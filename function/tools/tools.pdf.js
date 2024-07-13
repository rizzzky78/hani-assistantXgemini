const { jsPDF } = require("jspdf");
const { readFile } = require("fs/promises");
const { readFileSync } = require("fs");
const Tools = require("./tools.general");
const RajaOngkir = require("./tools.rajaongkir");
require("jspdf-autotable");

/**
 * **PDF Creator**
 *
 */
class PDF {
  /**
   *
   * @param { { status: import("@interface/order-data").StatusOrder } } status
   */
  static mapStatusOrder = ({ status }) => {
    const v = {
      pending: "Pending",
      forwarded: "Diteruskan",
      confirmed: "Dikonfirmasi",
      completed: "Selesai",
    };
    return v[status];
  };
  /**
   *
   * @type { import("./types").MapInputData }
   */
  static mapInputData = ({ data, type }) => {
    const {
      products,
      orders,
      approvals,
      payments,
      invoices,
      custdata,
      cmdModules,
    } = data;

    if (products && type === "products") {
      return {
        title: "Rekapitulasi Keseluruhan Produk",
        thead: [
          "No", // 1
          "ID Produk", // 3
          "Nama Produk", // 4
          "Harga/pcs", // 5
          "Harga Member", // 6
          "Poin/pcs", // 7
          "Netto (gr)", // 8
          "Stok", // 9
          "Terjual", // 10
        ],
        tbody: products.map((val, idx) => [
          idx + 1,
          val.productId,
          val.data.title,
          Tools.localePrice(val.data.price),
          Tools.localePrice(val.data.memberPrice),
          val.data.poin ? val.data.poin : "-",
          val.data.weight ? val.data.weight : "-",
          val.data.stock ? val.data.stock : "-",
          val.data.sold ? val.data.sold : "-",
        ]),
        tfoot: `Akses produk dengan mengetik "cari <nama produk>" atau "produk <ID Produk>".`,
        tfontsize: 7,
        cellsOption: "products",
      };
    } else if (orders && type === "orders") {
      const ongoingOrders = orders.filter((v) => !v.data.isCompleted);
      return {
        title: "Rekapitulasi Pemesanan Berlangsung",
        thead: [
          "No", // 0
          "ID Pemesanan", //1
          "Pelanggan", //2
          "Produk Yang Dipesan (pcs)", //5
          "QTY", //6
          "Harga Produk\nBiaya Ekspedisi", //8
          "Total Bayar", //9
          "Status Bayar", //10
          "Draft", //11
        ],
        tbody: ongoingOrders.map((v, idx) => {
          const {
            data: { orderType },
          } = v;
          const stateOrder = orderType === "dropship";
          return [
            idx + 1,
            v.data.orderId,
            `A/N ${v.ordererName}\nHP ${v.ordererId}\nHNI ID ${v.hniId}`,
            v.data.data.buckets
              .map((v) => `- ${v.productName} (${v.qtyAmount})`)
              .join("\n"),
            v.data.data.totalItem,
            Tools.localePrice(v.data.data.totalPrice) + "\n" + stateOrder
              ? Tools.localePrice(v.data.data.expedition.fees)
              : "-",
            Tools.localePrice(v.data.data.totalExactPrice),
            v.data.isPayed ? v.data.payedVia : "Belum Dibayar",
            v.data.data.additionalInfo,
          ];
        }),
        tfoot: `Akses Detail pemesanan dengan mengetik "cek-pesanan <ID Pemsanan>".`,
        tfontsize: 5,
        cellsOption: "orders",
      };
    } else if (payments && type === "payments") {
      return {
        title: "Rekapitulasi Data Pembayaran",
        thead: [
          "No", //0
          "Tanggal", //1
          "ID Pemesanan/Transaksi", //2
          "Pelanggan", //3
          "Dibayar Via", //4
          "Nominal", //5
          "Status", //6
          "ID Bukti Bayar", //7
        ],
        tbody: payments.map((v, i) => [
          i + 1,
          v.timeStamp + " " + "WIB",
          `${v.metadata.orderId}\n${v.metadata.transactionId}`,
          `A/N ${v.payer.tagName}\nHP ${v.payer.phoneNumber}`,
          v.payment.via,
          Tools.localePrice(v.payment.nominal),
          v.isVerified ? "Dikonfirmasi" : "Belum Dikonfirmasi",
          v.payment.image,
        ]),
        tfoot: `Akses Detail/Foto Bukti Bayar dengan mengetik "cek-transaksi <ID Transaksi>".`,
        tfontsize: 6,
        cellsOption: "payments",
      };
    } else if (approvals && type === "approvals") {
      return {
        title: "Rekapitulasi Pemesanan Berstatus Selesai",
        thead: [
          "No", //0
          "Tanggal", //1
          "ID Invoice", //2
          "Pelanggan", //3
          "Produk Dipesan (pcs)", //4
          "QTY", //5
          "Dibayar Via\nProduk/Ekspedisi", //6
          "Ekspedisi\nNo Resi", //8
        ],
        tbody: approvals.map((v, i) => [
          i + 1,
          v.timeStamp + " " + "WIB",
          v.invoice.invoiceId,
          `A/N ${v.metadata.orderer}\nHP ${v.metadata.phone}\nHNI ID ${v.metadata.hniId}`,
          v.products
            .map((v) => `- ${v.productName} (${v.qtyAmount})`)
            .join("\n"),
          v.products.reduce((v, t) => v + t.qtyAmount, 0),
          `${v.payment.via}\n${Tools.localePrice(v.payment.product)}\n${
            v.payment.expFees === 0 ? "-" : Tools.localePrice(v.payment.expFees)
          }`,
          `${
            v.orderType === "dropship"
              ? `${v.expedition.code.toUpperCase()} - ${
                  v.expedition.service
                }\n${v.expedition.receiptNumber}`
              : `Dipesan Takeaway`
          }`,
        ]),
        tfoot: `Akses detail data pemesanan selesai dengan mengetik "cek-pesanan <ID Invoice>".`,
        tfontsize: 6.5,
        cellsOption: "approvals",
      };
    } else if (invoices && type === "invoices") {
      const { products: buckets } = invoices;
      return {
        overrideDocs: invoices,
        title: "Rincian Produk Yang Dipesan",
        thead: [
          "No",
          "ID Produk",
          "Nama Produk",
          "Poin/pcs",
          "Netto (gr)",
          "Harga/pcs",
          "QTY",
          "Total Harga",
          "Total Poin",
        ],
        tbody: buckets.map((v, i) => [
          i + 1,
          v.productId,
          v.productName,
          v.poin,
          v.weight,
          Tools.localePrice(v.price),
          v.qtyAmount,
          Tools.localePrice(v.totalPrice),
          v.totalPoin,
        ]),
        tfoot: `Akses bukti gambar Invoice Pemesanan dengan mengetik "bukti <ID Invoice>".`,
        cellsOption: "invoices",
        tfontsize: 8,
      };
    } else if (custdata && type === "custdata") {
      const completedOrders = custdata.data.purchaseHistory.filter(
        (v) => v.isCompleted
      );
      return {
        title: `Daftar Riwayat Pemesanan Pelanggan`,
        overrideCustData: custdata,
        thead: [
          "No",
          "Tanggal",
          "ID Invoice/Pemesanan",
          "Produk (pcs)",
          "QTY",
          "Total Poin",
          "Total Bayar",
          "Draft",
        ],
        tbody: completedOrders.map((v, i) => [
          i + 1,
          v.timeStamp + " " + "WIB",
          `${v.invoices.invoiceId}\n${v.orderId}`,
          v.data.buckets
            .map((v) => `- ${v.productName} (${v.qtyAmount})`)
            .join("\n"),
          v.data.totalItem,
          v.data.totalPoin,
          Tools.localePrice(v.data.totalExactPrice),
          v.data.additionalInfo,
        ]),
        tfoot: `Akses detail pemesanan dengan mengetik "bukti <ID Invoice>".`,
        tfontsize: 7,
        cellsOption: "custdata",
      };
    } else if (cmdModules && type === "cmdmodules") {
      const mappedModules = cmdModules.sort((a, b) =>
        a.cmdKeys.localeCompare(b.cmdKeys)
      );
      return {
        title: `Rekapitulasi Keseluruhan Perintah pada Chatbot`,
        thead: [
          "No",
          "Nama/Kata Kunci Kode Perintah",
          // "Kategori\nPerizinan Pemakaian",
          "Tipe Argumen",
          "Format Argumen",
          "Contoh Argumen",
          "Deskripsi",
        ],
        tbody: mappedModules.map((v, i) => [
          i + 1,
          v.cmdKeys,
          // `${v.category}\n${v.permission}`,
          v.typeArgs,
          v.expectedArgs,
          v.exampleArgs,
          v.description,
        ]),
        tfoot: `Note: Terdapat perintah yang hanya bisa diakses oleh Admin.`,
        tfontsize: 5,
        cellsOption: "cmdmodules",
      };
    }
  };
  /**
   *
   * @type { import("./types").CreatePDF }
   */
  static createPDF = async ({ document }) => {
    const {
      title,
      thead,
      tbody,
      tfoot,
      tfontsize,
      cellsOption,
      override,
      overrideDocs,
    } = document;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    /* ========= cope PDF ========= */
    const imgData = new Uint8Array(readFileSync("./assets/image/hni-logo.png"));
    /* Images */
    pdf.addImage(
      imgData,
      "PNG",
      15, // x
      10, // y
      16, // width
      16 // height
    );

    /* GAP */
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(132, 196, 76);
    pdf.text("Halal Mart BC Cilacap 3", 35, 15, { align: "left" });
    /* GAP */
    pdf.setFontSize(6);
    pdf.setTextColor(39, 40, 41);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Alamat:\nJl. Nusa Indah, Gligir, Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53272\nWA: 08153456789`,
      35,
      20,
      { align: "left" }
    );
    /* ========= cope PDF ========= */

    /**
     * State indicates if the document is invoices or not
     */
    const state = cellsOption === "invoices";

    /* ========= Sub Table ========= */
    if (cellsOption === "invoices") {
      const v = overrideDocs;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Invoice Pemesanan", 15, 40, { align: "left" });
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`ID Invoice: ${v.invoice.invoiceId}`, 15, 45, { align: "left" });
      pdf.text(`Tanggal: ${v.timeStamp} WIB`, 15, 49, { align: "left" });

      pdf.setFont("helvetica", "bold");
      pdf.text(`Pelanggan`, 15, 56, { align: "left" });

      pdf.setFont("helvetica", "normal");
      pdf.text(`ID Pelanggan: ${v.metadata.custId}`, 15, 61, {
        align: "left",
      });
      pdf.text(`A/N ${v.metadata.orderer}`, 15, 65, { align: "left" });
      pdf.text(`HP ${v.metadata.phone}`, 15, 69, { align: "left" });
      pdf.text(`HNI ID ${v.metadata.hniId}`, 15, 73, { align: "left" });

      pdf.setFont("helvetica", "bold");
      pdf.text(`Rincian Pembayaran`, 15, 80, { align: "left" });

      pdf.setFont("helvetica", "normal");
      pdf.text(`Produk: ${Tools.localePrice(v.payment.product)}`, 15, 85, {
        align: "left",
      });
      const expFees =
        v.payment.expFees === 0 ? "-" : Tools.localePrice(v.payment.expFees);
      pdf.text(`Biaya Pengiriman: ${expFees}`, 15, 89, { align: "left" });
      pdf.text(`Dibayar Via: ${v.payment.via}`, 15, 93, {
        align: "left",
      });
      pdf.text(`Total Bayar: ${Tools.localePrice(v.payment.nominal)}`, 15, 97, {
        align: "left",
      });

      const leftMargin = 90;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Form Pemesanan Pelanggan`, leftMargin, 40, { align: "left" });

