#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <vector>

#include "types.h"

namespace cipher {
  extern Bytes encrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet);
  extern Bytes decrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet);

  namespace {
    std::vector<std::string> load_word_list(const std::string &filename) {
      std::vector<std::string> words;
      std::ifstream file(filename);

      if (!file.is_open()) {
        std::cerr << "Не удалось открыть файл: " << filename << std::endl;
        return words;
      }

      std::string word;
      while (std::getline(file, word)) {

        if (!word.empty()) {
          words.push_back(word);
        }
      }

      file.close();
      return words;
    }

    Bytes generate_text_from_words(const std::vector<std::string> &words, std::size_t target_size, std::uint32_t seed = std::mt19937::default_seed) {
      Bytes out;
      out.reserve(target_size + 64);
      if (words.empty())
        return out;

      std::mt19937 rng(seed);
      std::uniform_int_distribution<std::size_t> pick_word(0, words.size() - 1);
      std::uniform_int_distribution<int> pick_line_len(8, 14);

      while (out.size() < target_size) {
        int line_words = pick_line_len(rng);
        for (int i = 0; i < line_words && out.size() < target_size; ++i) {
          const std::string &w = words[pick_word(rng)];
          if (i > 0)
            out.push_back(' ');
          std::size_t remaining = target_size - out.size();
          std::size_t take = std::min(w.size(), remaining);
          out.insert(out.end(), w.begin(), w.begin() + take);
        }
        if (out.size() < target_size)
          out.push_back('\n');
      }
      return out;
    }

    std::size_t bulk_swap(Bytes &buf, const Bytes &orig, std::size_t partLength, char target_char, char replacement, std::mt19937 &rng, std::size_t max_changes) {
      if (max_changes == 0 || partLength == 0)
        return 0;

      std::vector<std::size_t> positions(partLength);
      std::iota(positions.begin(), positions.end(), 0);
      std::shuffle(positions.begin(), positions.end(), rng);

      unsigned char target = static_cast<unsigned char>(target_char);
      unsigned char repl = static_cast<unsigned char>(replacement);

      std::size_t changes = 0;
      std::vector<std::size_t> t_idxs;
      t_idxs.reserve(5);

      for (std::size_t i : positions) {
        if (changes >= max_changes)
          break;

        int budget = 2;
        t_idxs.clear();
        for (int b = 0; b < 5; ++b) {
          std::size_t idx = static_cast<std::size_t>(b) * partLength + i;
          if (buf[idx] != orig[idx])
            --budget;
          if (buf[idx] == target)
            t_idxs.push_back(idx);
        }
        if (budget <= 0 || t_idxs.empty())
          continue;

        std::shuffle(t_idxs.begin(), t_idxs.end(), rng);
        for (std::size_t idx : t_idxs) {
          if (budget <= 0 || changes >= max_changes)
            break;
          buf[idx] = repl;
          ++changes;
          --budget;
        }
      }
      return changes;
    }

    Bytes read_file(const std::string &path) {
      std::ifstream in(path, std::ios::binary);
      return Bytes((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());
    }

    bool write_file(const std::string &path, const Bytes &data) {
      std::ofstream out(path, std::ios::binary);
      if (!out.is_open())
        return false;
      out.write(data.data(), static_cast<std::streamsize>(data.size()));
      return static_cast<bool>(out);
    }
  } // namespace

  bool is_valid_decryption(const Bytes &candidate, const Bytes &original_plain, int iv, int shift, const std::string &alphabet) {
    try {
      Bytes decrypted = cipher::decrypt_(candidate, iv, shift, alphabet);
      return decrypted == original_plain;
    } catch (...) {
      return false;
    }
  }

  int run_distribution(const std::string &input_file) {
    std::ifstream infile(input_file, std::ios::binary);
    if (!infile.is_open()) {
      std::cerr << "Error: could not open file " << input_file << " for distribution analysis.\n";
      return 1;
    }

    std::map<char, size_t> frequencies;
    size_t total_chars = 0;
    char ch;

    while (infile.get(ch)) {
      frequencies[ch]++;
      total_chars++;
    }
    infile.close();

    if (total_chars == 0) {
      std::cout << "File " << input_file << " is empty.\n";
      return 1;
    }

    std::cout << "\n=== Character Distribution in " << input_file << " ===\n";
    std::cout << "Total characters analyzed: " << total_chars << "\n";
    std::cout << std::endl;
    std::cout << std::left << std::setw(12) << "Char (ASCII)" << " | " << "Count" << " | " << "Percentage" << "\n";
    std::cout << "-------------------------------------------\n";

    for (const auto &[symbol, count] : frequencies) {
      double percentage = (static_cast<double>(count) / total_chars) * 100.0;

      std::string char_desc;
      if (symbol == '\n')
        char_desc = "\\n(10)";
      else if (symbol == static_cast<char>(13))
        char_desc = "  (13)";
      else if (symbol == ' ')
        char_desc = "  (32)";
      else
        char_desc = std::string(1, symbol) + " (" + std::to_string((unsigned char)symbol) + ")";

      std::cout << std::left << std::setw(12) << char_desc << " | " << std::setw(5) << count << " | " << std::fixed << std::setprecision(2) << percentage << "%\n";
    }
    std::cout << "===========================================\n";
    return 0;
  }

  int run_benchmark(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file) {
    std::cout << "Generating 100 KB of test plain text...\n";

    auto all_words = load_word_list("words.txt");
    Bytes test_plain = generate_text_from_words(all_words, 102400);

    const std::string bench_input_file = "benchmark_" + input_file;
    const std::string bench_output_file = "benchmark_" + output_file;

    write_file(bench_input_file, test_plain);

    std::cout << "Starting performance benchmark...\n";

    auto start_enc = std::chrono::high_resolution_clock::now();
    Bytes ciphertext = cipher::encrypt_(test_plain, iv, shift, alphabet);
    auto end_enc = std::chrono::high_resolution_clock::now();

    std::chrono::duration<double, std::milli> duration_enc = end_enc - start_enc;
    double speed_enc = (static_cast<double>(test_plain.size()) / 1024.0) / (duration_enc.count() / 1000.0);

    std::cout << "Input Size      : " << test_plain.size() << " bytes\n";
    std::cout << "Output Size     : " << ciphertext.size() << " bytes\n\n";

    std::cout << "--- ENCRYPTION ---\n";
    std::cout << "Time Elapsed    : " << std::fixed << std::setprecision(3) << duration_enc.count() << " ms\n";
    std::cout << "Throughput      : " << std::fixed << std::setprecision(2) << speed_enc << " KB/sec\n\n";

    Bytes obfuscated = ciphertext;
    write_file(bench_output_file, obfuscated);

    auto start_dec = std::chrono::high_resolution_clock::now();
    Bytes decrypted = cipher::decrypt_(obfuscated, iv, shift, alphabet);
    auto end_dec = std::chrono::high_resolution_clock::now();

    std::chrono::duration<double, std::milli> duration_dec = end_dec - start_dec;
    double speed_dec = (static_cast<double>(decrypted.size()) / 1024.0) / (duration_dec.count() / 1000.0);

    std::cout << "--- DECRYPTION ---\n";
    std::cout << "Time Elapsed    : " << std::fixed << std::setprecision(3) << duration_dec.count() << " ms\n";
    std::cout << "Throughput      : " << std::fixed << std::setprecision(2) << speed_dec << " KB/sec\n\n";

    std::cout << "--- TEST ---\n";
    std::cout << "Integrity Check : " << (decrypted == test_plain ? "PASSED" : "FAILED") << "\n";
    std::cout << "Saved plain     : " << bench_input_file << "\n";
    std::cout << "Saved obfuscated: " << bench_output_file << "\n\n";
    return 0;
  }

  int run_test(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file) {
    try {
      Bytes input_bytes = read_file(input_file);
      if (input_bytes.empty()) {
        std::cerr << "Error: could not read " << input_file << "\n";
        return 1;
      }

      Bytes output_bytes = cipher::decrypt_(input_bytes, iv, shift, alphabet);
      (void)output_bytes;

      Bytes decrypted_bytes = read_file(output_file);
      if (decrypted_bytes.empty()) {
        std::cerr << "Error: could not read " << output_file << "\n";
        return 1;
      }

      if (decrypted_bytes == input_bytes) {
        std::cout << "Success! Files are equal\n";
      } else {
        std::cout << "Error! Files are different\n";
      }
    } catch (const std::exception &e) {
      std::cerr << "Runtime error: " << e.what() << "\n";
      return 1;
    }
    return 0;
  }

  int run_encrypt(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file) {
    try {
      Bytes input_bytes = read_file(input_file);
      if (input_bytes.empty()) {
        std::cerr << "Error: could not read " << input_file << "\n";
        return 1;
      }

      Bytes output_bytes = cipher::encrypt_(input_bytes, iv, shift, alphabet);
      if (!write_file(output_file, output_bytes)) {
        std::cerr << "Error: could not write " << output_file << "\n";
        return 1;
      }

      std::cout << "Success! Result written to " << output_file << "\n";
    } catch (const std::exception &e) {
      std::cerr << "Runtime error: " << e.what() << "\n";
      return 1;
    }
    return 0;
  }

  int run_decrypt(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file) {
    try {
      Bytes input_bytes = read_file(input_file);
      if (input_bytes.empty()) {
        std::cerr << "Error: could not read " << input_file << "\n";
        return 1;
      }

      Bytes output_bytes = cipher::decrypt_(input_bytes, iv, shift, alphabet);
      if (!write_file(output_file, output_bytes)) {
        std::cerr << "Error: could not write " << output_file << "\n";
        return 1;
      }

      std::cout << "Success! Result written to " << output_file << "\n";
    } catch (const std::exception &e) {
      std::cerr << "Runtime error: " << e.what() << "\n";
      return 1;
    }
    return 0;
  }

  int run_obfuscate(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file) {
    Bytes text = read_file(input_file);
    if (text.empty()) {
      std::cerr << "Error: obfuscate requires '" << input_file << "' as ciphertext source (empty or unreadable).\n";
      return 1;
    }

    Bytes reference_plain;
    try {
      reference_plain = cipher::decrypt_(text, iv, shift, alphabet);
    } catch (const std::exception &e) {
      std::cerr << "Error: initial ciphertext does not decrypt: " << e.what() << "\n";
      return 1;
    }

    std::mt19937 rng(std::random_device{}());
    int iterations = 0;
    const int max_safety_counter = 10000;
    const std::size_t partLength = text.size() / 5;

    const Bytes original = text;

    std::cout << "Starting obfuscation loop...\n";

    while (iterations < max_safety_counter && partLength > 0) {
      iterations++;

      std::map<char, size_t> frequencies;
      for (char c : text)
        frequencies[c]++;

      size_t max_count = 0;
      size_t min_count = static_cast<size_t>(-1);

      for (const auto &[c, count] : frequencies) {
        if (count > max_count)
          max_count = count;
        if (count < min_count)
          min_count = count;
      }

      if (frequencies.size() < alphabet.size())
        min_count = 0;

      if (max_count - min_count <= 1) {
        std::cout << "Obfuscation successfully passed in " << iterations << " cycles.\n";
        break;
      }

      std::vector<char> most_frequent_chars;
      std::vector<char> least_frequent_chars;

      if (min_count == 0) {
        for (char c : alphabet)
          if (frequencies[c] == 0)
            least_frequent_chars.push_back(c);
      }

      for (const auto &[c, count] : frequencies) {
        if (count == max_count)
          most_frequent_chars.push_back(c);
        if (min_count > 0 && count == min_count)
          least_frequent_chars.push_back(c);
      }

      if (most_frequent_chars.empty() || least_frequent_chars.empty())
        break;

      char target_char = most_frequent_chars[rng() % most_frequent_chars.size()];
      char replacement = least_frequent_chars[rng() % least_frequent_chars.size()];

      if (target_char == replacement)
        break;

      std::size_t max_changes = (max_count - min_count) / 2;
      if (max_changes == 0)
        max_changes = 1;

      Bytes candidate = text;
      std::size_t changes = bulk_swap(candidate, original, partLength, target_char, replacement, rng, max_changes);
      if (changes == 0)
        break;

      if (is_valid_decryption(candidate, reference_plain, iv, shift, alphabet)) {
        text = candidate;
      } else {
        std::cerr << "Warning: bulk swap broke decryption, stopping.\n";
        break;
      }
    }

    if (iterations >= max_safety_counter) {
      std::cout << "Obfuscation stopped at maximum safety counter.\n";
    }

    if (!write_file(output_file, text)) {
      std::cerr << "Error: could not write " << output_file << "\n";
      return 1;
    }
    std::cout << "Obfuscated result saved to " << output_file << "\n";
    return 0;
  }

} // namespace cipher
