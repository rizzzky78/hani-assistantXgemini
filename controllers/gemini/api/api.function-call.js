const { FunctionDeclarationSchemaType } = require("@google/generative-ai");

const functionDeclarations = {
  searchProduct: {
    name: "cariProduk",
    description:
      "Mencari informasi detail produk berdasarkan nama produk atau sebagian nama.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Kueri pencarian produk (nama produk atau sebagian).",
        },
      },
      required: ["query"],
    },
  },
  searchOrderData: {
    name: "cariDataPesanan",
    description: "Mencari informasi detail pesanan berdasarkan ID pesanan.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        orderId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ID pesanan yang dicari (format: ORD-ID-XXXXXXXX).",
        },
      },
      required: ["orderId"],
    },
  },
  searchPaymentData: {
    name: "cariDataTransaksi",
    description:
      "Mencari informasi detail transaksi pembayaran berdasarkan ID transaksi.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        transactionId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ID transaksi yang dicari (format: TRX-ID-XXXXXXXX).",
        },
      },
      required: ["transactionId"],
    },
  },
  sendOrderData: {
    name: "kirimDataPesanan",
    description:
      "Mengirim daftar pemesanan yang sedang berlangsung dalam format PDF. Hanya dapat diakses oleh Admin.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        phoneId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Nomor telepon penerima (format: 62XXXXXXXXXXX).",
        },
      },
      required: ["phoneId"],
    },
  },
  sendPaymentData: {
    name: "kirimBuktiPembayaran",
    description:
      "Mengirim daftar bukti pembayaran dalam format PDF. Hanya dapat diakses oleh Admin.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        phoneId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Nomor telepon penerima (format: 62XXXXXXXXXXX).",
        },
      },
      required: ["phoneId"],
    },
  },
  searchTopSelling: {
    name: "cariProdukTerlaris",
    description:
      "Mencari daftar produk terlaris berdasarkan jumlah produk terjual.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        limit: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description:
            "Jumlah maksimal produk terlaris yang ingin ditampilkan (opsional, default: 10).",
        },
      },
      required: ["limit"],
    },
  },
  // getProductStock: {
  //   name: "cekStokProduk",
  //   description: "Memeriksa stok tersedia untuk produk tertentu.",
  //   parameters: {
  //     type: FunctionDeclarationSchemaType.OBJECT,
  //     properties: {
  //       productId: {
  //         type: FunctionDeclarationSchemaType.STRING,
  //         description: "ID produk yang ingin dicek stoknya.",
  //       },
  //     },
  //     required: ["productId"],
  //   },
  // },
  // getProductUsage: {
  //   name: "cariPenggunaanProduk",
  //   description: "Mencari informasi tentang penggunaan atau manfaat produk tertentu.",
  //   parameters: {
  //     type: FunctionDeclarationSchemaType.OBJECT,
  //     properties: {
  //       productId: {
  //         type: FunctionDeclarationSchemaType.STRING,
  //         description: "ID produk yang ingin dicari informasi penggunaannya.",
  //       },
  //     },
  //     required: ["productId"],
  //   },
  // },
};

const funcDeclarationsTool = [
  {
    functionDeclarations: [
      functionDeclarations.searchProduct,
      functionDeclarations.searchTopSelling,
      // functionDeclarations.getProductStock,
      // functionDeclarations.getProductUsage,
    ],
  },
  {
    functionDeclarations: [
      functionDeclarations.searchOrderData,
      functionDeclarations.searchPaymentData,
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
