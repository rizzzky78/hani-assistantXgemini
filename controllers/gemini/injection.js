const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");
const { Validation } = require("@function/tools");
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
    const statusAdmin = Validation.validateAdmin(phoneid, {
      superAdmin,
      adminData,
    });
    return [
      {
        role: "user",
        parts: [
          {
            text: `<Data>\n${document}\n</Data>\n<PersonalData>\n<<username>>:<<${username}>>\n<<phoneNumber>>:<<${phoneid}>>\nisAdmin: ${statusAdmin}\n</PersonalData>\n<Instruction>In next conversation you will act as an Customer Service.</Instruction>`,
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
