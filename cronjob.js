const { CronJob } = require("cron");
const { exec } = require("child_process");

const restartJob = new CronJob("0 0 */1 * * *", () => {
  console.log("Restarting the application...");
  exec("npm run restart", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during restart: ${error}`);
      return;
    }
    console.log(`Restart successful: ${stdout}`);
  });
});

module.exports = restartJob;
