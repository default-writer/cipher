import { encrypt_cipher, decrypt_cipher } from "./cipher";

function encrypt_plain_(input, iv, shift, alphabet) {
  const result = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...input],
    ),
  ];
  return result;
}

function decrypt_plain_(input, iv, shift, alphabet) {
  const decryptedString = input;
  const result = [
    ...decrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...decryptedString],
    ),
  ];
  return result;
}

function encrypt_(input, iv, shift, alphabet) {
  const str1 = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...input],
    ),
  ];
  const str2 = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...str1],
    ),
  ];
  let str3 = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...str2],
    ),
  ];
  let str4 = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...str3],
    ),
  ];
  let str5 = [
    ...encrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...str4],
    ),
  ];
  return [...str1, ...str2, ...str3, ...str4, ...str5];
}

function decrypt_(input, iv, shift, alphabet) {
  const partLength = Math.floor(input.length / 5);
  const result1 = [
    ...decrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [...input.slice(0, partLength)],
    ),
  ];
  const result2 = [
    ...decrypt_cipher(
      parseInt(iv, 10),
      Number(shift),
      [...alphabet],
      [
        ...decrypt_cipher(
          parseInt(iv, 10),
          Number(shift),
          [...alphabet],
          [...input.slice(partLength, partLength * 2)],
        ),
      ],
    ),
  ];
  const result3 = [
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
              [...input.slice(partLength * 2, partLength * 3)],
            ),
          ],
        ),
      ],
    ),
  ];
  const result4 = [
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
                  [...input.slice(partLength * 3, partLength * 4)],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ];
  const result5 = [
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
                  [
                    ...decrypt_cipher(
                      parseInt(iv, 10),
                      Number(shift),
                      [...alphabet],
                      [...input.slice(partLength * 4)],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ];
  const str1 = result1;
  const str2 = result2;
  const str3 = result3;
  const str4 = result4;
  const str5 = result5;
  let result = [];
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
    result.push(winnerChar);
  }
  return result;
}

const chipher = {
  encrypt_plain: function (input, iv, shift, alphabet) {
    return encrypt_plain_(input, iv, shift, alphabet);
  },
  decrypt_plain: function (input, iv, shift, alphabet) {
    return decrypt_plain_(input, iv, shift, alphabet);
  },
  encrypt: function (input, iv, shift, alphabet) {
    return encrypt_(input, iv, shift, alphabet);
  },
  decrypt: function (input, iv, shift, alphabet) {
    return decrypt_(input, iv, shift, alphabet);
  },
};

export { chipher };
