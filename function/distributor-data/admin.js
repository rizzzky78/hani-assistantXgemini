const { RajaOngkir, Tools } = require("@function/tools");
const { CustomerInterface } = require("./customer");

class AdminInterface {
  /**
   * @param { import("@interface/product").ProductCategory } category
   * @returns
   */
  static setCategory(category) {
    const mapped = {
      herbal: "Herbal",
      beverages: "Health Food & Beverages",
      cosmetics: "Cosmetics & Homecare",
    };
    /**
     * @type { import("@interface/product").StaticCategory }
     */
    const staticCategory = mapped[category];
    return staticCategory;
  }

  static createUploadProductForms() {
    const forms =
      `Forms Upload Produk Baru\n` +
      `------\n` +
      `Nama Produk: <nama produk>\n` +
      `Kategori: <herbal/beverages/cosmetics>\n` +
      `Harga non member: <angka>\n` +
      `Harga member: <angka>\n` +
      `Stok: <angka>\n` +
      `Poin: <angka>\n` +
      `Berat (gr): <angka>\n` +
      `Deskripsi Produk: <deskripsi produk>`;
    return forms;
  }

  /**
   *
   * @param { import("@interface/order-data").StatusOrder } statusOrder
   */
  static mapStatusOrder(statusOrder) {
    const v = {
      ["never-order"]: `Pelanggan belum pernah melakukan pemesanan.`,
      ["pending"]: `Menunggu konfirmasi ulang, untuk diterukan ke Admin.`,
      ["forwarded"]: `Pemesanan Sudah diterukan ke Admin untuk disiapkan, menuggu Pelanggan melakukan pembayaran.`,
      ["confirmed"]: `Pemesanan dan pembayaran sudah dikonfirmasi oleh Admin.`,
      ["completed"]: `Pemesanan berstatus selesai.`,
    };
    return v[statusOrder];
  }

  /**
   *
   * @param { import("@interface/product").Product } product
   */
  static mapEditForms(product) {
    const {
      productId,
      data: {
        title,
        category,
        price,
        memberPrice,
        stock,
        poin,
        weight,
        description,
        image,
      },
    } = product;
    const premadeForms =
      `Forms Edit Produk\n` +
      `-------\n` +
      `ID Produk: ${productId}\n` +
      `Nama Produk: ${title}\n` +
      `Kategori: ${category}\n` +
      `Harga non Member: ${price}\n` +
      `Harga Member: ${memberPrice}\n` +
      `Stok: ${stock}\n` +
      `Poin: ${poin}\n` +
      `Berat: ${weight}\n` +
      `Deskripsi Produk: ${description}`;
    return {
      premadeForms,
      image,
    };
  }

  /**
   *
   * @param { { orders: import("@interface/order-data").CustomerOrderData } } dto
   */
  static mapCustomerOrderData({ orders }) {
    const {
      status,
      data: {
        orderType,
        orderId,
        timeStamp,
        data: {
          buckets,
          totalItem,
          totalPoin,
          totalPrice,
          totalWeight,
          totalExactPrice,
          orderer: [ordrName, ordrPhone, ordrHniId],
          expedition,
          recipient,
        },
      },
    } = orders;

    const val = {
      products: buckets
        .map((v, i) => {
          const { productName, price, qtyAmount } = v;
          const prices = price.toLocaleString("id-ID");
          const c = `- *${productName}* (${qtyAmount} pcs)\nHrg/pcs: Rp.${prices},-`;
          return c;
        })
        .join("\n\n"),
      weights: RajaOngkir.weightConverter({ value: totalWeight, parse: true }),
      pricesProduct: totalPrice.toLocaleString("id-ID"),
      fullPrice: totalExactPrice.toLocaleString("id-ID"),
    };
    const stateOrderDropship = orderType === "dropship";

    let caption =
      `--------- *Pemesanan*\n\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu Dipesan: *${timeStamp}*\n` +
      `Status: *${this.mapStatusOrder(status)}*\n\n` +
      `--------- *Detail Pemesanan*\n` +
      `---- *Pemesan*\n` +
      `Nama: *${ordrName}*\n` +
      `No. telp: *${ordrPhone}*\n` +
      `HNI ID: *${ordrHniId}*\n\n`;
    if (stateOrderDropship) {
      const {
        metadata: [recName, recPhone, recHniId],
        fullAddress,
      } = recipient;
      const [prov, district, subDist, postalCode] = fullAddress;
      const { service, description, fees, etd } = expedition;
      caption +=
        `---- *Penerima*\n` +
        `Nama: *${recName}*\n` +
        `No. telp: *${recPhone}*\n` +
        `HNI ID: *${recHniId ? recHniId : "-"}*\n` +
        `Alamat Lengkap: *${fullAddress.map((v) => v).join(" ")}*\n\n` +
        `---- *Ekspedisi*\n` +
        `Kurir: *JNE*\n` +
        `Service: *${service} - ${description}*\n` +
        `Total Estimasi Berat Produk: *${val.weights}kg*\n` +
        `Tujuan Kota/Kabupaten: *${district}*\n` +
        `Kode Pos: *${postalCode}*\n` +
        `Biaya Ekspedisi: *Rp.${fees.toLocaleString("id-ID")},-*\n` +
        `Estimasi Sampai: *${etd} hari*\n\n`;
    }
    caption +=
      `---- *List Produk Yang Dipesan*\n` +
      `${val.products}\n\n` +
      `--------- *Rekapitulasi Pemesanan*\n` +
      `Total Item: *${totalItem} item*\n` +
      `Total Poin: *${totalPoin} poin*\n` +
      `Total Harga Keseluruhan Produk: *Rp.${val.pricesProduct},-*\n`;
    if (stateOrderDropship) {
      const { fees } = expedition;
      caption += `Biaya Ekspedisi: *Rp.${fees.toLocaleString("id-ID")},-*\n`;
    }
    `Total Keseluruhan: *Rp.${val.fullPrice}*,-\n\n` + `> -akhir pesan-`;
    return caption;
  }

