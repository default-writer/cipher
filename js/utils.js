import { default_alphabet } from "./common";

let encoder_;
let decoder_;

function encoder() {
  if (!encoder_) encoder_ = new TextEncoder();
  return encoder_;
}

function decoder() {
  if (!decoder_) decoder_ = new TextDecoder();
  return decoder_;
}
const bin_alphabet = "01";

export function encode(plaintext, alphabet) {
  if (!alphabet) {
    alphabet = [...default_alphabet];
  }
  const bytes = new TextEncoder("utf-8").encode(plaintext);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  if (!hex) return "";
  let bigIntValue = BigInt("0x" + hex);
  const base = BigInt(alphabet.length);
  let result = "";
  while (bigIntValue > 0n) {
    const remainder = Number(bigIntValue % base);
    result = alphabet[remainder] + result;
    bigIntValue = bigIntValue / base;
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = alphabet[0] + result;
  }
  return result;
}

export function decode(encodedText, alphabet) {
  if (!alphabet) {
    alphabet = [...default_alphabet];
  }
  const base = BigInt(alphabet.length);
  let bigIntValue = 0n;
  for (let i = 0; i < encodedText.length; i++) {
    const char = encodedText[i];
    const charIndex = alphabet.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Character ${char} not found in the alphabet!`);
    }
    bigIntValue = bigIntValue * base + BigInt(charIndex);
  }
  let hex = bigIntValue.toString(16);
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  const len = hex.length / 2;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder("utf-8").decode(bytes);
}
