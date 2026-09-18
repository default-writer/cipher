import { hex_sha1, hex2binb } from "./sha1";
import { prng } from "./prng";
import { default_alphabet, seed, min, max } from "./common";

function shuffle(array, seed, rng) {
  rng = new prng(seed);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(rng.next(i));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function cipher_function(cipher) {
  return function (random, shift, alpha, array, sha_alphabet, sha_plaintext) {
    shuffle_binb(alpha, sha_alphabet);
    shuffle_binb(alpha, sha_plaintext);
    rnd = new prng(random);
    for (let i = 0; i < shift; i++) {
      array = array.map(item => cipher(item, alpha));
    }
    return array;
  };
}

function shuffle_binb(alphabet, str) {
  let array = hex2binb(str);
  for (let i = 0; i < array.length; i++) {
    shuffle(alphabet, array[i]);
  }
}

function next_position(char, alphabet) {
  const j = Math.floor(rnd.next(min, max));;
  const position = alphabet.indexOf(char);
  return (position + 1 + j) % alphabet.length;
}

function previous_position(char, alphabet) {
  const j = Math.floor(rnd.next(min, max));;
  const position = alphabet.indexOf(char);
  return alphabet.length - 1 - ((alphabet.length - position + j) % alphabet.length);
}

function shift_encrypt(char, alphabet) {
  if (char === undefined || !alphabet.includes(char))
    throw new Error("invalid symbol '" + char + "'");
  const position = alphabet.indexOf(char);
  let newPosition = next_position(char, alphabet);
  while (newPosition === position) newPosition = next_position(char, alphabet);
  return alphabet[newPosition];
}

function shift_decrypt(char, alphabet) {
  if (char === undefined || !alphabet.includes(char))
    throw new Error("invalid char '" + char + "'");
  const position = alphabet.indexOf(char);
  let newPosition = previous_position(char, alphabet);
  while (newPosition === position) newPosition = previous_position(char, alphabet);
  return alphabet[newPosition];
}

export var rnd = new prng(seed);
export function random_value() { return Math.floor(rnd.next(min, max)) }
export function random_alphabet(alphabet) { if (!!!alphabet) { alphabet = [...default_alphabet]; } return shuffle(alphabet, Math.floor(rnd.next(min, max))); }
export function sha1(array) { return hex_sha1(String(array)); }
export function decrypt_cipher(...args) { return cipher_function(shift_decrypt)(...args); }
export function encrypt_cipher(...args) { return cipher_function(shift_encrypt)(...args); }
