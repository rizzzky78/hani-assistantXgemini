const { ApiUser } = require("@controllers/gemini/api/api.user");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["clear"],
  callback: async ({ client, msg }) => {
    await ApiUser.clearUserChat({ id: msg.senderNumber }).then(() => {
      return msg.reply(
        "Sukses membersihkan percakapan!, sekarang kamu bisa memulai topik baru!"
      );
    });
  },
};
