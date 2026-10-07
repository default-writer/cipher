#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <map>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace cipher
{

    using Bytes = std::vector<char>;

    extern Bytes decrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet);

    void obfuscate_file(int iv, int shift, const std::string &alphabet);
    bool is_valid_decryption(const Bytes &candidate, const Bytes &original_plain, int iv, int shift, const std::string &alphabet);
    void print_distribution(const std::string &filename);

    void obfuscate_file(int iv, int shift, const std::string &alphabet)
    {
        std::ifstream orig_file("input.txt", std::ios::binary);
        if (!orig_file.is_open())
        {
            std::cerr << "Error: obfuscate requires 'input.txt' to verify decryption.\n";
            return;
        }
        Bytes original_plaintext;
        char ch;
        while (orig_file.get(ch))
        {
            if (ch == '\r')
                continue;
            original_plaintext.push_back(ch);
        }
        orig_file.close();

        std::ifstream cipher_file("output.txt", std::ios::binary);
        if (!cipher_file.is_open())
        {
            std::cerr << "Error: obfuscate requires 'output.txt' as source.\n";
            return;
        }
        Bytes text;
        while (cipher_file.get(ch))
        {
            if (ch == '\r')
                continue;
            text.push_back(ch);
        }
        cipher_file.close();

        if (text.empty())
        {
            std::cerr << "Error: 'output.txt' is empty.\n";
            return;
        }

        if (cipher::is_valid_decryption(text, original_plaintext, iv, shift, alphabet))
        {
            std::cerr << "Error: Initial ciphertext in 'output.txt' does not decrypt to 'input.txt'!\n";
            return;
        }

        std::mt19937 rng(std::random_device{}());

        int iterations = 0;
        const int max_safety_counter = 1000;

        while (iterations < max_safety_counter)
        {
            iterations++;

            std::map<char, size_t> frequencies;
            for (char c : text)
            {
                frequencies[c]++;
            }

            size_t max_count = 0;
            size_t min_count = -1;

            for (const auto &[c, count] : frequencies)
            {
                if (count > max_count)
                    max_count = count;
                if (count < min_count)
                    min_count = count;
            }

            if (frequencies.size() < alphabet.size())
            {
                min_count = 0;
            }

            if (max_count - min_count <= 1)
            {
                std::cout << "Obfuscation passed in " << iterations << " cycles.\n";
                break;
            }

            std::vector<char> most_frequent_chars;
            std::vector<char> least_frequent_chars;

            if (min_count == 0)
            {
                for (char c : alphabet)
                {
                    if (frequencies[c] == 0)
                        least_frequent_chars.push_back(c);
                }
            }

            for (const auto &[c, count] : frequencies)
            {
                if (count == max_count)
                    most_frequent_chars.push_back(c);
                if (min_count > 0 && count == min_count)
                    least_frequent_chars.push_back(c);
            }

            char target_char = most_frequent_chars[rng() % most_frequent_chars.size()];
            char replacement = least_frequent_chars[rng() % least_frequent_chars.size()];

            if (target_char == replacement)
                break;

            std::vector<size_t> indexes;
            for (size_t i = 0; i < text.size(); i++)
            {
                if (text[i] == target_char)
                {
                    indexes.push_back(i);
                }
            }

            if (!indexes.empty())
            {
                size_t random_index = indexes[rng() % indexes.size()];

                Bytes candidate_text = text;
                candidate_text[random_index] = replacement;

                if (cipher::is_valid_decryption(candidate_text, original_plaintext, iv, shift, alphabet))
                {
                    text = candidate_text;
                }
            }
        }

        if (iterations >= max_safety_counter)
        {
            std::cout << "Obfuscation stopped at maximum safety counter (" << max_safety_counter << " cycles).\n";
        }

        std::ofstream outfile("output.txt", std::ios::binary);
        if (outfile.is_open())
        {
            outfile.write(text.data(), static_cast<std::streamsize>(text.size()));
            outfile.close();
            std::cout << "Obfuscated result saved to output.txt\n";
        }
    }

    bool is_valid_decryption(const Bytes &candidate, const Bytes &original_plain, int iv, int shift, const std::string &alphabet)
    {
        try
        {
            Bytes decrypted = cipher::decrypt_(candidate, iv, shift, alphabet);
            return decrypted == original_plain;
        }
        catch (...)
        {
            return false;
        }
    }

    void print_distribution(const std::string &filename)
    {
        std::ifstream infile(filename, std::ios::binary);
        if (!infile.is_open())
        {
            std::cerr << "Error: could not open file " << filename << " for distribution analysis.\n";
            return;
        }

        std::map<char, size_t> frequencies;
        size_t total_chars = 0;
        char ch;

        while (infile.get(ch))
        {
            if (ch == '\r')
                continue;
            frequencies[ch]++;
            total_chars++;
        }
        infile.close();

        if (total_chars == 0)
        {
            std::cout << "File " << filename << " is empty.\n";
            return;
        }

        std::cout << "\n=== Character Distribution in " << filename << " ===\n";
        std::cout << "Total characters analyzed: " << total_chars << "\n\n";
        std::cout << std::left << std::setw(12) << "Char (ASCII)" << " | " << "Count" << " | " << "Percentage" << "\n";
        std::cout << "-------------------------------------------\n";

        for (const auto &[symbol, count] : frequencies)
        {
            double percentage = (static_cast<double>(count) / total_chars) * 100.0;

            std::string char_desc;
            if (symbol == '\n')
                char_desc = "\\n (10)";
            else if (symbol == ' ')
                char_desc = "' ' (32)";
            else
                char_desc = std::string(1, symbol) + " (" + std::to_string((unsigned char)symbol) + ")";

            std::cout << std::left << std::setw(12) << char_desc << " | "
                    << std::setw(5) << count << " | "
                    << std::fixed << std::setprecision(2) << percentage << "%\n";
        }
        std::cout << "===========================================\n";
    }

}