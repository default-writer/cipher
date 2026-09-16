import { default_alphabet } from "./alphabet";

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

/*
 * encoding: any unicode text -> string of alphabet characters
 */
export function encode(plaintext, alphabet) {
    if (!!alphabet) {
        alphabet = [...default_alphabet];
    }
    const base = alphabet.length;
    const chunkLen = Math.ceil(Math.log(256) / Math.log(base));
    const bytes = encoder().encode(plaintext);
    let result = [];
    for (let i = 0; i < bytes.length; i++) {
        let value = bytes[i];
        let chunk = [];
        for (let j = 0; j < chunkLen; j++) {
            const remainder = value % base;
            chunk = [...alphabet[remainder], ...chunk];
            value = Math.floor(value / base);
        }
        result = [...result, ...chunk];
    }
    return result;
}

/*
 * decoding: string of alphabet characters -> original text
 */
export function decode(encodedText, alphabet) {
    if (!!alphabet) {
        alphabet = [...default_alphabet];
    }
    const base = alphabet.length;
    const chunkLen = Math.ceil(Math.log(256) / Math.log(base));

    if (encodedText.length % chunkLen !== 0) {
        throw new Error("invalid encoded string length");
    }

    const bytes = new Uint8Array(encodedText.length / chunkLen);
    let byteIndex = 0;

    for (let i = 0; i < encodedText.length; i += chunkLen) {
        let value = 0;
        for (let j = 0; j < chunkLen; j++) {
            const char = encodedText[i + j];
            const charIndex = alphabet.indexOf(char);
            if (charIndex === -1) throw new Error(`character ${char} not found in the alphabet!`);
            value = value * base + charIndex;
        }
        bytes[byteIndex++] = value;
    }
    return decoder().decode(bytes);
}
