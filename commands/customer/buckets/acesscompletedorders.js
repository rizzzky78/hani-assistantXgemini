const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const { Tools, PDF } = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["pesanan-saya", "riwayat", "pesanan saya"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Melihat keseluruahan riwayat pemesanan selesai milik Customer dalam bentuk PDF.`,
  callback: async ({ client, msg }) => {
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        await Customer.validateByPhoneNumber(msg.senderNumber)
          .then(async (isCustomer) => {
            if (!isCustomer) {
              return msg.reply(commonMessage("notFound_CustomerHasNeverOrder"));
            } else {
              await Customer.getCustomerData(msg.senderNumber).then(
                async (custdata) => {
                  const {
                    data: { purchaseHistory },
                  } = custdata;
                  const completedOrders = purchaseHistory.filter(
                    (v) => v.isCompleted
                  );
                  if (!completedOrders || completedOrders.length === 0) {
                    return msg.reply(
                      commonMessage("notFound_CustomerHasEmptyCompletedOrders")
                    );
                  } else {
                    const { doc } = await PDF.printPurchaseHistory({
                      document: PDF.mapInputData({
                        data: { custdata },
                        type: "custdata",
                      }),
                    });
                    return client.sendMessage(msg.from, {
                      document: doc,
                      fileName: `Riwayat Pemesanan - ${custdata.metadata.tagName}`,
                      mimetype: "application/pdf",
                      caption: `Dicetak pada tanggal: ${Tools.getDate()}`,
                    });
                  }
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
  },
};
