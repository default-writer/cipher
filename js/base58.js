import { dsha256 } from "./sha256";
import { toBytes } from "./utils";

/* ------------------------------------------------------------------ *
 *  Base58 + SHA-1 checksum
 * ------------------------------------------------------------------ */

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const BASE58_INDEX = (() => {
  const map = new Map();
  for (let i = 0; i < BASE58_ALPHABET.length; i++)
    map.set(BASE58_ALPHABET[i], i);
  return map;
})();

/* ---------------------------- helpers ----------------------------- */

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/* --------------------------- encode ------------------------------- */

/**
 * Base58-encode bytes, optionally appending a SHA-1 checksum.
 *
 * @param {Uint8Array|ArrayBuffer|number[]} data   payload bytes
 * @param {object}   [opts]
 * @param {boolean}  [opts.checksum=true]          append checksum
 * @param {Function} [opts.hash=dsha256]              hash fn: bytes -> bytes
 * @param {number}   [opts.checksumLength=4]       checksum bytes to keep
 * @returns {string}
 */
function encode_base58(data, opts = {}) {
  const { checksum = true, hash = dsha256, checksumLength = 4 } = opts;

  let bytes = toBytes(data);

  if (checksum) {
    if (!Number.isInteger(checksumLength) || checksumLength < 1)
      throw new RangeError("checksumLength must be a positive integer");

    const digest = toBytes(hash(bytes));
    if (digest.length < checksumLength)
      throw new Error("hash output is shorter than checksumLength");

    bytes = concatBytes(bytes, digest.slice(0, checksumLength));
  }

  // count leading zero bytes
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  // big-endian bytes -> BigInt
  let num = 0n;
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256n + BigInt(bytes[i]);
  }

  let out = "";
  while (num > 0n) {
    const rem = Number(num % 58n);
    num /= 58n;
    out = BASE58_ALPHABET[rem] + out;
  }

  return "1".repeat(zeros) + out;
}

/* --------------------------- decode ------------------------------- */

/**
 * Base58-decode a string, optionally verifying & stripping a SHA-1 checksum.
 *
 * @param {string} str
 * @param {object}   [opts]
 * @param {boolean}  [opts.checksum=true]          verify + strip checksum
 * @param {Function} [opts.hash=dsha256]              hash fn: bytes -> bytes
 * @param {number}   [opts.checksumLength=4]       checksum bytes to verify
 * @returns {Uint8Array} payload (checksum removed)
 */
function decode_base58(str, opts = {}) {
  const { checksum = true, hash = dsha256, checksumLength = 4 } = opts;

  if (typeof str !== "string")
    throw new TypeError("decode_base58 expects a string");

  // count leading '1' -> leading zero bytes
  let zeros = 0;
  while (zeros < str.length && str[zeros] === "1") zeros++;

  let num = 0n;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const val = BASE58_INDEX.get(ch);
    if (val === undefined) {
      throw new Error(`Invalid Base58 character "${ch}" at index ${i}`);
    }
    num = num * 58n + BigInt(val);
  }

  // BigInt -> big-endian bytes
  const body = [];
  if (num > 0n) {
    let hex = num.toString(16);
    if (hex.length % 2) hex = "0" + hex;
    for (let i = 0; i < hex.length; i += 2) {
      body.push(parseInt(hex.substr(i, 2), 16));
    }
  }

  let bytes = new Uint8Array(zeros + body.length);
  bytes.set(body, zeros);

  if (!checksum) return bytes;

  if (bytes.length < checksumLength)
    throw new Error("Input is too short to contain a checksum");

  const payload = bytes.slice(0, bytes.length - checksumLength);
  const provided = bytes.slice(bytes.length - checksumLength);

  const digest = toBytes(hash(payload));
  if (digest.length < checksumLength)
    throw new Error("hash output is shorter than checksumLength");

  const expected = digest.slice(0, checksumLength);

  if (!bytesEqual(provided, expected)) {
    throw new Error("Invalid checksum");
  }

  return payload;
}

/* ---------------------------- exports ----------------------------- */
export { encode_base58, decode_base58 };
