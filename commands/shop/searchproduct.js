const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { CustomerInterface } = require("@function/distributor-data");
const { Converter } = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["cari", "cariproduk"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "Andrographis",
  description: `Mencari produk dan menampilkannya berdasarkan nama produk yang terdapat pada Katalog.`,
  cooldown: 5 * 1000,
  callback: async ({ client, msg, fullArgs }) => {
    if (!fullArgs || fullArgs.length < 3) {
      return msg.reply(commonMessage("invalid_QuerySearchProduct"));
    } else {
      await Moderation.searchProductByTitle(fullArgs)
        .then(async ({ status, data: productData }) => {
          if (status === "failed") {
            return msg.reply(
              commonMessage("notFound_SearchedProductNotExist")(fullArgs.trim())
            );
          }
          const matchedProducts = productData.slice(0, 3);
          client
            .sendMessage(msg.from, {
              text: commonMessage("notification_ShowsSearchedProducts")(
                matchedProducts.length,
                fullArgs.trim()
              ),
            })
            .then(async () => {
              matchedProducts.forEach((v) => {
                setTimeout(async () => {
                  const { caption, image } =
                    CustomerInterface.displayProduct(v);
                  return client.sendMessage(msg.from, {
                    caption,
                    image: await Converter.base64ToBufferConverter(image),
                  });
                }, 2000);
              });
            });
        })
        .catch((e) => {
          logger.error(e);
          console.log(e);
          return msg.reply(commonMessage("errorMessage"));
        });
    }
  },
};
