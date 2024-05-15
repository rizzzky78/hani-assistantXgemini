const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const { CustomerInterface } = require("@function/distributor-data");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["checkout"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengambil form pemesanan produk untuk melakukan pemesanan.`,
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
            await Customer.validateExistingBuckets(msg.senderNumber).then(
              async (isBuckets) => {
                if (!isBuckets) {
                  return msg.reply(
                    commonMessage("notFound_CustomerHasEmptyBuckets")
                  );
                }
                client
                  .sendMessage(msg.from, {
                    text: commonMessage("prompt_FillCheckoutOrderForms"),
                  })
                  .then(
                    setTimeout(async () => {
                      await Customer.getCustomerData(msg.senderNumber).then(
                        (customerData) => {
                          return client.sendMessage(msg.from, {
                            text: CustomerInterface.makeCheckoutForm(
                              customerData
                            ),
                          });
                        }
                      );
                    }, 3000)
                  );
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
