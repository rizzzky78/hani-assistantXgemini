const { FunctionDeclarationSchemaType } = require("@google/generative-ai");

const functionDeclarations = {
  searchProduct: {
    name: `cariProduk`,
    description: `Mencari informasi detail produk berdasarkan nama produk atau sebagian nama.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `Kueri pencarian produk (nama produk atau sebagian).`,
        },
      },
      required: [`query`],
    },
  },
  sendOrderData: {
    name: `kirimDataPesanan`,
    description: `Mengirim informasi detail pesanan berdasarkan ID pesanan.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        orderId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID pesanan yang akan dikirim.`,
        },
      },
      required: [`orderId`],
    },
  },
  sendPaymentData: {
    name: `kirimBuktiPembayaran`,
    description: `Mengirim informasi bukti pembayaran berdasarkan ID transaksi.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        transactionId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID transaksi pembayaran yang akan dikirim.`,
        },
      },
      required: [`transactionId`],
    },
  },
  searchOrderData: {
    name: `cariDataPesanan`,
    description: `Mencari informasi detail pesanan berdasarkan ID pesanan.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        orderId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID pesanan yang dicari.`,
        },
      },
      required: [`orderId`],
    },
  },
  serachPaymentData: {
    name: `cariDataTransaksi`,
    description: `Mencari informasi detail transaksi berdasarkan ID transaksi.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        transactionId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID transaksi yang dicari.`,
        },
      },
      required: [`transactionId`],
    },
  },
  searchTopSelling: {
    name: `cariProdukTerlaris`,
    description: `Mencari daftar produk terlaris berdasarkan jumlah produk terjual.`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        limit: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description: `Jumlah maksimal produk terlaris yang ingin ditampilkan (opsional).`,
        },
      },
    },
  },
};

/**
 * @type { import("@google/generative-ai").FunctionDeclarationsTool[] }
 */
const funcDeclarationsTool = [
  // {
  //   functionDeclarations: [
  //     functionDeclarations.searchProduct,
  //     // functionDeclarations.searchTopSelling,
  //   ],
  // },
  {
    functionDeclarations: [
      functionDeclarations.searchOrderData,
      functionDeclarations.serachPaymentData,
    ],
  },
  {
    functionDeclarations: [
      functionDeclarations.sendOrderData,
      functionDeclarations.sendPaymentData,
    ],
  },
];

module.exports = { funcDeclarationsTool };
