#ifndef PRNG_H
#define PRNG_H

#include <cstddef>
#include <cstdint>

class Prng {
public:
  explicit Prng(int64_t seed);
  std::size_t next_j();

private:
  std::size_t _seed;
};

extern Prng rnd;

#endif
