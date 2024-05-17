const { Moderation } = require("@controllers/admin");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["test"],
  waitMessage: true,
  callback: async ({ client, msg }) => {
    await Moderation.getTopSellingProducts().then((data) => {
      const mapped = data.map((v) => {
        const {
          data: { image, description, ...rest },
        } = v;
        return rest;
      });
      return msg.reply(JSON.stringify(mapped, null, 2));
    });
  },
};
