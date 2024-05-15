const { commonMessage } = require("@config/messages");
const { Moderation } = require("@controllers/admin");
const { CustomerInterface } = require("@function/distributor-data");
const { readFileSync } = require("fs");
const logger = require("@libs/utils/logger");
const { Tools } = require("@function/tools");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["katalog", "catalog"],
  category: "customer",
  permission: "common",
  typeArgs: "none",
  expectedArgs: "none",
  exampleArgs: "-",
  description: `Mengakses Katalog Produk yang ada berdasarkan kategori yang dituju.`,
  cooldown: 5 * 1000,
  callback: async ({ client, msg, args }) => {
    const [category, pages] = Tools.arrayModifier(
      "n",
      args.join(" ").split(" ")
    );

    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        if (
          !category ||
          !["herbal", "beverages", "cosmetics"].includes(
            category ? category : "-"
          )
        ) {
          return client.sendMessage(msg.from, {
            document: readFileSync("./assets/pdf/brosur-catalogue.pdf"),
            fileName: `Brosur Katalog Produk HNI HPAI`,
            mimetype: "application/pdf",
            caption: commonMessage("acessCatalogue"),
          });
        } else {
          await Moderation.getProductByCategory(category)
            .then(async ({ status, data: productsData }) => {
              if (status === "no-products") {
                return client.sendMessage(msg.from, {
                  text: commonMessage("notFound_CatalogHasEmptyProducts"),
                });
              } else {
                const { status, data: paginationData } =
                  CustomerInterface.sliceProductsData(productsData, {
                    category: category.trim(),
                    page: pages ? Number(pages.trim()) : 1,
                    pageSize: 10,
                  });
                if (status === "invalid" && pages) {
                  return client.sendMessage(msg.from, {
                    text: commonMessage("invalid_QueryAccessCatalog"),
                  });
                } else {
                  const { caption } =
                    CustomerInterface.paginateCatalogData(paginationData);
                  return client.sendMessage(msg.from, {
                    caption,
                    gifPlayback: true,
                    video: readFileSync("./assets/video/catalogue.mp4"),
                  });
                }
              }
            })
            .catch((e) => {
              logger.error(e);
              console.error(e);
              return msg.reply(commonMessage("errorMessage"));
            });
        }
      });
  },
};