  /**
   *
   * @param { { payments: import("@interface/payment").CustomerPaymentProof } } param0
   */
  static mapCustomerPaymentProof({ payments }) {
    const {
      isVerified,
      timeStamp,
      metadata: { orderId, transactionId },
      payer: { tagName, phoneNumber },
      payment: { via, nominal },
    } = payments;
    const verifyStatus = isVerified
      ? `*Sudah Diverifikasi*`
      : `*Belum Diverifikasi*`;
    const captionPayment =
      `*Bukti Pembayaran Dari Pelanggan*\n\n` +
      `--------- *Detail*\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `ID Transaksi: *${transactionId}*\n` +
      `Waktu Pembayaran: *${timeStamp} WIB*\n` +
      `Status Verifikasi: ${verifyStatus}\n\n` +
      `--------- *Dibayar Oleh*\n` +
      `Nama: *${tagName}*\n` +
      `No. Telp: ${phoneNumber}\n\n` +
      `--------- *Pembayaran*\n` +
      `Dibayar via: *${via}*\n` +
      `Nominal Pembayaran: *${Tools.localePrice(nominal)}*\n` +
      `Bukti Bayar/Transfer: *Lihat pada gambar*\n\n` +
      `> -akhir pesan-`;
    return captionPayment;
  }

  /**
   *
   * @param { { orders: import("@interface/order-data").CustomerOrderData } } param0
   */
  static mapForwardedCustomerOrderDetails({ orders }) {
    const {
      status,
      data: {
        orderType,
        orderId,
        timeStamp,
        data: {
          buckets,
          totalItem,
          totalPoin,
          totalPrice,
          totalWeight,
          totalExactPrice,
          orderer: [ordrName, ordrPhone, ordrHniId],
          expedition,
          recipient,
        },
      },
    } = orders;

    const val = {
      products: buckets
        .map((v, i) => {
          const { productName, price, qtyAmount } = v;
          const prices = price.toLocaleString("id-ID");
          const c = `${
            i + 1
          } - *${productName}* (${qtyAmount} pcs)\nHrg/pcs: Rp.${prices},-`;
          return c;
        })
        .join("\n\n"),
      weights: RajaOngkir.weightConverter({ value: totalWeight, parse: true }),
      pricesProduct: totalPrice.toLocaleString("id-ID"),
      fullPrice: totalExactPrice.toLocaleString("id-ID"),
    };

    const stateOrderDropship = orderType === "dropship";

    let caption =
      `--------- *Draft Pemesanan*\n\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu Dipesan: *${timeStamp}*\n` +
      `Status: *Menunggu Pelanggan melakukan pembayaran*\n\n` +
      `--------- *Detail Pemesanan*\n` +
      `---- *Pemesan*\n` +
      `Nama: *${ordrName}*\n` +
      `No. telp: *${ordrPhone}*\n` +
      `HNI ID: *${ordrHniId}*\n\n`;
    if (stateOrderDropship) {
      const {
        metadata: [recName, recPhone, recHniId],
        fullAddress,
      } = recipient;
      caption +=
        `---- *Penerima*\n` +
        `Nama: *${recName}*\n` +
        `No. telp: *${recPhone}*\n` +
        `HNI ID: *${recHniId ? recHniId : "-"}*\n` +
        `Alamat Lengkap: *${fullAddress.join(", ")}*\n\n`;
    }
    if (stateOrderDropship) {
      const { service, description, fees, etd } = expedition;
      const {
        fullAddress: [prov, district, subDist, postalCode],
      } = recipient;
      caption +=
        `---- *Ekspedisi*\n` +
        `Kurir: *JNE*\n` +
        `Service: *${service} - ${description}*\n` +
        `Total Estimasi Berat Produk: *${val.weights}kg*\n` +
        `Tujuan Kota/Kabupaten: *${district}*\n` +
        `Kode Pos: *${postalCode}*\n` +
        `Biaya Ekspedisi: *Rp.${fees.toLocaleString("id-ID")},-*\n` +
        `Estimasi Sampai: *${etd} hari*\n\n`;
    }
    caption += `---- *List Produk Yang Dipesan*\n` + `${val.products}\n\n`;
    caption +=
      `--------- *Rekapitulasi Pemesanan*\n` +
      `Total Item: *${totalItem} item*\n` +
      `Total Poin: *${totalPoin} poin*\n` +
      `Total Harga Keseluruhan Produk: *Rp.${val.pricesProduct},-*\n`;
    if (stateOrderDropship) {
      caption += `Biaya Ekspedisi: *${Tools.localePrice(expedition.fees)}*\n`;
    }
    `Total Keseluruhan: *Rp.${val.fullPrice}*,-\n\n` +
      `> *Catatan*\n> _Draft pemesanan ini digunakan untuk memudahkan Admin untuk mempercepat proses pemesanan._`;
    return caption;
  }

  /**
   *
   * @param { { payments: import("@interface/payment").CustomerPaymentProof, orders: import("@interface/order-data").CustomerOrderData } } param0
   */
  static mapForwardedCustomerPaymentProofDetails({ payments, orders }) {
    const {
      timeStamp,
      metadata: { transactionId },
      payer: { tagName, phoneNumber },
      payment: { via, nominal },
    } = payments;
    const {
      status,
      data: {
        orderType,
        orderId,
        data: {
          buckets,
          totalItem,
          totalPoin,
          totalPrice,
          totalWeight,
          totalExactPrice,
          orderer: [ordrName, ordrPhone, ordrHniId],
          expedition,
          recipient,
        },
      },
    } = orders;

    const val = {
      orderType:
        orderType === "dropship"
          ? `Dropship / Dipaket`
          : `Pesan Sekarang Diambil Nanti`,
      products: buckets
        .map((v, i) => {
          const { productName, price, qtyAmount } = v;
          const prices = price.toLocaleString("id-ID");
          const idx = i + 1;
          const c = `${idx} - *${productName}* (${qtyAmount} pcs)\nHrg/pcs: Rp.${prices},-`;
          return c;
        })
        .join("\n\n"),
      weights: RajaOngkir.weightConverter({ value: totalWeight, parse: true }),
      pricesProduct: Tools.localePrice(totalPrice),
      fullPrice: Tools.localePrice(totalExactPrice),
    };
    const stateOrderDropship = orderType === "dropship";

    const captionPayment =
      `*Bukti Pembayaran Dari Pelanggan*\n\n` +
      `--------- *Detail*\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `ID Transaksi: *${transactionId}*\n` +
      `Waktu Pembayaran: *${timeStamp} WIB*\n` +
      `Status: *Menunggu verifikasi Admin*\n\n` +
      `--------- *Dibayar Oleh*\n` +
      `Nama: *${tagName}*\n` +
      `No. Telp: ${phoneNumber}\n\n` +
      `--------- *Pembayaran*\n` +
      `Dibayar via: *${via}*\n` +
      `Nominal Pembayaran: *Rp.${nominal.toLocaleString("id-ID")},-*\n` +
      `Bukti Bayar/Transfer: *Lihat pada gambar*\n\n` +
      `> *Catatan:*\n` +
      `> Admin wajib memverifikasi dan memvalidasi pembayaran (cek lengkap), apakah nominal sudah sesuai dengan nominal tercantum pada data pemesanan atau tidak. ` +
      `Jika tidak valid, maka Admin dapat membatalkan pemesanan.`;
    let captionOrder =
      `--------- *Draft Pemesanan - (Sudah Dibayar)*\n\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu Dipesan: *${timeStamp}*\n` +
      `Tipe Pesanan: *${val.orderType}*\n` +
      `Status: *Menunggu Admin memverifikasi dan mengkonfirmasi*\n\n` +
      `--------- *Detail Pemesanan*\n` +
      `---- *Pemesan*\n` +
      `Nama: *${ordrName}*\n` +
      `No. telp: *${ordrPhone}*\n` +
      `HNI ID: *${ordrHniId}*\n\n`;
    if (stateOrderDropship) {
      const {
        metadata: [recName, recPhone, recHniId],
        fullAddress,
      } = recipient;
      const [prov, district, subDist, postalCode] = fullAddress;
      const { service, description, fees, etd } = expedition;
      captionOrder +=
        `---- *Penerima*\n` +
        `Nama: *${recName}*\n` +
        `No. telp: *${recPhone}*\n` +
        `HNI ID: *${recHniId ? recHniId : "-"}*\n` +
        `Alamat Lengkap: *${fullAddress.join(", ")}*\n\n` +
        `---- *Ekspedisi*\n` +
        `Kurir: *JNE*\n` +
        `Service: *${service} - ${description}*\n` +
        `Total Estimasi Berat Produk: *${val.weights}kg*\n` +
        `Tujuan Kota/Kabupaten: *${district}*\n` +
        `Kode Pos: *${postalCode}*\n` +
        `Biaya Ekspedisi: *Rp.${fees.toLocaleString("id-ID")},-*\n` +
        `Estimasi Sampai: *${etd} hari*\n\n`;
    }
    captionOrder +=
      `---- *List Produk Yang Dipesan*\n` +
      `${val.products}\n\n` +
      `--------- *Rekapitulasi Pemesanan*\n` +
      `Total Item: *${totalItem} item*\n` +
      `Total Poin: *${totalPoin} poin*\n` +
      `Total Harga Keseluruhan Produk: *${val.pricesProduct}*\n`;
    if (stateOrderDropship) {
      captionOrder += `Biaya Ekspedisi: *${Tools.localePrice(
        expedition.fees
      )}*\n`;
    }
    captionOrder +=
      `Total Keseluruhan: *${val.fullPrice}*\n\n` +
      `> *Catatan*\n` +
      `> Mohon sesuaikan pesanan dengan data yang tercantum.\n> Setelah menggunakan kode perintah *terima-pesanan*, maka Admin wajib mengisikan dan mengirimkan Form Invoice secara lengkap. ` +
      `Invoice nantinya akan diteruskan kepada pihak pemesan.`;
    return { captionPayment, captionOrder };
  }

