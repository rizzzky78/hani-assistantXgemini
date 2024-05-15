const { moderationMessage, commonMessage } = require("@config/messages");
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
  aliases: ["konfirmasi-uploadproduk", "forms"],
  category: "forms",
  permission: "admin",
  typeArgs: "forms",
  expectedArgs: "<QUERY FORMS>",
  exampleArgs: "Formulir",
  description: `Mengupload atau Mengedit data produk berdasarkan Forms yang dikirim.`,
  callback: async ({ msg, client, args, fullArgs }) => {
    const [selection] = Tools.arrayModifier("n", args);
    const isAdmin = Validation.validateAdmin(msg.senderNumber, {
      superAdmin,
      adminData,
    });
    if (!isAdmin) {
      return msg.reply(commonMessage("unauthorizedForAdminOnly"));
    }

    if (selection === "Upload") {
      const formRegExp =
        /Upload Produk Baru\n------\nNama Produk: ([^\n]+)\nKategori: ([^\n]+)\nHarga non member: ([^\n]+)\nHarga member: ([^\n]+)\nStok: ([^\n]+)\nPoin: ([^\n]+)\nBerat \(gr\): ([^\n]+)\nDeskripsi Produk: ([^]+)/;
      const matchRegExp = fullArgs.match(formRegExp);
      if (matchRegExp) {
        const queryData = Tools.arrayModifier("n", matchRegExp.slice(1));
        const { status, message, data } =
          Validation.validateCreateProductFormInput(queryData);
        const bufferImage =
          (await msg.download("buffer")) ||
          (msg.quoted && (await msg.quoted.download("buffer")));
        if (!bufferImage) {
          return msg.reply(
            moderationMessage("invalid_QueryImageUploadFormInput")
          );
        } else if (bufferImage && !status) {
          return msg.reply(message);
        } else if (bufferImage && status) {
          client
            .sendMessage(msg.from, {
              text: moderationMessage("waitUploadingProduct"),
            })
            .then(async () => {
              await Moderation.createProduct({
                title: data.title,
                category: data.category,
                price: data.price,
                memberPrice: data.memberPrice,
                stock: data.stock,
                poin: data.poin,
                weight: data.weight,
                description: data.description,
                image: bufferImage,
              })
                .then(async ({ status, data }) => {
                  if (!status) {
                    return msg.reply(commonMessage("errorMessage"));
                  }
                  const caption =
                    AdminInterface.distributeCreateProductData(data);
                  client
                    .sendMessage(msg.from, {
                      text: moderationMessage("success_CreateProduct")(
                        data.productId
                      ),
                    })
                    .then(
                      setTimeout(async () => {
                        return client.sendMessage(msg.from, {
                          caption: caption.captionCreateProduct,
                          image: await Converter.base64ToBufferConverter(
                            caption.base64Image
                          ),
                        });
                      }, 3000)
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
        return msg.reply(moderationMessage("invalid_QueryFormsUploadNotMatch"));
      }
    } else if (selection === "Edit") {
      const formsEditRegExp =
        /Edit Produk\n-------\nID Produk: ([^\n]+)\nNama Produk: ([^\n]+)\nKategori: ([^\n]+)\nHarga non Member: ([^\n]+)\nHarga Member: ([^\n]+)\nStok: ([^\n]+)\nPoin: ([^\n]+)\nBerat: ([^\n]+)\nDeskripsi Produk: ([^]+)/;
      const matchRegExp = fullArgs.match(formsEditRegExp);
      if (matchRegExp) {
        const queryData = Tools.arrayModifier("n", matchRegExp.slice(1));
        const { status, message, data } =
          Validation.validateInputEditProduct(queryData);
        const bufferImage =
          (await msg.download("buffer")) ||
          (msg.quoted && (await msg.quoted.download("buffer")));
        if (!bufferImage) {
          return msg.reply(
            moderationMessage("invalid_QueryImageEditFormInput")
          );
        } else if (bufferImage && !status) {
          return msg.reply(message);
        } else if (bufferImage && status) {
          client
            .sendMessage(msg.from, {
              text: commonMessage("waitMessage"),
            })
            .then(async () => {
              await Moderation.validateProductById(data.productId)
                .then(async (isValid) => {
                  if (!isValid) {
                    return msg.reply(
                      moderationMessage("notFound_ProductId")(data.productId)
                    );
                  }
                  await Moderation.editProduct(data.productId, {
                    title: data.title,
                    category: data.category,
                    price: data.price,
                    memberPrice: data.memberPrice,
                    stock: data.stock,
                    poin: data.poin,
                    weight: data.weight,
                    description: data.description,
                    // ...data,
                    image: bufferImage,
                  }).then(({ status }) => {
                    if (!status) {
                      return msg.reply(commonMessage("errorMessage"));
                    }
                    return client.sendMessage(msg.from, {
                      text: moderationMessage("success_UpdateProduct")(
                        data.productId
                      ),
                    });
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
        return msg.reply(moderationMessage("invalid_QueryFormsEditNotMatch"));
      }
    } else {
      return;
    }
  },
};
