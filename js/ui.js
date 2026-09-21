import { Chart } from "chart.js/auto";
import { encode, decode } from "../js/utils";
import { default_alphabet, default_plaintext } from "../js/common";
import { random_alphabet, random_value } from "../js/cipher";

import { sha1 } from "./cipher";
import { chipher } from "./codec";
import { click, saveAs } from "./io";
import { update_chart } from "./charts";

const ux = {
  alphabet1: document.getElementById("alphabet1"),
  plaintext1: document.getElementById("plaintext1"),
  IV1: document.getElementById("IV1"),
  output1: document.getElementById("output1"),
  convert1: document.getElementById("convert1"),
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
  sha_plaintext2: document.getElementById("sha_plaintext2"),
  shift2: document.getElementById("shift2"),
  app1: document.getElementById("app1"),
  app2: document.getElementById("app2"),
  randomize: document.getElementById("randomize"),
  alphabet_random: document.getElementById("alphabet_random"),
  alphabet_default: document.getElementById("alphabet_default"),
  alphabet_basic: document.getElementById("alphabet_basic"),
  encrypt: document.getElementById("encrypt"),
  decrypt: document.getElementById("decrypt"),
  init: function () {
    this.chart1 = new Chart(
      document.getElementById("myChart1").getContext("2d"),
      {
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
          },
        },
      },
    );
    this.chart2 = new Chart(
      document.getElementById("myChart2").getContext("2d"),
      {
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
          },
        },
      },
    );
    this.chart3 = new Chart(
      document.getElementById("myChart3").getContext("2d"),
      {
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
          },
        },
      },
    );
    this.chart4 = new Chart(
      document.getElementById("myChart4").getContext("2d"),
      {
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
          },
        },
      },
    );
    this.output1.addEventListener("change", (event) => {
      event.preventDefault();
      const text = this.output1.value;
      this.update_chart1(text);
      this.update_chart3(text);
    });
    this.output2.addEventListener("change", (event) => {
      event.preventDefault();
      const text = this.output2.value;
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
          const alphabetArray = this.alphabet1.value
            ? [...this.alphabet1.value]
            : [];
          const decryptedResult = chipher.decrypt(
            safeCipherText,
            this.IV1.value,
            parseInt(this.shift1.value, 10) || 0,
            alphabetArray,
          );
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
        const targetChar =
          mostFrequentChars[
            Math.floor(Math.random() * mostFrequentChars.length)
          ];
        const replacement =
          leastFrequentChars[
            Math.floor(Math.random() * leastFrequentChars.length)
          ];
        if (targetChar === replacement) break;
        const indexes = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === targetChar) {
            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          const randomIndex =
            indexes[Math.floor(Math.random() * indexes.length)];
          const candidateText = [
            ...text.slice(0, randomIndex),
            ...replacement,
            ...text.slice(randomIndex + 1),
          ];
          if (isValidDecryption(candidateText)) {
            text = [...candidateText];
          } else {
            console.warn(
              `rollback on ${iterations}: as '${targetChar}' -> '${replacement}' failed the integrity check.`,
            );
          }
        }
      }
      this.output1.value = text.join("");
      decrypt();
      this.update_chart1(text);
      this.update_chart3(text);
    });
    app1.addEventListener("click", (event) => {
      event.preventDefault();
      prepare2_();
    });
    app2.addEventListener("click", (event) => {
      event.preventDefault();
      prepare1_();
    });
    IV1.addEventListener("input", (event) => {
      event.preventDefault();
      encrypt();
    });
    alphabet1.addEventListener("input", (event) => {
      event.preventDefault();
      encrypt();
    });
    plaintext1.addEventListener("input", (event) => {
      event.preventDefault();
      this.sha_plaintext1.value = sha1(default_plaintext);
      encrypt();
    });
    randomize.addEventListener("click", (event) => {
      event.preventDefault();
      this.IV1.value = random_value();
      encrypt();
    });
    alphabet_default.addEventListener("click", (event) => {
      event.preventDefault();
      var plaintext = default_plaintext;
      var alphabet = default_alphabet;
      this.alphabet1.value = alphabet.join("");
      this.plaintext1.value = plaintext;
      this.sha_plaintext1.value = sha1(plaintext);
      encrypt();
    });
    alphabet_basic.addEventListener("click", (event) => {
      event.preventDefault();
      var plaintext = "This is a text.";
      var alphabet =
        "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890 .\n";
      this.alphabet1.value = alphabet;
      this.plaintext1.value = plaintext;
      this.sha_plaintext1.value = sha1(plaintext);
      encrypt();
    });
    this.alphabet_random.addEventListener("click", (event) => {
      event.preventDefault();
      var alphabet = random_alphabet([...this.alphabet1.value]);
      this.alphabet1.value = alphabet.join("");
      encrypt();
    });
    this.shift1.addEventListener("change", (event) => {
      event.preventDefault();
      encrypt();
    });
    this.encrypt.addEventListener("click", (event) => {
      event.preventDefault();
      encrypt();
    });
    this.decrypt.addEventListener("click", (event) => {
      event.preventDefault();
      decrypt();
    });
    this.sha_plaintext1.readOnly = true;
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
};

function load_(file) {
  read(file)
    .then((content) => {
      const json = JSON.parse(content);
      plaintext2.value = json.cipher;
      sha_plaintext2.value = json.sha;
      alphabet2.value = json.key
        ? [...json.key].join("")
        : [...default_alphabet].join("");
      shift2.value = json.shift ? parseInt(json.shift, 10) : 1;
      IV2.value = json.iv ? parseInt(json.iv, 10) : 1;
      decrypt();
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

function init_() {
  alphabet1.value = default_alphabet.join("");
  plaintext1.value = default_plaintext;
  sha_plaintext1.value = sha1(default_plaintext);
  IV1.value = 1;
  shift1.value = 1;
  IV2.value = 1;
  shift2.value = 1;
  plaintext2.value = null;
  output2.value = null;
}

function prepare1_() {
  IV1.value = IV2.value;
  shift1.value = shift2.value;
  alphabet1.value = alphabet2.value;
  plaintext1.value = output2.value;
  sha_plaintext1.value = sha_plaintext2.value;
}

function prepare2_() {
  IV2.value = IV1.value;
  shift2.value = shift1.value;
  alphabet2.value = alphabet1.value;
  plaintext2.value = output1.value;
  sha_plaintext2.value = sha_plaintext1.value;
  output2.value = null;
}

function encrypt() {
  var result = chipher.encrypt(
    ux.plaintext1.value,
    ux.IV1.value,
    ux.shift1.value,
    ux.alphabet1.value,
  );
  ux.output1.value = result.join("");
  ux.update_chart1(result);
  ux.update_chart3(result);
}

function decrypt() {
  var result = chipher.decrypt(
    ux.plaintext2.value,
    ux.IV2.value,
    ux.shift2.value,
    ux.alphabet2.value,
  );
  ux.output2.value = result;
  ux.update_chart2(result);
  ux.update_chart4(result);
}

export function ui() {
  ux.init();
  init_();
  encrypt();
  prepare2_();
  decrypt();
}

export { ux };
