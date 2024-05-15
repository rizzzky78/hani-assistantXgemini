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
const { Converter, IDGenerator, Tools } = require("@function/tools");
const { writeFileSync, readFileSync } = require("fs");

/**
 * @type { import("@interface/product").ProductDataInfo[] }
 */
const rawProductsData = [
  {
    title: "TITLE",
    category: "herbal",
    price: 0,
    memberPrice: 0,
    stock: 0,
    sold: 0,
    poin: 0,
    weight: 0,
    image: "PATH",
    description: "DESCRIPTION",
  },
];

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["code-raw"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    /**
     * @type { import("@interface/product").Product[] }
     */
    const instanceRawData = [];
    rawProductsData.forEach(async (v) => {
      instanceRawData.push({
        productId: IDGenerator.generateProductId(),
        timeStamp: Tools.getDate(),
        data: {
          title: v.title.trim(),
          category: v.category,
          price: v.price,
          memberPrice: v.memberPrice,
          stock: v.stock,
          sold: v.sold,
          poin: v.poin,
          weight: v.weight,
          image: await Converter.bufferToBase64Converter(readFileSync(v.image)),
          description: v.description.trim(),
        },
      });
    });
    await product.insertMany(instanceRawData).then(({ insertedCount }) => {
      return msg.reply(`Success added ${insertedCount} product!`);
    });
  },
};
