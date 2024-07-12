const { Moderation } = require("@controllers/admin");
const {
  collections: {
    product,
    customerOrderData,
    approvalOrderData,
    customerPaymentProof,
  },
} = require("@database/router");
const { CustomerInterface } = require("@function/distributor-data");

const { createObjectCsvStringifier } = require("csv-writer");

class CSV {
  /**
   *
   * @param { string } csvString
   */
  static formatCSVData(csvString) {
    return `Data Respon API dalam format CSV:\n<Data>\n${csvString}\n</Data>`;
  }
  /**
   *
   * @param { string } query
   */
  static async getSingleOrderTableData(query) {
    const orderData = await customerOrderData.findOne({
      "data.orderId": query.trim(),
    });
    if (orderData) {
      return orderData;
    } else {
      return false;
    }
  }

  /**
   *
   * @param { string } transactionId
   */
  static async getSinglePaymentTableData(transactionId) {
    const dataPayment = await customerPaymentProof.findOne({
      "metadata.transactionId": transactionId,
    });
    if (dataPayment) {
      return dataPayment;
    } else {
      return false;
    }
  }

  /**
   *
   * @param { string } query
   */
  static async getProductTableData(query) {
    const products = await product
      .find({
        "data.title": {
          $regex: new RegExp(query.trim(), "i"),
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
    } else {
      return false;
    }
  }

  static async getTopSellingProductsTableData() {
    const products = await Moderation.getTopSellingProducts();
    const mapped = products.map((val, idx) => {
      const {
        data: { title, category, sold },
      } = val;
      return {
        indexNumber: idx + 1,
        title,
        category: CustomerInterface.setCategory(category),
        sold,
      };
    });
    const csvTopSell = createObjectCsvStringifier({
      header: [
        { id: "indexNumber", title: "No" },
        { id: "title", title: "Nama Produk" },
        { id: "category", title: "Kategori" },
        { id: "sold", title: "Terjual (pcs)" },
      ],
    });
    const csvData =
      csvTopSell.getHeaderString() + csvTopSell.stringifyRecords(mapped);
    return this.formatCSVData(csvData);
  }

  static async getOngoingOrderTableData() {
    const orderData = await customerOrderData
      .find({
        status: "forwarded",
      })
      .toArray();
    if (orderData.length) {
      const mapped = orderData.map((val, idx) => {
        const {
          orderId,
          orderType,
          timeStamp,
          isPayed,
          payedVia,
          data: {
            buckets,
            totalItem,
            totalExactPrice,
            totalWeight,
            additionalInfo,
          },
        } = val.data;
        return {
          indexNumber: idx + 1,
          ordererId: val.ordererId,
          ordererName: val.ordererName,
          ordererHniId: val.hniId ? val.hniId : "-",
          orderId,
          orderType,
          timeStamp,
          isPayed: isPayed ? `Diabayar via ${payedVia}` : `Belum dibayar`,
          buckets: buckets
            .map((v) => `${v.productName} (${v.qtyAmount} pcs)`)
            .join(" - "),
          totalItem,
          totalExactPrice,
          totalWeight,
          additionalInfo,
        };
      });

      const csvOngoingOrders = createObjectCsvStringifier({
        header: [
          { id: "indexNumber", title: "No" },
          { id: "ordererId", title: "No Telp Pemesan" },
          { id: "ordererName", title: "Nama Pemesan" },
          { id: "ordererHniId", title: "HNI ID" },
          { id: "orderId", title: "ID Pemesanan" },
          { id: "orderType", title: "Tipe Pemesanan" },
          { id: "timeStamp", title: "Waktu Pemesanan" },
          { id: "isPayed", title: "Status Bayar" },
          { id: "buckets", title: "Produk Yang Dipesan" },
          { id: "totalItem", title: "Total Item (pcs)" },
          { id: "totalExactPrice", title: "Total Harga (Rp.)" },
          { id: "totalWeight", title: "Total Berat (gr)" },
          { id: "additionalInfo", title: "Detail Pemesanan" },
        ],
      });
      const csvData =
        csvOngoingOrders.getHeaderString() +
        csvOngoingOrders.stringifyRecords(mapped);
      return this.formatCSVData(csvData);
    } else {
      return false;
    }
  }

  static async getCompletedOrderTableData() {
    const completedOrderData = await approvalOrderData.find().toArray();
    if (completedOrderData.length) {
      const mapped = completedOrderData.map((val, idx) => {
        const {
          orderId,
          orderType,
          transactionId,
          timeStamp,
          invoice: { invoiceId },
          metadata: { orderer, phone, hniId },
          payment: { nominal },
          products,
        } = val;
        return {
          indexNumber: idx + 1,
          orderId,
          orderType,
          transactionId,
          timeStamp,
          invoiceId,
          orderer,
          phone,
          hniId: hniId ? hniId : `-`,
          nominal,
          products: products
            .map((v) => `${v.productName} (${v.qtyAmount} pcs)`)
            .join(" - "),
        };
      });
      const csvCompletedOrder = createObjectCsvStringifier({
        header: [
          { id: "indexNumber", title: "No" },
          { id: "orderId", title: "ID Pemesanan" },
          { id: "orderType", title: "Tipe Pemesanan" },
          { id: "transactionId", title: "ID Pemesanan" },
          { id: "timeStamp", title: "Waktu Pemesanan" },
          { id: "invoiceId", title: "ID Invoice" },
          { id: "orderer", title: "Nama Pemesan" },
          { id: "phone", title: "No Telpon" },
          { id: "hniId", title: "HNI ID" },
          { id: "nominal", title: "Nominal Dibayarkan (Rp.)" },
          { id: "products", title: "Produk Yang Dipesan" },
        ],
      });
      const csvData =
        csvCompletedOrder.getHeaderString() +
        csvCompletedOrder.stringifyRecords(mapped);
      return this.formatCSVData(csvData);
    } else {
      return false;
    }
  }
}

module.exports = { CSV };
