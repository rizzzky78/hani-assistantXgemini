const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { AdminInterface } = require("@function/distributor-data");
const { Validation, Tools, Converter } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["cek-transaksi", "payment"],
  category: "admin",
  permission: "admin",
  typeArgs: "query",
  expectedArgs: "<TRX-ID-XXX>",
  exampleArgs: "TRX-ID-123ABCD",
  description: `Melihat bukti bayar sekaligus detail transaksi milik Customer.`,
  callback: async ({ msg, client, args }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    } else {
      const [transactionId] = Tools.arrayModifier("u", args);
      if (!transactionId) {
        return msg.reply(
          moderationMessage("invalid_QueryTransactionIdAsEmpty")
        );
      } else {
        client
          .sendMessage(msg.from, {
            text: commonMessage("waitMessage"),
          })
          .then(async () => {
            await Moderation.validateExistingPaymentProof(transactionId)
              .then(async (isTransaction) => {
                if (!isTransaction) {
                  return msg.reply(
                    moderationMessage("notFound_transactionId")(transactionId)
                  );
                }
                await Moderation.getCustomerPaymentProof(transactionId).then(
                  async (payments) => {
                    const { base64 } = await Moderation.getKeyPairImages(
                      payments.payment.image
                    );
                    return client.sendMessage(msg.from, {
                      image: await Converter.base64ToBufferConverter(base64),
                      caption: AdminInterface.mapCustomerPaymentProof({
                        payments,
                      }),
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
      }
    }
  },
};
