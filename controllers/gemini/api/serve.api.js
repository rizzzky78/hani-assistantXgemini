const { CSV } = require("@controllers/csv");

const functionApiCall = {
  cariProduk: async ({ query }) => {
    const result = await CSV.getProductTableData(query);
    return result ? result : "Product Not Found!";
  },
  kirimDataPesanan: async ({ orderId }) => {
    const result = await CSV.getSingleOrderTableData(orderId);
    return result ? result : "Order Data Not Found!";
  },
  kirimBuktiPembayaran: async ({ transactionId }) => {
    const result = await CSV.getSinglePaymentTableData(transactionId);
    return result ? result : "Payment Data Not Found!";
  },
  cariDataPesanan: async ({ orderId }) => {
    const result = await CSV.getSingleOrderTableData(orderId);
    return result ? result : "Order Data Not Found!";
  },
  cariDataTransaksi: async ({ transactionId }) => {
    const result = await CSV.getSinglePaymentTableData(transactionId);
    return result ? result : "Payment Data Not Found!";
  },
};

module.exports = { functionApiCall };
