export type Session = {
  /**
   * Session Name Chatbot
   */
  sessionName: string;
  /**
   * Browser User Agent
   */
  userAgent: string;
  /**
   * Chatbot Auto Read Message
   */
  autoReadMessages: boolean;
};

/**
 * **MongoDB Configuration**
 */
export type MongoDBConfig = {
  /**
   * MongoDB URI
   */
  uri: string;
  /**
   * Main or Database Name
   */
  databaseName: string;
  /**
   * Collection Data
   */
  collection: {
    main: {
      customer: string;
      products: string;
      images: string;
    };
    orderData: {
      /**
       * Customer Orders Data Holder
       *
       * A temporary collection data that hold(s) customer orders.
       */
      customerOrderData: string;
      /**
       * Approval Order Data
       *
       * An Admin approved customer orders data.
       */
      approvalOrderData: string;
    };
    payment: {
      /**
       * Customer/Admin Transaction Tracker
       */
      transactionTracker: string;
      /**
       * A temporary/permanent customer payment proof data.
       *
       * approved and mutable on Admin side.
       */
      customerPaymentProof: string;
    };
    fileData: {
      invoices: string;
      attachment: string;
    };
    customerRegardsData: string;
    developer: string;
  };
};

export type Metadata = {
  marketPlaceName: string;
  organizationName: string;
  runMode: "DEVELOPMENT" | "PRODUCTION";
  /**
   * Override the forwarded orders data to
   */
  overrideStatus: "GROUP" | "SUPERADMIN";
  overrideGroupId: {
    ongoingOrders: string;
    ongoingTransactions: string;
  };
  /**
   * Super Admin
   */
  superAdmin: {
    userName: string;
    phoneId: string;
    phoneNumber: string;
  };
  adminData: {
    name: string;
    phoneId: string;
    phoneNumber: string;
    position: string;
  }[];
  paymentPlatform: PaymentPlatform[];
};

export type PaymentPlatform = {
  provider: "GO-PAY" | "QRIS" | "SHOPEE-PAY" | (string & {});
  key: string;
  name: string;
};

export type AdminDataDto = {
  superAdmin: {
    userName: string;
    phoneNumber: string;
  };
  adminData: {
    name: string;
    phoneNumber: string;
    position: string;
  }[];
};
