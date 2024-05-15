const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Validation, Tools, PDF } = require("@function/tools");
const logger = require("@libs/utils/logger");
const { superAdmin, adminData } = require("@config/settings").metadata;

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["pesanan-selesai"],
  category: "admin",
  permission: "admin",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Melihat daftar keseluruhan pemesanan Customer yang statusnya sudah selesai dalam bentuk PDF.`,
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
          await Moderation.getBatchApprovalOrderData()
            .then(async (approvalData) => {
              if (!approvalData || approvalData.length === 0) {
                return msg.reply(
                  moderationMessage("notification_NoCompletedOrdersExist")
                );
              } else {
                await PDF.createPDF({
                  document: PDF.mapInputData({
                    data: { approvals: approvalData },
                    type: "approvals",
                  }),
                }).then(({ doc }) => {
                  return client.sendMessage(msg.from, {
                    document: doc,
                    fileName: "Daftar Pemesanan Selesai - Rekap 2024",
                    mimetype: "application/pdf",
                    caption: `Daftar Pemesanan Selesai\nPer Tanggal: ${Tools.getDate()}`,
                  });
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
