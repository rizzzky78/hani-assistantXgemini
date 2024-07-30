const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Customer } = require("@controllers/customer");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["batal"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengkonfirmasi pembatalan pemesanan sekaligus menghapus data pemesanan yang statusnya belum dibayar.`,
  callback: async ({ client, msg }) => {
    await Customer.validateByPhoneNumber(msg.senderNumber)
      .then(async (isCustomer) => {
        if (!isCustomer) {
          return msg.reply(commonMessage("notFound_CustomerHasNeverOrder"));
        }
        await Moderation.validateStatusOrder(msg.senderNumber).then(
          async ({ status }) => {
            if (status === "forwarded") {
              return msg.reply(
                commonMessage("invalid_CancelOrderAsAlreadyForwarded")
              );
            } else if (status === "never-order") {
              return msg.reply(commonMessage("notFound_CustomerHasNeverOrder"));
            } else {
              await Customer.cancelAndClearOrders(msg.senderNumber).then(
                ({ status, orderId }) => {
                  if (status === "failed") {
                    return msg.reply(commonMessage("errorMessage"));
                  }
                  return client.sendMessage(msg.from, {
                    text: commonMessage("success_CancelOrder")(orderId),
                  });
                }
              );
            }
          }
        );
      })
      .catch((e) => {
        logger.error(e);
        console.error(e);
        return msg.reply(commonMessage("errorMessage"));
      });
  },
};
