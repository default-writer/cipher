import { TextEncoder, TextDecoder } from 'node:util';

export function str2hex(str) {
    const bytes = new TextEncoder().encode(str);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function hex2str(hex) {
    const cleanHex = hex.replace(/\s+/g, "");
    const bytes = new Uint8Array(
        cleanHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    return new TextDecoder().decode(bytes);
}

export function bytesToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

export function base64ToBytes(base64) {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
}

/*
 * encoding: any unicode text -> string of alphabet characters
 */
export function encode(plaintext, alphabetString) {
    const base = alphabetString.length;
    const chunkLen = Math.ceil(Math.log(256) / Math.log(base));
    const bytes = new TextEncoder().encode(plaintext);
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
        let value = bytes[i];
        let chunk = "";
        for (let j = 0; j < chunkLen; j++) {
            const remainder = value % base;
            chunk = alphabetString[remainder] + chunk;
            value = Math.floor(value / base);
        }
        result += chunk;
    }
    return result;
}

/*
 * decoding: string of alphabet characters -> original text
 */
export function decode(encodedText, alphabetString) {
    const base = alphabetString.length;
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
            const charIndex = alphabetString.indexOf(char);
            if (charIndex === -1) throw new Error(`character ${char} not found in the alphabet!`);
            value = value * base + charIndex;
        }
        bytes[byteIndex++] = value;
    }
    return new TextDecoder().decode(bytes);
}
