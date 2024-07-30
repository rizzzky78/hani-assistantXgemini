"use strict";

/**
 * @typedef {import("@adiwajshing/baileys").WASocket} WASocket
 * @typedef {import("@libs/utils/serialize").Serialize} Serialize
 * @typedef {import("@google/generative-ai").GenerativeModel} GenerativeModel
 * @typedef {import("@google/generative-ai").ChatSession} ChatSession
 * @typedef {import("@google/generative-ai").Content} Content
 * @typedef {import("@google/generative-ai").GenerateContentResult} GenerateContentResult
 */

const { readFileSync, writeFileSync } = require("fs");
const {
  GoogleGenerativeAI,
  FunctionCallingMode,
} = require("@google/generative-ai");
const logger = require("@libs/utils/logger");
const chalk = require("chalk");
const { Injection } = require("./injection");
const { ApiServe } = require("./api/api.serve");
const { funcDeclarationsTool } = require("./api/api.function-call");
const { ApiUser } = require("./api/api.user");
const { ApiModeration } = require("./api/api.moderation");
const { commonMessage } = require("@config/messages");
const sanitizeHtml = require("sanitize-html");

/**
 * Gemini AI Assistant Controller
 */
class Gemini {
  /**
   * @param {WASocket} client - WhatsApp client instance
   * @param {Serialize} msg - Serialized message object
   */
  constructor(client, msg) {
    /** @type {WASocket} */
    this.client = client;
    /** @type {Serialize} */
    this.msg = msg;
    /** @type {GoogleGenerativeAI} */
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
    /** @type {string} */
    this.sysInstruction = readFileSync(
      "./controllers/gemini/persona.txt",
      "utf-8"
    );
  }

  /**
   *
   * @param { UserMessageDto } dto
   */
  messageMapper(dto) {
    return JSON.stringify(dto);
  }

  /**
   * Generate response based on user input
   * @param {{id: string; tagname: string; prompt: string}} param0 - User input parameters
   * @param {Buffer} [img] - Optional image buffer
   * @returns {Promise<any>} - Generated response
   */
  async generative({ id, tagname, prompt }, img = null) {
    try {
      const sanitizedPrompt = this.messageMapper({
        phoneId: this.msg.from,
        phoneNumber: this.msg.senderNumber,
        userName: tagname,
        media: img ? "has-attached-media" : "no-media",
        messageType: "reguler-message",
        message: sanitizeHtml(prompt),
      });
      const model = this.getModel();
      const sessionChat = await this.getOrCreateSessionChat(id, tagname);

      if (img) {
        return await this.handleImagePrompt(
          model,
          sanitizedPrompt,
          img,
          sessionChat,
          id,
          tagname
        );
      }

      return await this.handleTextPrompt(
        model,
        sanitizedPrompt,
        sessionChat,
        id,
        tagname
      );
    } catch (error) {
      return await this.handleError(error, id, tagname);
    }
  }

