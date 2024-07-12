const {
  collections: { product },
} = require("@database/router");
const { readFileSync, writeFileSync } = require("fs");

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
    const [document, username] = docs;
    return [
      {
        role: "user",
        parts: [
          {
            text: `<Data>\n${document}\n</Data>\n<Dynamiic Data>\n${this.rawInjectData()}\n</Dynamiic Data>\n<My Personal>My Name is: ${username}</My Personal>`,
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
  static async getDataProducts() {
    const products = await product.find().toArray();
    const result = products.map((v) => {
      const { image, ...res } = v.data;
      return res;
    });
    return JSON.stringify(result, null, 2);
  }
}

module.exports = { Injection };
