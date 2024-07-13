const { CSV } = require("@controllers/csv");

const { Moderation } = require("@controllers/admin");
const {
  collections: {
    product,
    customerOrderData,
    approvalOrderData,
    customerPaymentProof,
  },
} = require("@database/router");
const { PDF, Tools } = require("@function/tools");

/**
 * @param { import("@adiwajshing/baileys").WASocket } client
 */
class ApiRequest {
  /**
   *
   * @param { import("@adiwajshing/baileys").WASocket } client
   * @param { import("@libs/utils/serialize").Serialize } msg
   */
  constructor(client, msg) {
    this.client = client;
    this.msg = msg;
  }
  /**
   *
   * @param { string } query
   * @returns
   */
  async getProduct(query) {
    const products = await product
      .find({
        "data.title": {
          $regex: new RegExp(query, "i"),
        },
      })
      .toArray();
    if (products.length) {
      const exclude = products.slice(0, 3).map((p) => {
        const {
          data: { image, ...rest },
        } = p;
        return {
          ...rest,
        };
      });
      return exclude;
    }
    return { error: `Product with name <${query}> Not Found!` };
  }
  /**
   *
   * @param { string } orderId
   */
  async getSingleOrderData(orderId) {
    const orderData = await customerOrderData.findOne({
      "data.orderId": orderId,
    });
    if (orderData) {
      return orderData;
    }
    return { error: `Order Data with <${orderId}> Not Found!` };
  }
  /**
   *
   * @param { string } transactionId
   */
  async getSinglePaymentData(transactionId) {
    const dataPayment = await customerPaymentProof.findOne({
      "metadata.transactionId": transactionId,
    });
    if (dataPayment) {
      return dataPayment;
    }
    return { error: `Payment Data <${transactionId}> Not Found!` };
  }

  async sendOngoingOrders() {
    const orderData = await customerOrderData
      .find({
        status: "forwarded",
      })
      .toArray();
    if (orderData) {
      const { doc } = await PDF.createPDF({
        document: PDF.mapInputData({
          data: { orders: orderData },
          type: "orders",
        }),
      });
      await this.client.sendMessage(msg.from, {
        document: doc,
        fileName: "Daftar Pemesanan Berlangsung",
        mimetype: "application/pdf",
        caption: `Daftar Pemesanan Berlangsung`,
      });
      new Promise((resolve) => setTimeout(resolve, 5_000));
      return { message: "The Ongoing Orders Data PDF is already sent!" };
    }
    return { error: "There is no Ongoing Orders Data Found!" };
  }
}

const functionApiCall = {
  cariProduk: async ({ query }) => {
    const result = await CSV.getProductTableData(query);
    return result ? { data: result } : { error: "Order Data Not Found!" };
  },
  kirimDataPesanan: async ({ orderId }) => {
    const result = await CSV.getSingleOrderTableData(orderId);
    return result ? { data: result } : { error: "Order Data Not Found!" };
  },
  kirimBuktiPembayaran: async ({ transactionId }) => {
    const result = await CSV.getSinglePaymentTableData(transactionId);
    return result ? { data: result } : { error: "Payment Data Not Found!" };
  },
  cariDataPesanan: async ({ orderId }) => {
    const result = await CSV.getSingleOrderTableData(orderId);
    return result ? { data: result } : { error: "Order Data Not Found!" };
  },
  cariDataTransaksi: async ({ transactionId }) => {
    const result = await CSV.getSinglePaymentTableData(transactionId);
    return result ? { data: result } : { error: "Order Data Not Found!" };
  },
};

class ApiServe {
  /**
   *
   * @param { import("@adiwajshing/baileys").WASocket } client
   * @param { import("@libs/utils/serialize").Serialize } msg
   */
  constructor(client, msg) {
    this.client = client;
    this.msg = msg;
  }
  /**
   *
   * @param { keyof functionApiCall } name
   * @param { { key: string } } args
   */
  async mapFunctionCallApi(name, args) {
    const result = await functionApiCall[name](args);
    return result;
  }
  /**
   *
   * @param { string } query
   * @returns
   */
  async getProduct(query) {
    const products = await product
      .find({
        "data.title": {
          $regex: new RegExp(query, "i"),
        },
      })
      .toArray();
    if (products.length) {
      const exclude = products.slice(0, 3).map((p) => {
        const {
          data: { image, ...rest },
        } = p;
        return {
          ...rest,
        };
      });
      return { data: JSON.stringify(exclude) };
    }
    return { error: `Product with name <${query}> Not Found!` };
  }
  /**
   *
   * @param { string } orderId
   */
  async getSingleOrderData(orderId) {
    const orderData = await customerOrderData.findOne({
      "data.orderId": orderId,
    });
    if (orderData) {
      return { data: JSON.stringify(orderData) };
    }
    return { error: `Order Data with <${orderId}> Not Found!` };
  }
  /**
   *
   * @param { string } transactionId
   */
  async getSinglePaymentData(transactionId) {
    const dataPayment = await customerPaymentProof.findOne({
      "metadata.transactionId": transactionId,
    });
    if (dataPayment) {
      return { data: JSON.stringify(dataPayment) };
    }
    return { error: `Payment Data <${transactionId}> Not Found!` };
  }

  /**
   *
   * @param { string } nomorTelepon
   * @returns
   */
  async sendOngoingOrders(nomorTelepon) {
    const orderData = await customerOrderData
      .find({
        status: "forwarded",
      })
      .toArray();
    if (orderData) {
      const { doc } = await PDF.createPDF({
        document: PDF.mapInputData({
          data: { orders: orderData },
          type: "orders",
        }),
      });
      await this.client.sendMessage(nomorTelepon + `@s.whatsapp.net`, {
        document: doc,
        fileName: "Daftar Pemesanan Berlangsung",
        mimetype: "application/pdf",
        caption: `Daftar Pemesanan Berlangsung`,
      });
      new Promise((resolve) => setTimeout(resolve, 5_000));
      return { message: "The Ongoing Orders Data PDF is already sent!" };
    }
    return { error: "There is no Ongoing Orders Data Found!" };
  }

  /**
   *
   * @param { string } nomorTelepon
   */
  async sendPaymentData(nomorTelepon) {
    const paymentData = await customerPaymentProof.find().toArray();
    if (paymentData) {
      const { doc } = await PDF.createPDF({
        document: PDF.mapInputData({
          data: { payments: paymentData },
          type: "payments",
        }),
      });
      await this.client.sendMessage(nomorTelepon + `@s.whatsapp.net`, {
        document: doc,
        fileName: `Daftar Bukti Pembayaran Customer`,
        mimetype: "application/pdf",
        caption: `Dicetak pada tanggal: ${Tools.getDate()}`,
      });
      new Promise((resolve) => setTimeout(resolve, 5_000));
      return { message: "The Payment Data PDF is already sent!" };
    }
    return { error: `Payment Data Not Found!` };
  }

  /* INSTANCEABLE */
  async cariProduk({ query }) {
    return await this.getProduct(query);
  }
  async kirimLaporanPesananBerlangsung({ nomorTelepon }) {
    return await this.sendOngoingOrders(nomorTelepon);
  }
  async kirimLaporanPembayaran({ nomorTelepon }) {
    return await this.sendPaymentData(nomorTelepon);
  }
  async cariPesanan({ idPesanan }) {
    return await this.getSingleOrderData(idPesanan);
  }
  async cariTransaksi({ idTransaksi }) {
    return await this.getSinglePaymentData(idTransaksi);
  }
}

module.exports = { functionApiCall, ApiServe };
