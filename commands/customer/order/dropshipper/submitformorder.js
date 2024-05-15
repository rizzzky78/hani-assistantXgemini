const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Customer } = require("@controllers/customer");
const { CustomerInterface } = require("@function/distributor-data");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["form"],
  category: "forms",
  permission: "common",
  typeArgs: "forms",
  expectedArgs: "<QUERY FORMS>",
  exampleArgs: "Formulir",
  description: `Menerima form lengkap pemesanan dan melanjutkan proses pemesanan.`,
  callback: async ({ client, msg, fullArgs, message }) => {
    message.message.locationMessage;
    const regularFormRegex =
      /Pemesanan\nNama Pemesan: ([^\n]+)\nNomor Telpon: ([^\n]+)\nHNI ID: ([^\n]+)\n---\nData Penerima\nNama: ([^\n]+)\nNomor Telpon: ([^\n]+)\nHNI ID Penerima: ([^\n]+)\n---\nDetail Alamat Penerima\nProvinsi: ([^\n]+)\nKota\/Kabupaten: ([^\n]+)\nKecamatan: ([^\n]+)\nKode Pos: ([^\n]+)\nAlamat Lengkap: ([^]+)/;
    const matchRegexp = fullArgs.match(regularFormRegex);
    if (matchRegexp) {
      const formData = matchRegexp.splice(1);
      if (!formData.every((v) => v)) {
        return msg.reply(commonMessage("invalid_QueryFormsAsEmpty"));
      } else {
        client
          .sendMessage(msg.from, {
            text: commonMessage("waitMessage"),
          })
          .then(async () => {
            await Customer.validateByPhoneNumber(msg.senderNumber)
              .then(async (isCustomer) => {
                if (!isCustomer) {
                  return msg.reply(
                    commonMessage("notFound_CustomerHasNeverOrder")
                  );
                }
                await Moderation.validateStatusOrder(msg.senderNumber).then(
                  async ({ status, orderId }) => {
                    if (status === "pending") {
                      return msg
                        .reply(commonMessage("prompt_ResubmitConfirmationCode"))
                        .then(
                          setTimeout(() => {
                            return client.sendMessage(msg.from, {
                              text: `konfirmasi-pemesanan ${orderId}`,
                            });
                          }, 3000)
                        );
                    } else if (status === "never-order") {
                      await Customer.validateExistingBuckets(
                        msg.senderNumber
                      ).then(async (isBuckets) => {
                        if (!isBuckets) {
                          return msg.reply(
                            commonMessage("notFound_CustomerHasEmptyBuckets")
                          );
                        }
                        const { info, fullAddress, orderer, recipient } =
                          CustomerInterface.displaySuccessOrderResult(formData);

                        await Customer.appendCustomerOrderFromBuckets(
                          msg.senderNumber,
                          {
                            orderer,
                            metadata: recipient,
                            formInfo: info,
                            fullAddress,
                          }
                        ).then(({ status, orders }) => {
                          if (status === "destination-not-found") {
                            return msg.reply(
                              commonMessage(
                                "notFound_DistrictOnFormsUnrecognized"
                              )
                            );
                          } else if (status === "failed") {
                            return msg.reply(commonMessage("errorMessage"));
                          } else {
                            client
                              .sendMessage(msg.from, {
                                text: CustomerInterface.mapCustomerOrderDetails(
                                  {
                                    orders,
                                  }
                                ),
                              })
                              .then(
                                setTimeout(() => {
                                  client
                                    .sendMessage(msg.from, {
                                      text: commonMessage(
                                        "prompt_SendOrderConfirmationCode"
                                      ),
                                    })
                                    .then(
                                      setTimeout(() => {
                                        return client.sendMessage(msg.from, {
                                          text: `konfirmasi-pemesanan ${orders.data.orderId}`,
                                        });
                                      }, 3000)
                                    );
                                }, 3000)
                              );
                          }
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
          });
      }
    } else {
      return msg.reply(commonMessage("invalid_QueryFormsOrder"));
    }
  },
};
