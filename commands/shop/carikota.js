const { CustomerInterface } = require("@function/distributor-data");
const { RajaOngkir } = require("@function/tools");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["carikota"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "Cilacap",
  description: `Mencari data kota/kabupaten berdasarkan query.`,
  callback: async ({ client, msg, args, fullArgs }) => {
    const { status, data } = RajaOngkir.searchCity(fullArgs);
    if (!status) return msg.reply("Tidak ditemukan!");
    const [cities] = data;
    return client.sendMessage(msg.from, {
      text: CustomerInterface.mapSearchedDistrict({
        query: fullArgs.trim(),
        city: cities,
      }),
    });
  },
};
