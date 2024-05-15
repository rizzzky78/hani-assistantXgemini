const { Moderation } = require("@controllers/admin");
const {
  collections: {
    customer,
    customerOrderData,
    customerPaymentProof,
    approvalOrderData,
    product,
  },
} = require("@database/router");
const { Tools } = require("@function/tools");
const { writeFileSync, readFileSync } = require("fs");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["code-stagging"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    const [selection] = Tools.arrayModifier("n", args);
    if (selection === "0") {
      /**
       * @type { import("@interface/product").Product[] }
       */
      const productsData = JSON.parse(
        readFileSync("./assets/json/static/stagging.products.json", "utf-8")
      );
      await product.insertMany(productsData).then(({ insertedCount }) => {
        return msg.reply(`Sukses, insserted ${insertedCount} product.`);
      });
    }
    if (selection === "1") {
      const products = await product.find().toArray();
      writeFileSync(
        "./assets/json/static/stagging.products.json",
        JSON.stringify(products, null, 2)
      );
      return msg.reply(`Sucess, count ${products.length}`);
    }
  },
};
