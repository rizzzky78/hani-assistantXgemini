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
const { writeFileSync } = require("fs");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["code-dev"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    const { status, data: products } = await Moderation.getAllProduct();
    const mapped = products.map((v) => {
      const {
        productId,
        data: { category, price, memberPrice, poin, weight },
      } = v;
      return { id: productId, cat: category, price, memberPrice, poin, weight };
    });
    writeFileSync(
      "./assets/json/static/partialproducts.json",
      JSON.stringify(mapped, null, 2)
    );
    return msg.reply("Success!");
  },
};