  /**
   * Get the Gemini model instance
   * @returns {GenerativeModel} Configured Gemini model
   */
  getModel() {
    return this.gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: this.sysInstruction,
      tools: funcDeclarationsTool,
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.AUTO,
        },
      },
    });
  }

  /**
   * Get existing session chat or create a new one
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @returns {Promise<Content[]>} Session chat history
   */
  async getOrCreateSessionChat(id, tagname) {
    const existingUser = await ApiUser.readUserData(id);
    /** @type {Content[]} */
    let sessionChat = existingUser ? existingUser.chats : [];

    if (sessionChat.length < 1) {
      logger.info("Successfully injected dataset!");
      const productData = await ApiModeration.readProductDataState();
      sessionChat.push(
        ...Injection.injectMessageData(productData, {
          phoneId: this.msg.from,
          phoneNumber: this.msg.senderNumber,
          userName: tagname,
          media: "no-media",
          messageType: "dataset",
          message: "VIA_INJECTTION_DATA",
        })
      );
    }

    return sessionChat;
  }

  /**
   * Handle image-based prompts
   * @param {GenerativeModel} model - Gemini model instance
   * @param {string} prompt - User prompt
   * @param {Buffer} img - Image buffer
   * @param {Content[]} sessionChat - Current session chat
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @returns {Promise<any>} Generated response
   */
  async handleImagePrompt(model, prompt, img, sessionChat, id, tagname) {
    /** @type {GenerateContentResult} */
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
    sessionChat.push(...Injection.injectMultiData(prompt, visionResponseText));
    await this.updateUserData(id, tagname, sessionChat);
    return this.msg.reply(
      commonMessage("formatAutoResponseMessage")(visionResponseText)
    );
  }

  /**
   * Handle text-based prompts
   * @param {GenerativeModel} model - Gemini model instance
   * @param {string} prompt - User prompt
   * @param {Content[]} sessionChat - Current session chat
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @returns {Promise<any>} Generated response
   */
  async handleTextPrompt(model, prompt, sessionChat, id, tagname) {
    /** @type {ChatSession} */
    const chat = model.startChat({ history: sessionChat });
    /** @type {GenerateContentResult} */
    const result = await chat.sendMessage(prompt);
    logger.info(chalk.magentaBright(`User ${id} uses autochat`));

    const responseFunctionCall = result.response.functionCalls();
    if (responseFunctionCall) {
      return await this.handleFunctionCall(
        chat,
        responseFunctionCall,
        id,
        tagname
      );
    } else {
      const content = await chat.getHistory();
      await this.updateUserData(id, tagname, content);
      return this.msg.reply(
        commonMessage("formatAutoResponseMessage")(result.response.text())
      );
    }
  }

  /**
   * Handle function calls from the AI
   * @param {ChatSession} chat - Current chat session
   * @param {import("@google/generative-ai").FunctionCall[]} responseFunctionCall - Function call response from AI
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @returns {Promise<any>} Processed response
   */
  async handleFunctionCall(chat, responseFunctionCall, id, tagname) {
    console.log(JSON.stringify(responseFunctionCall, null, 2));

    const instanceApiServe = new ApiServe(this.client, this.msg);
    const [metadataCall] = responseFunctionCall;
    /** @type {{name: string; args: Object}} */
    const callData = {
      /**
       * @type { keyof instanceApiServe }
       */
      name: metadataCall.name,
      args: metadataCall.args,
    };

    const apiResponse = await instanceApiServe[callData.name](callData.args);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    /** @type {GenerateContentResult} */
    const modResult = await chat.sendMessage([
      {
        functionResponse: {
          name: metadataCall.name,
          response: apiResponse,
        },
      },
    ]);
    writeFileSync(
      "./assets/json/state/gemini.json",
      JSON.stringify({ responseFunctionCall, apiResponse }, null, 2)
    );

    const modContent = await chat.getHistory();
    await this.updateUserData(id, tagname, modContent);

    logger.info("Gemini Function Call API Used!");
    return this.msg.reply(
      commonMessage("formatAutoResponseMessage")(modResult.response.text())
    );
  }

  /**
   * Update or create user data
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @param {Content[]} content - Chat content to update
   * @returns {Promise<void>}
   */
  async updateUserData(id, tagname, content) {
    const existingUser = await ApiUser.readUserData(id);
    if (existingUser) {
      await ApiUser.updateUserData({ id, content });
    } else {
      await ApiUser.createUser({ id, tagname, content });
    }
  }

  /**
   * Handle errors in the Gemini controller
   * @param {Error} error - Error object
   * @param {string} id - User ID
   * @param {string} tagname - User tag name
   * @returns {Promise<any>} Error response
   */
  async handleError(error, id, tagname) {
    logger.error(`Error in Gemini generative function: ${error.message}`);
    console.error(error);
    await ApiUser.clearUserChat({ id });
    logger.error(
      `User ${tagname} (${id}) message data was reset due to an error!`
    );
    return this.msg.reply(commonMessage("errorMessage"));
  }
}

module.exports = { Gemini };

// "use strict"

