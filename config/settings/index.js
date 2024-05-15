const sessionMode =
  process.env.MODE === "PRODUCTION"
    ? process.env.SESSION_PROD
    : process.env.SESSION_DEV;

/**
 * @type { import("../types").Session }
 */
const session = {
  sessionName: sessionMode,
  userAgent: process.env.USER_AGENT,
  autoReadMessages: true,
};

/**
 * @type { import("../types").MongoDBConfig }
 */
const mongoConfig = {
  //
  uri: process.env.MONGODB_URI, // jgn idubah
  databaseName: process.env.DB_NAME, // jgn diubah
  collection: {
    main: {
      customer: "Data-Customer-2023",
      products: "Data-Products",
      images: "Data-Images",
    },
    orderData: {
      customerOrderData: "Order-Data-Customer",
      approvalOrderData: "Order-Data-Approval",
    },
    payment: {
      transactionTracker: "Data-Transaction",
      customerPaymentProof: "Data-Customer-PaymentProof",
    },
    customerRegardsData: "Data-Regards",
  },
};

/**
 * @type { import("../types").Metadata }
 */
const metadata = {
  marketPlaceName: process.env.MARKETPLACE_NAME,
  organizationName: process.env.ORGANIZATION_NAME,
  runMode: process.env.MODE,
  overrideStatus: process.env.OVERRIDE_STATUS,
  overrideGroupId: {
    ongoingOrders: process.env.GROUP_ID_ONGOING_ORDERS,
    ongoingTransactions: process.env.GROUP_ID_TRANSACTION,
  },
  superAdmin: {
    userName: process.env.SUPER_ADMIN_NAME,
    phoneNumber: process.env.SUPER_ADMIN_PHONE,
    phoneId: process.env.SUPER_ADMIN_ID, //"6281329585825@s.whatsapp.net",
  },
  adminData: [
    {
      name: process.env.ADMIN_1_NAME,
      phoneNumber: process.env.ADMIN_1_PHONE,
      phoneId: process.env.ADMIN_1_PHONE_ID,
      position: process.env.ADMIN_1_ROLE,
    },
    {
      name: process.env.ADMIN_2_NAME,
      phoneNumber: process.env.ADMIN_2_PHONE,
      phoneId: process.env.ADMIN_2_PHONE_ID,
      position: process.env.ADMIN_2_ROLE,
    },
  ],
  paymentPlatform: [
    {
      provider: process.env.PAYMENT_1_PROVIDER,
      key: process.env.PAYMENT_1_KEY,
      name: process.env.PAYMENT_1_ON_BEHALF,
    },
    {
      provider: process.env.PAYMENT_2_PROVIDER,
      key: process.env.PAYMENT_2_KEY,
      name: process.env.PAYMENT_2_ON_BEHALF,
    },
    {
      provider: process.env.PAYMENT_3_PROVIDER,
      key: process.env.PAYMENT_3_KEY,
      name: process.env.PAYMENT_3_ON_BEHALF,
    },
    {
      provider: process.env.PAYMENT_4_PROVIDER,
      key: process.env.PAYMENT_4_KEY,
      name: process.env.PAYMENT_4_ON_BEHALF,
    },
    {
      provider: process.env.PAYMENT_5_PROVIDER,
      key: process.env.PAYMENT_5_KEY,
      name: process.env.PAYMENT_5_ON_BEHALF,
    },
  ],
};

module.exports = { session, mongoConfig, metadata };
//
