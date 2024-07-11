const schedule = require("node-schedule");
const {
  collections: { userChatData },
} = require("@database/router");

const { readFileSync, writeFileSync } = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  GoogleAIFileManager,
  FileState,
} = require("@google/generative-ai/files");

const {
  functionCallMapper,
  functionDeclarationsTool,
  functionApiResponseMapper,
} = require("./function");
const logger = require("@libs/utils/logger");
const chalk = require("chalk");
const { Injection } = require("./injection");

/**
 * **Google Gemini AI**
 */
class Gemini {
  static fileManager = new GoogleAIFileManager(process.env.GEMINI_APIKEY);
  /**
   *
   * @param { { id: string; tagname: string; content: import("@google/generative-ai").Content[] } } param0
   */
  static async createUser({ id, tagname, content }) {
    /**
     * @type { import("@interface/schema").UserChats }
     */
    const user = {
      id,
      tagname,
      timestamp: new Date().toISOString(),
      countchats: 1,
      chats: content,
    };
    await userChatData.insertOne(user);
  }

  /**
   *
   * @param { string } id
   */
  static async readUserData(id) {
    const userData = await userChatData.findOne({ id });
    return userData ? userData : null;
  }

  /**
   *
   * @param { { id: string; content: import("@google/generative-ai").Content[] } } param0
   */
  static async updateUserData({ id, content }) {
    await userChatData.updateOne(
      { id },
      {
        $set: {
          timestamp: new Date().toISOString(),
          chats: content,
        },
        $inc: {
          countchats: 1,
        },
      }
    );
  }

  static async clearUserChat({ id }) {
    await userChatData.findOneAndUpdate(
      { id },
      {
        $set: {
          countchats: 0,
        },
        $push: {
          chats: {
            $each: [],
            $slice: 2,
          },
        },
      }
    );
  }

  static async autoClearChatSession() {
    const getTime = new Date(Date.now() - 1 * 60 * 60 * 1000);
    await userChatData.updateMany(
      {
        timestamp: { $lt: getTime.toISOString() },
      },
      {
        $set: {
          countchats: 0,
          chats: [],
        },
      }
    );
    logger.info("Cleared inactive chat sessions");
  }

  static async uploadCatalogue() {
    const fileData = await Injection.getDataProducts();
    writeFileSync("./assets/json/state/data-products.json", fileData);
    const uploadResponse = await this.fileManager.uploadFile(
      "./assets/json/state/data-products.json",
      {
        mimeType: "application/json",
        displayName: "Katalog Produk HNI HPAI",
      }
    );
    writeFileSync(
      "./controllers/gemini/state-catalogue.json",
      JSON.stringify(uploadResponse, null, 2)
    );
    logger.info("Data Catalogue successfully injected!");
    return uploadResponse;
  }

  static async updateProductsDataState() {
    logger.info("Products Data State updated!");
    const fileData = await Injection.getDataProducts();
    writeFileSync("./assets/json/state/data-products.json", fileData);
  }

  static readProductDataState() {
    return readFileSync("./assets/json/state/data-products.json", "utf-8");
  }

  static async checkFileExpiration() {
    /**
     * @type { import("@google/generative-ai/files").UploadFileResponse }
     */
    const fileMetadata = JSON.parse(
      readFileSync("./controllers/gemini/state-catalogue.json", "utf-8")
    );
    if (fileMetadata) {
      const expirationDate = new Date(fileMetadata?.file?.expirationTime);
      const now = new Date();
      return now >= expirationDate;
    } else {
      await this.uploadCatalogue();
      return false;
    }
  }

  /**
   *
   * @returns { import("@google/generative-ai/files").UploadFileResponse }
   */
  static readFileMetadata() {
    return JSON.parse(
      readFileSync("./controllers/gemini/state-catalogue.json", "utf-8")
    );
  }

  /**
   * **Google Gemini Chat Completions**
   * @param { { id: string; tagname: string; prompt: string } } param0
   * @param { Buffer } img
   */
  static async generative({ id, tagname, prompt }, img = null) {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
    const sysIntruction = readFileSync(
      "./controllers/gemini/persona.txt",
      "utf-8"
    );
    /**
     * @type { GeminiModelMapper }
     */
    const selectedModel = "gemini-1.5-flash";
    const model = gemini.getGenerativeModel({
      model: selectedModel,
      systemInstruction: sysIntruction,
      tools: functionDeclarationsTool,
      toolConfig: {
        functionCallingConfig: {
          mode: "AUTO",
        },
      },
    });

    const existingUser = await this.readUserData(id);

    /**
     * @type { import("@google/generative-ai").Content[] }
     */
    const sessionChat = existingUser ? existingUser.chats : [];

    if (sessionChat.length < 1 || !sessionChat) {
      sessionChat.push(
        ...Injection.injectDocsData(this.readProductDataState())
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
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: visionResponseText,
            },
          ],
        }
      );
      existingUser
        ? await this.updateUserData({ id, content: sessionChat })
        : await this.createUser({ id, tagname, content: sessionChat });
      return visionResponseText;
    }

    const chat = model.startChat({
      history: sessionChat,
    });

    const result = await chat.sendMessage(prompt);

    logger.info(chalk.magentaBright(`User ${id} uses autochat`));

    const funcCall = result.response.functionCalls();

    if (funcCall) {
      const [call] = funcCall;
      /**
       * @type { Promise<{ status: "success" | "failed"; data: string }> }
       */
      const apiresponse = await functionCallMapper[call.name](call.args);
      const modresult = await chat.sendMessage(
        functionApiResponseMapper(apiresponse)
      );

      const modcontent = await chat.getHistory();

      existingUser
        ? await this.updateUserData({ id, content: modcontent })
        : await this.createUser({ id, tagname, content: modcontent });

      return modresult.response.text();
    } else {
      const content = await chat.getHistory();
      existingUser
        ? await this.updateUserData({ id, content })
        : await this.createUser({ id, tagname, content });

      return result.response.text();
    }
  }
}

// Schedule the task to run every two hours
schedule.scheduleJob("0 */1 * * *", async () => {
  await Gemini.autoClearChatSession();
  await Gemini.updateProductsDataState();
});

module.exports = { Gemini };
