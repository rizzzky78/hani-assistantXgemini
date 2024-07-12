const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

module.exports = {
  apps: [
    {
      name: "Chatbot Hani",
      script: "./app.js",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      cron_restart: "0 */5 * * *", // Cron syntax for every 5 hours
    },
  ],
};