  /**
   * @param { import("@interface/customer").OrderType } orderType
   * @param { import("@interface/distributor-data").InvoiceFormDto } dto
   */
  static makeInvoiceForm(orderType, { order, payment }) {
    const {
      metadata: { orderId, transactionId },
    } = payment;

    const formsDropship =
      `Dropship Invoice Pemesanan\n` +
      `---- Data Pemesanan\n` +
      `ID Pemesanan: ${orderId}\n` +
      `ID Transaksi: ${transactionId}\n` +
      `---- Form Admin\n` +
      `Nomor Resi: (isikan nomor resi)\n` +
      `Catatan: (opsional, lampirkan catatan ke customer)`;
    const formsTakeaway =
      `Takeaway Invoice Pemesanan\n` +
      `---- Data Pemesanan\n` +
      `ID Pemesanan: ${orderId}\n` +
      `ID Transaksi: ${transactionId}\n` +
      `---- Form Admin\n` +
      `Catatan: (opsional, lampirkan catatan ke customer)`;
    return orderType === "dropship" ? formsDropship : formsTakeaway;
  }

  /**
   *
   * @param { import("@interface/product").Product } callbackCreateProductData
   */
  static distributeCreateProductData(callbackCreateProductData) {
    const {
      productId,
      timeStamp,
      data: dataProduct,
    } = callbackCreateProductData;
    const {
      title,
      category,
      price,
      memberPrice,
      stock,
      poin,
      weight,
      description,
      image: base64Image,
    } = dataProduct;
    const captionCreateProduct =
      `\n*Data Produk Berhasil Diupload!*\n\n` +
      `ID Produk: ${productId}\n` +
      `Nama Produk: ${title}\n` +
      `Kategori: ${CustomerInterface.setCategory(category)}\n` +
      `Harga: ${Tools.localePrice(price)}\n` +
      `Harga Member: ${Tools.localePrice(memberPrice)}\n` +
      `Stok: ${stock}\n` +
      `Poin: ${poin}\n` +
      `Netto/pcs: ${weight}gr\n\n` +
      `Deskripsi:\n${description}\n\n` +
      `Produk Diupload pada:\n${timeStamp}\n\n`;
    return {
      captionCreateProduct,
      base64Image,
    };
  }

