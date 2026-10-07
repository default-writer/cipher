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

#include "prng.h"

namespace cipher
{
    using Bytes = std::vector<char>;

    extern void obfuscate_file(int iv, int shift, const std::string &alphabet);
    extern bool is_valid_decryption(const cipher::Bytes &candidate, const cipher::Bytes &original_plain, int iv, int shift, const std::string &alphabet);
    extern void print_distribution(const std::string &filename);

    std::size_t next_position(char ch, const std::string &alphabet)
    {
        int64_t j = rnd.next_j();
        auto pos = alphabet.find(ch);
        if (pos == std::string::npos)
            return std::string::npos;
        std::size_t L = alphabet.size();
        return (pos + 1 + static_cast<std::size_t>(j)) % L;
    }

    std::size_t previous_position(char ch, const std::string &alphabet)
    {
        int64_t j = rnd.next_j();
        auto pos = alphabet.find(ch);
        if (pos == std::string::npos)
            return std::string::npos;
        std::size_t L = alphabet.size();
        return L - 1 - ((L - pos + static_cast<std::size_t>(j)) % L);
    }

    char shift_encrypt(char ch, const std::string &alphabet)
    {
        auto pos = alphabet.find(ch);
        if (pos == std::string::npos)
            throw std::runtime_error(std::string("invalid symbol '") + ch + "' (code: " + std::to_string((int)(unsigned char)ch) + ")");
        std::size_t position = pos;
        std::size_t newPosition = next_position(ch, alphabet);
        while (newPosition == position)
            newPosition = next_position(ch, alphabet);
        return alphabet[newPosition];
    }

    char shift_decrypt(char ch, const std::string &alphabet)
    {
        auto pos = alphabet.find(ch);
        if (pos == std::string::npos)
            throw std::runtime_error(std::string("invalid char '") + ch + "' (code: " + std::to_string((int)(unsigned char)ch) + ")");
        std::size_t position = pos;
        std::size_t newPosition = previous_position(ch, alphabet);
        while (newPosition == position)
            newPosition = previous_position(ch, alphabet);
        return alphabet[newPosition];
    }

    Bytes cipher_function(bool encrypt, int64_t seed, int shift,
                          const std::string &alphabet, Bytes array)
    {
        rnd = Prng(seed);
        for (int i = 0; i < shift; ++i)
        {
            for (char &c : array)
            {
                c = encrypt ? shift_encrypt(c, alphabet)
                            : shift_decrypt(c, alphabet);
            }
        }
        return array;
    }

    Bytes encrypt_cipher(int64_t seed, int shift, const std::string &alphabet, const Bytes &input)
    {
        return cipher_function(true, seed, shift, alphabet, input);
    }

    Bytes decrypt_cipher(int64_t seed, int shift, const std::string &alphabet, const Bytes &input)
    {
        return cipher_function(false, seed, shift, alphabet, input);
    }

    Bytes encrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet)
    {
        Bytes s1 = encrypt_cipher(iv, shift, alphabet, input);
        Bytes s2 = encrypt_cipher(iv, shift, alphabet, s1);
        Bytes s3 = encrypt_cipher(iv, shift, alphabet, s2);
        Bytes s4 = encrypt_cipher(iv, shift, alphabet, s3);
        Bytes s5 = encrypt_cipher(iv, shift, alphabet, s4);

        Bytes r;
        r.reserve(s1.size() * 5);
        r.insert(r.end(), s1.begin(), s1.end());
        r.insert(r.end(), s2.begin(), s2.end());
        r.insert(r.end(), s3.begin(), s3.end());
        r.insert(r.end(), s4.begin(), s4.end());
        r.insert(r.end(), s5.begin(), s5.end());
        return r;
    }

    Bytes decrypt_(const Bytes &input, int iv, int shift, const std::string &alphabet)
    {
        const std::size_t partLength = input.size() / 5;
        auto slice = [&](std::size_t a, std::size_t b) -> Bytes
        {
            b = std::min(b, input.size());
            if (a >= input.size() || a >= b)
                return {};
            return Bytes(input.begin() + a, input.begin() + b);
        };

        Bytes p1 = slice(0, partLength);
        Bytes p2 = slice(partLength, partLength * 2);
        Bytes p3 = slice(partLength * 2, partLength * 3);
        Bytes p4 = slice(partLength * 3, partLength * 4);
        Bytes p5 = slice(partLength * 4, input.size());

        auto decrypt_n = [&](const Bytes &p, int n)
        {
            Bytes cur = p;
            for (int k = 0; k < n; ++k)
                cur = decrypt_cipher(iv, shift, alphabet, cur);
            return cur;
        };

        Bytes s1 = decrypt_n(p1, 1);
        Bytes s2 = decrypt_n(p2, 2);
        Bytes s3 = decrypt_n(p3, 3);
        Bytes s4 = decrypt_n(p4, 4);
        Bytes s5 = decrypt_n(p5, 5);

        Bytes result;
        result.reserve(partLength);

        std::mt19937 gen(1337);
        std::uniform_real_distribution<double> dist(0.0, 1.0);

        for (std::size_t i = 0; i < partLength; ++i)
        {
            char chars[5] = {s1[i], s2[i], s3[i], s4[i], s5[i]};
            std::vector<std::pair<char, int>> votes;
            for (char c : chars)
            {
                auto it = std::find_if(votes.begin(), votes.end(), [&](const auto &p)
                                       { return p.first == c; });
                if (it == votes.end())
                    votes.emplace_back(c, 1);
                else
                    ++it->second;
            }

            std::vector<std::pair<char, int>> ordered;
            for (char d = '0'; d <= '9'; ++d)
            {
                auto it = std::find_if(votes.begin(), votes.end(), [&](const auto &p)
                                       { return p.first == d; });
                if (it != votes.end())
                    ordered.push_back(*it);
            }
            for (auto &p : votes)
                if (p.first < '0' || p.first > '9')
                    ordered.push_back(p);

            int maxVotes = 0;
            char winner = chars[0];
            for (auto &[c, n] : ordered)
            {
                if (n > maxVotes)
                {
                    maxVotes = n;
                    winner = c;
                }
                else if (n == maxVotes && maxVotes == 1)
                {
                    if (dist(gen) > 0.2)
                        winner = c;
                }
            }
            result.push_back(winner);
        }
        return result;
    }
}
