const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { CustomerInterface } = require("@function/distributor-data");
const { Converter, Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["produk"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "123ABC",
  description: `Melihat detail informasi produk sesuai dengan ID Produk yang dituju.`,
  cooldown: 5 * 1000,
  callback: async ({ client, msg, args }) => {
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        const [productId] = Tools.arrayModifier("u", args);
        if (!productId) {
          return msg.reply(commonMessage("invalid_QueryProductId"));
        }
        await Moderation.validateProductById(productId)
          .then(async (isValid) => {
            if (!isValid) {
              return client.sendMessage(msg.from, {
                text: commonMessage("notFound_ProductId")(productId),
              });
            }
            await Moderation.getProduct(productId).then(async (productData) => {
              const { caption, image: base64Image } =
                CustomerInterface.displayProduct(productData);
              return client.sendMessage(msg.from, {
                caption,
                image: await Converter.base64ToBufferConverter(base64Image),
              });
            });
          })
          .catch((e) => {
            logger.error(e);
            return msg.reply(commonMessage("errorMessage"));
          });
      });
  },
};
