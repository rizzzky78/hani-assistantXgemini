/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["get-group-id"],
  waitMessage: "Wait...",
  callback: async function ({ client, command, msg, args }) {
    return client.sendMessage(msg.from, {
      text: msg.from.toString(),
    });
  },
};
