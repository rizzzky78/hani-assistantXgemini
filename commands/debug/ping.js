const moment = require("moment");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["ping"],
  callback: async ({ msg, message }) => {
    return msg.reply(
      JSON.stringify(
        {
          ping: `*_${moment
            .duration(
              Date.now() - parseInt(message.messageTimestamp.toString()) * 1000
            )
            .asSeconds()} second(s)_*`,
          raw: message.messageTimestamp.toString(),
        },
        null,
        2
      )
    );
  },
};
