const { moderationMessage, commonMessage } = require("@config/messages");
const { Admin, Moderation } = require("@controllers/admin");
const { Validation, Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["batalkan-pesanan"],
  category: "admin",
  permission: "admin",
  typeArgs: "query",
  expectedArgs: "<TRX-ID-XXX>",
  exampleArgs: "TRX-ID-123ABCD",
  description: "Membatalkan pembayaran sekaligus pemesanan dari Customer.",
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
      }
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
              await Admin.cancelCustomerPayment(transactionId).then(
                ({ status, data }) => {
                  if (status === "confirmed") {
                    return msg.reply(
                      moderationMessage(
                        "invalid_TransactionIdAlreadyConfirmed"
                      )(transactionId)
                    );
                  } else if (status === "failed") {
                    return msg.reply(commonMessage("errorMessage"));
                  } else {
                    client
                      .sendMessage(msg.from, {
                        text: moderationMessage("success_CancelCustomerOrder")(
                          transactionId
                        ),
                      })
                      .then(
                        setTimeout(() => {
                          return client.sendMessage(data.custPhoneId, {
                            text: commonMessage(
                              "notification_OrderHasCanceled"
                            )(transactionId),
                          });
                        }, 3000)
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
        });
    }
  },
};
