const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["hapus"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Menghapus produk pada keranjang pemesanan.`,
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
            await Customer.pullCustomerBuckets(msg.senderNumber).then(
              (status) => {
                if (!status) {
                  return msg.reply(commonMessage("errorMessage"));
                }
                return msg.reply(
                  commonMessage("success_DeleteCustomerBuckets")
                );
              }
            );
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
