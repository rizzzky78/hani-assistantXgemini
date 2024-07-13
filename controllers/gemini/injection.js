const { readFileSync } = require("fs");

class Injection {
  static injectChatData() {
    return [
      {
        role: "user",
        parts: [
          {
            text: readFileSync(
              "./assets/data/general-information.txt",
              "utf-8"
            ),
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: `Understood, please let me know the next instructions or any specific details you need further analyzed or processed from this data.`,
          },
        ],
      },
    ];
  }
  static rawInjectData() {
    return readFileSync("./assets/data/general-information.txt", "utf-8");
  }
  /**
   *
   * @param { string } user
   * @param { string } model
   */
  static injectMultiData(user, model) {
    return [
      {
        role: "user",
        parts: [
          {
            text: user,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: model,
          },
        ],
      },
    ];
  }
  /**
   *
   * @param  { ...string } docs
   * @returns
   */
  static injectDocsData(...docs) {
    const [document, username, phoneid] = docs;
    return [
      {
        role: "user",
        parts: [
          {
            text: `<Data>\n${document}\n</Data>\n<Dynamiic Data>\n${this.rawInjectData()}\n</Dynamiic Data>\n<My Personal>\nMy Name is: ${username}\nMy Phone ID: ${phoneid}@s.whatsapp.net\n</My Personal>\n<Instruction>In next conversation you will act as Customer Service.</Instruction>`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: `Understood, please let me know the next instructions or any specific details you need further analyzed or processed from this data.`,
          },
        ],
      },
    ];
  }
}

module.exports = { Injection };
