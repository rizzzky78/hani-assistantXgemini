const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

module.exports = {
  apps: [
    {
      name: "Chatbot Hani",
      script: "./app.js",
      // Restart the app every 5 hours (18000 seconds)
      restart_delay: 18000000,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
