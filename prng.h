#ifndef PRNG_H
#define PRNG_H

#include <cstdint>

class Prng {
public:
    explicit Prng(int64_t seed);
    int64_t next_j();
private:
    int64_t _seed;
};

extern Prng rnd;

#endif
