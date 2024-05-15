const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { CustomerInterface } = require("@function/distributor-data");
const { Tools, Converter } = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["bukti"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<INV-ID-XXX>",
  exampleArgs: "INV-ID-123ABCDE",
  description: `Melihat detail pemesanan.`,
  callback: async ({ client, msg, args }) => {
    const [invoiceId] = Tools.arrayModifier("u", args);
    if (!invoiceId) {
      return msg.reply(
        commonMessage("invalid_QueryAccessOrderDetailsInvoiceId")
      );
    }
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        await Moderation.validateInvoiceId(invoiceId)
          .then(async (isInvoice) => {
            if (!isInvoice) {
              return msg.reply(commonMessage("notFound_InvoceId")(invoiceId));
            } else {
              await Moderation.getOrdersDetails(invoiceId).then(
                async (orderDetails) => {
                  const [orderData, paymentData, approvalData] = orderDetails;
                  const { base64: invoiceImg } =
                    await Moderation.getKeyPairImages(
                      approvalData.invoice.images
                    );
                  client
                    .sendMessage(msg.from, {
                      image: await Converter.base64ToBufferConverter(
                        invoiceImg
                      ),
                      caption: CustomerInterface.mapCustomerOrderDetails({
                        orders: orderData,
                      }),
                    })
                    .then(
                      setTimeout(async () => {
                        const { base64 } = await Moderation.getKeyPairImages(
                          paymentData.payment.image
                        );
                        return client.sendMessage(msg.from, {
                          image: await Converter.base64ToBufferConverter(
                            base64
                          ),
                          caption: CustomerInterface.mapCustomerPaymentProof({
                            payments: paymentData,
                          }),
                        });
                      }, 3000)
                    );
                }
              );
            }
          })
          .catch((e) => {
            logger.error(e);
            console.error(e);
            return msg.reply(commonMessage("errorMessage"));
          });
      });
  },
};
