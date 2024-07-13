const { FunctionDeclarationSchemaType } = require("@google/generative-ai");

const functionDeclarations = {
  cariProduk: {
    name: "cariProduk",
    description: "Mencari informasi produk berdasarkan nama produk (atau sebagian nama).",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Nama produk atau sebagian nama yang ingin dicari.",
        },
      },
      required: ["query"],
    },
  },

  cariPesanan: {
    name: "cariPesanan",
    description: "Menampilkan informasi detail tentang pesanan tertentu.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        idPesanan: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ID unik dari pesanan yang ingin dicari.",
        },
      },
      required: ["idPesanan"],
    },
  },

  cariTransaksi: {
    name: "cariTransaksi",
    description: "Menampilkan informasi detail tentang transaksi tertentu.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        idTransaksi: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ID unik dari transaksi yang ingin dicari.",
        },
      },
      required: ["idTransaksi"],
    },
  },

  kirimLaporanPesananBerlangsung: {
    name: "kirimLaporanPesananBerlangsung",
    description: "Mengirim laporan PDF berisi pesanan yang sedang berlangsung ke nomor telepon yang tercantum pada percakapan sebelumnya. (Hanya untuk Admin)",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        nomorTelepon: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Nomor telepon (termasuk kode negara) tujuan pengiriman laporan pada user saat ini.",
        },
      },
      required: ["nomorTelepon"],
    },
  },

  kirimLaporanPembayaran: {
    name: "kirimLaporanPembayaran",
    description: "Mengirim laporan PDF berisi pembayaran pelanggan ke nomor telepon yang tercantum pada percakapan sebelumnya. (Hanya untuk Admin)",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        nomorTelepon: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Nomor telepon (termasuk kode negara) tujuan pengiriman laporan pada user saat ini.",
        },
      },
      required: ["nomorTelepon"],
    },
  },
};


/**
 * Deklarasi Fungsi
 * @type { import("@google/generative-ai").FunctionDeclarationsTool[] }
 */
const funcDeclarationsTool = [
  {
    functionDeclarations: [
      functionDeclarations.cariProduk,
    ],
  },
  {
    functionDeclarations: [
      functionDeclarations.cariPesanan,
      functionDeclarations.cariTransaksi,
    ],
  },
  {
    functionDeclarations: [
      functionDeclarations.kirimLaporanPesananBerlangsung,
      functionDeclarations.kirimLaporanPembayaran,
    ],
  },
];

module.exports = { funcDeclarationsTool };
