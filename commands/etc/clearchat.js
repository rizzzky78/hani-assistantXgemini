const { Gemini } = require("@controllers/gemini");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["clear"],
  callback: async ({ client, msg }) => {
    client
      .sendMessage(msg.from, {
        text: "Wait...",
      })
      .then(async () => {
        await Gemini.clearUserChat({ id: msg.senderNumber }).then(() => {
          return msg.reply(
            "Sukses membersihkan percakapan!, sekarang kamu bisa memulai topik baru!"
          );
        });
      });
  },
};
