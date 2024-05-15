const { commonMessage } = require("@config/messages");

const { customer, customerOrderData, customerPaymentProof, approvalOrderData } =
  require("@database/router").collections;

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["data-reset"],
  waitMessage: "Wait...",
  callback: async ({ client, msg, fullArgs }) => {
    try {
      client
        .sendMessage(msg.from, {
          text: commonMessage("waitMessage"),
        })
        .then(async () => {
          const delCust = await customer.deleteMany({});
          const delOrder = await customerOrderData.deleteMany({});
          const delPayment = await customerPaymentProof.deleteMany({});
          const delApproval = await approvalOrderData.deleteMany({});
          if (delCust && delOrder && delPayment && delApproval) {
            return msg.reply("RESET SUCCESS!");
          }
        });
    } catch (e) {
      console.error(e);
      return msg.reply("Error!");
    }
  },
};
