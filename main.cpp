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
#include <chrono> // Добавлено для точного замера времени

#include "prng.h"

namespace cipher
{
    using Bytes = std::vector<char>;

    extern void obfuscate_file(int iv, int shift, const std::string &alphabet);
    extern bool is_valid_decryption(const cipher::Bytes &candidate, const cipher::Bytes &original_plain, int iv, int shift, const std::string &alphabet);
    extern void print_distribution(const std::string &filename);
    extern Bytes encrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet);
    extern Bytes decrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet);
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        std::cerr << "Usage:\n"
                  << "  " << argv[0] << " <encrypt|decrypt> <iv> <shift>\n"
                  << "  " << argv[0] << " benchmark <iv> <shift>\n" // Добавлено в справку
                  << "  " << argv[0] << " obfuscate <iv> <shift>\n"
                  << "  " << argv[0] << " dist\n";
        return 1;
    }

    std::string mode = argv[1];
    std::string alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:-\n'";

    if (mode == "dist")
    {
        cipher::print_distribution("output.txt");
        return 0;
    }

    if (argc < 4)
    {
        std::cerr << "Error: Mode '" << mode << "' requires <iv> and <shift> parameters.\n";
        return 1;
    }

    int iv = std::stoi(argv[2]);
    int shift = std::stoi(argv[3]);

    if (mode == "obfuscate")
    {
        cipher::obfuscate_file(iv, shift, alphabet);
        return 0;
    }

    // --- РЕЖИМ БЕНЧМАРКА ---
    if (mode == "benchmark")
    {
        const size_t ONE_MB = 1024 * 1024;
        const int ITERATIONS = 100;

        std::cout << "Starting benchmark: " << ITERATIONS << " iterations of " << ONE_MB / (1024 * 1024) << " MB...\n";

        // Инициализируем генератор (используем iv как seed для теста)
        // Если вы выбрали Способ 2 (процедурный), замените на: prng_init(iv);
        // В случае Способа 1 предполагается, что объект `rnd` уже объявлен extern.

        std::chrono::duration<double, std::milli> total_encrypt_time(0);
        std::chrono::duration<double, std::milli> total_decrypt_time(0);

        // Вектор, куда будем генерировать случайные 1 МБ данных
        cipher::Bytes input_bytes(ONE_MB);

        for (int i = 0; i < ITERATIONS; ++i)
        {
            // 1. Генерируем случайный 1 МБ с помощью вашего Prng
            for (size_t j = 0; j < ONE_MB; ++j)
            {
                // Если выбрали Способ 2, замените на: prng_next_j()
                // Берем остаток от деления на размер алфавита, чтобы шифровались валидные символы
                input_bytes[j] = alphabet[static_cast<size_t>(rnd.next_j()) % alphabet.size()];
            }

            // 2. Тестируем и замеряем шифрование
            auto t1 = std::chrono::high_resolution_clock::now();
            cipher::Bytes encrypted = cipher::encrypt_(input_bytes, iv, shift, alphabet);
            auto t2 = std::chrono::high_resolution_clock::now();
            total_encrypt_time += (t2 - t1);

            // 3. Тестируем и замеряем дешифрование
            auto t3 = std::chrono::high_resolution_clock::now();
            cipher::Bytes decrypted = cipher::decrypt_(encrypted, iv, shift, alphabet);
            auto t4 = std::chrono::high_resolution_clock::now();
            total_decrypt_time += (t4 - t3);
        }

        // Вывод результатов тестирования
        std::cout << "\n================ BENCHMARK RESULTS ================\n";
        std::cout << std::fixed << std::setprecision(2);
        std::cout << "Total processed data: " << (ONE_MB * ITERATIONS) / (1024.0 * 1024.0) << " MB\n\n";

        std::cout << "ENCRYPTION:\n";
        std::cout << "  Total time:   " << total_encrypt_time.count() << " ms\n";
        std::cout << "  Average/MB:   " << total_encrypt_time.count() / ITERATIONS << " ms\n";

        std::cout << "\nDECRYPTION:\n";
        std::cout << "  Total time:   " << total_decrypt_time.count() << " ms\n";
        std::cout << "  Average/MB:   " << total_decrypt_time.count() / ITERATIONS << " ms\n";
        std::cout << "===================================================\n";

        return 0;
    }

    // --- СТАНДАРТНЫЙ РЕЖИМ РАБОТЫ С ФАЙЛАМИ (ENCRYPT / DECRYPT) ---
    std::string filename = (mode == "encrypt") ? "input.txt" : "output.txt";
    std::ifstream infile(filename, std::ios::binary);
    if (!infile.is_open())
    {
        std::cerr << "Error: count not open file " << filename << "\n";
        return 1;
    }

    cipher::Bytes input_bytes;
    char ch;
    while (infile.get(ch))
    {
        if (ch == '\r')
            continue;
        input_bytes.push_back(ch);
    }
    infile.close();

    try
    {
        cipher::Bytes output_bytes;
        if (mode == "encrypt")
        {
            output_bytes = cipher::encrypt_(input_bytes, iv, shift, alphabet);
        }
        else
        {
            output_bytes = cipher::decrypt_(input_bytes, iv, shift, alphabet);
        }

        std::string out_filename = (mode == "encrypt") ? "output.txt" : "decrypted.txt";
        std::ofstream outfile(out_filename, std::ios::binary);
        if (!outfile.is_open())
        {
            std::cerr << "Error: could not open file for writing: " << out_filename << "\n";
            return 1;
        }
        outfile.write(output_bytes.data(), static_cast<std::streamsize>(output_bytes.size()));
        outfile.close();

        std::cout << "Success! Result written to " << out_filename << "\n";
    }
    catch (const std::exception &e)
    {
        std::cerr << "Runtime error: " << e.what() << "\n";
        return 1;
    }

    return 0;
}
