const axios = require("axios").default;

const sticker = axios.create({
  baseURL: "https://sticker-api-tpe3wet7da-uc.a.run.app",
});

/**
 * @type { import('@libs/builders/command').ICommand }
 */
module.exports = {
  aliases: ["s", "stiker", "sticker"],
  category: "sticker",
  description: "Sticker Maker",
  waitMessage: "Bentar tod...",
  callback: async ({ msg, client, message }) => {
    /**
     * @type { string }
     */
    let capts;
    switch (msg.senderNumber) {
      case "6281230239662":
        capts =
          "Skip, tidak melayani pembuatan stiker untuk warga viking malang! 🤣";
        break;
      case "6285389791282":
        capts = "Skip, tidak melayani pembuatan stiker untuk seorang peod! 🤣";
        break;
      case "6285648200362":
        capts =
          "Skip, tidak melayani pembuatan stiker untuk wibu akut penghalu 2dimensi! 🤣";
    }

    const contactObj = {
      ["6281230239662"]: `Skip, tidak melayani pembuatan stiker untuk warga viking malang! 🤣`,
      ["6285389791282"]: `Skip, tidak melayani pembuatan stiker untuk seorang peod! 🤣`,
      ["6285648200362"]: `Skip, tidak melayani pembuatan stiker untuk wibu akut penghalu 2dimensi! 🤣`,
    };

    if (
      ["6281230239662", "6285389791282", "6285648200362"].includes(
        msg.senderNumber
      )
    ) {
      return msg.reply(capts);
    } else {
      const file =
        (await msg.download("buffer")) ||
        (msg.quoted && (await msg.quoted.download("buffer")));
      if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
        const data = {
          image: `data:image/jpeg;base64,${file.toString("base64")}`,
          stickerMetadata: {
            pack: msg.pushName ? msg.pushName : "No-Name",
            author: "github.com/rizzzky78",
            keepScale: true,
            circle: false,
            removebg: false,
          },
        };
        sticker.post("/prepareWebp", data).then((res) => {
          client.sendMessage(
            msg.from,
            { sticker: Buffer.from(res.data.webpBase64, "base64") },
            { quoted: message }
          );
        });
      } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
        const data = {
          file: `data:video/mp4;base64,${file.toString("base64")}`,
          stickerMetadata: {
            pack: msg.pushName ? msg.pushName : "No-Name",
            author: "github.com/rizzzky78",
            keepScale: true,
          },
          processOptions: {
            crop: false,
            fps: 10,
            startTime: "00:00:00.0",
            endTime: "00:00:7.0",
            loop: 0,
          },
        };
        sticker.post("/convertMp4BufferToWebpDataUrl", data).then((data) => {
          client.sendMessage(
            msg.from,
            { sticker: Buffer.from(data.data.split(";base64,")[1], "base64") },
            { quoted: message }
          );
        });
      } else {
        msg.reply("Kirim media dengan caption /sticker");
      }
    }
  },
};
