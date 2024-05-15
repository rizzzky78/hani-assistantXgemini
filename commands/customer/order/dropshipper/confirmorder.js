// dropship
const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const {
  CustomerInterface,
  AdminInterface,
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
  aliases: ["konfirmasi-pemesanan"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<ORD-ID-XXX>",
  exampleArgs: "ORD-ID-123ABCD",
  description: `Mengkonfirmasi pemesanan dan meneruskan pesanan ke Admin.`,
  callback: async ({ client, msg, args }) => {
    const [orderId] = Tools.arrayModifier("n", args);
    if (!orderId) {
      return msg.reply(commonMessage("invalid_QueryOrderIdInput"));
    } else {
      client
        .sendMessage(msg.from, {
          text: commonMessage("waitMessage"),
        })
        .then(async () => {
          await Moderation.validateCustomerOrder(orderId)
            .then(async (isOrder) => {
              if (!isOrder) {
                return msg.reply(
                  commonMessage("notFound_CustomerHasNeverOrder")
                );
              }
              await Moderation.validateStatusOrder(msg.senderNumber).then(
                async ({ status }) => {
                  if (status === "forwarded") {
                    return msg.reply(
                      commonMessage("notification_OrderIsAlreadyForwarded")(
                        orderId
                      )
                    );
                  } else if (status === "confirmed") {
                    return msg.reply(
                      commonMessage("notification_OrderIsAlreadyComfirmed")(
                        orderId
                      )
                    );
                  } else if (status === "never-order") {
                    return msg.reply(
                      commonMessage("notFound_CustomerHasNeverOrder")
                    );
                  } else {
                    const msgSentId =
                      overrideStatus === "GROUP"
                        ? overrideGroupId.ongoingOrders
                        : superAdmin.phoneId;
                    await Moderation.forwardCustomerOrder(orderId).then(
                      ({ status, orders }) => {
                        if (status === "failed") {
                          return msg.reply(commonMessage("errorMessage"));
                        }
                        client
                          .sendMessage(msgSentId, {
                            text: AdminInterface.mapForwardedCustomerOrderDetails(
                              { orders }
                            ),
                          })
                          .then(
                            setTimeout(() => {
                              client
                                .sendMessage(msg.from, {
                                  text: CustomerInterface.mapPaymentProvider({
                                    orders,
                                  }),
                                })
                                .then(
                                  setTimeout(() => {
                                    client
                                      .sendMessage(msg.from, {
                                        text: commonMessage(
                                          "prompt_SentPaymentCode"
                                        ),
                                      })
                                      .then(
                                        setTimeout(() => {
                                          return client.sendMessage(msg.from, {
                                            text: `bayar ${orders.data.orderId}`,
                                          });
                                        }, 5000)
                                      );
                                  }, 3000)
                                );
                            }, 3000)
                          );
                      }
                    );
                  }
                }
              );
            })
            .catch((e) => {
              logger.error(e);
              console.log(e);
              return msg.reply(commonMessage("errorMessage"));
            });
        });
    }
  },
};
