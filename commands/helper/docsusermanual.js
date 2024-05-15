const { commonMessage } = require("@config/messages");
const { Tools } = require("@function/tools");
const { readFileSync } = require("fs");
const { cmdModules } = require("@libs/constants/command");

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["tutorial"],
  category: "general",
  description: `Mengirim tutorial lengkap mengenai tata cara pemakaian chatbot.`,
  callback: async ({ msg, client, args }) => {
    const [selection] = Tools.arrayModifier("l", args);
    client
      .sendMessage(msg.from, {
        text: commonMessage("waitMessage"),
      })
      .then(async () => {
        if (!selection) {
          return client.sendMessage(msg.from, {
            video: readFileSync("./assets/video/introduction.mp4"),
            caption: `Berikut terlampir tata cara lengkap dalam melakukan pemesanan melalui Chatbot HANI.`,
          });
        }
        if (selection === "bayar") {
          return client.sendMessage(msg.from, {
            video: readFileSync("./assets/video/howto-upload.mp4"),
            caption: `Berikut terlampir tata cara lengkap dalam melakukan pembayaran melalui Chatbot HANI.`,
          });
        }
        if (selection === "cmd") {
          /**
           * @type { Array<{ cmdKeys: string; category: "admin" | "customer" | "general"; permission: string; typeArgs: string; expectedArgs: string; exampleArgs: string description: string }> }
           */
          const instanceCmdModule = [];
          for (const mod in cmdModules) {
            cmdModules[mod]
              .sort((a, b) => a.name.localeCompare(b.name))
              .forEach((v) =>
                instanceCmdModule.push({
                  cmdKeys: v.name,
                  category: v.category,
                  permission: v.strict,
                  typeArgs: v.typeArgs,
                  expectedArgs: v.expectedArgs,
                  exampleArgs: v.exampleArgs,
                  description: v.description,
                })
              );
          }
          const { doc } = await PDF.createPDF({
            document: PDF.mapInputData({
              data: { cmdModules: instanceCmdModule },
              type: "cmdmodules",
            }),
          });
          return client.sendMessage(msg.from, {
            document: doc,
            fileName: `Daftar Kode Perintah Chatbot`,
            mimetype: "application/pdf",
            caption: `Berikut adalah daftar atau list keseluruhan kode perintah yang terdapat pada sistem Chatbot.`,
          });
        }
      });
  },
};
