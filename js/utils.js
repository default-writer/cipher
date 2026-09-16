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