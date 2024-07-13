const schedule = require("node-schedule");
const {
  collections: { product },
} = require("@database/router");

const { readFileSync, writeFileSync } = require("fs");

class ApiModeration {
  static async getDataProducts() {
    const products = await product.find().toArray();
    const result = products.map((v) => {
      const { image, ...res } = v.data;
      return res;
    });
    return JSON.stringify(result, null, 2);
  }
  static async writeProductDataState() {
    const fileData = await this.getDataProducts();
    writeFileSync("./assets/json/state/data-products.json", fileData);
  }

  static async autoUpdateProductsDataState() {
    logger.info("Products Data State updated!");
    const fileData = await this.getDataProducts();
    writeFileSync("./assets/json/state/data-products.json", fileData);
  }

  static async readProductDataState() {
    const fileDataString = readFileSync(
      "./assets/json/state/data-products.json",
      "utf-8"
    );
    /**
     * @type { import("@interface/product").Product[] }
     */
    const mapped = JSON.parse(fileDataString);
    if (!mapped || !mapped.length) {
      await this.writeProductDataState();
    }
    return fileDataString;
  }
}

schedule.scheduleJob("0 */2 * * *", async () => {
  await ApiModeration.autoUpdateProductsDataState();
});

module.exports = { ApiModeration };
