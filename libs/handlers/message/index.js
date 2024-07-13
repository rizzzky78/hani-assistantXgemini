const { getContentType } = require("@adiwajshing/baileys");
const { commands } = require("@libs/constants/command");
const { serialize } = require("@libs/utils/serialize");
const { cooldown } = require("@libs/utils/cooldown");
const moment = require("moment-timezone");
const chalk = require("chalk");

const { Tools } = require("@function/tools");
const { commonMessage } = require("@config/messages");
const { Customer } = require("@controllers/customer");
const logger = require("@libs/utils/logger");

const {
  session: { autoReadMessages },
} = require("@config/settings");
const { Gemini } = require("@controllers/gemini");
const { ApiUser } = require("@controllers/gemini/api/api.user");

/**
 * **Core Message Handler**
 * @type { import("./types").MessageHandler }
 */
async function MessageHandler(client, { messages, type }) {
  const message = messages[0];
  if (message.key && message.key.remoteJid === "status@broadcast") return;
  if (!message.message) return;
  message.type = getContentType(message.message);
  /**
   * @type { string }
   */
  const body =
    message.message?.conversation ||
    message.message[message.type]?.text ||
    message.message[message.type]?.caption ||
    message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.message?.buttonsResponseMessage?.selectedButtonId ||
    message.message?.templateButtonReplyMessage?.selectedId ||
    null;

  if (autoReadMessages) {
    client.readMessages([message.key]);
  }

  const msg = await serialize(message, client);
  if (
    message.type === "protocolMessage" ||
    message.type === "senderKeyDistributionMessage" ||
    !message.type
  )
    return;

  if (msg.responseId) {
    msg.body = msg.responseId;
  }

  if (!msg.isGroup) {
    await Customer.validateByPhoneNumber(msg.senderNumber)
      .then(async (isRegistered) => {
        if (!isRegistered) {
          await Customer.registerCustomer({
            tagName: msg.pushName,
            phoneNumber: msg.senderNumber,
          }).then(({ data: { metadata } }) => {
            logger.info(
              `User ${msg.pushName} successfully registered! with ${metadata.customerId}.`
            );
          });
          return;
        }
        return;
      })
      .catch((e) => {
        logger.error("Error registering Customer.");
        console.error(e);
      });
  }

  const command = msg.body?.trim()?.split(/ +/)?.shift()?.toLowerCase() || null;
  const args = msg.body?.trim()?.split(/ +/)?.slice(1);
  const fullArgs = msg.body?.replace(command, "")?.slice(1).trim() || null;
  const messageArgs = msg.body || null;

  const getCommand =
    commands.get(command) ||
    commands.find((v) => v?.aliases && v?.aliases?.includes(command));

  if (!getCommand) {
    if (msg.isGroup && msg.body?.includes("6287777281751")) {
      msg.react("👍🏻").then(async () => {
        const buffImg =
          (await msg.download("buffer")) ||
          (msg.quoted && (await msg.quoted.download("buffer"))) ||
          null;
        const gemini = new Gemini(client, msg);
        await gemini
          .generative({ id: msg.senderNumber, tagname: msg.pushName }, buffImg)
          .catch(async (e) => {
            logger.error(e);
            console.error(e);
            await ApiUser.clearUserChat({ id: msg.pushName });
            logger.error(
              `User ${msg.pushName} message data was reset due to an error!`
            );
            return msg.reply(commonMessage("errorMessage"));
          });
      });
    }
    if (msg.isGroup) return;
    if (msg.isSelf) return;
    msg.react("👍🏻").then(async () => {
      const buffImg =
        (await msg.download("buffer")) ||
        (msg.quoted && (await msg.quoted.download("buffer"))) ||
        null;

      const gemini = new Gemini(client, msg);
      await gemini
        .generative({ id: msg.senderNumber, tagname: msg.pushName }, buffImg)
        .catch(async (e) => {
          logger.error(e);
          console.error(e);
          await ApiUser.clearUserChat({ id: msg.pushName });
          logger.error(
            `User ${msg.pushName} message data was reset due to an error!`
          );
          return msg.reply(commonMessage("errorMessage"));
        });
    });
  }
  if (getCommand) {
    const command_log = [
      chalk.whiteBright(`[ ${new Date().toISOString()} ]`),
      chalk.yellowBright(`[  COMMAND  ] :`),
      chalk.magentaBright(command),
      chalk.greenBright("from"),
      chalk.cyanBright(
        `${msg.pushName} | ${msg.senderNumber.substring(0, 9) + "xxx"}`
      ),
    ];
    if (msg.isGroup) {
      command_log.push(chalk.greenBright("in"));
      command_log.push(chalk.yellow(msg.groupMetadata.subject));
    }

    console.log(...command_log);

    Tools.createLog("cmd", {
      id: msg.senderNumber,
      username: msg.pushName,
      cmd: command,
      args: fullArgs ? fullArgs : null,
    });

    if (
      getCommand.groupOnly &&
      getCommand.adminOnly &&
      !msg.groupMetadata.participants
        .filter((v) => v.admin)
        .map((v) => v.id)
        .includes(msg.senderNumber + "@s.whatsapp.net")
    ) {
      return msg.reply("Group only!");
    }

    if (getCommand.privateOnly && msg.isGroup) {
      return msg.reply("Admin only!");
    }

    if (getCommand.cooldown) {
      const cooldownBuilder = `${msg.senderNumber}-${command}`;
      if (
        cooldown.get(cooldownBuilder) &&
        cooldown.get(cooldownBuilder) > moment()
      ) {
        const duration = moment.duration(
          cooldown.get(cooldownBuilder).diff(moment())
        );
        const time = Math.round(duration.asSeconds());
        return msg.reply(`Sedang cooldown ${time} detik.`);
      }
      if (
        !cooldown.get(cooldownBuilder) ||
        (cooldown.get(cooldownBuilder) &&
          cooldown.get(cooldownBuilder) < moment())
      ) {
        cooldown.set(
          cooldownBuilder,
          moment().add(moment.duration(getCommand.cooldown))
        );
        setTimeout(() => cooldown.delete(cooldownBuilder), getCommand.cooldown);
      }
    }

    if (getCommand.waitMessage) {
      if (typeof getCommand.waitMessage === "string") {
        await msg.reply(getCommand.waitMessage);
      } else {
        await msg.reply("_Mohon tunggu sebentar..._");
      }
    }

    return await getCommand.callback({
      client,
      message,
      msg,
      command,
      args,
      fullArgs,
    });
  }
}
module.exports = MessageHandler;