  /**
   *
   * @param { import("@interface/product").Product } productData
   */
  static displayProductBeforeDelete(productData) {
    const { title, category, price, stock, description, image } =
      productData.data;
    const caption =
      `\n` +
      `*${title}*\n\n` +
      `📌 ID Produk: ${productData.productId}\n` +
      `🔖 Kategori: ${this.setCategory(category)}\n` +
      `📦 Stok yang tersedia: ${stock} pcs\n` +
      `💵 Harga: Rp.${price.toLocaleString("id-ID")}\n` +
      `📑 Deskripsi:\n${description}\n\n` +
      `┌─\n` +
      `│ Untuk konfirmasi hapus produk\n` +
      `│ Silahkan kirim ulang kode perintah setelah pesan ini.\n` +
      `└─\n`;
    return {
      caption,
      image,
    };
  }

  /**
   *
   * @param { import("@interface/payment").CustomerPaymentProof } custPaymentProof
   */
  static distributeSingleCustomerOrderData(custPaymentProof) {
    const {
      orderId,
      timeStamp,
      transactionId,
      metadata: { tagName, phoneNumber, paymentVia },
      data: {
        productId,
        productName,
        price,
        quantity,
        totalPrice,
        additionalInfo,
      },
    } = custPaymentProof;
    return {
      buyer: { tagName, phoneNumber },
      meta: [{ timeStamp, orderId, transactionId, paymentVia }],
      data: [
        {
          productId,
          productName,
          price,
          quantity,
          totalPrice,
          additionalInfo: additionalInfo.trim(),
        },
      ],
    };
  }

