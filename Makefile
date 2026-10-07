# В окружении clang64 используем clang++ вместо g++
CXX      ?= clang++

# Для C++26 в Clang используется -std=c++26 (или -std=c++2c для старых версий)
CXXFLAGS ?= -std=c++26 -O2 -Wall -Wextra -pedantic

# В Windows исполняемые файлы должны иметь расширение .exe
TARGET   := codec.exe

.PHONY: all clean run-encrypt run-decrypt

all: $(TARGET)

$(TARGET): main.cpp utils.cpp prng.cpp cipher.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

# Примеры запуска (добавлен префикс ./ для запуска в bash)
run-encrypt: $(TARGET)
	./$(TARGET) encrypt 1 1

run-decrypt: $(TARGET)
	./$(TARGET) decrypt 1 1

clean:
	rm -f $(TARGET) output.txt
