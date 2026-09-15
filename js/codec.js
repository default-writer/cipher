import {
  sha1,
  random,
  alphabet,
  plaintext,
  set_plaintext,
  random_key,
  encrypt_cipher,
  decrypt_cipher,
  default_key,
  set_alphabet,
} from "./cipher";

function str2hex(str) {
  const bytes = new TextEncoder().encode(str);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hex2str(hex) {
  const cleanHex = hex.replace(/\s+/g, "");
  const bytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return new TextDecoder().decode(bytes);
}

function encrypt_plain_(input, iv, shift, alphabet, sha) {
  const result = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...input],
    sha,
    sha1([String(...iv)])
  ).join("");
  return result;
}

function decrypt_plain_(input, iv, shift, alphabet, sha) {
  const decryptedString = input;
  const result = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...decryptedString],
    sha,
    sha1([String(...iv)])
  ).join("");
  return result;
}

function encrypt_(input, iv, shift, alphabet, sha) {
  const str1 = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...input],
    sha,
    sha1([String(...iv)])
  ).join("");
  const str2 = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...str1],
    sha,
    sha1([String(...iv)])
  ).join("");
  let str3 = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...str2],
    sha,
    sha1([String(...iv)])
  ).join("");
  let str4 = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...str3],
    sha,
    sha1([String(...iv)])
  ).join("");
  let str5 = encrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...str4],
    sha,
    sha1([String(...iv)])
  ).join("");
  return str1 + str2 + str3 + str4 + str5;
}

function decrypt_(input, iv, shift, alphabet, sha) {
  const partLength = Math.floor(input.length / 5);
  const result1 = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [...input.substring(0, partLength)],
    sha,
    sha1([String(...iv)])
  ).join("");
  const result2 = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [
      ...decrypt_cipher(
        parseInt(iv, 10),
        Number(shift),
        [...alphabet],
        [...input.substring(partLength, partLength * 2)],
        sha,
        sha1([String(...iv)])
      ).join(""),
    ],
    sha,
    sha1([String(...iv)])
  ).join("");
  const result3 = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [
      ...decrypt_cipher(
        parseInt(iv, 10),
        Number(shift),
        [...alphabet],
        [
          ...decrypt_cipher(
            parseInt(iv, 10),
            Number(shift),
            [...alphabet],
            [...input.substring(partLength * 2, partLength * 3)],
            sha,
            sha1([String(...iv)])
          ).join(""),
        ],
        sha,
        sha1([String(...iv)])
      ).join(""),
    ],
    sha,
    sha1([String(...iv)])
  ).join("");
  const result4 = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [
      ...decrypt_cipher(
        parseInt(iv, 10),
        Number(shift),
        [...alphabet],
        [
          ...decrypt_cipher(
            parseInt(iv, 10),
            Number(shift),
            [...alphabet],
            [
              ...decrypt_cipher(
                parseInt(iv, 10),
                Number(shift),
                [...alphabet],
                [...input.substring(partLength * 3, partLength * 4)],
                sha,
                sha1([String(...iv)])
              ).join(""),
            ],
            sha,
            sha1([String(...iv)])
          ).join(""),
        ],
        sha,
        sha1([String(...iv)])
      ).join(""),
    ],
    sha,
    sha1([String(...iv)])
  ).join("");
  const result5 = decrypt_cipher(
    parseInt(iv, 10),
    Number(shift),
    [...alphabet],
    [
      ...decrypt_cipher(
        parseInt(iv, 10),
        Number(shift),
        [...alphabet],
        [
          ...decrypt_cipher(
            parseInt(iv, 10),
            Number(shift),
            [...alphabet],
            [
              ...decrypt_cipher(
                parseInt(iv, 10),
                Number(shift),
                [...alphabet],
                [
                  ...decrypt_cipher(
                    parseInt(iv, 10),
                    Number(shift),
                    [...alphabet],
                    [...input.substring(partLength * 4)],
                    sha,
                    sha1([String(...iv)])
                  ).join(""),
                ],
                sha,
                sha1([String(...iv)])
              ).join(""),
            ],
            sha,
            sha1([String(...iv)])
          ).join(""),
        ],
        sha,
        sha1([String(...iv)])
      ).join(""),
    ],
    sha,
    sha1([String(...iv)])
  ).join("");
  const str1 = result1;
  const str2 = result2;
  const str3 = result3;
  const str4 = result4;
  const str5 = result5;
  let result = "";
  for (let i = 0; i < partLength; i++) {
    const char1 = str1[i];
    const char2 = str2[i];
    const char3 = str3[i];
    const char4 = str4[i];
    const char5 = str5[i];
    const votes = {};
    [char1, char2, char3, char4, char5].forEach((char) => {
      votes[char] = (votes[char] || 0) + 1;
    });
    let maxVotes = 0;
    let winnerChar = char1;
    for (let char in votes) {
      if (votes[char] > maxVotes) {
        maxVotes = votes[char];
        winnerChar = char;
      } else if (votes[char] === maxVotes && maxVotes === 1) {
        if (Math.random() > 0.2) {
          winnerChar = char;
        }
      }
    }
    result += winnerChar;
  }
  return result;
}

function update_chart1_(array) {
  update_chart1(array);
}

function update_chart2_(array) {
  update_chart2(array);
}

function update_chart3_(array) {
  update_chart3(array);
}

function update_chart4_(array) {
  update_chart4(array);
}

const chipher = {
  selector: function (selector) {
    this._encrypt = selector(encrypt_, encrypt_plain_);
    this._decrypt = selector(decrypt_, decrypt_plain_);
  },
  encrypt_plain: function (input, iv, shift, alphabet, sha) {
    return encrypt_plain_(input, iv, shift, alphabet, sha);
  },
  decrypt_plain: function (input, iv, shift, alphabet, sha) {
    return decrypt_plain_(input, iv, shift, alphabet, sha);
  },
  encrypt: function (input, iv, shift, alphabet, sha) {
    return this._encrypt(input, iv, shift, alphabet, sha);
  },
  decrypt: function (input, iv, shift, alphabet, sha) {
    return this._decrypt(input, iv, shift, alphabet, sha);
  },
};

export { chipher };
