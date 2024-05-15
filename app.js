/**
 *        INITIALIZER
 */
require("module-alias/register");
require("@libs/constants/prototype");
require("dotenv").config();

/**
 *        MODULE IMPORT
 */
const logger = require("@libs/utils/logger");
const chalk = require("chalk");
const { Utility } = require("./libs/utils/utility");
const { connect } = require("./libs/connect.lib");
const { Tools } = require("@function/tools");

/**
 *          FIRST LOGGING
 */
console.log(
  chalk.whiteBright(
    `━━━━━━━ [ RUNTIME ] ━━━━━━━━ [   LEVEL   ] ━ [ DETAILS ] ━━━━━━━━━`
  )
);

/**
 *      REGISTER COMMAND MODULE
 */
new Utility();

/**
 *           WA SOCKET
 */
connect();
// restartJob.start();
/**
 *         UPTIME LOGGING
 */
setInterval(() => {
  const uptime = Tools.uptimeApp();
  logger.info(chalk.yellowBright(`Stanby -- Uptime Application ${uptime}`));
}, 1.8e6);

/**
 *        ERROR LOGGING
 */
process.on("uncaughtException", (err) => {
  logger.error(err.message);
  console.error(err);
});

/**
 *   PROMISE REJECTION LOGGING
 */
process.on("unhandledRejection", (err) => {
  console.error(err);
  // handle error
});

/**
 *
 *
 * Rizky
 * Copyright @2024
 *
 *
 */
