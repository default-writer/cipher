#!/usr/bin/bash -e
BIG_RANDOM=$(( (RANDOM << 15) | RANDOM ))
echo $BIG_RANDOM
./codec -b $BIG_RANDOM 1
./codec -o $BIG_RANDOM 1 -i benchmark_output.txt -o benchmark_obfuscated.txt
./codec -d $BIG_RANDOM 1 -i benchmark_obfuscated.txt -o benchmark_decoded.txt
./codec -t $BIG_RANDOM 1 -i benchmark_input.txt -o benchmark_decoded.txt