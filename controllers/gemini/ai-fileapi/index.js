const {
  GoogleAIFileManager,
  FileState,
} = require("@google/generative-ai/files");

const { readFileSync, writeFileSync } = require("fs");
const cryptoRandomStr = require("crypto-random-string");
const logger = require("@libs/utils/logger");
const { MIMEType } = require("util");

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
  async fileProcessor(fileBuffer, mime) {
    const filePath = `./controllers/gemini/ai-fileapi/dist-fileapi/`;
    const fileName = `${cryptoRandomStr(7)}.${mime}`;
    const filePathName = filePath + fileName;
    writeFileSync(filePathName, fileBuffer);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    readFileSync(filePathName) && logger.info("File Processing: OK");
    return { filePath: filePathName, fileName: fileName };
  }

  /**
   *
   * @param { Buffer } fileBuffer
   * @param { MIMEType } mime
   */
  async uploadFile(fileBuffer, mime) {
    const { filePath, fileName } = await this.fileProcessor(fileBuffer, mime);
    const fileUpload = await this.fileManager.uploadFile(filePath, {
      mimeType: mime,
      displayName: fileName,
    });

    let fileState = await this.fileManager.getFile(fileUpload.file.name);
    while (fileState.state === FileState.PROCESSING) {
      logger.info("Loading file for ready state...");
      await new Promise((res) => setTimeout(res, 5000));
      fileState = await this.fileManager.getFile(fileUpload.file.name);
    }
    if (fileState.state === FileState.FAILED) {
      throw new Error("File processing failed!");
    }
    return fileUpload;
  }
}

module.exports = { GeminiFileAPI };
