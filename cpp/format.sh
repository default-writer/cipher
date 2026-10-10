#!/usr/bin/bash -e
find . -path "*/.*" -prune -o -type f \( -name "*.cpp" -o -name "*.h" \) -exec clang-format -style=file -i {} +