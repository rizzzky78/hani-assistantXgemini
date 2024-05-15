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
  aliases: ["code-product"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    const [selection] = Tools.arrayModifier("l", args);
    /**
     * @type { Array<import("@interface/product").Product> }
     */
    const productsData = JSON.parse(
      readFileSync("./assets/json/static/mappedproducts.json", "utf-8")
    );
    /**
     * @type { Array<{ id: string; cat: import("@interface/product").ProductCategory; productName: string; memPrice: number; poins: number; weight: number }> }
     */
    const partialProductsData = JSON.parse(
      readFileSync("./assets/json/static/partialproducts.json", "utf-8")
    );
    if (selection === "append") {
      await product.insertMany(productsData).then(({ insertedCount }) => {
        return msg.reply(`Succes, inserted ${insertedCount} product.`);
      });
    }
    if (selection === "reset") {
      await product.deleteMany({}).then(({ deletedCount }) => {
        return msg.reply(`Succes, deleted ${deletedCount} product`);
      });
    }
    if (selection === "mutate") {
      const productsWithId = await product.find().toArray();
      /**
       * @type { import("mongodb").AnyBulkWriteOperation<import("@interface/product").Product>[] }
       */
      const bulkWriteData = partialProductsData.map((v) => ({
        updateOne: {
          filter: {
            productId: v.id,
          },
          update: {
            $set: {
              "data.memberPrice": v.memPrice,
              "data.poin": v.poins,
              "data.weight": v.weight,
              "data.stock": 50,
              "data.sold": 0,
            },
          },
        },
      }));
      await product.bulkWrite(bulkWriteData).then(({ modifiedCount }) => {
        return msg.reply(`Success, modified ${modifiedCount} product.`);
      });
    }
  },
};
