const functionDeclarations = {
  searchProduct: {
    name: "cariProduk",
    description:
      "Mencari informasi detail produk berdasarkan nama produk atau sebagian nama.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Kueri pencarian produk (nama produk atau sebagian).",
        },
      },
      required: ["query"],
    },
  },
  sendOrderData: {
    name: "kirimDataPesanan",
    description: "Mengirim informasi detail pesanan berdasarkan ID pesanan.",
    parameters: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "ID pesanan yang akan dikirim.",
        },
      },
      required: ["orderId"],
    },
  },
  sendPaymentData: {
    name: "kirimBuktiPembayaran",
    description:
      "Mengirim informasi bukti pembayaran berdasarkan ID transaksi.",
    parameters: {
      type: "object",
      properties: {
        transactionId: {
          type: "string",
          description: "ID transaksi pembayaran yang akan dikirim.",
        },
      },
      required: ["transactionId"],
    },
  },
  searchOrderData: {
    name: "cariDataPesanan",
    description: "Mencari informasi detail pesanan berdasarkan ID pesanan.",
    parameters: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "ID pesanan yang dicari.",
        },
      },
      required: ["orderId"],
    },
  },
  serachPaymentData: {
    name: "cariDataTransaksi",
    description: "Mencari informasi detail transaksi berdasarkan ID transaksi.",
    parameters: {
      type: "object",
      properties: {
        transactionId: {
          type: "string",
          description: "ID transaksi yang dicari.",
        },
      },
      required: ["transactionId"],
    },
  },
  searchTopSelling: {
    name: "cariProdukTerlaris",
    description:
      "Mencari daftar produk terlaris berdasarkan jumlah produk terjual.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Jumlah maksimal produk terlaris yang ingin ditampilkan (opsional).",
        },
      },
    },
  },
};

const functionCallRequest = (callName) => {};
