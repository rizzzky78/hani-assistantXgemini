const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Validation, Tools, PDF } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["list-transaksi"],
  category: "admin",
  permission: "admin",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Melihat daftar keseluruhan data transaksi pembayaran Customer dalam bentuk PDF.`,
  callback: async ({ msg, client }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    } else {
      client
        .sendMessage(msg.from, {
          text: commonMessage("waitMessage"),
        })
        .then(async () => {
          await Moderation.getBatchCustomerPaymentProof()
            .then(async (paymentData) => {
              if (!paymentData || paymentData.length === 0) {
                return msg.reply(
                  moderationMessage("notification_NoTransactionsExist")
                );
              } else {
                const { doc } = await PDF.createPDF({
                  document: PDF.mapInputData({
                    data: { payments: paymentData },
                    type: "payments",
                  }),
                });
                return client.sendMessage(msg.from, {
                  document: doc,
                  fileName: `Daftar Bukti Pembayaran Customer`,
                  mimetype: "application/pdf",
                  caption: `Dicetak pada tanggal: ${Tools.getDate()}`,
                });
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
