const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Validation, PDF } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["list-produk"],
  category: "admin",
  permission: "admin",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Merekap keseluruhan data produk yang ada pada Katalog dalam bentuk PDF.`,
  callback: async ({ msg, client }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    }
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        await Moderation.getAllProduct()
          .then(async ({ status, data: products }) => {
            if (status === "no-products") {
              return msg.reply(
                commonMessage("notFound_CatalogHasEmptyProducts")
              );
            }
            const mappedProducts = products.sort((a, b) =>
              a.data.title.localeCompare(b.data.title)
            );
            const { doc } = await PDF.createPDF({
              document: PDF.mapInputData({
                data: { products: mappedProducts },
                type: "products",
              }),
            });
            return client.sendMessage(msg.from, {
              document: doc,
              fileName: "Daftar Lengkap Produk",
              mimetype: "application/pdf",
              caption: `Berikut adalah daftar produk yang sudah dimasukan kedalam database Chatbot.`,
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
