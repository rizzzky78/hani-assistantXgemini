/**
 *        INITIALIZER
 */
require("module-alias/register");
require("@libs/constants/prototype");
require("dotenv").config();

const fs = require("fs");

const {
  session: { sessionName },
} = require("@config/settings");
const dirPath = `./session/${sessionName}-session`;

try {
  console.log("Deleting session...");
  fs.rmSync(dirPath, { recursive: true, force: true });
  console.log(`${dirPath} is deleted!`);
} catch (err) {
  console.error(`Error while deleting ${dirPath}.`, err);
}
