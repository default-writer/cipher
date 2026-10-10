#!/usr/bin/bash -e
BIG_RANDOM=$(( (RANDOM << 15) | RANDOM ))
echo $BIG_RANDOM
./codec -e $BIG_RANDOM 1
./codec -o $BIG_RANDOM 1
./codec -d $BIG_RANDOM 1
./codec -t $BIG_RANDOM 1
./codec -r