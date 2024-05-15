const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const { Tools } = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * @memberof Customer
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["hniid"],
  category: "customer",
  permission: "common",
  typeArgs: "query",
  expectedArgs: "<QUERY>",
  exampleArgs: "12345678",
  description: `Mengatur HNI ID Customer.`,
  callback: async ({ client, msg, args }) => {
    const [hniId] = Tools.arrayModifier("n", args);
    if (!hniId) {
      return msg.reply(commonMessage("invalid_QueryHniIdInput"));
    }
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        await Customer.validateByPhoneNumber(msg.senderNumber)
          .then(async (isCustomer) => {
            if (!isCustomer) {
              await Customer.registerCustomer({
                tagName: msg.pushName,
                phoneNumber: msg.senderNumber,
              });
            }
            await Customer.registerHniId(msg.senderNumber, hniId).then(
              (status) => {
                if (!status) {
                  return msg.reply(commonMessage("errorMessage"));
                }
                return msg.reply(
                  commonMessage("notification_SuccessAddedHniId")(hniId)
                );
              }
            );
          })
          .catch((e) => {
            logger.error(e);
            console.error(e);
            return msg.reply(commonMessage("errorMessage"));
          });
      });
  },
};
