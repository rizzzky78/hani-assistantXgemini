const { MongoClient, ServerApiVersion } = require("mongodb");
const {
  mongoConfig: { uri },
} = require("@config/settings");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports = { client };
