import { Chart } from "chart.js/auto";

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
import { chipher } from "./codec";
import { click, saveAs } from "./io";
import { default_alphabet } from "./alphabet";
import { update_chart } from "./charts";

const ux = {
  alphabet1: document.getElementById("alphabet1"),
  plaintext1: document.getElementById("plaintext1"),
  IV1: document.getElementById("IV1"),
  output1: document.getElementById("output1"),
  input1: document.getElementById("input1"),
  replace1: document.getElementById("replace1"),
  convert1: document.getElementById("convert1"),
  sha_plaintext1: document.getElementById("sha_plaintext1"),
  sha_1: document.getElementById("sha_1"),
  shift1: document.getElementById("shift1"),
  import_json: document.getElementById("import_json"),
  export_json: document.getElementById("export_json"),
  upload_json: document.getElementById("upload_json"),
  export_public_json: document.getElementById("export_public_json"),
  alphabet2: document.getElementById("alphabet2"),
  plaintext2: document.getElementById("plaintext2"),
  IV2: document.getElementById("IV2"),
  output2: document.getElementById("output2"),
  input2: document.getElementById("input2"),
  replace2: document.getElementById("replace2"),
  convert2: document.getElementById("convert2"),
  sha_plaintext2: document.getElementById("sha_plaintext2"),
  sha_2: document.getElementById("sha_2"),
  shift2: document.getElementById("shift2"),
  app1: document.getElementById("app1"),
  app2: document.getElementById("app2"),
  apply1: document.getElementById("apply1"),
  apply2: document.getElementById("apply2"),
  randomize: document.getElementById("randomize"),
  alphabet_random: document.getElementById("alphabet_random"),
  alphabet_default: document.getElementById("alphabet_default"),
  alphabet_basic: document.getElementById("alphabet_basic"),
  encrypt: document.getElementById("encrypt"),
  decrypt: document.getElementById("decrypt"),
  init: function () {
    chipher.selector(function (a, b) {
      return a;
    });
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
      }
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
      }
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
      }
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
      }
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
      loadContent();
    });
    this.export_json.addEventListener("click", (event) => {
      event.preventDefault();
      saveContent();
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
        { type: "application/json;charset=utf-8" }
      );
      saveAs(blob, "settings-public.json");
    });
    // convert1.addEventListener("click", (event) => {
    //   event.preventDefault();

    //   let text = this.output1.value;
    //   if (!text || text.length === 0) return;

    //   for (let i_ = 0; i_ < 32; i_++) {
    //     // 1. Считаем частоту каждого символа в тексте
    //     const frequencies = {};
    //     for (const char of text) {
    //       frequencies[char] = (frequencies[char] || 0) + 1;
    //     }

    //     // 2. Находим экстремумы (максимальную и минимальную частоту)
    //     let maxCount = 0;
    //     let minCount = Infinity;

    //     for (const char in frequencies) {
    //       if (frequencies[char] > maxCount) maxCount = frequencies[char];
    //       if (frequencies[char] < minCount) minCount = frequencies[char];
    //     }

    //     // 3. Собираем списки кандидатов (если символов с одинаковой частотой несколько)
    //     const mostFrequentChars = [];
    //     const leastFrequentChars = [];

    //     for (const char in frequencies) {
    //       if (frequencies[char] === maxCount) mostFrequentChars.push(char);
    //       if (frequencies[char] === minCount) leastFrequentChars.push(char);
    //     }

    //     // 4. Случайно выбираем один самый частый и один самый редкий символ
    //     const targetChar =
    //       mostFrequentChars[
    //         Math.floor(Math.random() * mostFrequentChars.length)
    //       ];
    //     const replacement =
    //       leastFrequentChars[
    //         Math.floor(Math.random() * leastFrequentChars.length)
    //       ];

    //     // Защита: если самый частый и самый редкий символ — это один и тот же символ (в тексте всего 1 уникальный символ), ничего не делаем
    //     if (targetChar === replacement) return;

    //     // 5. Находим все индексы вхождений выбранного частого символа
    //     const indexes = [];
    //     for (let i = 0; i < text.length; i++) {
    //       if (text[i] === targetChar) {
    //         indexes.push(i);
    //       }
    //     }

    //     // 6. Заменяем ровно одно случайное вхождение
    //     if (indexes.length > 0) {
    //       const randomIndex =
    //         indexes[Math.floor(Math.random() * indexes.length)];

    //       text =
    //         text.substring(0, randomIndex) +
    //         replacement +
    //         text.substring(randomIndex + 1);

    //       // Перезаписываем текст в интерфейсе
    //       this.output1.value = text;
    //     }
    //   }

    //   // 7. Обновляем левые графики
    //   this.update_chart1(text);
    //   this.update_chart3(text);
    // });
    convert1.addEventListener("click", (event) => {
      event.preventDefault();

      let text = this.output1.value;
      if (!text || text.length === 0) return;

      // Берем оригинальный plaintext из левой колонки для проверки целостности
      const originalPlaintext = this.plaintext1.value;

      // Функция валидации: проверяет, расшифруется ли кандидатная строка обратно в оригинал
      const isValidDecryption = (candidateText) => {
        try {
          // ИСПРАВЛЕНИЕ БАГА ИТЕРИРОВАНИЯ:
          // 1. Принудительно приводим кандидат к строковому примитиву String(), чтобы Babel-спред внутри codec.js не падал
          const safeCipherText = String(candidateText);

          // 2. Преобразуем строку алфавита в итерируемый массив (как требует codec.js)
          const alphabetArray = this.alphabet2.value
            ? [...this.alphabet2.value]
            : [];

          // 3. Вызываем дешифратор с явными параметрами, идентично вашему тест-кейсу
          const decryptedResult = chipher.decrypt(
            safeCipherText,
            this.IV2.value,
            parseInt(this.shift2.value, 10) || 0,
            alphabetArray,
            this.sha_2.value
          );

          // Проверяем результат (если дешифратор вернул массив символов, склеиваем в строку)
          const decryptedString = Array.isArray(decryptedResult)
            ? decryptedResult.join("")
            : decryptedResult;

          // Возвращаем true, если восстановленный текст совпадает с исходным
          return decryptedString === originalPlaintext;
        } catch (e) {
          console.error("Ошибка во время тестового декодирования:", e);
          return false;
        }
      };

      // Стартовая проверка устойчивости исходного текста
      if (!isValidDecryption(text)) {
        console.error(
          "Исходный шифротекст не может быть расшифрован с текущими настройками правой колонки!"
        );
        return;
      }

      let iterations = 0;
      const maxSafetyCounter = 5000; // Предохранитель бесконечного цикла

      while (iterations < maxSafetyCounter) {
        iterations++;

        // 1. Считаем частоту каждого символа в текущем успешном тексте
        const frequencies = {};
        for (const char of text) {
          frequencies[char] = (frequencies[char] || 0) + 1;
        }

        // 2. Находим экстремумы (максимальную и минимальную частоту)
        let maxCount = 0;
        let minCount = Infinity;

        for (const char in frequencies) {
          if (frequencies[char] > maxCount) maxCount = frequencies[char];
          if (frequencies[char] < minCount) minCount = frequencies[char];
        }

        // КРИТЕРИЙ УСТОЙЧИВОСТИ: Идеальное распределение достигнуто (разница <= 1)
        // Пример: если в тексте осталось распределение по 20 и 21 символу, цикл останавливается
        if (maxCount - minCount <= 1) {
          console.log(
            `Идеальное сбалансированное распределение достигнуто за ${iterations} итераций.`
          );
          break;
        }

        // 3. Собираем списки кандидатов на перестановку
        const mostFrequentChars = [];
        const leastFrequentChars = [];

        for (const char in frequencies) {
          if (frequencies[char] === maxCount) mostFrequentChars.push(char);
          if (frequencies[char] === minCount) leastFrequentChars.push(char);
        }

        // 4. Случайно выбираем один самый частый и один самый редкий символ из ранжирования
        const targetChar =
          mostFrequentChars[
            Math.floor(Math.random() * mostFrequentChars.length)
          ];
        const replacement =
          leastFrequentChars[
            Math.floor(Math.random() * leastFrequentChars.length)
          ];

        if (targetChar === replacement) break;

        // 5. Находим все индексы вхождений выбранного частого символа
        const indexes = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === targetChar) {
            indexes.push(i);
          }
        }

        // 6. Заменяем ровно одно случайное вхождение
        if (indexes.length > 0) {
          const randomIndex =
            indexes[Math.floor(Math.random() * indexes.length)];

          const candidateText =
            text.substring(0, randomIndex) +
            replacement +
            text.substring(randomIndex + 1);

          // Проверяем устойчивость подстановки через тестовую дешифрацию
          if (isValidDecryption(candidateText)) {
            text = candidateText; // Шаг успешен, фиксируем изменения строки
          } else {
            // ОТКАТ: Если замена повредила внутренние блоки восстановления каналов,
            // текущий candidateText отбрасывается, выполнение прерывается,
            // а переменная `text` сохраняет полностью рабочий вид с предыдущего шага.
            console.warn(
              `Автоматический откат подстановки на итерации ${iterations}: мутация '${targetChar}' -> '${replacement}' нарушила целостность каналов.`
            );
            break;
          }
        }
      }

      // Записываем финальный устойчивый текст в интерфейс
      this.output1.value = text;

      // Вызываем штатный дешифратор приложения для обновления правого текстового поля
      decrypt();

      // 7. Обновляем левые графики (теперь они перерисуют ровную линию и симметричный круг)
      this.update_chart1(text);
      this.update_chart3(text);
    });
    apply1.addEventListener("click", (event) => {
      event.preventDefault();
      let text = this.output1.value;
      const targetChar = this.input1.value;
      const replacement = this.replace1.value;
      if (targetChar && text.includes(targetChar)) {
        const indexes = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === targetChar) {
            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          const randomIndex =
            indexes[Math.floor(Math.random() * indexes.length)];
          text =
            text.substring(0, randomIndex) +
            replacement +
            text.substring(randomIndex + 1);
          this.output1.value = text;
        }
      }
      this.update_chart1(text);
      this.update_chart3(text);
    });
    apply2.addEventListener("click", (event) => {
      event.preventDefault();
      let text = this.output2.value;
      const targetChar = this.input2.value;
      const replacement = this.replace2.value;
      if (targetChar && text.includes(targetChar)) {
        const indexes = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === targetChar) {
            indexes.push(i);
          }
        }
        if (indexes.length > 0) {
          const randomIndex =
            indexes[Math.floor(Math.random() * indexes.length)];
          text =
            text.substring(0, randomIndex) +
            replacement +
            text.substring(randomIndex + 1);
          this.output2.value = text;
        }
      }
      this.update_chart2(text);
      this.update_chart4(text);
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
      this.sha_1.value = sha1(alphabet);
      encrypt();
    });
    plaintext1.addEventListener("input", (event) => {
      event.preventDefault();
      set_plaintext(plaintext1.value);
      this.sha_plaintext1.value = sha1(plaintext);
      encrypt();
    });
    randomize.addEventListener("click", (event) => {
      event.preventDefault();
      this.IV1.value = random();
      encrypt();
    });
    alphabet_default.addEventListener("click", (event) => {
      event.preventDefault();
      setup_();
    });
    alphabet_basic.addEventListener("click", (event) => {
      event.preventDefault();
      set_alphabet(
        "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890 .\n"
      );
      set_plaintext("This is a text.");
      this.alphabet1.value = alphabet.join("");
      this.sha_1.value = sha1(alphabet);
      this.plaintext1.value = plaintext.join("");
      this.sha_plaintext1.value = sha1(plaintext);
      encrypt();
    });
    this.alphabet_random.addEventListener("click", (event) => {
      event.preventDefault();
      random_key();
      this.alphabet1.value = alphabet.join("");
      this.sha_1.value = sha1(alphabet);
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
    this.sha_1.readOnly = true;
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

function loadContent() {
  click(upload_json);
}

function saveContent() {
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
    { type: "application/json;charset=utf-8" }
  );
  saveAs(blob, "settings.json");
}

function load_(file) {
  read(file)
    .then((content) => {
      const json = JSON.parse(content);
      plaintext2.value = json.cipher;
      sha_plaintext2.value = json.sha;
      alphabet2.value = json.key
        ? [...json.key].join("")
        : [...default_alphabet].join("");
      sha_2.value = json.key
        ? sha1([...json.key])
        : sha1([...default_alphabet]);
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
  default_key();
  alphabet1.value = alphabet.join("");
  plaintext1.value = plaintext.join("");
  sha_1.value = sha1(alphabet);
  sha_plaintext1.value = sha1(plaintext);
  IV1.value = 1;
  shift1.value = 1;
  IV2.value = 1;
  shift2.value = 1;
  plaintext2.value = plaintext.value;
}

function prepare1_() {
  IV1.value = IV2.value;
  shift1.value = shift2.value;
  alphabet1.value = alphabet2.value;
  plaintext1.value = output2.value;
  sha_1.value = sha_2.value;
  sha_plaintext1.value = sha_plaintext2.value;
}

function prepare2_() {
  IV2.value = IV1.value;
  shift2.value = shift1.value;
  alphabet2.value = alphabet1.value;
  plaintext2.value = output1.value;
  sha_2.value = sha_1.value;
  sha_plaintext2.value = sha_plaintext1.value;
}

function encrypt() {
  var result = chipher.encrypt(
    ux.plaintext1.value,
    ux.IV1.value,
    ux.shift1.value,
    ux.alphabet1.value,
    ux.sha_1.value
  );
  ux.output1.value = result;
  ux.update_chart1(result);
  ux.update_chart3(result);
}

function decrypt() {
  var result = chipher.decrypt(
    ux.plaintext2.value,
    ux.IV2.value,
    ux.shift2.value,
    ux.alphabet2.value,
    ux.sha_2.value
  );
  ux.output2.value = result;
  ux.update_chart2(result);
  ux.update_chart4(result);
}

function setup_(isMain) {
  if (isMain === true) {
    init_();
    encrypt();
    prepare2_();
    decrypt();
  }
}

function bytesToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

function base64ToBytes(base64) {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
  return new TextDecoder().decode(bytes);
}

export function ui() {
  ux.init();
  setup_(true);
}

export { ux };
