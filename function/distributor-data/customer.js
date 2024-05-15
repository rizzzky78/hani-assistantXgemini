const { Tools, RajaOngkir } = require("@function/tools");

class CustomerInterface {
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

  /**
   *
   * @param { "jne" | "pos" | "tiki" } courier
   */
  static setCourier(courier) {
    return courier.toUpperCase();
  }

  static createCekOngkirForms() {
    return (
      `Cek Ongkir Form\n` +
      `-----\n` +
      `Ekspedisi: <jne/tiki/pos>\n` +
      `Tujuan: <nama kota/kabupaten>\n` +
      `Berat: <berat dalam gram>`
    );
  }

  /**
   *
   * @param { import("@function/tools/types").RajaOngkirResponse } response
   */
  static mapCekOngkirResult(response) {
    const {
      data: {
        query,
        origin_details,
        destination_details,
        results: [{ code, name, costs }],
      },
    } = response;
    const mapCost = costs
      .map((v) => {
        const {
          service,
          description,
          cost: [{ value, etd, note }],
        } = v;
        return `*${service}* - ${description}\nBiaya: ${Tools.localePrice(
          value
        )}\nEstimasi Sampai: ${etd} hari\nCatatan: ${note ? note : "-"}`;
      })
      .join("\n\n");
    const caption =
      `----- *Hasil Cek Ongkir*\n\n` +
      `--- *Query*\n` +
      `Kurir : *${query.courier.toUpperCase()}*\n` +
      `Asal : *${query.origin}*\n` +
      `Tujuan : *${query.destination}*\n` +
      `Berat Paket (gr) : *${query.weight}*\n\n` +
      `--- *Asal - Halal Mart BC Cilacap 3*\n` +
      `ID Provinsi: *${origin_details.province_id}*\n` +
      `Provinsi: *${origin_details.province}*\n` +
      `ID ${origin_details.type} : *${origin_details.city_id}*\n` +
      `Nama ${origin_details.type} : *${origin_details.city_name}*\n` +
      `Kode POS : *${origin_details.postal_code}*\n\n` +
      `--- *Tujuan*\n` +
      `ID Provinsi: *${destination_details.province_id}*\n` +
      `Provinsi: *${destination_details.province}*\n` +
      `ID ${destination_details.type} : *${destination_details.city_id}*\n` +
      `Nama ${destination_details.type} : *${destination_details.city_name}*\n` +
      `Kode POS : *${destination_details.postal_code}*\n\n` +
      `--- *Ekspedisi*\n` +
      `Kode: ${code.toUpperCase()}\n` +
      `${name}\n\n` +
      `----- *Layanan Ekspedisi*\n` +
      `${mapCost}\n\n` +
      `> Sumber API: Raja Ongkir\n> https://rajaongkir.com/\n> -akhir pesan-`;
    return caption;
  }

