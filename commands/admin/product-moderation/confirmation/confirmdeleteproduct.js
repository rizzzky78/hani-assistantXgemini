const { moderationMessage, commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Validation, Tools } = require("@function/tools");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");
const logger = require("@libs/utils/logger");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["konfirmasi-hapusproduk"],
  category: "admin",
  permission: "admin",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "123ABC",
  description: `Mengkonfirmasi sekaligus menghapus produk yang dituju.`,
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
    } else {
      client
        .sendMessage(msg.from, {
          text: commonMessage("waitMessage"),
        })
        .then(async () => {
          await Moderation.validateProductById(productId)
            .then(async (isValidProductId) => {
              if (!isValidProductId) {
                return msg.reply(
                  moderationMessage("notFound_ProductId")(productId.trim())
                );
              } else {
                await Moderation.deleteProduct(productId).then(
                  ({ status, data }) => {
                    if (status === "failed") {
                      return msg.reply(commonMessage("errorMessage"));
                    }
                    return client.sendMessage(msg.from, {
                      text: moderationMessage("success_DeleteProduct")(
                        data.productId
                      ),
                    });
                  }
                );
              }
            })
            .catch((e) => {
              logger.error(e);
              console.error(e);
              return msg.reply(commonMessage("errorMessage"));
            });
        });
    }
  },
};
