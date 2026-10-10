CXX      ?= clang++
CXXFLAGS ?= -std=c++26 -O2 -g -gcodeview -Wall -Wextra -pedantic -static -static-libstdc++
TARGET   := codec.exe

.PHONY: all clean encrypt decrypt test

all: $(TARGET)

$(TARGET): main.cpp run.cpp cipher.cpp prng.cpp
	@$(CXX) $(CXXFLAGS) -o $@ $^ -Wl,-pdb=codec.pdb

encrypt: $(TARGET)
	@./$(TARGET) encrypt 1 1

decrypt: $(TARGET)
	@./$(TARGET) decrypt 1 1

test: $(TARGET)
	@./$(TARGET) encrypt 1 1 > /dev/null
	@./$(TARGET) decrypt 1 1 > /dev/null

clean:
	@rm -f $(TARGET) codec.pdb output.txt decrypted.txt
