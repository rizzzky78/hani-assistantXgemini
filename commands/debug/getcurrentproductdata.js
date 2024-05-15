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
  aliases: ["get-current-product"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    /**
     * @type { Array<{ productId: string; category: string; productName: string; regularPrice: number; memberPrice: number; poinEach: number; weight: number; }> }
     */
    const currentProducts = JSON.parse(
      readFileSync("./assets/json/static/current.products.json", "utf-8")
    );
    const { data: products } = await Moderation.getAllProduct();
    products.forEach((v) => {
      currentProducts.push({
        productId: v.productId,
        category: v.data.category,
        productName: v.data.title,
        regularPrice: v.data.price,
        memberPrice: v.data.memberPrice,
        poinEach: v.data.poin,
        weight: v.data.weight,
      });
    });
    writeFileSync(
      "./assets/json/static/current.products.json",
      JSON.stringify(currentProducts, null, 2)
    );
    return msg.reply("Success saved current products!");
  },
};
