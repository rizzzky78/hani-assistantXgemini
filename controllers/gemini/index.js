const schedule = require("node-schedule");
const {
  collections: { userChatData },
} = require("@database/router");

const { readFileSync } = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const {
  functionCallMapper,
  functionDeclarationsTool,
  functionApiResponseMapper,
} = require("./function");
const logger = require("@libs/utils/logger");
const chalk = require("chalk");

/**
 * **Google Gemini AI**
 */
class Gemini {
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
      logger.info(`User ${id} - API response appended!`);
      sessionChat.push(
        {
          role: "user",
          parts: [
            {
              text: readFileSync(
                "./assets/data/general-information.txt",
                "utf-8"
              ),
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: `Understood, please let me know the next instructions or any specific details you need further analyzed or processed from this data.`,
            },
          ],
        }
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

  /**
   * **Google Gemini Chat Completions**
   * @param { Buffer } img
   * @param { { id: string; tagname: string; prompt: string } } dto
   */
  static async visionPro(img, { id, tagname, prompt }) {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
    const sysIntruction = readFileSync(
      "./controllers/gemini/persona.txt",
      "utf-8"
    );
    /**
     * @type { GeminiModelMapper }
     */
    const selectedModel = "gemini-1.0-pro-latest";
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
    const visionResponse = await model.generateContent([
      "PROMPT",
      {
        inlineData: {
          data: img.toString("base64"),
          mimeType: "image/png",
        },
      },
    ]);
    const res = visionResponse.response.text();
  }
}

// Schedule the task to run every two hours
schedule.scheduleJob("0 */1 * * *", async () => {
  await Gemini.autoClearChatSession();
});

module.exports = { Gemini };
