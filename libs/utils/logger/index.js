const { Tools } = require("@function/tools");
const chalk = require("chalk");
const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine({
    transform: (info, opts) => {
      const formatedDate = new Date().toISOString();
      switch (info.level) {
        case "info":
          console.info(
            chalk.whiteBright(`[ ${formatedDate} ]`),
            chalk.blueBright(`[    LOG    ] :`),
            chalk.whiteBright(info.message)
          );
          Tools.createLog("info", info.message);
          break;
        case "warn":
          console.warn(
            chalk.whiteBright(`[ ${formatedDate} ]`),
            chalk.blueBright(`[  WARNING  ] :`),
            chalk.whiteBright(info.message)
          );
          break;
        case "error":
          console.error(
            chalk.whiteBright(`[ ${formatedDate} ]`),
            chalk.keyword("red")(`[   ERROR   ] :`),
            chalk.whiteBright(info.message)
          );
          Tools.createLog("error", info.message);
          break;
        case "debug":
          console.log(
            chalk.whiteBright(`[ ${formatedDate} ]`),
            chalk.keyword("aqua")(`[   DEBUG   ] :`),
            chalk.whiteBright(info.message)
          );
          break;
      }
      return false;
    },
  }),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