      pdf.setFont("helvetica", "normal");
      // pdf.setFontSize(8);
      pdf.text(`${v.metadata.info}`, leftMargin, 45, { align: "left" });

      if (v.orderType === "dropship") {
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `Ekspedisi - ${v.expedition.code.toUpperCase()} ${
            v.expedition.description
          }`,
          leftMargin,
          95,
          { align: "left" }
        );

        pdf.setFont("helvetica", "normal");
        pdf.text(`No Resi: ${v.expedition.receiptNumber}`, leftMargin, 100, {
          align: "left",
        });
      }

      // GAP
      // pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 15, 110, { align: "left" });

      pdf.autoTable({
        head: [thead],
        body: tbody,
        startY: 112,
        theme: "grid",
        styles: {
          fontSize: tfontsize,
          halign: "start",
        },
        headStyles: {
          fillColor: [132, 196, 76],
          textColot: [255, 255, 236],
          fontStyle: "bold",
          valign: "middle",
          halign: "center",
        },
        bodyStyles: {
          valign: "middle",
          // halign: "center",
        },
        columnStyles: this.customAligmentCells(cellsOption),
      });

      const tHeight = pdf.autoTable.previous.finalY;
      pdf.text("Rincian", 15, tHeight + 10, { align: "left" });

      const count = {
        products: v.products.reduce((v, t) => v + t.qtyAmount, 0),
        poins: v.products.reduce((v, t) => v + t.totalPoin, 0),
        weight: v.products.reduce((v, t) => v + t.totalWeight, 0),
      };
      const weights = RajaOngkir.weightConverter({
        value: count.weight,
        parse: true,
      });
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Produk : ${count.products} produk`, 15, tHeight + 15, {
        align: "left",
      });
      pdf.text(`Total Poin : ${count.poins} poin`, 15, tHeight + 19, {
        align: "left",
      });
      pdf.text(`Total Berat : ${weights}kg`, 15, tHeight + 23, {
        align: "left",
      });
    }
    /* ========= Sub Table ========= */

    /* ========= Main Table ========= */
    if (cellsOption !== "invoices") {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 105, 40, { align: "center" });

      pdf.autoTable({
        head: [state ? override.subthead : thead],
        body: state ? override.subtbody : tbody,
        startY: state ? 85 : 44,
        theme: "grid",
        styles: {
          fontSize: state ? override.tfonsize : tfontsize,
          halign: "start",
        },
        headStyles: {
          fillColor: [132, 196, 76],
          textColot: [255, 255, 236],
          fontStyle: "bold",
          valign: "middle",
          halign: "center",
        },
        bodyStyles: {
          valign: "middle",
          // halign: "center",
        },
        columnStyles: this.customAligmentCells(cellsOption),
      });
    }

    /* ========= Main Table ========= */

    /* ========= Footer Table ========= */
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(tfoot, 105, pdf.internal.pageSize.height - 10, {
      align: "center",
    });
    /* ========= Footer Table ========= */

    const path = `./assets/data/user/docs-${cellsOption}-temp.pdf`;
    pdf.save(path);
    return {
      doc: await readFile(path),
    };
  };

  /**
   *
   * @type { import("./types").PrintPurchaseHistory }
   */
  static printPurchaseHistory = async ({ document }) => {
    const {
      overrideCustData,
      title,
      thead,
      tbody,
      tfoot,
      tfontsize,
      cellsOption,
    } = document;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    /* ========= cope PDF ========= */
    const imgData = new Uint8Array(readFileSync("./assets/image/hni-logo.png"));
    /* Images */
    pdf.addImage(
      imgData,
      "PNG",
      15, // x
      10, // y
      16, // width
      16 // height
    );

    /* GAP */
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(132, 196, 76);
    pdf.text("Halal Mart BC Cilacap 3", 35, 15, { align: "left" });
    /* GAP */
    pdf.setFontSize(6);
    pdf.setTextColor(39, 40, 41);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Alamat:\nJl. Nusa Indah, Gligir, Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53272\nWA: 08153456789`,
      35,
      20,
      { align: "left" }
    );
    /* ========= cope PDF ========= */

    /* ========= Metadata ========= */
    const {
      metadata: { customerId, tagName, phoneNumber, hniId, registeredOn },
      data: { purchaseHistory },
    } = overrideCustData;
    const completedOrders = purchaseHistory.filter((v) => v.isCompleted);
    const v = {
      buys: completedOrders.length,
      products: completedOrders.reduce((v, t) => v + t.data.totalItem, 0),
      poins: completedOrders.reduce((v, t) => v + t.data.totalPoin, 0),
      spents: completedOrders.reduce((v, t) => v + t.data.totalExactPrice, 0),
    };

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Data Pelanggan", 15, 40, { align: "left" });
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`ID Pelanggan : ${customerId}`, 15, 45, { align: "left" });
    pdf.text(`Terdaftar Pada : ${registeredOn} WIB`, 15, 49, {
      align: "left",
    });
    pdf.text(`A/N : ${tagName}`, 15, 53, { align: "left" });
    pdf.text(`HP : ${phoneNumber}`, 15, 57, { align: "left" });
    pdf.text(`HNI ID : ${hniId ? hniId : "-"}`, 15, 61, { align: "left" });

    pdf.setFont("helvetica", "bold");
    pdf.text(`Rekapitulasi Keseluruhan Pemesanan Yang Selesai`, 100, 40, {
      align: "left",
    });
    pdf.setFont("helvetica", "normal");
    pdf.text(`Akumulasi Kali Pembelian : ${v.buys} kali`, 100, 45, {
      align: "left",
    });
    pdf.text(`Akumulasi Produk Yang Dibeli : ${v.products} pcs`, 100, 49, {
      align: "left",
    });
    pdf.text(`Akumulasi Poin Yang Didapatkan : ${v.poins} poin`, 100, 53, {
      align: "left",
    });
    pdf.text(
      `Akumulasi Pengeluaran : ${Tools.localePrice(v.spents)}`,
      100,
      57,
      {
        align: "left",
      }
    );

    // append table
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 15, 75, { align: "left" });

    pdf.autoTable({
      head: [thead],
      body: tbody,
      startY: 77,
      theme: "grid",
      styles: {
        fontSize: tfontsize,
        halign: "start",
      },
      headStyles: {
        fillColor: [132, 196, 76],
        textColot: [255, 255, 236],
        fontStyle: "bold",
        valign: "middle",
        halign: "center",
      },
      bodyStyles: {
        valign: "middle",
        // halign: "center",
      },
      columnStyles: this.customAligmentCells(cellsOption),
    });
    /* ========= Main Table ========= */

    /* ========= Footer Table ========= */
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(tfoot, 105, pdf.internal.pageSize.height - 10, {
      align: "center",
    });
    /* ========= Footer Table ========= */

    const path = `./assets/temp/docs-custdata.pdf`;
    pdf.save(path);
    return {
      doc: await readFile(path),
    };
  };

  /**
   *
   * @type { import("./types").CustomAligmentCells }
   */
  static customAligmentCells = (type) => {
    /**
     * @type { import("./types").MapPremadeCells }
     */
    const mappedCells = {
      products: {
        0: { halign: "center" },
        1: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
        8: { halign: "center" },
        9: { halign: "center" },
      },
      orders: {
        0: { halign: "center" },
        1: { halign: "center" },
        4: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
      payments: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
      approvals: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
        8: { halign: "center" },
      },
      invoices: {
        0: { halign: "center" },
        1: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        6: { halign: "center" },
        8: { halign: "center" },
      },
      custdata: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      cmdmodules: {
        0: { halign: "center" },
        2: { halign: "center" },
      },
    };
    return mappedCells[type];
  };
}

module.exports = PDF;