  /**
   *
   * @param { { query: string; city: import("@function/tools/types").City } } dto
   */
  static mapSearchedDistrict({ query, city }) {
    const caption =
      `----- *Hasil Pencarian*\n` +
      `Query: *${query}*\n\n` +
      `--- *Detail*\n` +
      `ID Kota : *${city.city_id}*\n` +
      `ID Provinsi : *${city.province_id}*\n` +
      `Provinsi : *${city.province}*\n` +
      `Nama ${city.type} : *${city.city_name}*\n` +
      `Kode POS : *${city.postal_code}*\n\n` +
      `--- *Catatan*\n` +
      `Jika nama kota yang Kamu cari sesuai, maka Kamu dapat mengisi form dan melanjutkan proses pemesananmu.\n> -akhir pesan-`;
    return caption;
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
   * @param { import("@interface/product").Product[] } productsData
   * @param { import("@interface/distributor-data").PaginationDto } paginationData `page` the page number to retrieve, `pageSize` the number of products to display per page.
   * @returns { import("@interface/distributor-data").ProductPaginationCallback }
   */
  static sliceProductsData(productsData, paginationData) {
    const { category, page, pageSize } = paginationData;
    const totalProducts = productsData.length;
    const totalPages = Math.ceil(totalProducts / pageSize);
    if (page < 1 || page > totalPages || isNaN(page)) {
      return {
        status: "invalid",
        data: null,
      };
    }
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = productsData.slice(startIndex, endIndex);

    return {
      status: "success",
      data: {
        category: this.setCategory(category),
        totalProducts,
        currentPage: page,
        pageSize,
        totalPages,
        products: paginatedData,
      },
    };
  }

  /**
   *
   * @param { import("@interface/distributor-data").PaginationData } paginatedData
   */
  static paginateCatalogData(paginatedData) {
    const {
      category,
      totalProducts,
      currentPage,
      pageSize,
      totalPages,
      products: productData,
    } = paginatedData;
    const caption =
      `\n🏷️ *Katalog Produk ${category}*\n\n` +
      `Kategori Katalog yang dapat diakses:\n` +
      `- herbal\n` +
      `- beverages\n` +
      `- cosmetics\n\n` +
      `Halaman Katalog: *${currentPage}/${totalPages}*\n` +
      `Total Keseluruhan Produk: *${totalProducts} produk*\n` +
      `Menampilkan *${productData.length}* produk dari *${totalProducts}* produk\n\n\n` +
      `- *List Produk ${category}* -\n\n` +
      `${productData
        .map(
          (item) =>
            `\n` +
            `📌 ID Produk: ${item.productId}\n` +
            `┏━\n` +
            `┃ *${item.data.title}*\n` +
            `┃ 📦 Stok: ${item.data.stock} pcs\n` +
            `┃ 💵 Harga: Rp.${item.data.price.toLocaleString("id-ID")}\n` +
            `┗━`
        )
        .join("\n\n")}` +
      `\n\n\n` + //┌└│├─
      `┌─\n` +
      `│📒 Untuk berpindah Lembar Katalog gunakan perintah:\n` +
      `│ *!katalog [kategori] [nomor halaman katalog]*\n` +
      `│ contoh: *!katalog herbal 3*\n` +
      `├─\n` +
      `│📙 Untuk mengakses informasi/detail produk gunakan perintah:\n` +
      `│ *!produk [ID Produk]*, contoh: *!produk 123ABC*\n` +
      `├─\n` +
      `│📔 Jika Kamu perlu bantuan lainnya, gunakan perintah:\n` +
      `│ *!bantuan*\n` +
      `└\n`;
    return { caption };
  }

  /**
   *
   * @param { import("@interface/product").Product } productData
   */
  static displayProduct({ productId, data }) {
    const {
      title,
      category,
      price,
      memberPrice,
      stock,
      sold,
      poin,
      weight,
      description,
      image,
    } = data;
    const caption = //📌🔖📦💵📑
      `\n` +
      `*${title}*\n\n` +
      `📌 ID Produk : ${productId}\n` +
      `🔖 Kategori : ${this.setCategory(category)}\n` +
      `📦 Stok : ${stock} pcs\n` +
      `📦 Terjual: ${sold} pcs\n` +
      `💵 Harga non Member : ${Tools.localePrice(price)}\n` +
      `💵 Harga Member : ${Tools.localePrice(memberPrice)}\n` +
      `🔖 Poin/pcs : ${poin} poin\n` +
      `📦 Netto/pcs : ${weight}gr\n` +
      `📑 Deskripsi :\n${description}\n\n` +
      `> *Catatan:*\n` +
      `> Untuk memesan produk (dropship) silahkan ketik dengan format *pesan <nama produk> # <jml pemesanan>*, Contoh: *pesan MHS # 3*\n` +
      `> Untuk memesan produk (bayar sekarang diambil nanti) silahkan ketik dengan format *beli <nama produk> # <jml pemesanan>*, Contoh: *beli MHS # 5*`
      
    return {
      /**
       * Product Data Caption
       */
      caption,
      /**
       * Base64Image Product Image
       */
      image,
    };
  }

  /**
   *
   * @param { string } queryInput
   * @param { import("@interface/product").Product[] } productData
   */
  static displaySearchedProduct(queryInput, productData) {
    const mapped = productData.map((product, idx) => {
      const { productId, data } = product;
      const { title, category, price, stock } = data;
      const productInfo =
        `📌 ID Produk: ${productId}\n` +
        `┌─[ ${idx + 1} ]\n` +
        `│ *${title}*\n` +
        `│ 🔖 Kategori: ${this.setCategory(category)}\n` +
        `│ 📦 Stok: ${stock} pcs\n` +
        `│ 💵 Harga: Rp.${price.toLocaleString("id-ID")}\n` +
        `└─`;
      return productInfo;
    });
    const caption =
      `\n*Hasil Pencarian Produk*\n\n` +
      `Query: ${queryInput}\n\n\n` +
      `${mapped.join("\n\n")}\n\n` +
      `- Untuk mengakses detail produk, gunakan perintah */produk [ID Produk]*\n` +
      `- Untuk melakukan pemesanan, gunakan perintah */pesan [ID Produk] # [Jumlah Pemesanan]\n`;
    return { caption, base64ImageHeader: productData[0].data.image };
  }

  /**
   * @param { { tagName: string, phoneNumber: string, productId: string, productName: string, qtyAmount: string } } orderData
   */
  static makeFormOrder(orderData) {
    const { tagName, phoneNumber, productId, productName, qtyAmount } =
      orderData;
    const formOrder = `konfirmasipemesanan Form Pemesanan\nID Produk: ${productId.toUpperCase()}\nNama Produk: ${productName}\nJumlah Pemesanan: ${qtyAmount.trim()}\nNama Pemesan: ${tagName}\nNomor Telpon: ${phoneNumber}\nHNI ID: -\nOpsi Pengiriman: pickup\nAlamat Pengiriman: -`;
    return formOrder;
  }

  /**
   *
   * @param { "pesan" | "beli" } cmdInput
   * @param { import("@interface/customer").Customer } customer
   */
  static displayCurrentBuckes(cmdInput, { metadata, data }) {
    const mappedProducts = data.buckets
      .map((v) => {
        const { productName, price, poin, weight, qtyAmount, totalPoin } = v;
        const prices = price.toLocaleString("id-ID");
        return `*${productName}*\nHarga | poin /pcs: Rp.${prices} | ${poin}\nNetto: ${weight}gr\nJumlah: ${qtyAmount} pcs\nPoin: ${totalPoin}`;
      })
      .join("\n\n");
    const val = {
      totalItem: data.buckets.reduce((v, t) => v + t.qtyAmount, 0),
      totalPoin: data.buckets.reduce((v, t) => v + t.totalPoin, 0),
      totalPrice: data.buckets.reduce((v, t) => v + t.totalPrice, 0),
      totalWeight: data.buckets.reduce((v, t) => v + t.totalWeight, 0),
    };
    const { tagName, phoneNumber, hniId } = metadata;
    const weights = RajaOngkir.weightConverter({
      value: val.totalWeight,
      parse: true,
    });
    const orderType = cmdInput === "pesan" ? `checkout` : `selesai`;
    const caption =
      `\n*Data Pengguna*\n` +
      `Nama Pengguna: ${tagName}\n` +
      `No. Telp/WA: ${phoneNumber}\n` +
      `HNI ID: ${
        hniId ? hniId : `Belum Ditambahkan, ketik "*hniid*" untuk menambahkan`
      }\n\n` +
      `*Keranjang Produk*\n` +
      `---------------------------\n` +
      `${mappedProducts}\n\n` +
      `---------------------------\n\n` +
      `Total Item: *${val.totalItem} pcs*\n` +
      `Total Harga: *Rp.${val.totalPrice.toLocaleString("id-ID")}*\n` +
      `Estimasi Total Berat Produk: *${weights} kg*\n` +
      `Akumulasi Perolehan Poin: *${val.totalPoin} poin*\n\n` +
      `---------------------------\n\n` +
      `*Catatan*\n` +
      `> Untuk melanjutkan proses pesananmu, silahkan ketik "*${orderType}*".\n` +
      `> Untuk menghapus produk pada keranjang, silahkan ketik *hapus*.`;
    return caption;
  }

  /**
   *
   * @param { import("@interface/customer").Customer } customer
   */
  static makeCheckoutForm({ metadata }) {
    const hniId = metadata.hniId ? metadata.hniId : `(opsional)`;
    const form = `Form Pemesanan\nNama Pemesan: ${metadata.tagName}\nNomor Telpon: ${metadata.phoneNumber}\nHNI ID: ${hniId}\n---\nData Penerima\nNama: (nama lengkap penerima)\nNomor Telpon: (nomor telpon penerima)\nHNI ID Penerima: (opsional)\n---\nDetail Alamat Penerima\nProvinsi: (alamat provinsi penerima)\nKota/Kabupaten: (alamat kota/kabupaten penerima)\nKecamatan: (alamat kecamatan penerima)\nKode Pos: (kode pos alamat penerima)\nAlamat Lengkap: (Desa/RT/RW/Nomor rumah/dll)`;
    return form;
  }

  /**
   *
   * @param { string[] } formOrder
   */
  static displaySuccessOrderResult(formOrder) {
    const [
      ordererTagName,
      ordererPhoneNumber,
      ordererHniId,
      recipientName,
      recipientPhoneNumber,
      recipientHniId,
      addrProvince,
      addrDistrict,
      addrSubDistrict,
      addrPostalCode,
      addrDetail,
    ] = Tools.arrayModifier("n", formOrder);
    const caption =
      `-Data Pemesan\n` +
      `Nama: ${ordererTagName}\n` +
      `No Telp: ${ordererPhoneNumber}\n` +
      `HNI ID: ${ordererHniId}\n` +
      `-Data Penerima\n` +
      `Nama: ${recipientName}\n` +
      `No Telp: ${recipientPhoneNumber}\n` +
      `HNI ID Penerima: ${recipientHniId ? recipientHniId : "-"}\n` +
      `Alamat Lengkap: ${addrProvince}, ${addrDistrict}, ${addrSubDistrict}, ${addrPostalCode}\n` +
      `${addrDetail}`;
    return {
      info: caption,
      orderer: [ordererTagName, ordererPhoneNumber, ordererHniId],
      recipient: [recipientName, recipientPhoneNumber, recipientHniId],
      fullAddress: [
        addrProvince,
        addrDistrict,
        addrSubDistrict,
        addrPostalCode,
        addrDetail,
      ],
    };
  }

  /**
   *
   * @param { { purchase: import("@interface/customer").Purchases, orders: import("@interface/order-data").CustomerOrderData } } param0
   */
  static mapCustomerOrderDetails({ purchase, orders }) {
    const {
      status,
      data: {
        orderType,
        orderId,
        timeStamp,
        data: {
          buckets,
          totalItem,
          totalPrice,
          totalPoin,
          totalWeight,
          totalExactPrice,
          orderer: [ordrName, ordrPhone, ordrHniId],
          expedition,
          recipient,
        },
      },
    } = orders;
    const products = buckets
      .map((v) => {
        const { productName, price, poin, weight, qtyAmount, totalPoin } = v;
        const prices = price.toLocaleString("id-ID");
        const bucks =
          `*${productName}*\n` +
          `Hrg | poin/pcs: Rp.${prices} | ${poin} poin\n` +
          `Estimasi netto/pcs: ${weight}gr\n` +
          `Jml: ${qtyAmount} pcs\n` +
          `Akumulasi Poin: ${totalPoin} poin`;
        return bucks;
      })
      .join("\n\n");
    const weights = RajaOngkir.weightConverter({
      value: totalWeight,
      parse: true,
    });
    const stateOrderType =
      orderType === "dropship"
        ? `Dropship / Dipaket`
        : `Pesan Sekarang Diambil Nanti`;
    const stateDropshipOrder =
      Object.keys(recipient).length > 0 && Object.keys(expedition).length > 0;

    let caption =
      `--------- *Detail Pemesanan*\n\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu: *${timeStamp} WIB*\n` +
      `Tipe Pemesanan: *${stateOrderType}*\n` +
      `Status Pemesanan: *${this.mapStatusOrder(status)}*\n\n` +
      `--------- *Nama Pemesan*\n` +
      `Nama: *${ordrName}*\n` +
      `No. telp: *${ordrPhone}*\n` +
      `HNI ID: *${ordrHniId}*\n\n`;
    if (stateDropshipOrder) {
      const {
        metadata: [recName, recPhone, recHniId],
        fullAddress,
      } = recipient;
      const [prov, district, subDist, postalCode] = fullAddress;
      const { service, description, fees, etd } = expedition;
      caption +=
        `--------- *Nama Penerima*\n` +
        `Nama: *${recName}*\n` +
        `No. telp: *${recPhone}*\n` +
        `HNI ID: *${recHniId ? recHniId : "-"}*\n` +
        `Alamat Lengkap: *${fullAddress.join(", ")}*\n\n` +
        `--------- *Ekspedisi*\n` +
        `Kurir: JNE\n` +
        `Service: *${service}* - ${description}\n` +
        `Total estimasi berat paket: *${weights} kg*\n` +
        `Tujuan Kota/Kabupaten | kode pos: *${district}* | *${postalCode}*\n` +
        `Biaya pengiriman: *Rp.${fees.toLocaleString("id-ID")}*\n` +
        `Estimasi sampai tujuan: *${etd} hari*\n\n`;
    }
    caption +=
      `--------- *Keranjang Pemesanan*\n` +
      `${products}\n\n` +
      `--------- *Rekapitulasi*\n` +
      `Total item: *${totalItem} pcs/produk*\n` +
      `Total poin: *${totalPoin} poin*\n` +
      `Total harga keseluruhan: *Rp.${totalPrice.toLocaleString("id-ID")}*\n` +
      `Total estimasi berat: *${weights} kg*\n\n`;
    caption +=
      `--------- *Total Pembayaran*\n` +
      `Produk: *Rp.${totalPrice.toLocaleString("id-ID")}*\n`;
    if (stateDropshipOrder) {
      caption += `Pengiriman: *${Tools.localePrice(expedition.fees)}*\n`;
    }
    caption +=
      `Total Pembayaran: *${Tools.localePrice(totalExactPrice)}*\n\n` +
      `> *Catatan*\n` +
      `> Silahkan periksa kembali data pemesanan, salin dan kirimkan kode konfirmasi pemesanan setelah pesan ini untuk melanjutkan proses pemesananmu. ` +
      `Jika pemesananmu kurang sesuai, ketik "*batal*" untuk membatalkan pemesanan dan memulai dari awal.`;
    return caption;
  }

  /**
   *
   * @param { { approvals: import("@interface/order-data").ApprovalOrderData } } param0
   */
  static mapCustomerApprovalData({ approvals }) {}

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
      `*Bukti Pembayaran*\n\n` +
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
   * @param { { orders: import("@interface/order-data").CustomerOrderData } } dto
   */
  static mapPaymentProvider({ orders }) {
    const {
      metadata: { paymentPlatform },
    } = require("@config/settings");

    const {
      data: {
        orderId,
        timeStamp,
        data: {
          totalPrice,
          expedition,
          totalExactPrice,
          orderer: [ordrName, ordrPhone],
        },
      },
    } = orders;

    const payments = paymentPlatform
      .map((v) => {
        const { provider, key, name } = v;
        return `*${provider}*\nID: ${key}\nA/N: ${name}`;
      })
      .join("\n\n");
    let caption =
      `--------- *Pembayaran*\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu: *${timeStamp}*\n\n` +
      `---- *List Pembayaran*\n` +
      `${payments}\n\n` +
      `---- *Rekapitulasi*\n` +
      `Total Harga Produk Yang Dipesan:\n` +
      `*Rp.${totalPrice.toLocaleString("id-ID")},-*\n\n`;
    if (Object.keys(expedition).length > 0) {
      const { fees } = expedition;
      caption +=
        `Total Biaya Pengiriman:\n` +
        `*Rp.${fees.toLocaleString("id-ID")},-*\n\n`;
    }
    caption +=
      `Total Yang Harus Dibayarkan:\n` +
      `*Rp.${totalExactPrice.toLocaleString("id-ID")},-*\n\n\n` +
      `> *Catatan*\n` +
      `> Harap melakukan transfer/pembayaran sesuai dengan nominal tercantum dan melalui platform pembayaran diatas. ` +
      `Setelah Kamu melakukan upload pembayaran, Admin akan memverfikasi pembayaran, memproses pemesanan, dan Kamu akan mendapatkan Invoice pemesanan.`;
    return caption;
  }

  /**
   *
   * @param { { payments: import("@interface/payment").CustomerPaymentProof } } param0
   */
  static mapForwardedCustomerPaymentProof({ payments }) {
    const {
      timeStamp,
      metadata: { orderId, transactionId },
      payer: { tagName, phoneNumber },
      payment: { via, nominal },
    } = payments;

    const caption =
      `*Upload Bukti Pembayaran Berhasil!*\n\n` +
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
      `Bukti Bayar/Transfer: *Lihat pada gambar*\n\n`;
    return caption;
  }

  /**
   *
   * @param { { approval: import("@interface/order-data").ApprovalOrderData } } dto
   */
  static mapCustomerInvoice({ approval }) {
    const {
      orderType,
      orderId,
      transactionId,
      timeStamp,
      invoice: { invoiceId },
      metadata,
      payment,
      products,
      expedition,
    } = approval;

    const productList = products
      .map((v) => `*${v.productName}* (${v.qtyAmount})`)
      .join(", ");
    const v = {
      productPrices: Tools.localePrice(payment.product),
      expFees: payment.expFees === 0 ? "-" : Tools.localePrice(payment.expFees),
      totalPrices: Tools.localePrice(payment.nominal),
    };
    const stateTypeOrder =
      orderType === "dropship"
        ? `Dropship / Dipaket`
        : `Pesan Sekarang Diambil Nanti`;
    const stateOrderDropship = orderType === "dropship";

    const captionImage =
      `*Bukti Invoice*\n` +
      `ID Invoice: *${invoiceId}*\n` +
      `Catatan Dari Admin: *${
        metadata.adminNotes ? metadata.adminNotes : "-"
      }*\n\n` +
      `> _Invoice PDF akan dikirimkan setelah pesan ini._`;
    let captionInvoice =
      `--------- *Invoice Pemesanan*\n\n` +
      `Tanggal: *${timeStamp} WIB*\n\n` +
      `ID Invoice: *${invoiceId}*\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `ID Transaksi: *${transactionId}*\n` +
      `Tipe Pemesanan: *${stateTypeOrder}*\n`;
    if (stateOrderDropship) {
      captionInvoice +=
        `Ekspedisi: *${expedition.code.toUpperCase()} - ${
          expedition.description
        }*\n` + `No. Resi: *${expedition.receiptNumber}*\n\n`;
    }
    captionInvoice +=
      `Status: *Selesai/Dikirim*\n\n` +
      `--------- *Detail Pemesan*\n` +
      `Nama: *${metadata.orderer}*\n` +
      `No. Telp: *${metadata.phone}*\n` +
      `HNI ID: *${metadata.hniId}*\n\n` +
      `--------- *Detail Pemesanan*\n` +
      `Produk: ${productList}\n\n` +
      `Harga Produk: *${v.productPrices}*\n`;
    if (stateOrderDropship) {
      captionInvoice += `Biaya Pengiriman: *${v.expFees}*\n`;
    }
    captionInvoice +=
      `Total Dibayarkan: *${v.totalPrices}*\n\n` +
      `> Kamu dapat melihat detail pemesanan pada file PDF yang terlampir.`;
    return { captionImage, captionInvoice };
  }

  /**
   *
   * @param { import("@interface/customer").Customer } customerData
   */
  static displayCustomerBuckets({ metadata, data }) {
    const { tagName, phoneNumber, hniId } = metadata;
    const { buckets, purchaseHistory } = data;
    /**
     * @param { import("@interface/customer").Buckets[] } buckets
     * @param { boolean } opt
     */
    const mappedBuckets = (buckets, opt = true) =>
      buckets
        ? buckets
            .map((v, i) => {
              return `${i + 1} - ${v.productName} ${v.qtyAmount} pcs`;
            })
            .join("\n") +
          (opt
            ? `\n\nSilahkan ketik *checkout* untuk melanjutkan proses pemesanan.`
            : "")
        : `Kamu tidak memiliki pesanan pada keranjang.`;
    const filteredPurchases = purchaseHistory.filter((v) => !v.isCompleted);
    const mappedPurchases =
      filteredPurchases.length > 0
        ? filteredPurchases
            .map((v) => {
              const {
                orderId,
                timeStamp,
                isPayed,
                payedVia,
                data: { buckets, totalItem, totalPrice, additionalInfo },
              } = v;
              const payments = isPayed ? payedVia : "Belum Dibayarkan";
              const caption =
                `*Produk*\n` +
                `${mappedBuckets(buckets, false)}\n\n` +
                `Total Item: ${totalItem} pcs\n` +
                `Total Harga: Rp.${totalPrice.toLocaleString("id-ID")}\n\n` +
                `*Detail Order*\n` +
                `Order ID: ${orderId}\n` +
                `Waktu Pemesanan: ${timeStamp} WIB\n` +
                `Status Pembayaran: ${payments}\n\n` +
                `*Form Pemesanan*\n` +
                `${additionalInfo}\n\n` +
                `- - - - - - - - - - - - - - - -`;
              return caption;
            })
            .join("\n")
        : `Kamu tidak memiliki data pemesanan berlangsung.`;
    const caption =
      `*- Keranjang Produk dan Pemesanan Berlangsung -*\n\n` +
      `Nama Pengguna: ${tagName}\n` +
      `Nomor Telp Pengguna: ${phoneNumber}\n` +
      `HNI ID: ${
        hniId ? hniId : `Belum ditambahkan, ketik "*hniid*" untuk menambahkan..`
      }\n\n` +
      `- - - - - - - - - - - - - - - -\n\n` +
      `*- Keranjang Produk -*\n` +
      `${mappedBuckets(buckets)}\n\n` +
      `- - - - - - - - - - - - - - - -\n\n` +
      `*- Pemesanan Berlangsung -*\n\n` +
      `${mappedPurchases}\n\n` +
      `*Petunjuk*\n` +
      `[1] Kamu dapat menghapus produk pada keranjang produk dengan mengetik *hapus*.\n` +
      `[2] Kamu dapat membatalkan pemesanan dengan cara mengetik *batal*, *hanya berlaku untuk pemesanan yang belum dibayarkan.\n` +
      `[3] Jika perlu panduan lengkap, sillahkan ketik *bantuan*.\n\n` +
      `- Akhir Pesan -`;
    const state = buckets.length > 0 || filteredPurchases.length > 0;
    return state
      ? caption
      : `Kamu tidak memiliki produk pada keranjang dan data pemesanan berlangsung, sialhkan pesan produk dengan mengetik *pesan nama produk # jumlah*.`;
  }

  /**
   *
   * @param { import("@interface/customer").Purchases } purchases
   */
  static redirectToPayment(purchases) {
    const {
      metadata: { paymentPlatform },
    } = require("@config/settings");
    const {
      orderId,
      timeStamp,
      data: { buckets, totalItem, totalPrice, additionalInfo },
    } = purchases;
    const v = {
      buckets: buckets
        .map((v, i) => `${i + 1} - ${v.productName} ${v.qtyAmount} pcs`)
        .join("\n"),
      payment: paymentPlatform
        .map((v) => `💳 ${v.provider}\nvia: ${v.key}\nA/N: ${v.name}`)
        .join("\n\n"),
    };
    const captionOrder =
      `*- Pemesanan Produk -*\n\n` +
      `ID Pemesanan: *${orderId}*\n` +
      `Waktu Pemesanan: *${timeStamp} WIB*\n\n` +
      `*- Produk Yang Dipesan -*\n\n` +
      `${v.buckets}\n\n` +
      `Total Item: *${totalItem} pcs*\n` +
      `Total Harga: *Rp.${totalPrice.toLocaleString("id-ID")}*\n\n` +
      `*- Form dan Alamat Pemesanan -*\n\n` +
      `${additionalInfo}\n`;
    const captionPayment =
      `*-Pembayaran-*\n\n` +
      `*Platform Pembayaran Yang Tersedia*\n\n` +
      `${v.payment}\n\n` +
      `*Detail Pemesanan*\n` +
      `Total Item: *${totalItem}*\n` +
      `Total Harga: *Rp.${totalPrice.toLocaleString("id-ID")}*\n\n` +
      `*Ongkos Kirim Ekspedisi*\n` +
      `*Akan dicek setelah Admin menerima pemesanan.\n\n` +
      `*- Catatan -*\n` +
      `Untuk total pembayaran (termasuk ongkir ekspedisi) akan dilampirkan setelah Admin menerima dan mengecek data pemesanan.\n\n` +
      `*_Silahkan kirimkan kode verifikasi pemesanan setelah pesan ini, untuk meneruskan pemesanan ke Admin._*`;
    return {
      captionOrder,
      captionPayment,
      redirectKey: `konfirmasi-pemesanan ${orderId}`,
    };
  }

  /**
   *
   * @param { import("@interface/product").ProductDataInfo } productDataInfo
   * @param { string } qtyAmount
   */
  static displayNewFormOrderData(productDataInfo, qtyAmount) {
    const { title, category, stock, price } = productDataInfo;
    const msg =
      `\n*Data Pemesanan*\n` +
      `┌─\n` +
      `│ Nama Produk: ${title}\n` +
      `│ Kategori: ${this.setCategory(category)}\n` +
      `│ Stok: ${stock} pcs\n` +
      `│ Harga: Rp.${price.toLocaleString("id-ID")}\n` +
      `│ Jumlah Pemesanan: ${qtyAmount} pcs\n` +
      `│ Total Harga: Rp.${(price * Number(qtyAmount)).toLocaleString(
        "id-ID"
      )}\n` +
      `└─\n\n` +
      `Ketentuan:\n` +
      `- Form "Jumlah Pemesanan" tidak dapat melebihi stok yang tersedia\n` +
      `- Form "HNI ID" bersifat opsional, Kamu bisa mencantumkannya jika memiliki\n` +
      `- Form "Opsi Pengiriman" yaitu "pickup" dan "delivery", pickup untuk ambil ditempat dan delivery untuk diantar.\n` +
      `- Form "Alamat Pengiriman" wajib di isi jika "Opsi Pengiriman" = "delivery"\n\n` +
      `_Mohon isikan dan kirim ulang form pemesanan setelah pesan ini, harap mengisi form sesuai dengan ketentuan dan tidak mengubah format form pemesanan._`;
    return msg;
  }

  /**
   *
   * @param { import("@interface/query-parts").FormOrderDto } formOrderData
   */
  static displayFormOrderResult(formOrderData) {
    const {
      ordererName,
      ordererPhoneNumber,
      ordererHniId,
      deliveryOption,
      deliveryAddress,
    } = formOrderData;
    const displayData =
      `Nama Pemesan: ${ordererName}\n` +
      `No. Telp: ${ordererPhoneNumber}\n` +
      `HNI ID: ${ordererHniId ? ordererHniId : "-"}\n` +
      `Opsi Pengiriman: ${deliveryOption}\n` +
      `Alamat Pengiriman:\n${deliveryAddress ? deliveryAddress : "-"}`;
    return displayData;
  }

  /**
   *
   * @param { import("@config/types").PaymentPlatform[] } paymenPlatform
   * @param { import("@interface/customer").PurchaseData } purchaseData
   */
  static displayPaymentPlatform(paymenPlatform, purchaseData) {
    const {
      timeStamp,
      data: { productName, price, quantity, totalPrice, additionalInfo },
    } = purchaseData;
    const msgPayment = paymenPlatform
      .map((pay) => {
        const { provider, key, name } = pay;
        return `💳 *${provider}*\nvia: ${key}\nA/N: ${name}`;
      })
      .join("\n\n");
    const priceLocale = price.toLocaleString("id-ID");
    const msg =
      `\n*Data Pemesanan*\n` +
      `┌─\n` +
      `│ 🗓️ Dipesan Tanggal: *${timeStamp}*\n` +
      `│ 🔖 Nama Produk: *${productName}*\n` +
      `│ 💵 Harga/pcs: *Rp.${priceLocale}*\n` +
      `│ 📦 Jumlah Pemesanan: *${quantity} pcs*\n` +
      `└─\n` +
      `┌─\n` +
      `│ 🛻 Pengiriman\n` +
      `│ - Pickup: *+ Rp.0*\n` +
      `│ - Reguler: *+ Rp.25.000*\n` +
      `│ - Reguler Luar Jawa: *+ Rp.30.000*\n` +
      `└─\n\n` +
      `🧾 Total Bayar via Pickup: *Rp.${priceLocale}*\n\n` +
      `🧾 Total Bayar +Ongkir Reguler: *Rp.${(price + 25000).toLocaleString(
        "id-ID"
      )}*\n\n` +
      `🧾 Total Bayar +Ongkir Reguler Luar Jawa: *Rp.${(
        price + 30000
      ).toLocaleString("id-ID")}*\n\n` +
      `📃 *Informasi Tambahan:*\n${additionalInfo}\n\n` +
      `📑 *Platform Pembayaran Yang Tersedia*\n\n` +
      `💳 *QRIS*\n\n` +
      `${msgPayment}\n\n` +
      `_Setelah melakukan transfer/pembayaran silahkan upload bukti bayar` +
      `dengan menggunakan caption perintah */bayar [order id] # dibayar via*, contoh */bayar ORD-ID-123ABC # GO-PAY*. ` +
      `Order Id akan dikirim setelah pesan ini._`;
    return msg;
  }

  /**
   *
   * @param { import("@interface/controllers/admin").ConfirmCustomerOrderCallback } callback
   */
  static displayCustomerInvoice(callback) {
    const {
      data: { ordererPhoneId, approvalOrder },
    } = callback;
    const {
      orderId,
      timeStamp,
      payedVia,
      data: { productName, quantity, totalPrice, additionalInfo },
    } = approvalOrder;
    const caption =
      `\n*Pesananmu Telah Dikonfirmasi Admin!*\n\n` +
      `*Invoice Pemesanan*\n` +
      `Order Id: ${orderId}\n` +
      `Waktu Pemesanan: ${timeStamp}\n\n` +
      `Nama Produk: ${productName}\n` +
      `Jumlah Pemesanan: ${quantity} pcs\n\n` +
      `Dibayarkan Via: ${payedVia}\n` +
      `Total Dibayarkan: Rp.${totalPrice.toLocaleString("id-ID")}\n\n` +
      `Informasi Tambahan:\n${additionalInfo}\n` +
      `\n` +
      `Untuk opsi pengiriman "pickup" silahkan ambil produk yang dipesan pada toko.\n` +
      `Untuk opsi pengiriman "delivery" mohon tunggu informasi lebih lanjut dari Admin.\n` +
      `_Regards_`;
    return { caption, ordererPhoneId };
  }

  /**
   *
   * @param { import("@interface/customer").Customer } customerData
   * @param { { page: number; pageSize: number } } paginationData
   * @returns { { status: "success" | "invalid"; message: string } }
   */
  static displayCustomerBucket(customerData, paginationData) {
    const { purchaseHistory } = customerData.data;
    const { page, pageSize } = paginationData;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const slicedOrderData = purchaseHistory.slice(startIndex, endIndex);
    const orderData = slicedOrderData
      .map((purchaseData, idx) => {
        const { orderId, timeStamp, isCompleted, isPayed, payedVia, data } =
          purchaseData;
        const { productName, price, quantity, totalPrice, additionalInfo } =
          data;
        const msg =
          `┌─[ ${idx + 1} ]\n` +
          `│ ORD-ID: ${orderId}\n` +
          `│ Status Pemesanan: ${isCompleted ? "selesai" : "belum selesai"}\n` +
          `│ Status Pembayaran: ${isPayed ? payedVia : "belum dibayarkan"}\n` +
          `│ Waktu Pemesanan: ${timeStamp}\n` +
          `├─\n` +
          `│ Nama Produk: ${productName.substring(0, 60)}\n` +
          `│ Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
          `│ Jumlah Pemesanan: ${quantity} pcs\n` +
          `│ Total Harga: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
          `└─`;
        return msg;
      })
      .join("\n\n");

    const count = {
      incompletedOrders: purchaseHistory.filter((order) => !order.isCompleted)
        .length,
      unpaidOrders: purchaseHistory.filter((order) => !order.isPayed).length,
      unsorted: purchaseHistory.length,
      sorted: purchaseHistory.slice(startIndex, endIndex).length,
    };

    const unpaidTotalPrice = purchaseHistory
      .filter((purchase) => !purchase.isPayed)
      .reduce((total, purchase) => total + purchase.data.totalPrice, 0);

    const displayOrderData =
      purchaseHistory.length > 0
        ? orderData
        : "Kamu belum pernah melakukan pemesanan\n";

    const totalPages = Math.ceil(purchaseHistory.length / pageSize);

    const message =
      `\n🛒 *Data Keranjang Customer*\n\n` +
      `┌─\n` +
      `│ Halaman keranjang ${page} dari ${totalPages} halaman\n` +
      `│ Menampilkan ${count.sorted} pemesanan dari ${count.unsorted} data pemesanan\n` +
      `├─\n` +
      `│ Total pesanan yang belum selesai: ${count.incompletedOrders} pesanan\n` +
      `│ Total pesanan yang belum dibayarkan: ${count.unpaidOrders} pesanan\n` +
      `│ Total yang belum dibayarkan: Rp.${unpaidTotalPrice.toLocaleString(
        "id-ID"
      )}\n` +
      `└─\n` +
      `\n\n` +
      `*List Pemesanan Produk Kamu*\n\n` +
      `${displayOrderData}\n` +
      `\n` +
      `─────────────────────\n` +
      `Untuk menghapus/membatalkan pemesanan gunakan perintah:\n` +
      `*!batal [Order-ID]*, contoh: *!batal ORD-ID-123ABC*\n` +
      `Kamu tidak dapat menghapus data pemesanan yang statusnya sudah selesai.\n` +
      `\n`;

    if (page < 1 || isNaN(page) || page > totalPages) {
      const message = `*Invalid!*\n\nHalaman keranjang yang kamu masukan tidak valid atau tidak dapat ditemukan!`;
      return {
        status: "invalid",
        message,
      };
    }
    return {
      status: "success",
      message,
    };
  }

  /**
   *
   * @param { import("@interface/customer").Customer } customer
   */
  static distributeCustomerOrderData(customer) {
    const {
      metadata,
      data: { purchaseHistory },
    } = customer;
    const orders = {
      confirmed: purchaseHistory.filter((v) => v.isCompleted),
      unconfirmed: purchaseHistory.filter((v) => !v.isCompleted),
      unpaid: purchaseHistory.filter((v) => !v.isPayed),
      unpaidPrice: purchaseHistory
        .filter((v) => !v.isPayed)
        .reduce((t, v) => t + v.data.totalPrice, 0),
    };

    const ongoingOrders = orders.unconfirmed.map((v, idx) => {
      const {
        orderId,
        timeStamp,
        isPayed,
        payedVia,
        data: { productName, price, quantity, totalPrice, additionalInfo },
      } = v;
      const msg =
        `┌─[ ${idx + 1} ]\n` +
        `│ ORD-ID: ${orderId}\n` +
        `│ Status Pembayaran: ${isPayed ? payedVia : "belum dibayarkan"}\n` +
        `│ Waktu Pemesanan: ${timeStamp}\n` +
        `├─\n` +
        `│ Nama Produk: ${productName.substring(0, 60)}\n` +
        `│ Harga/pcs: Rp.${price.toLocaleString("id-ID")}\n` +
        `│ Jumlah Pemesanan: ${quantity} pcs\n` +
        `│ Total Harga: Rp.${totalPrice.toLocaleString("id-ID")}\n` +
        `└─\n` +
        `*Informasi Tambahan*\n` +
        `${additionalInfo}\n`;
      return msg;
    });
    const displayOngoingOrders =
      orders.unconfirmed.length > 0
        ? ongoingOrders.join("\n\n")
        : "*Kamu tidak memiliki data pemesanan, silahkan lakukan pemesanan agar dapat ditampilkan.*";
    const report =
      `\n🛒 *Data Keranjang Customer*\n\n` +
      `┌─\n` +
      `│ Total pesanan yang selesai: ${orders.confirmed.length} pesanan\n` +
      `│ Total pesanan yang belum selesai: ${orders.unconfirmed.length} pesanan\n` +
      `│ Total pesanan yang belum dibayarkan: ${orders.unpaid.length} pesanan\n` +
      `│ Total belum dibayarkan: Rp.${orders.unpaidPrice.toLocaleString(
        "id-ID"
      )}\n` +
      `└─\n` +
      `\n\n` +
      `*List Pemesanan Produk Kamu Yang Sedang Berlangsung*\n\n` +
      `${displayOngoingOrders}` +
      `\n` +
      `─────────────────────\n` +
      `Untuk menghapus/membatalkan pemesanan gunakan perintah:\n` +
      `*/batal [Order-ID]*, contoh: */batal ORD-ID-123ABC*\n` +
      `Kamu tidak dapat menghapus data pemesanan yang statusnya sudah selesai.\n\n` +
      `Untuk mengakses data pemesanan yang sudah selesai gunakan perintah */pesanan-saya*.\n`;

    return {
      metadata,
      report,
      orders,
    };
  }

  /**
   *
   * @param { import("./types").CustomerOrderData } customerOrderData
   */
  static displayCustomerDeleteBucket(customerOrderData) {
    const { orderId, timeStamp, data } = customerOrderData;
    const caption =
      `\n*Berhasil Menghapus Data Pemesanan!*\n\n` +
      `Order-ID: ${orderId}\n` +
      `Tanggal Pemesanan: ${timeStamp}\n` +
      `\n` +
      `Nama Produk: ${data.productName}\n` +
      `Harga/pcs: Rp.${data.price.toLocaleString("id-ID")}\n` +
      `Jumlah Pemesanan: ${data.quantity} pcs\n` +
      `Total Harga: Rp.${data.totalPrice.toLocaleString("id-ID")}\n` +
      `Catatan/Note:\n${data.additionalInfo}\n\n` +
      `_Silahkan cek perubahan pada *!keranjang*_\n`;
    return { caption };
  }

  /**
   *
   * @param { import("@libs/types/schema").CustomerTopUpData } customerTopUpData
   */
  static displayCustomerTopupData(customerTopUpData) {
    const { transactionId, isVerified, timeStamp, metadata, data } =
      customerTopUpData;
    const caption =
      `\n*Upload Bukti Top-Up Berhasil!*\n\n` +
      `*Data Customer*\n` +
      `Nama: ${metadata.tagName}\n` +
      `No. Telp: ${metadata.phoneNumber}\n\n` +
      `*Data Top-Up*\n` +
      `ID Transasksi Top-Up: ${transactionId}\n` +
      `Top-Up Via: *${data.topUpVia}*\n` +
      `Total Top-Up: *Rp.${data.amountTopUp.toLocaleString("id-ID")}*\n` +
      `Status: ${isVerified ? "" : "Menunggu verifikasi dari Admin"}\n` +
      `Tanggal: ${timeStamp}\n`;
    return { caption };
  }

  /**
   *
   * @param { import("@libs/types/schema"). } customerData
   * @param { { page: number; pageSize: number } } paginationData
   * @returns { { status: "success" | "invalid"; message: string } }
   */
  static displayCustomerBucketsss(customerData, paginationData) {
    const { data } = customerData;
    const { page, pageSize } = paginationData;
    const checkoutPurchaseData = data.payment.purchaseHistory;
    const orderPurchaseData = data.payment.spendingHistory;
    const inComplete = {
      byCheckout: checkoutPurchaseData.filter((order) => !order.isCompleted)
        .length,
      byOrder: orderPurchaseData.filter((order) => !order.isCompleted).length,
    };
    const incompleteCheckoutTotalPrice = checkoutPurchaseData
      .filter((purchase) => !purchase.isCompleted)
      .reduce((total, purchase) => total + purchase.data.totalPrice, 0);

    // Calculate the start and end indices based on the page and pageSize.
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const dataByOrder = orderPurchaseData
      .slice(startIndex, endIndex)
      .map((data, idx) => {
        const { orderId, isCompleted, timeStamp, data: recordData } = data;
        const { productName, price, quantity, totalPrice, additionalInfo } =
          recordData;
        const statusVerified = isCompleted
          ? `Sudah dikonfirmasi Admin`
          : `Belum dikonfirmasi Admin`;
        const msg =
          `┏━[ No.${idx + 1} ]\n` +
          `┃ OrderID: *${orderId}*\n` +
          `┃ Status: *${statusVerified}*\n` +
          `┃ Waktu Pemesanan: *${timeStamp}*\n` +
          `┣━` +
          `┃ Nama Produk: *${productName}*\n` +
          `┃ Harga/pcs: *Rp.${price.toLocaleString("id-ID")}*\n` +
          `┃ Jumlah yang dipesan: *${quantity} pcs*\n` +
          `┃ Total yang sudah dibayarkan: *Rp.${totalPrice.toLocaleString(
            "id-ID"
          )}*\n` +
          `┃ Catatan/Note:\n` +
          `┃ ${additionalInfo.substring(0, 55)}...\n` +
          `┗━`;
        return msg;
      })
      .join("\n\n");

    const dataByCheckout = checkoutPurchaseData
      .slice(startIndex, endIndex)
      .map((data, idx) => {
        const { orderId, isCompleted, timeStamp, data: recordData } = data;
        const { productName, price, quantity, totalPrice, additionalInfo } =
          recordData;
        const statusVerified = isCompleted
          ? `Sudah dikonfirmasi Admin`
          : `Menunggu pembayaran dan verifikasi pembayaran`;
        const msg =
          `┏━[ No.${idx + 1} ]\n` +
          `┃ OrderID: *${orderId}*\n` +
          `┃ Status: *${statusVerified}*\n` +
          `┃ Waktu Pemesanan: *${timeStamp}*\n` +
          `┣━\n` +
          `┃ Nama Produk: *${productName}*\n` +
          `┃ Harga/pcs: *Rp.${price.toLocaleString("id-ID")}*\n` +
          `┃ Jumlah yang dipesan: *${quantity} pcs*\n` +
          `┃ Total pembayaran: *Rp.${totalPrice.toLocaleString("id-ID")}*\n` +
          `┃ Catatan/Note:\n` +
          `┃ ${additionalInfo.substring(0, 55)}...\n` +
          `┗━`;
        return msg;
      })
      .join("\n\n");

    const displayDataOrder =
      orderPurchaseData.length > 0
        ? dataByOrder
        : "*Belum pernah melakukan pemesanan via Order.";
    const displayDataCheckout =
      checkoutPurchaseData.length > 0
        ? dataByCheckout
        : "*Belum pernah melakukan pemesanan via Checkout.";
    const totalData = [...orderPurchaseData, ...checkoutPurchaseData].length;
    const totalSorted = [
      ...checkoutPurchaseData.slice(startIndex, endIndex),
      ...orderPurchaseData.slice(startIndex, endIndex),
    ].length;
    const totalPages = Math.ceil(totalData / pageSize);
    const message =
      `\n🛒 *Data Keranjang Customer*\n\n` +
      `┏━\n` +
      `┃ Halaman *${page}* dari *${totalPages}* halaman.\n` +
      `┃ Menampilkan *${totalSorted} pemesanan* dari *${totalData} data pemesanan*\n` +
      `┣━\n` +
      `┃ Hints:\n` +
      `┃ Untuk berganti halaman gunakan perintah\n` +
      `┃ *!keranjang [halaman keranjang]*\n` +
      `┗━\n\n` +
      `📗 *Daftar Pemesanan/Pembelian Via Order:*\n\n` +
      `${displayDataOrder}\n\n` +
      `📘 *Daftar Pemesanan/Pembelian Via Checkout:*\n\n` +
      `${displayDataCheckout}\n\n` +
      `┏━\n` +
      `┃ 📦 Total pesanan yang belum dibayarkan: ${inComplete.byCheckout} pesanan\n` +
      `┃ 📦 Total pesanan yang belum dikonfirmasi Admin: ${inComplete.byOrder} pesanan\n` +
      `┃ 💵 Total pembayaran yang belum dibayarkan: Rp.${incompleteCheckoutTotalPrice.toLocaleString(
        "id-ID"
      )}\n` +
      `┗━\n\n` +
      `Note:\n` +
      `Kamu bisa menghapus/membatalkan pemesanan dengan menggunakan perintah *!batal [Order-ID]-XXX*\n\n` +
      `Contoh: *!batal Order-ID-123ABCDE*\n\n` +
      `Perlu diketahui Kamu tidak dapat menghapus pemesanan yang sudah selesai (diverifikasi/dikonfirmasi) diproses Admin sebelumnya!\n`;

    if (page < 1 || page > totalPages || isNaN(page)) {
      const message = `*Invalid!*\n\nHalaman keranjang yang kamu masukan tidak valid atau tidak dapat ditemukan!`;
      return {
        status: "invalid",
        message,
      };
    }
    return {
      status: "invalid",
      message,
    };
  }

  /**
   *
   * @param { import("@interface/payment").CustomerPaymentProof } customerPaymentProof
   */
  static displayCustomerOrderCancelation(customerPaymentProof) {
    const { orderId, transactionId, timeStamp, metadata, data } =
      customerPaymentProof;
    const msg = `Dear Customer ${
      metadata.tagName
    }, pembayaran Kamu dengan ID transaksi *${transactionId}* telah ditolak oleh Admin.

Detail Pembayaran:
ID Transaksi: ${transactionId}
Pembayaran via: ${metadata.paymentVia}
Waktu Upload Pembayaran: ${timeStamp}

Detail Pemesanan:
Oder ID: ${orderId}
Nama Produk: ${data.productName}
Jumlah: ${data.quantity} pcs
Harga Total: Rp.${data.totalPrice.toLocaleString("id-ID")}
${data.additionalInfo}`;
    return {
      phoneId: metadata.phoneNumber + "@s.whatsapp.net",
      caption: msg,
      base64Image: metadata.image,
    };
  }
}

module.exports = { CustomerInterface };
