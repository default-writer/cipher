#include "prng.h"
#include <cmath>
#include <cstddef>
#include <cstdint>

constexpr int64_t PRNG_MOD = 2147483647LL;
constexpr int64_t PRNG_MUL = 48271LL;

Prng::Prng(int64_t seed) {
  _seed = seed % PRNG_MOD;
  if (_seed <= 0) {
    _seed += PRNG_MOD - 1;
  }
}

std::size_t Prng::next_j() {
  _seed = (_seed * PRNG_MUL) % PRNG_MOD;
  return _seed;
}

Prng rnd(1238473661LL);
