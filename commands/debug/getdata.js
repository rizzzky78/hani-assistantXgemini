const {
  collections: {
    customer,
    customerOrderData,
    customerPaymentProof,
    approvalOrderData,
  },
} = require("@database/router");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["getdata"],
  waitMessage: "Wait...",
  callback: async ({ client, msg, args }) => {
    try {
      /**
       * @type { ["1" | "2" | "3" | "4"] }
       */
      const [match] = args;
      switch (match) {
        case "1":
          await customerOrderData
            .find()
            .toArray()
            .then((orderData) => {
              return client.sendMessage(msg.from, {
                text: JSON.stringify(orderData, null, 2),
              });
            });
          break;
        case "2":
          await customerPaymentProof
            .find()
            .toArray()
            .then((paymentProof) => {
              const mapped = paymentProof.map((p) => {
                const {
                  metadata: { image, ...resOf },
                  ...some
                } = p;
                return { resOf, some };
              });
              return client.sendMessage(msg.from, {
                text: JSON.stringify(mapped, null, 2),
              });
            });
          break;
        case "3":
          await approvalOrderData
            .find()
            .toArray()
            .then((approvalData) => {
              return client.sendMessage(msg.from, {
                text: JSON.stringify(approvalData, null, 2),
              });
            });
          break;
        case "4":
          await customer
            .findOne({ "metadata.phoneNumber": msg.senderNumber })
            .then((custData) => {
              return client.sendMessage(msg.from, {
                text: JSON.stringify(custData, null, 2),
              });
            });
          break;
        default: {
          return msg.reply(
            "Invalid cmd!\n1 - customerOrderData, 2 - customerPaymentProof, 3 - approvalOrderData"
          );
        }
      }
    } catch (e) {
      console.error(e);
      return msg.reply("Error!");
    }
  },
};
