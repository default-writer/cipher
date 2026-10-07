#include <cstdint>
#include <cmath>
#include "prng.h"

constexpr int64_t PRNG_MOD = 2147483647LL;
constexpr int64_t PRNG_MUL = 48271LL;

// Конструктор класса Prng
Prng::Prng(int64_t seed) {
    _seed = seed % PRNG_MOD;
    if (_seed <= 0) {
        _seed += PRNG_MOD - 1;
    }
}

// Метод класса Prng
int64_t Prng::next_j() {
    _seed = (_seed * PRNG_MUL) % PRNG_MOD;
    double v = static_cast<double>(_seed) / 2147483647.0;
    v = v * 2147483647.0 + 0.0;
    return static_cast<int64_t>(std::floor(v));
}

Prng rnd(1238473661LL);
