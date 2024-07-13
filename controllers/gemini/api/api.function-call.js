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
    description: `Mengirim data daftar pemesanan berlangsung dengan format PDF. Akses ini hanya boleh digunakan oleh user yang berstatus sebagai Admin`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        phoneId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID nomor telepon pengakses yang akan dikirim.`,
        },
      },
      required: [`phoneId`],
    },
  },
  sendPaymentData: {
    name: `kirimBuktiPembayaran`,
    description: `Mengirim informasi daftar bukti pembayaran dengan format PDF. Akses ini hanya boleh digunakan oleh user yang berstatus sebagai Admin`,
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        phoneId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: `ID nomor telepon pengakses yang akan dikirim.`,
        },
      },
      required: [`phoneId`],
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
 * Declarations
 * @type { import("@google/generative-ai").FunctionDeclarationsTool[] }
 */
const funcDeclarationsTool = [
  {
    functionDeclarations: [
      functionDeclarations.searchProduct,
      // functionDeclarations.searchTopSelling,
    ],
  },
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
