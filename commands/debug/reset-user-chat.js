const { ApiUser } = require("@controllers/gemini/api/api.user");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["reset-mychat"],
  callback: async function ({ client, command, msg, args }) {
    await ApiUser.deleteUserChat({ id: msg.senderNumber }).then(() => {
      return msg.reply("Sukses menghapus data chat User!");
    });
  },
};