  /**
   *
   * @param { import("@interface/payment").CustomerPaymentProof } customerPaymentProof
   */
  static displayCustomerPaymentOrder(customerPaymentProof) {
    const {
      orderId,
      transactionId,
      timeStamp,
      metadata: { tagName, phoneNumber, paymentVia, image },
      data: {
        productId,
        productName,
        price,
        quantity,
        totalPrice,
        additionalInfo,
      },
    } = customerPaymentProof;
    const caption = //
      `\n*🗳️ Info Pemesanan Produk*\n` +
      `┌─\n` +
      `│ 📋 Order Id: ${orderId}\n` +
      `│ 🧾 Transaksi Id: ${transactionId}\n` +
      `│ 🗓️ Waktu: ${timeStamp}\n` +
      `└─\n\n` +
      `👤 *Pemesan*\n` +
      `┌─\n` +
      `│ 🪪 Nama: ${tagName}\n` +
      `│ ☎️ No. Telp/WA: ${phoneNumber}\n` +
      `└─\n\n` +
      `🛒 *Data Pemesanan*\n` +
      `┌─\n` +
      `│ 📌 ID Produk: ${productId}\n` +
      `│ 🔖 Nama Produk: ${productName}\n` +
      `│ 💵 Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
      `│ 📦 Jumlah Pemesanan: ${quantity} pcs\n` +
      `│ 💵 Total Pembayaran: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
      `└─\n\n` +
      `📑 *Informasi Tambahan:*\n${additionalInfo}\n\n` +
      `💳 *Pembayaran*\n` +
      `┌─\n` +
      `│ Dibayar Via: ${paymentVia}\n` +
      `│ Nominal: _harap cek pada bukti bayar_\n` +
      `└─\n\n` +
      `*Note:* _Admin wajib memverifikasi bukti bayar dengan nominal pembayaran, jika valid maka gunakan perintah ` +
      `*/konfirmasi-pembayaran [TRX-ID]* untuk mengkonfirmasi pemesanan, ` +
      `jika tidak valid gunakan perintah */cancel-pembayaran [TRX-ID]* ` +
      `untuk membatalkan pemesanan._`;
    return { caption, image };
  }

