const { commonMessage, moderationMessage } = require("@config/messages");
const { AdminInterface } = require("@function/distributor-data");
const { Validation } = require("@function/tools");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["produk-baru"],
  category: "admin",
  permission: "admin",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengambil form untuk upload data produk baru.`,
  callback: async ({ msg, client }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    }
    return client
      .sendMessage(msg.from, {
        text: moderationMessage("prompt_FillQueryUploadProductForms"),
      })
      .then(() => {
        setTimeout(() => {
          return client.sendMessage(msg.from, {
            text: AdminInterface.createUploadProductForms(),
          });
        }, 3000);
      });
  },
};