// /**
//  * @typedef {import("@adiwajshing/baileys").WASocket} WASocket
//  * @typedef {import("@libs/utils/serialize").Serialize} Serialize
//  * @typedef {import("@google/generative-ai").GenerativeModel} GenerativeModel
//  * @typedef {import("@google/generative-ai").ChatSession} ChatSession
//  * @typedef {import("@google/generative-ai").Content} Content
//  * @typedef {import("@google/generative-ai").GenerateContentResult} GenerateContentResult
//  */

// const { readFileSync, writeFileSync } = require("fs");
// const {
//   GoogleGenerativeAI,
//   FunctionCallingMode,
// } = require("@google/generative-ai");
// const logger = require("@libs/utils/logger");
// const chalk = require("chalk");
// const { Injection } = require("./injection");
// const { ApiServe } = require("./api/api.serve");
// const { funcDeclarationsTool } = require("./api/api.function-call");
// const { ApiUser } = require("./api/api.user");
// const { ApiModeration } = require("./api/api.moderation");
// const { commonMessage } = require("@config/messages");
// const sanitizeHtml = require("sanitize-html");

// /**
//  * Gemini AI Assistant Controller
//  */
// class Gemini {
//   /**
//    * @param {WASocket} client - WhatsApp client instance
//    * @param {Serialize} msg - Serialized message object
//    */
//   constructor(client, msg) {
//     /** @type {WASocket} */
//     this.client = client;
//     /** @type {Serialize} */
//     this.msg = msg;
//     /** @type {GoogleGenerativeAI} */
//     this.gemini = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
//     /** @type {string} */
//     this.sysInstruction = readFileSync(
//       "./controllers/gemini/persona.txt",
//       "utf-8"
//     );
//   }

//   /**
//    * Generate response based on user input
//    * @param {{id: string; tagname: string; prompt: string}} param0 - User input parameters
//    * @param {Buffer} [img] - Optional image buffer
//    * @returns {Promise<any>} - Generated response
//    */
//   async generative({ id, tagname, prompt }, img = null) {
//     try {
//       const sanitizedPrompt = sanitizeHtml(prompt);
//       const model = this.getModel();
//       const sessionChat = await this.getOrCreateSessionChat(id, tagname);

//       if (img) {
//         return await this.handleImagePrompt(
//           model,
//           sanitizedPrompt,
//           img,
//           sessionChat,
//           id,
//           tagname
//         );
//       }

//       return await this.handleTextPrompt(
//         model,
//         sanitizedPrompt,
//         sessionChat,
//         id,
//         tagname
//       );
//     } catch (error) {
//       return await this.handleError(error, id, tagname);
//     }
//   }

//   /**
//    * Get the Gemini model instance
//    * @returns {GenerativeModel} Configured Gemini model
//    */
//   getModel() {
//     return this.gemini.getGenerativeModel({
//       model: "gemini-1.5-flash",
//       systemInstruction: this.sysInstruction,
//       tools: funcDeclarationsTool,
//       toolConfig: {
//         functionCallingConfig: {
//           mode: FunctionCallingMode.AUTO,
//         },
//       },
//     });
//   }

//   /**
//    * Get existing session chat or create a new one
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @returns {Promise<Content[]>} Session chat history
//    */
//   async getOrCreateSessionChat(id, tagname) {
//     const existingUser = await ApiUser.readUserData(id);
//     /** @type {Content[]} */
//     let sessionChat = existingUser ? existingUser.chats : [];

//     if (sessionChat.length < 1) {
//       logger.info("Successfully injected dataset!");
//       const productData = await ApiModeration.readProductDataState();
//       sessionChat.push(...Injection.injectDocsData(productData, tagname, id));
//     }

//     return sessionChat;
//   }

