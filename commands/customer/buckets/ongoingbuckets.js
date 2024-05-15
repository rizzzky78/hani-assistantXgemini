const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const { CustomerInterface } = require("@function/distributor-data");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["keranjang"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengakses keranjang pemesanan yang sedang berlangsung.`,
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
            }
            await Customer.getCustomerData(msg.senderNumber).then(
              (customerData) => {
                return client.sendMessage(msg.from, {
                  text: CustomerInterface.displayCustomerBuckets(customerData),
                });
              }
            );
          })
          .catch((e) => {
            logger.error(e);
            console.error(e);
            return msg.reply(commonMessage("errorMessage"));
          });
      });
  },
};
