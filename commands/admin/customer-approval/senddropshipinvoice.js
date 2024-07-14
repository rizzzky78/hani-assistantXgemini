const { moderationMessage, commonMessage } = require("@config/messages");
const { Admin, Moderation } = require("@controllers/admin");
const { CustomerInterface } = require("@function/distributor-data");
const { Validation, PDF, Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");
const {
  metadata: { superAdmin, adminData },
} = require("@config/settings");
const { Customer } = require("@controllers/customer");

/**
 * @memberof Admin
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["dropship", "Dropship"],
  category: "forms",
  permission: "admin",
  typeArgs: "forms",
  expectedArgs: "<QUERY FORMS>",
  exampleArgs: "Formulir",
  description: "Mengirimkan Invoice dan menyelesaikan pemesanan Customer.",
  callback: async ({ msg, client, fullArgs, args }) => {
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    } else {
      const bufferImage =
        (await msg.download("buffer")) ||
        (msg.quoted && (await msg.quoted.download("buffer")));
      if (!bufferImage) {
        return msg.reply(
          moderationMessage("invalid_QueryImageInvoiceFormInput")
        );
      } else {
        const formRegExpDropship =
          /Invoice Pemesanan\n---- Data Pemesanan\nID Pemesanan: ([^\n]+)\nID Transaksi: ([^\n]+)\n---- Form Admin\nNomor Resi: ([^\n]+)\nCatatan: ([^]+)/;
        const matchRegExp = fullArgs.match(formRegExpDropship);
        if (matchRegExp) {
          const formInvoice = Tools.arrayModifier("n", matchRegExp.splice(1));
          if (!formInvoice.every((v) => v)) {
            return msg.reply(moderationMessage("invalid_QueryFormsAsEmpty"));
          } else {
            const [orderId, transactionId, receiptNumber, adminNotes] =
              formInvoice;
            console.log(formInvoice);

            client
              .sendMessage(msg.from, {
                text: commonMessage("waitMessage"),
              })
              .then(async () => {
                await Moderation.validateBothOrderAndPaymentProof({
                  orderId,
                  transactionId,
                })
                  .then(async ({ isOrder, isTransaction }) => {
                    if (!isOrder || !isTransaction) {
                      return msg.reply(
                        moderationMessage("notFound_orderAndTransactionIDs")(
                          orderId,
                          transactionId
                        )
                      );
                    }
                    await Admin.completeCustomerOrder("Dropship", {
                      metadata: [orderId, transactionId],
                      receiptNumber,
                      adminNotes,
                      image: bufferImage,
                    }).then(async ({ status, message, data }) => {
                      if (status === "failed") {
                        return msg.reply(commonMessage("errorMessage"));
                      }
                      if (status === "completed") {
                        return msg.reply(
                          moderationMessage(
                            "invalid_OrderIdAlreadySubmitedInvoice"
                          )(orderId)
                        );
                      } else if (status === "inv-qty") {
                        return msg.reply(message);
                      } else if (status === "success") {
                        const { custPhoneId, approval } = data;

                        const { doc } = await PDF.createPDF({
                          document: PDF.mapInputData({
                            data: { invoices: approval },
                            type: "invoices",
                          }),
                        });
                        await Customer.uploadPDFInvoice(
                          await Converter.bufferToBase64Converter(doc),
                          approval.invoice
                        );
                        const { captionImage, captionInvoice } =
                          CustomerInterface.mapCustomerInvoice({ approval });
                        client
                          .sendMessage(msg.from, {
                            text: moderationMessage(
                              "notification_SendingInvoice"
                            ),
                          })
                          .then(
                            setTimeout(async () => {
                              client
                                .sendMessage(custPhoneId, {
                                  image: bufferImage,
                                  caption: captionImage,
                                })
                                .then(
                                  setTimeout(() => {
                                    client
                                      .sendMessage(custPhoneId, {
                                        document: doc,
                                        fileName: `${approval.invoice.invoiceId}`,
                                        mimetype: "application/pdf",
                                        caption: captionInvoice,
                                      })
                                      .then(
                                        setTimeout(() => {
                                          return client.sendMessage(msg.from, {
                                            text: moderationMessage(
                                              "notification_SuccessSendInvoice"
                                            ),
                                          });
                                        }, 3000)
                                      );
                                  }, 3000)
                                );
                            }, 3000)
                          );
                      }
                    });
                  })
                  .catch((e) => {
                    logger.error(e);
                    console.error(e);
                    return msg.reply(commonMessage("errorMessage"));
                  });
              });
          }
        } else {
          return msg.reply(moderationMessage("invalid_QueryFormsDoesNotMatch"));
        }
      }
    }
  },
};
