const { GoogleAIFileManager } = require("@google/generative-ai/files");

const { readFileSync, writeFileSync } = require("fs");
const cryptoRandomStr = require("crypto-random-string");
const logger = require("@libs/utils/logger");

class GeminiFileAPI {
  /**
   *
   * @param { import("@adiwajshing/baileys").WASocket } client
   * @param { import("@libs/utils/serialize").Serialize } msg
   */
  constructor(client, msg) {
    this.client = client;
    this.msg = msg;
    this.fileManager = new GoogleAIFileManager(process.env.GEMINI_APIKEY);
  }

  /**
   *
   * @param { Buffer } fileBuffer
   * @param { string } mime
   */
  fileProcessor(fileBuffer, mime) {
    const filename = `./controllers/gemini/ai-fileapi/dist-fileapi/${cryptoRandomStr(
      7
    )}.${mime}`;
    writeFileSync(filename, fileBuffer);
    readFileSync(filename) && logger.info("File Processing: OK");
    return filename;
  }

  /**
   *
   * @param { Buffer } fileBuffer
   */
  async uploadFile(fileBuffer) {
    return await this.fileManager.uploadFile("FILEPATH", {
      mimeType: "MIME",
      displayName: "DISPLAY_NAME",
    });
  }

}
