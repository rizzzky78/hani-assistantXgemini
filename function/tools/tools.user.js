const { writeFileSync, readFileSync } = require("fs");

const intervals = 2 * 60 * 60 * 1000;
class User {
  constructor() {
    this.startAutoDeleteTimer();
    /**
     * @type { Array<import("@interface/schema").UserState> }
     */
    this.userState = [];
    /**
     * @type { string }
     */
    this.statePath = "./assets/json/user/customer-state.json";
    /**
     * @type { number }
     */
    this.checkInterval = 2 * 60 * 60 * 1000; // Two hours in milliseconds
  }

  /**
   * Append checking user/accessor, if exist it will return `true`,
   * if not it will append user data into JSON and return `false`
   * @param { string } phoneNumber
   * @returns { boolean }
   */
  checkUser(phoneNumber) {
    this.loadUserState();
    const isExist = this.userState.some((u) => u.phoneNumber === phoneNumber);
    if (isExist) {
      return true;
    } else {
      this.userState.push({
        timeStamp: new Date().toISOString(),
        phoneNumber,
      });
      writeFileSync(this.statePath, JSON.stringify(this.userState, null, 2));
      return false;
    }
  }

  loadUserState() {
    const userStateData = readFileSync(this.statePath, "utf-8");
    this.userState = JSON.parse(userStateData);
  }

  startAutoDeleteTimer() {
    setInterval(() => {
      const currentTime = new Date().getTime();
      const filtered = (this.userState = this.userState.filter((user) => {
        const userTime = new Date(user.timeStamp).getTime();
        return currentTime - userTime <= intervals;
      }));
      writeFileSync(this.statePath, JSON.stringify(filtered, null, 2));
    }, intervals);
  }
}

const UserInstance = new User();

module.exports = UserInstance;