  /**
   *
   * @param { import("@interface/order-data").CustomerOrderData[] } customerOrderDatas
   * @param { { page: number, pageSize: number } } pagination
   */
  static displayBatchOrderData(customerOrderDatas, pagination) {
    const { page, pageSize } = pagination;
    const totalOrder = customerOrderDatas.length;
    const totalPages = Math.ceil(totalOrder / pageSize);
    if (customerOrderDatas.length < 1) {
      return {
        message: `Data Pemesanan Kosong!\nSaat ini tidak memiliki data pemesanan untuk ditampilkan.`,
      };
    }
    if (page < 1 || page > totalPages || isNaN(page)) {
      return {
        message: `Masukan perintah  tidak valid!\nHalaman pemesanan yang Kamu masukan tidak valid atau tidak dapat ditemukan. Halaman pemesanan harus berupa angka.`,
      };
    }
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrder = customerOrderDatas.slice(startIndex, endIndex);
    const mappedOrderData = paginatedOrder
      .map((orderData, idx) => {
        const {
          orderId,
          timeStamp,
          isCompleted,
          isPayed,
          payedVia,
          data: { productId, productName, price, quantity, totalPrice },
        } = orderData;
        const payVia = isPayed ? `Dibayar via ${payedVia}` : `Belum dibayar`;
        const caption =
          `┌─[ ${idx + 1} ]\n` +
          `│ *Data Pemesanan:*\n` +
          `│ Order ID: ${orderId}\n` +
          `│ Status Pemesanan: ${isCompleted ? "Selesai" : "Belum Selesai"}\n` +
          `│ Status Pembayaran: ${payVia}\n` +
          `│ Waktu Pemesanan: ${timeStamp}\n` +
          `├─\n` +
          `│ *Data Produk Yang Dipesan:*\n` +
          `│ ID Produk: ${productId}\n` +
          `│ Nama Produk: ${productName}\n` +
          `│ Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
          `│ Jumlah Pemesanan: ${quantity} pcs\n` +
          `│ Harga Total: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
          `└─\n`;
        return caption;
      })
      .join("\n\n");
    const count = {
      unsorted: customerOrderDatas.length,
      sorted: paginatedOrder.length,
      incompleted: customerOrderDatas.filter((v) => !v.isCompleted).length,
      unpaid: customerOrderDatas.filter((v) => !v.isPayed).length,
      unpaidTotal: customerOrderDatas
        .filter((v) => !v.isPayed)
        .reduce((total, payed) => total + payed.data.totalPrice, 0),
    };
    const orderDataCaption =
      `\n*List Keseluruhan Data Pemesanan*\n\n` +
      `┌─\n` +
      `│ Halaman ${page} dari ${totalPages} halaman\n` +
      `│ Menampilkan ${count.sorted} dari ${count.unsorted} data pemesanan\n` +
      `├─\n` +
      `│ Total pesanan yang belum selesai: ${count.incompleted} pesanan\n` +
      `│ Total pesanan yang belum dibayarkan: ${count.unpaid} pesanan\n` +
      `│ Total belum dibayar: Rp.${count.unpaidTotal.toLocaleString(
        "id-ID"
      )}\n` +
      `└─\n\n` +
      `${mappedOrderData}\n\n` +
      `─────────────────────\n` +
      `Untuk berpindah halaman gunakan perintah */listorder [halaman yang dituju]*\n` +
      `Contoh: */listorder 3*.`;
    return { message: orderDataCaption };
  }

  /**
   *
   * @param { import("@interface/order-data").CustomerOrderData } customerOrderData
   */
  static displayOrderData(customerOrderData) {
    const {
      orderId,
      timeStamp,
      isCompleted,
      isPayed,
      payedVia,
      data: {
        productId,
        productName,
        price,
        quantity,
        totalPrice,
        additionalInfo,
      },
    } = customerOrderData;
    const payed = isPayed ? `Dibayar via ${payedVia}` : `Belum Dibayar`;
    const caption =
      `\n*Data Pemesanan: ${orderId}*\n` +
      `┌─\n` +
      `│ Status Pemesanan: ${isCompleted ? "Selesai" : "Belum Selesai"}\n` +
      `│ Status Pembayaran: ${payed}\n` +
      `│ Waktu Pemesanan: ${timeStamp}\n` +
      `└─\n\n` +
      `*Data Produk Yang Dipesan:*\n` +
      `┌─\n` +
      `│ ID Produk: ${productId}\n` +
      `│ Nama Produk: ${productName}\n` +
      `│ Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
      `│ Jumlah Pemesanan: ${quantity} pcs\n` +
      `│ Harga Total: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
      `└─\n\n` +
      `*Informasi Tambahan:*\n` +
      `${additionalInfo}\n`;
    return { caption, productId };
  }

