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
 * @memberof Debug
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["mutate-products"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    /**
     * @type { import("@interface/product").Product[] }
     */
    const rawProducts = JSON.parse(
      readFileSync("./assets/json/static/stagging.products.json", "utf-8")
    );

    await product.deleteMany({}).then(async () => {
      await product.insertMany(rawProducts).then(({ insertedCount }) => {
        return msg.reply(`Success, inserted ${insertedCount} product.`);
      });
    });
  },
};
