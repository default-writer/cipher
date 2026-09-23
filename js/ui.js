import { Chart } from "chart.js/auto";
import { encode_base58, decode_base58 } from "../js/base58";
import { bytesToHex } from "../js/sha256";

import { default_alphabet, default_plaintext } from "../js/common";
import { random_alphabet, random_value } from "../js/cipher";

import { sha1 } from "./sha1";
import { chipher } from "./codec";
import { click, saveAs } from "./io";
import { update_chart } from "./charts";

const hex = (input) => bytesToHex(sha1(input));
const te = new TextEncoder();
const td = new TextDecoder();

const ux = {
  alphabet1: document.getElementById("alphabet1"),
  plaintext1: document.getElementById("plaintext1"),
  IV1: document.getElementById("IV1"),
  output1: document.getElementById("output1"),
  convert1: document.getElementById("convert1"),
  text1: document.getElementById("text1"),
  sha_plaintext1: document.getElementById("sha_plaintext1"),
  shift1: document.getElementById("shift1"),
  import_json: document.getElementById("import_json"),
  export_json: document.getElementById("export_json"),
  upload_json: document.getElementById("upload_json"),
  export_public_json: document.getElementById("export_public_json"),
  alphabet2: document.getElementById("alphabet2"),
  plaintext2: document.getElementById("plaintext2"),
  IV2: document.getElementById("IV2"),
  output2: document.getElementById("output2"),
  text2: document.getElementById("text2"),
  sha_plaintext2: document.getElementById("sha_plaintext2"),
  shift2: document.getElementById("shift2"),
  app1: document.getElementById("app1"),
  app2: document.getElementById("app2"),
  randomize: document.getElementById("randomize"),
  alphabet_random: document.getElementById("alphabet_random"),
  alphabet_default: document.getElementById("alphabet_default"),
  alphabet_basic: document.getElementById("alphabet_basic"),
  encrypt1: document.getElementById("encrypt"),
  decrypt1: document.getElementById("decrypt"),
  main: document.getElementById("main"),
  view2Btn: document.getElementById("view-2-btn"),
  view2Screen: document.getElementById("view-2-screen"),
  closeview2: document.getElementById("view-2-close"),
  init: function () {
    this.chart1 = new Chart(document.getElementById("myChart1").getContext("2d"), {
      type: "doughnut",
      data: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: "rgba(0,127,0,0.25)",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
    this.chart2 = new Chart(document.getElementById("myChart2").getContext("2d"), {
      type: "doughnut",
      data: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: "rgba(0,127,0,0.25)",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
    this.chart3 = new Chart(document.getElementById("myChart3").getContext("2d"), {
      type: "line",
      data: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: "rgba(0,127,0,0.25)",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    });
    this.chart4 = new Chart(document.getElementById("myChart4").getContext("2d"), {
      type: "line",
      data: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: "rgba(0,127,0,0.25)",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    });
    this.output1.addEventListener("input", (event) => {
      event.preventDefault();
      const text = this.output1.value;
      try {
        this.text1.value = encode_base58(te.encode(text));
      } catch {
        this.text1.value = "";
      }
      this.update_chart1(text);
      this.update_chart3(text);
    });
    this.output2.addEventListener("input", (event) => {
      event.preventDefault();
      const text = this.output2.value;
      try {
        this.text2.value = td.decode(decode_base58(text));
      } catch {
        this.text2.value = "";
      }
      this.update_chart2(text);
      this.update_chart4(text);
    });
    this.upload_json.addEventListener("change", (event) => {
      event.preventDefault();
      if (this.upload_json.files.length === 1) {
        load_(this.upload_json.files[0]);
      }
    });
    this.upload_json.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById("upload_json").value = "";
    });
    this.import_json.addEventListener("click", (event) => {
      event.preventDefault();
      click(upload_json);
    });
    this.export_json.addEventListener("click", (event) => {
      event.preventDefault();
      const blob = new Blob(
        [
          JSON.stringify({
            cipher: output1.value,
            sha: sha_plaintext1.value,
            key: alphabet1.value,
            shift: shift1.value,
            iv: IV1.value,
          }),
        ],
        { type: "application/json;charset=utf-8" },
      );
      saveAs(blob, "settings.json");
    });
    this.export_public_json.addEventListener("click", (event) => {
      event.preventDefault();
      const blob = new Blob(
        [
          JSON.stringify({
            cipher: this.output1.value,
            sha: this.sha_plaintext1.value,
          }),
        ],
        { type: "application/json;charset=utf-8" },
      );
      saveAs(blob, "settings-public.json");
    });
    this.convert1.addEventListener("click", (event) => {
      event.preventDefault();
      let text = [...this.output1.value];
      if (!text || text.length === 0) return;
      const originalPlaintext = this.plaintext1.value;
      const isValidDecryption = (candidateText) => {
        try {
          const safeCipherText = [...candidateText];
          const alphabetArray = this.alphabet1.value ? [...this.alphabet1.value] : [];
          const decryptedResult = chipher.decrypt(safeCipherText, this.IV1.value, parseInt(this.shift1.value, 10) || 0, alphabetArray).join("");
          const decryptedString = decryptedResult;
          return decryptedString === originalPlaintext;
        } catch (e) {
          console.error("error:", e);
          return false;
        }
      };
      if (!isValidDecryption(text)) {
        console.error("failed");
        return;
      }
      let iterations = 0;
      const maxSafetyCounter = 1000;
      while (iterations < maxSafetyCounter) {
        iterations++;
        const frequencies = {};
        for (const char of text) {
          frequencies[char] = (frequencies[char] || 0) + 1;
        }
        let maxCount = 0;
        let minCount = Infinity;
        for (const char in frequencies) {
          if (frequencies[char] > maxCount) maxCount = frequencies[char];
          if (frequencies[char] < minCount) minCount = frequencies[char];
        }
        if (maxCount - minCount <= 1) {
          console.log(`passed in ${iterations} cycles`);
          break;
        }
        const mostFrequentChars = [];
        const leastFrequentChars = [];
        for (const char in frequencies) {
          if (frequencies[char] === maxCount) mostFrequentChars.push(char);
          if (frequencies[char] === minCount) leastFrequentChars.push(char);
        }
        const targetChar = mostFrequentChars[Math.floor(Math.random() * mostFrequentChars.length)];
        const replacement = leastFrequentChars[Math.floor(Math.random() * leastFrequentChars.length)];
        if (targetChar === replacement) break;
        const indexes = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === targetChar) {
            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
          const candidateText = [...text.slice(0, randomIndex), ...replacement, ...text.slice(randomIndex + 1)];
          if (isValidDecryption(candidateText)) {
            text = [...candidateText];
          }
        }
      }
      this.output1.value = text.join("");
      this.text1.value = encode_base58(te.encode(this.output1.value));
      this.decrypt();
      this.update_chart1(text);
      this.update_chart3(text);
    });
    this.view2Btn.addEventListener("click", () => {
      this.view2Screen.classList.add("active");
    });
    this.closeview2.addEventListener("click", () => {
      this.view2Screen.classList.remove("active");
    });
    this.app1.addEventListener("click", (event) => {
      event.preventDefault();
      this.prepare2_();
    });
    this.app2.addEventListener("click", (event) => {
      event.preventDefault();
      this.prepare1_();
    });
    this.IV1.addEventListener("input", (event) => {
      event.preventDefault();
      this.encrypt();
    });
    this.alphabet1.addEventListener("input", (event) => {
      event.preventDefault();
      this.encrypt();
    });
    this.plaintext1.addEventListener("input", (event) => {
      event.preventDefault();
      this.sha_plaintext1.value = hex(default_plaintext);
      this.encrypt();
    });
    this.randomize.addEventListener("click", (event) => {
      event.preventDefault();
      this.IV1.value = random_value();
      this.encrypt();
    });
    this.alphabet_default.addEventListener("click", (event) => {
      event.preventDefault();
      var plaintext = default_plaintext;
      var alphabet = default_alphabet;
      this.alphabet1.value = alphabet.join("");
      this.plaintext1.value = plaintext;
      this.sha_plaintext1.value = hex(plaintext);
      this.encrypt();
    });
    this.alphabet_basic.addEventListener("click", (event) => {
      event.preventDefault();
      var plaintext = "This is a text.";
      var alphabet = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890 .\n";
      this.alphabet1.value = alphabet;
      this.plaintext1.value = plaintext;
      this.sha_plaintext1.value = hex(plaintext);
      this.encrypt();
    });
    this.alphabet_random.addEventListener("click", (event) => {
      event.preventDefault();
      var alphabet = random_alphabet([...this.alphabet1.value]);
      this.alphabet1.value = alphabet.join("");
      this.encrypt();
    });
    this.shift1.addEventListener("change", (event) => {
      event.preventDefault();
      this.encrypt();
    });
    this.encrypt1.addEventListener("click", (event) => {
      event.preventDefault();
      this.encrypt();
    });
    this.decrypt1.addEventListener("click", (event) => {
      event.preventDefault();
      this.decrypt();
    });
    this.sha_plaintext1.readOnly = true;
    this.init_();
    this.encrypt();
    this.prepare2_();
    this.decrypt();
    this.main.classList.add("active");
  },
  init_: function () {
    this.alphabet1.value = default_alphabet.join("");
    this.plaintext1.value = default_plaintext;
    this.sha_plaintext1.value = hex(default_plaintext);
    this.IV1.value = 1;
    this.shift1.value = 1;
    this.IV2.value = 1;
    this.shift2.value = 1;
    this.plaintext2.value = null;
    this.output2.value = null;
  },
  prepare1_: function () {
    this.IV1.value = this.IV2.value;
    this.shift1.value = this.shift2.value;
    this.alphabet1.value = this.alphabet2.value;
    this.plaintext1.value = this.output2.value;
    this.sha_plaintext1.value = hex(this.sha_plaintext2.value);
  },
  prepare2_: function () {
    this.IV2.value = this.IV1.value;
    this.shift2.value = this.shift1.value;
    this.alphabet2.value = this.alphabet1.value;
    this.plaintext2.value = this.output1.value;
    this.sha_plaintext2.value = this.sha_plaintext1.value;
  },
  update_chart1: function (array) {
    return update_chart(this.chart1)(array);
  },
  update_chart2: function (array) {
    return update_chart(this.chart2)(array);
  },
  update_chart3: function (array) {
    return update_chart(this.chart3)(array);
  },
  update_chart4: function (array) {
    return update_chart(this.chart4)(array);
  },
  encrypt: function () {
    try {
      this.output1.value = chipher.encrypt(this.plaintext1.value, this.IV1.value, this.shift1.value, this.alphabet1.value).join("");
      this.text1.value = encode_base58(te.encode(this.output1.value));
    } catch (_ex) {
      console.log(_ex);
      this.output1.value = "";
    }
    this.update_chart1([...this.output1.value]);
    this.update_chart3([...this.output1.value]);
  },
  decrypt: function () {
    var input = "";
    try {
      this.output2.value = chipher.decrypt([...this.plaintext2.value], this.IV2.value, this.shift2.value, this.alphabet2.value).join("");
      this.text2.value = td.decode(decode_base58(this.text1.value));
    } catch (_ex) {
      console.log(_ex);
      this.output2.value = "";
    }
    this.update_chart2([...this.output2.value]);
    this.update_chart4([...this.output2.value]);
  },
};

function load_(file) {
  read(file)
    .then((content) => {
      const json = JSON.parse(content);
      plaintext2.value = json.cipher;
      sha_plaintext2.value = json.sha;
      alphabet2.value = json.key ? [...json.key].join("") : [...default_alphabet].join("");
      shift2.value = json.shift ? parseInt(json.shift, 10) : 1;
      IV2.value = json.iv ? parseInt(json.iv, 10) : 1;
      this.decrypt();
    })
    .catch((error) => console.log(error));
}

function read(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export function ui() {
  ux.init();
}

export { ux };
