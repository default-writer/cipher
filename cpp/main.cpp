#include <algorithm>
#include <chrono>
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

#include "prng.h"
#include "types.h"

namespace cipher {
  extern int run_distribution(const std::string &input_file);
  extern int run_benchmark(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file);
  extern int run_test(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file);
  extern int run_encrypt(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file);
  extern int run_decrypt(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file);
  extern int run_obfuscate(int iv, int shift, const std::string &alphabet, const std::string &input_file, const std::string &output_file);
} //  namespace cipher

int main(int argc, char *argv[]) {
  if (argc < 2) {
    std::string prog = "codec";
    std::cerr << "Usage:\n"
              << "  " << prog << " -r | distribution [-i <input>]\n"
              << "  " << prog << " -b | benchmark  <iv> <shift> [-i <input>] [-o <output>]\n"
              << "  " << prog << " -t | test       <iv> <shift> [-i <input>] [-o <output>]\n"
              << "  " << prog << " -e | encrypt    <iv> <shift> [-i <input>] [-o <output>]\n"
              << "  " << prog << " -d | decrypt    <iv> <shift> [-i <input>] [-o <output>]\n"
              << "  " << prog << " -o | obfuscate  <iv> <shift> [-i <input>] [-o <output>]\n"
              << "\nDefaults: -i input.txt  -o output.txt\n";
    return 1;
  }

  std::string mode = argv[1];
  std::string input_file = std::string();
  std::string output_file = std::string();
  std::vector<std::string> positional;

  for (int i = 2; i < argc; ++i) {
    std::string arg = argv[i];
    if (arg == "-i" || arg == "--input") {
      if (i + 1 >= argc) {
        std::cerr << "Error: " << arg << " requires a file name.\n";
        return 1;
      }
      input_file = argv[++i];
    } else if (arg == "-o" || arg == "--output") {
      if (i + 1 >= argc) {
        std::cerr << "Error: " << arg << " requires a file name.\n";
        return 1;
      }
      output_file = argv[++i];
    } else {
      positional.push_back(arg);
    }
  }

  std::string alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:-\r\n\'!@#$%^&*()_+{}\"`~[];\\?/<>";

  if (mode == "-r" || mode == "distribution") {
    return cipher::run_distribution(input_file);
  }

  if (positional.size() < 2) {
    std::cerr << "Error: Mode '" << mode << "' requires <iv> and <shift> parameters.\n";
    return 1;
  }

  int iv = std::stoi(positional[0]);
  int shift = std::stoi(positional[1]);

  if (mode == "-b" || mode == "benchmark") {
    if (input_file.size() == 0)
      input_file = "input.txt";
    if (output_file.size() == 0)
      output_file = "output.txt";
    return cipher::run_benchmark(iv, shift, alphabet, input_file, output_file);
  }
  if (mode == "-t" || mode == "test") {
    if (input_file.size() == 0)
      input_file = "input.txt";
    if (output_file.size() == 0)
      output_file = "output.txt";
    return cipher::run_test(iv, shift, alphabet, input_file, output_file);
  }
  if (mode == "-e" || mode == "encrypt") {
    if (input_file.size() == 0)
      input_file = "input.txt";
    if (output_file.size() == 0)
      output_file = "output.txt";
    return cipher::run_encrypt(iv, shift, alphabet, input_file, output_file);
  }
  if (mode == "-d" || mode == "decrypt") {
    if (input_file.size() == 0)
      input_file = "output.txt";
    if (output_file.size() == 0)
      output_file = "decrypted.txt";
    return cipher::run_decrypt(iv, shift, alphabet, input_file, output_file);
  }
  if (mode == "-o" || mode == "obfuscate") {
    if (input_file.size() == 0)
      input_file = "output.txt";
    if (output_file.size() == 0)
      output_file = "obfuscated.txt";
    return cipher::run_obfuscate(iv, shift, alphabet, input_file, output_file);
  }

  std::cerr << "Error: unknown mode '" << mode << "'.\n";
  return 1;
}