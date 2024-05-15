const { client } = require("@database/connection");

const {
  mongoConfig: { databaseName, collection },
} = require("@config/settings");

const Database = client.db(databaseName);

/**
 * **Collection Databases**
 *
 * @type { import("@interface/schema").CollectionsData }
 */
const collections = {
  product: Database.collection(collection.main.products),
  customer: Database.collection(collection.main.customer),

  customerOrderData: Database.collection(
    collection.orderData.customerOrderData
  ),
  approvalOrderData: Database.collection(
    collection.orderData.approvalOrderData
  ),
  customerPaymentProof: Database.collection(
    collection.payment.customerPaymentProof
  ),
  imageData: Database.collection(collection.main.images),
  userState: Database.collection(collection.customerRegardsData),

  userChatData: Database.collection("UserChatData")
};

module.exports = { collections }; //
