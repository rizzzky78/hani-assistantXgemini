const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Validation, Tools, PDF } = require("@function/tools");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["list-pesanan"],
  category: "admin",
  permission: "admin",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Melihat daftar keseluruhan pemesanan berlangsung dalam bentuk PDF.`,
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
          await Moderation.getBatchCustomerOrders()
            .then(async (customerOrder) => {
              const ongoingOrders = customerOrder.filter(
                (v) => v.status !== "completed"
              );
              if (!ongoingOrders || ongoingOrders.length === 0) {
                return msg.reply(
                  moderationMessage("notification_NoOngoingOrdersExist")
                );
              } else {
                const { doc } = await PDF.createPDF({
                  document: PDF.mapInputData({
                    data: { orders: customerOrder },
                    type: "orders",
                  }),
                });
                return client.sendMessage(msg.from, {
                  document: doc,
                  fileName: "Daftar Pemesanan Berlangsung - Rekap 2024",
                  mimetype: "application/pdf",
                  caption: `Daftar Pemesanan Berlangsung\nPer Tanggal: ${Tools.getDate()}`,
                });
              }
            })
            .catch((e) => {
              console.error(e);
              return msg.reply(commonMessage("errorMessage"));
            });
        });
    }
  },
};
