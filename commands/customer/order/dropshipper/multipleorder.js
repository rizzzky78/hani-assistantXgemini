const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { Customer } = require("@controllers/customer");
const { CustomerInterface } = require("@function/distributor-data");
const { Tools, Converter } = require("@function/tools");
const logger = require("@libs/utils/logger");
const { readFileSync } = require("fs");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["pesan"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY # QTY>",
  exampleArgs: "Sarkum # 4",
  description: `Menambahkan produk pada keranjang pemesanan.`,
  callback: async ({ client, msg, args }) => {
    const [productName, qty] = Tools.arrayModifier(
      "n",
      args.join(" ").split("#")
    );
    if (!productName || !qty) {
      return msg.reply(commonMessage("invalid_QueryMultipleOrder")("pesan"));
    }
    if (productName && qty) {
      if (isNaN(parseInt(qty)) || parseInt(qty) < 0) {
        return msg.reply(
          commonMessage("invalid_QueryMulitpleOrderAsIsNaN")("pesan")
        );
      }

      !(await Customer.validateByPhoneNumber(msg.senderNumber)) &&
        (await Customer.registerCustomer({
          tagName: msg.pushName,
          phoneNumber: msg.senderNumber,
        }));
      await Customer.validateBeforeAppendBuckets(msg.senderNumber)
        .then(async ({ status }) => {
          if (!status) {
            return msg.reply(commonMessage("invalid_OrderIsAlreadyOngoing"));
          } else {
            await Moderation.searchProductByTitle(productName).then(
              async ({ status, data: productData }) => {
                if (status === "failed") {
                  return msg.reply(
                    commonMessage("notFound_SearchedProductNotExist")(
                      productName
                    )
                  );
                }
                const [product] = productData;
                const {
                  productId,
                  data: {
                    title,
                    category,
                    stock,
                    memberPrice,
                    sold,
                    poin,
                    weight,
                  },
                } = product;

                await Moderation.checkStockProduct({
                  productId,
                  amount: parseInt(qty),
                }).then(async (isStock) => {
                  if (!isStock) {
                    return msg.reply(
                      commonMessage("invalid_CurrentStockCannotFulfilOrder")({
                        productName: title,
                        stock,
                        demand: qty,
                      })
                    );
                  }
                  await client
                    .sendMessage(msg.from, {
                      caption: commonMessage(
                        "notification_DisplayShowcasedProduct"
                      )(title, memberPrice, stock, sold, poin),
                      image: await Converter.base64ToBufferConverter(
                        product.data.image
                      ),
                    })
                    .then(async () => {
                      await Customer.appendSingleBuckets(msg.senderNumber, {
                        productId,
                        productName: title,
                        category,
                        price: memberPrice,
                        poin,
                        weight,
                        qtyAmount: parseInt(qty),
                      }).then(async ({ status }) => {
                        if (status === "failed") {
                          return msg.reply(commonMessage("errorMessage"));
                        }
                        await Customer.getCustomerData(msg.senderNumber).then(
                          (customerData) => {
                            client
                              .sendMessage(msg.from, {
                                text: CustomerInterface.displayCurrentBuckes(
                                  "pesan",
                                  customerData
                                ),
                              })
                              .then(
                                setTimeout(() => {
                                  client.sendMessage(msg.from, {
                                    text: commonMessage(
                                      "notification_SuccessAddProductsToBuckets"
                                    ),
                                  });
                                }, 3000)
                              );
                          }
                        );
                      });
                    });
                });
              }
            );
          }
        })
        .catch((e) => {
          logger.error(e);
          console.error(e);
          return msg.reply(commonMessage("errorMessage"));
        });
    }
  },
};
