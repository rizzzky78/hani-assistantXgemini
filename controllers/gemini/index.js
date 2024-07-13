const { readFileSync } = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const logger = require("@libs/utils/logger");
const chalk = require("chalk");
const { Injection } = require("./injection");
const { functionApiCall, ApiServe } = require("./api/apai.serve");
const { funcDeclarationsTool } = require("./api/api.function-call");
const { ApiUser } = require("./api/api.user");
const { ApiModeration } = require("./api/api.moderation");
const { commonMessage } = require("@config/messages");

class Gemini {
  /**
   *
   * @param { import("@adiwajshing/baileys").WASocket } client
   * @param { import("@libs/utils/serialize").Serialize } msg
   */
  constructor(client, msg) {
    this.client = client;
    this.msg = msg;
  }
  sysIntruction = readFileSync("./controllers/gemini/persona.txt", "utf-8");
  /**
   *
   * @param { { id: string; tagname: string; prompt: string } } param0
   * @param { Buffer } img
   */
  async generative({ id, tagname, prompt }, img = null) {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
    /**
     * @type { GeminiModelMapper }
     */
    const selectedModel = "gemini-1.5-flash";
    const model = gemini.getGenerativeModel({
      model: selectedModel,
      systemInstruction: this.sysIntruction,
      tools: funcDeclarationsTool,
      toolConfig: {
        functionCallingConfig: {
          mode: "AUTO",
        },
      },
    });

    const existingUser = await ApiUser.readUserData(id);
    /**
     * @type { import("@google/generative-ai").Content[] }
     */
    const sessionChat = existingUser ? existingUser.chats : [];
    if (sessionChat.length < 1 || !sessionChat) {
      logger.info("Successfully injected dataset!");
      sessionChat.push(
        ...Injection.injectDocsData(
          await ApiModeration.readProductDataState(),
          tagname,
          id
        )
      );
    }

    if (img) {
      const visionResponse = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: img.toString("base64"),
            mimeType: "image/png",
          },
        },
      ]);
      const visionResponseText = visionResponse.response.text();
      sessionChat.push(
        ...Injection.injectMultiData(prompt, visionResponseText)
      );
      existingUser
        ? await ApiUser.updateUserData({ id, content: sessionChat })
        : await ApiUser.createUser({ id, tagname, content: sessionChat });
      return this.msg.reply(
        commonMessage("formatAutoResponseMessage")(visionResponseText)
      );
    }

    const chat = model.startChat({
      history: sessionChat,
    });
    const result = await chat.sendMessage(prompt);
    logger.info(chalk.magentaBright(`User ${id} uses autochat`));

    const responseFunctionCall = result.response.functionCalls();
    if (responseFunctionCall) {
      const instanceApiServe = new ApiServe(this.client, this.msg);
      const [metadataCall] = responseFunctionCall;
      const callData = {
        /**
         * @type { keyof functionApiCall }
         */
        name: metadataCall.name,
        args: metadataCall.args,
      };
      const apiResponse = await instanceApiServe[callData.name](callData.args);
      new Promise((resolve) => setTimeout(resolve, 5_000));
      const modResult = await chat.sendMessage([
        {
          functionResponse: {
            name: metadataCall.name,
            response: apiResponse,
          },
        },
      ]);
      const modContent = await chat.getHistory();

      existingUser
        ? await ApiUser.updateUserData({ id, content: modContent })
        : await ApiUser.createUser({ id, tagname, content: modContent });
      logger.info("Gemini Function Call API Used!");
      return this.msg.reply(
        commonMessage("formatAutoResponseMessage")(modResult.response.text())
      );
    } else {
      const content = await chat.getHistory();
      existingUser
        ? await this.updateUserData({ id, content })
        : await this.createUser({ id, tagname, content });

      return this.msg.reply(
        commonMessage("formatAutoResponseMessage")(result.response.text())
      );
    }
  }
}

module.exports = { Gemini };
