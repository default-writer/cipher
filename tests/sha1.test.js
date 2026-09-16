import { binb2hex, hex2binb, hex_sha1 } from "../js/sha1";

/*
 * Perform a simple self-test to see if the VM is working
 */
test("validate string to sha1 conversion", () => {
  expect(binb2hex(hex2binb(hex_sha1("abc")))).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
});