  /**
   *
   * @param { import("@interface/order-data").ApprovalOrderData[] } approvalOrderData
   * @param { { page: number, pageSize: number } } pagination
   */
  static displayBatchApprovalOrderData(approvalOrderData, pagination) {
    const { page, pageSize } = pagination;
    const totalApprovalOrder = approvalOrderData.length;
    const totalPages = Math.ceil(totalApprovalOrder / pageSize);
    if (approvalOrderData.length < 1) {
      return {
        message: `Data Pemesanan Yang Dikonfirmasi Kosong!\nSaat ini tidak memiliki data pemesanan dikonfirmasi untuk ditampilkan.`,
      };
    }
    if (page < 1 || page > totalPages || isNaN(page)) {
      return {
        message: `Masukan perintah  tidak valid!\nHalaman pemesanan yang Kamu masukan tidak valid atau tidak dapat ditemukan. Halaman pemesanan harus berupa angka.`,
      };
    }
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedApproval = approvalOrderData.slice(startIndex, endIndex);
    const mappedApprovalOrderData = paginatedApproval
      .map((approvalData, idx) => {
        const {
          orderId,
          timeStamp,
          payedVia,
          data: { productId, productName, price, quantity, totalPrice },
        } = approvalData;
        const caption =
          `┌─[ ${idx + 1} ]\n` +
          `│ *${orderId}*\n` +
          `│ Pembayaran: ${payedVia}\n` +
          `│ Total Dibayarkan: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
          `│ Waktu Pemesanan: ${timeStamp}\n` +
          `├─\n` +
          `│ ID Produk: ${productId}\n` +
          `│ Nama Produk: ${productName}\n` +
          `│ Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
          `│ Jumlah Pemesanan: ${quantity} pcs\n` +
          `└─\n`;
        return caption;
      })
      .join("\n\n");
    const count = {
      unsorted: approvalOrderData.length,
      sorted: paginatedApproval.length,
      totalProfit: approvalOrderData.reduce(
        (total, payed) => total + payed.data.totalPrice,
        0
      ),
    };
    const approvalOrderDataCaption =
      `\n*List Keseluruhan Data Pemesanan Yang Dikonfirmasi*\n\n` +
      `┌─\n` +
      `│ Halaman ${page} dari ${totalPages}\n` +
      `│ Menampilkan ${count.sorted} dari ${count.unsorted} data konfirmasi\n` +
      `├─\n` +
      `│ Total Pesanan Dikonfirmasi: ${count.unsorted} pesanan\n` +
      `│ Total Profit: Rp.${count.totalProfit.toLocaleString("id-ID")}\n` +
      `└─\n\n` +
      `${mappedApprovalOrderData}\n\n` +
      `─────────────────────\n` +
      `Untuk berpindah halaman gunakan perintah */listselesai [halaman yang dituju]*\n` +
      `Contoh: */listselesai 3*.`;
    return { message: approvalOrderDataCaption };
  }

  /**
   *
   * @param { import("@interface/payment").CustomerPaymentProof } paymentProof
   */
  static displayPaymentProofData(paymentProof) {
    const {
      orderId,
      transactionId,
      timeStamp,
      isConfirmed,
      metadata: { tagName, phoneNumber, paymentVia, image },
      data: { productId, productName, quantity, totalPrice, additionalInfo },
    } = paymentProof;
    const confirmation = isConfirmed
      ? "Sudah Dikonfirmasi"
      : "Belum Dikonfrimasi";
    const caption =
      `\n*Data Order dan Transaksi*\n` +
      `┌─\n` +
      `│ ID Order: ${orderId}\n` +
      `│ ID Transaksi: ${transactionId}\n` +
      `│ Status Pembayaran: ${confirmation}\n` +
      `│ Dibayar Via: ${paymentVia}\n` +
      `│ Nominal Pembayaran: ${totalPrice}\n` +
      `│ Waktu Transaksi: ${timeStamp}\n` +
      `└─\n\n` +
      `*Data Pemesan / Pembayar*\n` +
      `┌─\n` +
      `│ Nama: ${tagName}\n` +
      `│ No. Telp/WA: ${phoneNumber}\n` +
      `└─\n\n` +
      `*Data Pemesanan*\n` +
      `┌─\n` +
      `│ ID Produk: ${productId}\n` +
      `│ Nama Produk: ${productName}\n` +
      `│ Jumlah Pemesanan: ${quantity} pcs\n` +
      `└─\n\n` +
      `*Informasi Tambahan dari Pemesan*\n` +
      `${additionalInfo}\n`;
    return { caption, image };
  }

