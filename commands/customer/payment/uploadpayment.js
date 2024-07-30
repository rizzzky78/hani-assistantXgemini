// payment
const { commonMessage, moderationMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Customer } = require("@controllers/customer");
const {
  AdminInterface,
  CustomerInterface,
} = require("@function/distributor-data");
const { Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { overrideStatus, overrideGroupId, superAdmin },
} = require("@config/settings");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["bayar"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<ORD-ID-XXX>",
  exampleArgs: "ORD-ID-123ABCD BRI",
  description: `Mengupload bukti bayar/transfer dan meneruskan ke Admin untuk dilakukan verifikasi sebelum pemesanan dikonfirmasi.`,
  callback: async ({ client, msg, args }) => {
    const [orderId] = Tools.arrayModifier("n", args);
    const bufferImage =
      (await msg.download("buffer")) ||
      (msg.quoted && (await msg.quoted.download("buffer")));

    if (!bufferImage || !orderId) {
      return msg.reply(commonMessage("invalid_QueryPaymentCode"));
    } else {
      await Moderation.validateCustomerOrder(orderId)
        .then(async (isOrder) => {
          if (!isOrder) {
            return msg.reply(commonMessage("notFound_CustomerHasNeverOrder"));
          }
          await Moderation.validateStatusOrder(msg.senderNumber).then(
            async ({ status }) => {
              if (status === "completed") {
                return msg.reply(
                  commonMessage("notification_OrderIsAlreadyCompleted")(orderId)
                );
              } else if (status === "never-order") {
                return msg.reply(
                  commonMessage("notFound_CustomerHasNeverOrder")
                );
              } else {
                await Customer.validatePaymentStatus({
                  phoneNumber: msg.senderNumber,
                  orderId,
                }).then(async (isPayed) => {
                  if (isPayed) {
                    return msg.reply(
                      commonMessage("notification_OrderIsAlreadyPayed")(orderId)
                    );
                  }
                  await Customer.uploadPaymentProof(msg.senderNumber, {
                    orderId,
                    via: "TRANSFER",
                    image: bufferImage,
                  }).then(({ status, data: { payments, orders } }) => {
                    if (status === "failed") {
                      return msg.reply(commonMessage("errorMessage"));
                    }
                    const msgSentId =
                      overrideStatus === "GROUP"
                        ? overrideGroupId.ongoingTransactions
                        : superAdmin.phoneId;
                    const { captionPayment, captionOrder } =
                      AdminInterface.mapForwardedCustomerPaymentProofDetails({
                        payments,
                        orders,
                      });
                    client
                      .sendMessage(msg.from, {
                        image: bufferImage,
                        caption:
                          CustomerInterface.mapForwardedCustomerPaymentProof({
                            payments,
                          }),
                      })
                      .then(
                        setTimeout(() => {
                          client
                            .sendMessage(msg.from, {
                              text: commonMessage(
                                "notification_ForwardingPayment"
                              ),
                            })
                            .then(
                              setTimeout(() => {
                                client
                                  .sendMessage(msgSentId, {
                                    image: bufferImage,
                                    caption: captionPayment,
                                  })
                                  .then(
                                    setTimeout(() => {
                                      client
                                        .sendMessage(msgSentId, {
                                          text: captionOrder,
                                        })
                                        .then(
                                          setTimeout(() => {
                                            client
                                              .sendMessage(msgSentId, {
                                                text: moderationMessage(
                                                  "prompt_ApproveOrCancelCustomerOrder"
                                                ),
                                              })
                                              .then(
                                                setTimeout(() => {
                                                  client
                                                    .sendMessage(msgSentId, {
                                                      text: `terima-pesanan ${payments.metadata.transactionId}`,
                                                    })
                                                    .then(
                                                      setTimeout(() => {
                                                        client
                                                          .sendMessage(
                                                            msgSentId,
                                                            {
                                                              text: `batalkan-pesanan ${payments.metadata.transactionId}`,
                                                            }
                                                          )
                                                          .then(
                                                            setTimeout(() => {
                                                              return client.sendMessage(
                                                                msg.from,
                                                                {
                                                                  text: commonMessage(
                                                                    "notification_SuccessSubmitPayment"
                                                                  ),
                                                                }
                                                              );
                                                            }, 3000)
                                                          );
                                                      }, 3000)
                                                    );
                                                }, 3000)
                                              );
                                          }, 3000)
                                        );
                                    }, 3000)
                                  );
                              }, 3000)
                            );
                        }, 3000)
                      );
                  });
                });
              }
            }
          );
        })
        .catch((e) => {
          logger.error(e);
          console.error(e);
          return msg.reply(commonMessage("errorMessage"));
        });
    }
  },
};
