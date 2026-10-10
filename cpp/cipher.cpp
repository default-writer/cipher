#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <map>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>

#include "prng.h"
#include "types.h"

namespace cipher {
  struct AlphabetLUT {
    std::size_t char_to_pos[256];
    AlphabetLUT(const std::string &alphabet) {
      std::fill(std::begin(char_to_pos), std::end(char_to_pos), -1);
      for (size_t i = 0; i < alphabet.size(); ++i) {
        char_to_pos[static_cast<unsigned char>(alphabet[i])] = static_cast<int>(i);
      }
    }
  };

  inline std::size_t get_char_pos(unsigned char ch, const AlphabetLUT &lut) {
    return lut.char_to_pos[ch];
  }

  inline char shift_encrypt(unsigned char ch, const std::string &alphabet, const AlphabetLUT &lut, Prng &local_rnd) {
    std::size_t pos = get_char_pos(ch, lut);
    if (pos > 255)
      return ch;

    std::size_t L = alphabet.size();
    std::size_t j = local_rnd.next_j();
    std::size_t newPosition = (pos + 1 + static_cast<std::size_t>(j)) % L;

    while (newPosition == static_cast<std::size_t>(pos)) {
      j = local_rnd.next_j();
      newPosition = (static_cast<std::size_t>(pos) + 1 + static_cast<std::size_t>(j)) % L;
    }
    return alphabet[newPosition];
  }

  inline char shift_decrypt(char ch, const std::string &alphabet, const AlphabetLUT &lut, Prng &local_rnd) {
    int pos = get_char_pos(ch, lut);
    if (pos == -1)
      return ch;

    std::size_t L = alphabet.size();
    int64_t j = local_rnd.next_j();
    std::size_t newPosition = L - 1 - ((L - static_cast<std::size_t>(pos) + static_cast<std::size_t>(j)) % L);

    while (newPosition == static_cast<std::size_t>(pos)) {
      j = local_rnd.next_j();
      newPosition = L - 1 - ((L - static_cast<std::size_t>(pos) + static_cast<std::size_t>(j)) % L);
    }
    return alphabet[newPosition];
  }

  void cipher_function(bool encrypt, int64_t iv, int shift, const std::string &alphabet, Bytes &array, std::size_t start_pos, std::size_t end_pos, const AlphabetLUT &lut) {
    Prng local_rnd(iv);
    for (int i = 0; i < shift; ++i) {
      for (std::size_t idx = start_pos; idx < end_pos; ++idx) {
        array[idx] = encrypt ? shift_encrypt(array[idx], alphabet, lut, local_rnd)
                             : shift_decrypt(array[idx], alphabet, lut, local_rnd);
      }
    }
  }

  Bytes encrypt_cipher(int64_t seed, int shift, const std::string &alphabet, Bytes input, const AlphabetLUT &lut) {
    cipher_function(true, seed, shift, alphabet, input, 0, input.size(), lut);
    return input;
  }

  Bytes decrypt_cipher(int64_t seed, int shift, const std::string &alphabet, Bytes input, const AlphabetLUT &lut) {
    cipher_function(false, seed, shift, alphabet, input, 0, input.size(), lut);
    return input;
  }

  Bytes encrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet) {
    AlphabetLUT lut(alphabet);
    Bytes r;
    r.reserve(input.size() * 5);
    Bytes current_layer = input;

    for (int layer = 0; layer < 5; ++layer) {
      cipher_function(true, iv, shift, alphabet, current_layer, 0, current_layer.size(), lut);
      r.insert(r.end(), current_layer.begin(), current_layer.end());
    }
    return r;
  }

  Bytes decrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet) {
    AlphabetLUT lut(alphabet);
    const std::size_t partLength = input.size() / 5;
    if (partLength == 0)
      return {};

    Bytes blocks[5];
    for (int b = 0; b < 5; ++b) {
      blocks[b].reserve(partLength);

      std::size_t block_start = b * partLength;
      blocks[b].assign(input.begin() + block_start, input.begin() + block_start + partLength);
    }

    auto decrypt_block_lazy = [&](int b) {
      int total_rounds = b + 1;
      for (int r = 0; r < total_rounds; ++r) {
        Prng local_rnd(iv);
        for (int i = 0; i < shift; ++i) {
          for (std::size_t idx = 0; idx < partLength; ++idx) {
            blocks[b][idx] = shift_decrypt(blocks[b][idx], alphabet, lut, local_rnd);
          }
        }
      }
    };

    bool block_decrypted[5] = {false, false, false, false, false};

    Bytes result;
    result.reserve(partLength);

    for (std::size_t i = 0; i < partLength; ++i) {

      if (!block_decrypted[0]) {
        decrypt_block_lazy(0);
        block_decrypted[0] = true;
      }
      unsigned char c1 = blocks[0][i];

      if (!block_decrypted[1]) {
        decrypt_block_lazy(1);
        block_decrypted[1] = true;
      }
      unsigned char c2 = blocks[1][i];

      if (!block_decrypted[2]) {
        decrypt_block_lazy(2);
        block_decrypted[2] = true;
      }
      unsigned char c3 = blocks[2][i];

      if (c1 == c2 && c2 == c3) {
        result.push_back(static_cast<char>(c1));
        continue;
      }

      if (!block_decrypted[3]) {
        decrypt_block_lazy(3);
        block_decrypted[3] = true;
      }
      unsigned char c4 = blocks[3][i];

      if ((c1 == c2 && c2 == c4) || (c1 == c3 && c3 == c4)) {
        result.push_back(static_cast<char>(c1));
        continue;
      }
      if (c2 == c3 && c3 == c4) {
        result.push_back(static_cast<char>(c2));
        continue;
      }

      if (!block_decrypted[4]) {
        decrypt_block_lazy(4);
        block_decrypted[4] = true;
      }
      unsigned char c5 = blocks[4][i];
      result.push_back(static_cast<char>(c5));
    }

    return result;
  }

} // namespace cipher