//   /**
//    * Handle image-based prompts
//    * @param {GenerativeModel} model - Gemini model instance
//    * @param {string} prompt - User prompt
//    * @param {Buffer} img - Image buffer
//    * @param {Content[]} sessionChat - Current session chat
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @returns {Promise<any>} Generated response
//    */
//   async handleImagePrompt(model, prompt, img, sessionChat, id, tagname) {
//     /** @type {GenerateContentResult} */
//     const visionResponse = await model.generateContent([
//       prompt,
//       {
//         inlineData: {
//           data: img.toString("base64"),
//           mimeType: "image/png",
//         },
//       },
//     ]);
//     const visionResponseText = visionResponse.response.text();
//     sessionChat.push(...Injection.injectMultiData(prompt, visionResponseText));
//     await this.updateUserData(id, tagname, sessionChat);
//     return this.msg.reply(
//       commonMessage("formatAutoResponseMessage")(visionResponseText)
//     );
//   }

//   /**
//    * Handle text-based prompts
//    * @param {GenerativeModel} model - Gemini model instance
//    * @param {string} prompt - User prompt
//    * @param {Content[]} sessionChat - Current session chat
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @returns {Promise<any>} Generated response
//    */
//   async handleTextPrompt(model, prompt, sessionChat, id, tagname) {
//     /** @type {ChatSession} */
//     const chat = model.startChat({ history: sessionChat });
//     /** @type {GenerateContentResult} */
//     const result = await chat.sendMessage(prompt);
//     logger.info(chalk.magentaBright(`User ${id} uses autochat`));

//     const responseFunctionCall = result.response.functionCalls();
//     if (responseFunctionCall) {
//       return await this.handleFunctionCall(
//         chat,
//         responseFunctionCall,
//         id,
//         tagname
//       );
//     } else {
//       const content = await chat.getHistory();
//       await this.updateUserData(id, tagname, content);
//       return this.msg.reply(
//         commonMessage("formatAutoResponseMessage")(result.response.text())
//       );
//     }
//   }

//   /**
//    * Handle function calls from the AI
//    * @param {ChatSession} chat - Current chat session
//    * @param {import("@google/generative-ai").FunctionCall[]} responseFunctionCall - Function call response from AI
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @returns {Promise<any>} Processed response
//    */
//   async handleFunctionCall(chat, responseFunctionCall, id, tagname) {
//     console.log(JSON.stringify(responseFunctionCall, null, 2));

//     const instanceApiServe = new ApiServe(this.client, this.msg);
//     const [metadataCall] = responseFunctionCall;
//     /** @type {{name: string; args: Object}} */
//     const callData = {
//       /**
//        * @type { keyof instanceApiServe }
//        */
//       name: metadataCall.name,
//       args: metadataCall.args,
//     };

//     const apiResponse = await instanceApiServe[callData.name](callData.args);
//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     /** @type {GenerateContentResult} */
//     const modResult = await chat.sendMessage([
//       {
//         functionResponse: {
//           name: metadataCall.name,
//           response: apiResponse,
//         },
//       },
//     ]);
//     writeFileSync(
//       "./assets/json/state/gemini.json",
//       JSON.stringify({ responseFunctionCall, apiResponse }, null, 2)
//     );

//     const modContent = await chat.getHistory();
//     await this.updateUserData(id, tagname, modContent);

//     logger.info("Gemini Function Call API Used!");
//     return this.msg.reply(
//       commonMessage("formatAutoResponseMessage")(modResult.response.text())
//     );
//   }

//   /**
//    * Update or create user data
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @param {Content[]} content - Chat content to update
//    * @returns {Promise<void>}
//    */
//   async updateUserData(id, tagname, content) {
//     const existingUser = await ApiUser.readUserData(id);
//     if (existingUser) {
//       await ApiUser.updateUserData({ id, content });
//     } else {
//       await ApiUser.createUser({ id, tagname, content });
//     }
//   }

//   /**
//    * Handle errors in the Gemini controller
//    * @param {Error} error - Error object
//    * @param {string} id - User ID
//    * @param {string} tagname - User tag name
//    * @returns {Promise<any>} Error response
//    */
//   async handleError(error, id, tagname) {
//     logger.error(`Error in Gemini generative function: ${error.message}`);
//     console.error(error);
//     await ApiUser.clearUserChat({ id });
//     logger.error(
//       `User ${tagname} (${id}) message data was reset due to an error!`
//     );
//     return this.msg.reply(commonMessage("errorMessage"));
//   }
// }

// module.exports = { Gemini };