  /**
   *
   * @param { import("@interface/payment").CustomerPaymentProof[] } paymentProof
   * @param { { page: number, pageSize: number } } pagination
   */
  static displayBatchPaymentProofData(paymentProof, pagination) {
    const { page, pageSize } = pagination;
    const totalPaymentProof = paymentProof.length;
    const totalPages = Math.ceil(totalPaymentProof / pageSize);
    if (paymentProof.length < 1) {
      return {
        message: `Data Bukti Transaksi Kosong!\nSaat ini tidak ada data transaksi untuk ditampilkan.`,
      };
    }
    if (page < 1 || page > totalPages || isNaN(page)) {
      return {
        message: `Masukan perintah tidak valid!\nHalaman transaksi yang Kamu masukan tidak valid atau tidak dapat ditemukan. Halaman transaksi harus berupa angka.`,
      };
    }
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPaymentProof = paymentProof.slice(startIndex, endIndex);
    const mappedPaymentProof = paginatedPaymentProof
      .map((proofData, idx) => {
        const {
          orderId,
          transactionId,
          timeStamp,
          isConfirmed,
          metadata: { tagName, phoneNumber, paymentVia },
          data: { productId, productName, quantity, totalPrice },
        } = proofData;
        const confirmation = isConfirmed
          ? "Sudah Dikonfirmasi"
          : "Belum Dikonfrimasi";
        const caption =
          `┌─[ ${idx + 1} ]\n` +
          `│ ID Order: ${orderId}\n` +
          `│ ID Transaksi: ${transactionId}\n` +
          `│ Waktu Transaksi: ${timeStamp}\n` +
          `├─\n` +
          `│ Status Pembayaran: ${confirmation}\n` +
          `│ Dibayar Via: ${paymentVia}\n` +
          `│ Nominal Pembayaran: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
          `├─\n` +
          `│ Nama: ${tagName}\n` +
          `│ No. Telp/WA: ${phoneNumber}\n` +
          `├─\n` +
          `│ ID Produk: ${productId}\n` +
          `│ Nama Produk: ${productName}\n` +
          `│ Jumlah Pemesanan: ${quantity} pcs\n` +
          `└─\n`;
        return caption;
      })
      .join("\n\n");
    const count = {
      sorted: paginatedPaymentProof.length,
      unsorted: paymentProof.length,
      unconfirmed: paymentProof.filter((v) => !v.isConfirmed).length,
      confirmed: paymentProof.filter((v) => v.isConfirmed).length,
      totalUnconfirmed: paymentProof
        .filter((v) => !v.isConfirmed)
        .reduce(
          (accumulator, paymentData) =>
            accumulator + paymentData.data.totalPrice,
          0
        ),
      totalConfirmed: paymentProof
        .filter((v) => v.isConfirmed)
        .reduce(
          (accumulator, paymentData) =>
            accumulator + paymentData.data.totalPrice,
          0
        ),
    };
    const paymentProofDataCaption =
      `\n*List Keseluruhan Data Transaksi*\n\n` +
      `┌─\n` +
      `│ Halaman ${page} dari ${totalPages} halaman\n` +
      `│ Menampilkan ${count.sorted} dari ${count.unsorted} data transaksi\n` +
      `├─\n` +
      `│ Total transaksi dikonfirmasi: ${count.confirmed} transaksi\n` +
      `│ Total transaksi belum dikonfirmasi: ${count.unconfirmed} transaksi\n` +
      `│ Total nominal yang dikonfirmasi: Rp.${count.totalConfirmed.toLocaleString(
        "id-ID"
      )}\n` +
      `│ Total nominal yang belum dikonfirmasi: Rp.${count.totalUnconfirmed.toLocaleString(
        "id-ID"
      )}\n` +
      `└─\n\n` +
      `${mappedPaymentProof}\n\n` +
      `─────────────────────\n` +
      `Untuk berpindah halaman gunakan perintah */listtransaksi [halaman yang dituju]*\n` +
      `Contoh: */listtransaksi 4*.\n` +
      `Untuk mengakses detail data transaksi gunakan perintah */cek-transaksi [ID Transaksi]*\n` +
      `Contoh: */cek-transaksi TRX-ID-123ABC456*.`;
    return { message: paymentProofDataCaption };
  }
}

module.exports = { AdminInterface };
