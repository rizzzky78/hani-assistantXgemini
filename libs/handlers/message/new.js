

const {
    getContentType,
    MessageUpdateType,
    WAMessage,
    WASocket,
  } = require("@adiwajshing/baileys");
  const { commands } = require("@libs/constants/command");
  const { serialize } = require("@libs/utils/serialize");
  const { cooldown } = require("@libs/utils/cooldown");
  const moment = require("moment-timezone");
  const chalk = require("chalk");
  
  const { Tools } = require("@function/tools");
  const { commonMessage } = require("@config/messages");
  
  /**
   * **Core Message Handler**
   * @param { WASocket } client
   * @param { { messages: WAMessage[], type: MessageUpdateType } } param1
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
    const isCommand = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^@*&.+-,©^\/]/.test(body);
  
    /**
     * Auto Read
     */
    client.readMessages([message.key]);
  
    const msg = await serialize(message, client);
    if (
      message.type === "protocolMessage" ||
      message.type === "senderKeyDistributionMessage" ||
      !message.type
    )
      return;
  
    if (!isCommand) {
      if (msg.isGroup) return;
      if (Tools.checkUser(msg.senderNumber)) {
        return msg.reply(
          commonMessage("invalid_MessageAsNotCommand")(msg.pushName)
        );
      } else {
        return msg.reply(commonMessage("greetNewUser")(msg.pushName));
      }
    }
  
    if (msg.responseId) {
      msg.body = msg.responseId;
    }
  
    const prefix = isCommand ? msg.body[0] : null;
    const args = msg.body?.trim()?.split(/ +/)?.slice(1);
    const command = isCommand
      ? msg.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
      : null;
    const fullArgs = msg.body?.replace(command, "")?.slice(1)?.trim() || null;
  
    const getCommand =
      commands.get(command) ||
      commands.find((v) => v?.aliases && v?.aliases?.includes(command));
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
  
      if (getCommand.minArgs && getCommand.minArgs > args.length) {
        var text = `*Minimal argument is ${getCommand.minArgs}*\n`;
        if (getCommand.expectedArgs) {
          text += `*Usage :* {prefix}{command} {argument}\n`;
        }
        if (getCommand.example) {
          text += `*Example :* ${getCommand.example}`;
        }
        return msg.reply(
          text.format({ prefix, command, argument: getCommand.expectedArgs })
        );
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
  
      return getCommand.callback({
        client,
        message,
        msg,
        command,
        prefix,
        args,
        fullArgs,
      });
    }
  }
  module.exports = MessageHandler;
  