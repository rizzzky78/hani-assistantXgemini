const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const { CustomerInterface } = require("@function/distributor-data");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["selesai"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengkonfirmasi pembelian untuk dilanjutkan ke pembayaran.`,
  callback: async ({ client, msg }) => {
    await Customer.validateByPhoneNumber(msg.senderNumber)
      .then(async (isCustomer) => {
        if (!isCustomer) {
          return msg.reply(commonMessage("notFound_CustomerHasNeverOrder"));
        }
        await Customer.validateExistingBuckets(msg.senderNumber).then(
          async (isBuckets) => {
            if (!isBuckets) {
              return msg.reply(
                commonMessage("notFound_CustomerHasEmptyBuckets")
              );
            }
            await Customer.appendCustTakeAwayOrderFromBuckets(
              msg.senderNumber
            ).then(async ({ status, orders }) => {
              if (status === "failed") {
                return msg.reply(commonMessage("errorMessage"));
              }
              client
                .sendMessage(msg.from, {
                  text: CustomerInterface.mapCustomerOrderDetails({
                    orders,
                  }),
                })
                .then(
                  setTimeout(() => {
                    return client.sendMessage(msg.from, {
                      text: `konfirmasi-pembelian ${orders.data.orderId}`,
                    });
                  }, 3000)
                );
            });
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
