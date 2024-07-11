const { Gemini } = require("@controllers/gemini");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["append-upload-raw"],
  callback: async function ({ client, command, msg, args }) {
    await Gemini.uploadCatalogue().then(() => {
      return msg.reply("Success!");
    });
  },
};
