const { moderationMessage, commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { AdminInterface } = require("@function/distributor-data");
const { Converter, Validation, Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["hapusproduk"],
  category: "admin",
  permission: "admin",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "123ABC",
  description: `Inisiasi awal sebelum menghapus data produk secara permanen.`,
  callback: async ({ msg, client, args }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    }
    const [productId] = Tools.arrayModifier("u", args);
    if (!productId) {
      return client.sendMessage(msg.from, {
        text: moderationMessage("invalid_QueryDeleteProductIdInput"),
      });
    }
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        await Moderation.validateProductById(productId)
          .then(async (isValid) => {
            if (!isValid) {
              return msg.reply(
                moderationMessage("notFound_ProductId")(productId)
              );
            }
            await Moderation.getProduct(productId).then(async (productData) => {
              const { caption, image } =
                AdminInterface.displayProductBeforeDelete(productData);
              return client
                .sendMessage(msg.from, {
                  caption,
                  image: await Converter.base64ToBufferConverter(image),
                })
                .then(() => {
                  setTimeout(() => {
                    return client.sendMessage(msg.from, {
                      text: `konfirmasi-hapusproduk ${productData.productId}`,
                    });
                  }, 3000);
                });
            });
          })
          .catch((e) => {
            logger.error(e);
            console.error(e);
            return msg.reply(commonMessage("errorMessage"));
          });
      });
  },
};
