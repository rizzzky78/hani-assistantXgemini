const { moderationMessage } = require("@config/messages");
const { CustomerInterface } = require("@function/distributor-data");
const { RajaOngkir, Tools } = require("@function/tools");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["cekongkir", "cek"],
  category: "admin",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY FORMS>",
  exampleArgs: "Formulir",
  description: `Mengecek harga ongkos kirim berdasarkan tujuan dan berat paket.`,
  callback: async ({ client, msg, fullArgs }) => {
    if (!fullArgs || fullArgs.length < 1) {
      client
        .sendMessage(msg.from, {
          text: moderationMessage("prompt_FillQueryCekOngkirFormsInput"),
        })
        .then(
          setTimeout(() => {
            const formCekOngkir = CustomerInterface.createCekOngkirForms();
            return msg.reply(formCekOngkir);
          }, 3000)
        );
    } else if (fullArgs) {
      const formsRegExp =
        /Ongkir Form\n-----\nEkspedisi: ([^\n]+)\nTujuan: ([^\n]+)\nBerat: ([^\n]+)/;
      const formsData = fullArgs.match(formsRegExp);
      if (formsData) {
        const [courier, destination, weight] = Tools.arrayModifier(
          "n",
          formsData.splice(1)
        );
        if (!formsData.every((v) => v)) {
          return msg.reply(
            moderationMessage("invalid_QueryCekOngkirFormsInput")
          );
        } else if (!["jne", "tiki", "pos"].includes(courier.toLowerCase())) {
          return msg.reply(
            moderationMessage("invalid_QueryCekOngkirFormsExpeditionInput")
          );
        } else if (isNaN(weight)) {
          return msg.reply(
            moderationMessage("invalid_QueryCekOngkirFormsWeightInput")
          );
        } else {
          const { status, message, data } = await RajaOngkir.checkStaticCost(
            courier.toLowerCase(),
            {
              destination: destination.toLowerCase(),
              weight: parseInt(weight),
            }
          );
          if (!status) {
            return msg.reply(message);
          } else {
            return client.sendMessage(msg.from, {
              text: CustomerInterface.mapCekOngkirResult(data),
            });
          }
        }
      } else {
        return msg.reply(
          moderationMessage("invalid_QueryCekOngkirFormsAsNotMatch")
        );
      }
    }
  },
};
