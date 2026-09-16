import { TextEncoder, TextDecoder } from 'node:util';

/**
 * function to calculate fixed chunk length for a single byte 0-255
 */
function getChunkLength(alphabetLength) {
    return Math.ceil(Math.log(256) / Math.log(alphabetLength));
}

/**
 * encoding: any unicode text -> string of alphabet characters
 */
function encodeToCustomAlphabet(plaintext, alphabetString) {
    const base = alphabetString.length;
    const chunkLen = getChunkLength(base);
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

/**
 * decoding: string of alphabet characters -> original text
 */
function decodeFromCustomAlphabet(encodedText, alphabetString) {
    const base = alphabetString.length;
    const chunkLen = getChunkLength(base);

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

test("validate string to sha1 conversion", () => {
    const text = `The atmosphere of Mars is about 100 times thinner than Earth's, and it is 95 percent carbon dioxide.`;

    const binAlphabet = "01";
    const binEncoded = encodeToCustomAlphabet(text, binAlphabet);
    console.log("binary view first 32 characters:", binEncoded.substring(0, 32));

    const hexAlphabet = "0123456789ABCDEF";
    const hexEncoded = encodeToCustomAlphabet(text, hexAlphabet);
    console.log("hex view first 8 characters:", hexEncoded.substring(0, 8));

    console.log("decoded binary matches:", decodeFromCustomAlphabet(binEncoded, binAlphabet) === text);
    console.log("decoded hex matches:", decodeFromCustomAlphabet(hexEncoded, hexAlphabet) === text);
    expect(text).toBe(decodeFromCustomAlphabet(binEncoded, binAlphabet));
    expect(text).toBe(decodeFromCustomAlphabet(hexEncoded, hexAlphabet));
});
