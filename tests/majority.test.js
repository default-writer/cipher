import { chipher } from "../js/codec";

describe("recover tests", () => {
  const plaintext = "NASA_MARS";
  const iv = "58216150";
  const shift = 1;
  const alphabet =
    "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const sha = "b539474cb934ef";

  test("test: 0% errors on 5 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet, sha);
    const restoredText = chipher.decrypt(cipherText, iv, shift, alphabet, sha);
    expect(restoredText).toBe(plaintext);
  });

  test("test: 100% errors on 1 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet, sha);
    const partLength = Math.floor(cipherText.length / 5);
    const brokenCipherText =
      "X".repeat(partLength) + cipherText.substring(partLength);

    const restoredText = chipher.decrypt(
      brokenCipherText,
      iv,
      shift,
      alphabet,
      sha
    );
    expect(restoredText).toBe(plaintext);
  });

  test("test: 100% errors on 2 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet, sha);
    const partLength = Math.floor(cipherText.length / 5);
    const badStream = "X".repeat(partLength);
    const brokenCipherText =
      badStream + badStream + cipherText.substring(partLength * 2);

    const restoredText = chipher.decrypt(
      brokenCipherText,
      iv,
      shift,
      alphabet,
      sha
    );

    expect([plaintext, "X".repeat(plaintext.length)]).toContain(restoredText);
  });

  test("test: 100% errors on 1 random channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet, sha);
    const partLength = Math.floor(cipherText.length / 5);

    let channels = [
      cipherText.substring(0, partLength).split(""),
      cipherText.substring(partLength, partLength * 2).split(""),
      cipherText.substring(partLength * 2, partLength * 3).split(""),
      cipherText.substring(partLength * 3, partLength * 4).split(""),
      cipherText.substring(partLength * 4).split(""),
    ];

    let visualMatrix = [["ch1"], ["ch2"], ["ch3"], ["ch4"], ["ch5"]];

    for (let i = 0; i < partLength; i++) {
      const randomChannelIdx = Math.floor(Math.random() * 5);
      let badChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      channels[randomChannelIdx][i] = badChar;
      for (let c = 0; c < 5; c++) {
        visualMatrix[c].push(c === randomChannelIdx ? "x" : "o");
      }
    }

    console.table(visualMatrix);

    const brokenCipherText = channels.map((ch) => ch.join("")).join("");
    const restoredText = chipher.decrypt(
      brokenCipherText,
      iv,
      shift,
      alphabet,
      sha
    );

    expect(restoredText).toBe(plaintext);
  });

  test("test: 100% errors on 2 random channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet, sha);
    const partLength = Math.floor(cipherText.length / 5);

    let channels = [
      cipherText.substring(0, partLength).split(""),
      cipherText.substring(partLength, partLength * 2).split(""),
      cipherText.substring(partLength * 2, partLength * 3).split(""),
      cipherText.substring(partLength * 3, partLength * 4).split(""),
      cipherText.substring(partLength * 4).split(""),
    ];

    let visualMatrix = [["ch1"], ["ch2"], ["ch3"], ["ch4"], ["ch5"]];

    for (let i = 0; i < partLength; i++) {
      const randomChannelIdx1 = Math.floor(Math.random() * 5);
      const randomChannelIdx2 = Math.floor(Math.random() * 5);
      let badChar1 = alphabet[Math.floor(Math.random() * alphabet.length)];
      let badChar2 = alphabet[Math.floor(Math.random() * alphabet.length)];
      channels[randomChannelIdx1][i] = badChar1;
      channels[randomChannelIdx2][i] = badChar2;
      for (let c = 0; c < 5; c++) {
        visualMatrix[c].push(
          c === randomChannelIdx1 || c === randomChannelIdx2 ? "x" : "o"
        );
      }
    }

    console.table(visualMatrix);

    const brokenCipherText = channels.map((ch) => ch.join("")).join("");
    const restoredText = chipher.decrypt(
      brokenCipherText,
      iv,
      shift,
      alphabet,
      sha
    );

    expect(restoredText).toBe(plaintext);
  });
});
