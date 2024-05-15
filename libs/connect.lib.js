const {
  default: WASocket,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestWaWebVersion,
} = require("@adiwajshing/baileys");

const logger = require("./utils/logger");
const {
  session: { sessionName, userAgent },
} = require("@config/settings");
const { messageHandler } = require("./handlers");
const { Boom } = require("@hapi/boom");
const { existsSync } = require("fs");
const store = require("@store");
const Pino = require("pino");
const { Tools } = require("@function/tools");

existsSync("./store/baileys_store.json") &&
  store.readFromFile("./store/baileys_store.json");
setInterval(() => {
  store.writeToFile("./store/baileys_store.json");
}, 60_000);

/**
 * Connections Attempts
 * @type { number }
 */
let connectionAttempts = 0;

/**
 * **Core: WA Socket**
 */
async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    `./session/${sessionName}-session`
  );
  const { version, isLatest } = await fetchLatestWaWebVersion().catch(() =>
    fetchLatestBaileysVersion()
  );

  const client = WASocket({
    printQRInTerminal: true,
    auth: state,
    logger: Pino({ level: "silent" }),
    browser: Browsers.macOS(userAgent),
    version,
  });
  logger.info(`WA Version: ${version}. Is Latest: ${isLatest}`);

  logger.info(`Using metadata session : ${userAgent}/${sessionName}`);

  store.bind(client.ev);

  client.ev.on("chats.set", () => {
    logger.info(`Got ${store.chats.all().length} chats`);
  });

  client.ev.on("contacts.set", () => {
    logger.info(`Got ${Object.values(store.contacts).length} contacts`);
  });

  client.ev.on("creds.update", saveCreds);
  client.ev.on("connection.update", async (up) => {
    const { lastDisconnect, connection, qr } = up;

    if (qr) {
      logger.info(
        "Please scanning QR Code to connect\nCara menghubungkan akun whatsapp ke Chatbot sama halnya seperti saat pertama kali menggunakan whatsapp web."
      );
    }

    if (connection) {
      logger.info(`Connection Status: ${Tools.mapConnections(connection)}`);
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect.error).output.statusCode;

      if (reason === DisconnectReason.badSession) {
        logger.error(
          `Bad Session File, Please Delete ./session/${sessionName}-session and Scan Again`
        );
        client.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        connectionAttempts++;
        if (connectionAttempts >= 20) {
          logger.error(
            "Exceeded maximum connection attempts. Terminating the app."
          );
          process.exit(1); // 1 indicates an error
        } else {
          logger.error("Connection closed, Reconnecting...");
          connect();
        }
      } else if (reason === DisconnectReason.connectionLost) {
        logger.error("Connection Lost from Server, reconnecting...");
        connect();
      } else if (reason === DisconnectReason.connectionReplaced) {
        logger.error(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        );
        client.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        logger.error(
          `Device Logged Out, Please Delete ./session/${sessionName}-session and Scan Again.`
        );
        client.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        logger.error("Restart Required, Restarting...");
        connect();
      } else if (reason === DisconnectReason.timedOut) {
        connectionAttempts++;
        if (connectionAttempts >= 20) {
          logger.error(
            "Exceeded maximum connection attempts. Terminating the app."
          );
          process.exit(1); // 1 indicates an error
        } else {
          logger.error("Connection TimedOut, Reconnecting...");
          connect();
        }
      } else {
        connectionAttempts = 0; // Reset the counter for other reasons
        client.end(
          new Error(
            `Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`
          )
        );
      }
    }
  });

  // messages.upsert
  client.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;
    messageHandler(client, { messages, type });
  });
}

module.exports = {
  connect,
};
