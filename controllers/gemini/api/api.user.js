const schedule = require("node-schedule");
const {
  collections: { userChatData },
} = require("@database/router");
const logger = require("@libs/utils/logger");

class ApiUser {
  /**
   *
   * @param { import("./api").CreateUserDto } param0
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
   * @param { import("./api").UpdateUserDto } param0
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

  /**
   *
   * @param { { id: string } } param0
   */
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
}

schedule.scheduleJob("0 */2 * * *", async () => {
  await User.autoClearChatSession();
});

module.exports = { ApiUser };
