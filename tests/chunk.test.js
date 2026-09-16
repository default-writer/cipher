import { encode, decode } from "../js/utils";

test("test: encode and decode test", () => {
    const text = `🍎🍏 The atmosphere of Mars is about 100 times thinner than Earth's, and it is 95 percent carbon dioxide.`;

    const binAlphabet = "01";
    const binEncoded = encode(text, binAlphabet);
    console.log("binary view first 32 characters:", binEncoded.substring(0, 32));

    const hexAlphabet = "0123456789ABCDEF";
    const hexEncoded = encode(text, hexAlphabet);
    console.log("hex view first 8 characters:", hexEncoded.substring(0, 8));

    console.log("decoded binary matches:", decode(binEncoded, binAlphabet) === text);
    console.log("decoded hex matches:", decode(hexEncoded, hexAlphabet) === text);
    expect(text).toBe(decode(binEncoded, binAlphabet));
    expect(text).toBe(decode(hexEncoded, hexAlphabet));
});
