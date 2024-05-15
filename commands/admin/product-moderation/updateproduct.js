const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { AdminInterface } = require("@function/distributor-data");
const { Validation, Converter, Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["edit"],
  category: "admin",
  permission: "admin",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "123ABC",
  description: `Mengambil data produk sekaligus form untuk edit/update produk.`,
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
      return msg.reply(moderationMessage("invalid_QueryEditProductIdInput"));
    } else {
      await Moderation.validateProductById(productId)
        .then(async (isValid) => {
          if (!isValid) {
            return msg.reply(commonMessage("notFound_ProductId")(productId));
          }
          await Moderation.getProduct(productId).then((productData) => {
            const { premadeForms, image: base64Image } =
              AdminInterface.mapEditForms(productData);
            client
              .sendMessage(msg.from, {
                text: moderationMessage("prompt_FillQueryEditProductForms"),
              })
              .then(async () => {
                client
                  .sendMessage(msg.from, {
                    image: await Converter.base64ToBufferConverter(base64Image),
                  })
                  .then(() => {
                    setTimeout(() => {
                      return client.sendMessage(msg.from, {
                        text: premadeForms,
                      });
                    }, 3000);
                  });
              });
          });
        })
        .catch((e) => {
          logger.error(e);
          console.error(e);
          return msg.reply(commonMessage("errorMessage"));
        });
    }
  },
};
