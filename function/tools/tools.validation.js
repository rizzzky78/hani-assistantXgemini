class Validation {
  /**
   * Performs eval on value input
   * @param { string } v values
   */
  static evaluate(v) {
    return Boolean(Number(v)) && Number(v) > 0;
  }
  /**
   * **Validate Query Create Product**
   * @param { import("@interface/query-parts").QueryPartsCreateProduct } queryParts
   */
  static validateQueryPartsCreateProduct(queryParts) {
    const [titleProduct, category, price, stock, description] = queryParts;
    const validation = {
      isValidCategory: ["herbal", "beverages", "cosmetics"].includes(
        category.trim()
      ),
      isValidTitle: titleProduct.length >= 5,
      isValidPrice: !isNaN(price.trim()),
      isValidStock: !isNaN(stock.trim()),
      isValidDescription: description.length >= 10,
    };
    const warnings = {
      category: validation.isValidCategory
        ? ""
        : "query ke-1 - !upload ** # [Nama Produk] # [Harga] # [Stok] # [Deskripsi].\nKategori produk hanya dapat berupa: *herbal, beverages, dan cosmetics*!",
      titleProduct: validation.isValidTitle
        ? ""
        : "query ke-2 - !upload *[Nama Produk]* # [Harga] # [Stok] # [Deskripsi].\nNama Produk harus terdiri lebih dari 5 huruf!",
      price: validation.isValidPrice
        ? ""
        : "query ke-3 - !upload [Nama Produk] # *[Harga]* # [Stok] # [Deskripsi].\nHarga Produk harus berupa angka!",
      stock: validation.isValidStock
        ? ""
        : "query ke-4 - !upload [Nama Produk] # [Harga] # *[Stok]* # [Deskripsi].\nStok Produk harus berupa angka!",
      description: validation.isValidDescription
        ? ""
        : "query ke-5 - !upload [Nama Produk] # [Harga] # [Stok] # *[Deskripsi]*.\nDeskripsi produk setidaknya memiliki panjang lebih dari 10 huruf!",
    };
    /**
     * @type { string[] }
     */
    const invalidQueries = [];
    for (const key in warnings) {
      if (warnings[key]) {
        invalidQueries.push(warnings[key]);
      }
    }
    const summary = invalidQueries.join("\n\n");
    /**
     * Summary of invalid queryParts
     */
    const summaryWarning =
      `*Perintah tidak valid!*, dikarenakan:\n\n` + `${summary}`;
    return { validation, summaryWarning };
  }

  /**
   *
   * @param { import("@interface/product").FormFieldProductData } formFieldData
   * @returns
   */
  static validateCreateProductFormInput(formFieldData) {
    const [
      title,
      category,
      price,
      memberPrice,
      stock,
      poin,
      weight,
      description,
    ] = formFieldData;
    const validations = {
      isValTitle: title.length <= 4,
      isValCategory: !["herbal", "beverages", "cosmetics"].includes(
        category.toLowerCase()
      ),
      isValPrice: !this.evaluate(price),
      isValMemberPrice: !this.evaluate(memberPrice),
      isValStock: !this.evaluate(stock),
      isValPoin: !this.evaluate(poin),
      isValWeight: !this.evaluate(weight),
      isValDesc: description.length <= 10,
    };
    const warnings = {
      validTitle:
        validations.isValTitle && `- Nama Produk harus lebih dari 4 huruf!`,
      validCategory:
        validations.isValCategory &&
        `- Kategori produk hanya dapat berupa "herbal", "beverages", dan "cosmetics".`,
      validPrice:
        validations.isValPrice && `- Harga produk harus berupa angka positif!`,
      validMemberPrice:
        validations.isValMemberPrice &&
        `- Harga Member harus berupa angka positif!`,
      validStock:
        validations.isValStock && `- Stok produk harus berupa angka positif!`,
      validPoin:
        validations.isValPoin && `- Poin produk harus berupa angka positif!`,
      validWeight:
        validations.isValWeight && `- Berat produk harus berupa angka positif!`,
      validDescription:
        validations.isValDesc &&
        `- Deskripsi Produk harus memiliki lebih dari 10 karakter!`,
    };
    const invalidQueries = Object.values(warnings).filter(Boolean);
    const summaryWarning = invalidQueries.length
      ? `*Perintah tidak valid!*\nDikarenakan:\n\n${invalidQueries.join(
          "\n"
        )}\n\nSilahkan ubah form sesuai dengan ketentuan yang ada.`
      : "";
    const status = Object.values(validations).every((valid) => !valid);
    return {
      status,
      message: status ? "success" : summaryWarning,
      data: {
        title,
        category,
        price,
        memberPrice,
        stock,
        poin,
        weight,
        description,
      },
    };
  }

  /**
   *
   * @param { import("@interface/query-parts").QueryPartsUpdateProduct } queryParts
   */
  static validateQueryPartsUpdateProduct(queryParts) {
    const [productId, matchKeyUpdate, inputValue] = queryParts.map((v) =>
      v.trim()
    );
    const existingMatchKey = [
      "nama",
      "kategori",
      "harga",
      "stok",
      "deskripsi",
      "gambar",
    ];

    /** @type { boolean } */
    let statusValidation;
    /** @type { string } */
    let msgError;
    switch (matchKeyUpdate) {
      case "nama":
        {
          statusValidation = inputValue.length >= 5;
          msgError = "Nama produk harus lebih dari 5 huruf!";
        }
        break;
      case "kategori":
        {
          statusValidation = ["herbal", "beverages", "cosmetics"].includes(
            inputValue
          );
          msgError =
            "Kategori harus berupa: *heerbal*, *beverages*, dan *cosmetics*!";
        }
        break;
      case "harga":
        {
          statusValidation = !isNaN(inputValue.trim());
          msgError = "Harga harus berupa angka!";
        }
        break;
      case "stok":
        {
          statusValidation = !isNaN(inputValue.trim());
          msgError = "Stok harus berupa angka!";
        }
        break;
      case "deskripsi":
        {
          statusValidation = inputValue.length >= 10;
          msgError = "Deskripsi produk setidaknya lebih dari 10 huruf!";
        }
        break;
    }

    const validation = {
      isValidProductId: productId.length > 5,
      isValidMatchKeyUpdate: existingMatchKey.includes(matchKeyUpdate),
      isValidInputValue: statusValidation,
    };
    const warnings = {
      productId: validation.isValidProductId
        ? ""
        : "query ke-1 - !editproduk *[ID produk]* # [key update] # [value].\nProduk ID yang kamu masukan tidak valid!, silahkan cek ulang.",
      matchKeyUpdate: validation.isValidMatchKeyUpdate
        ? ""
        : "query ke-2 - !editproduk [ID produk] # *[key update]* # [value].\nKey Update yang kamu masukan tidak valid!, berikut adalah key update yang tersedia:\n- nama\n- kategori\n- harga\n- stok\n- deskripsi\n- gambar\n\nPerlu diketahui untuk key update *gambar* tidak memerlukan value melainkan gambar produk yang diupload.",
      inputValue: validation.isValidInputValue
        ? ""
        : `query ke-2 - !editproduk [ID produk] # [key update] # *[value]*.\n${msgError}`,
    };
    /**
     * @type { string[] }
     */
    const invalidQueries = [];
    for (const key in warnings) {
      if (warnings[key]) {
        invalidQueries.push(warnings[key]);
      }
    }
    const summary = invalidQueries.join("\n\n");
    /**
     * Summary of invalid queryParts
     */
    const summaryWarning =
      `*Perintah tidak valid!*, dikarenakan:\n\n` + `${summary}`;
    return { validation, summaryWarning };
  }

  /**
   * @param { string[] } data
   */
  static validateInputEditProduct(data) {
    const [
      productId,
      title,
      category,
      price,
      memberPrice,
      stock,
      poin,
      weight,
      description,
    ] = data;

    const validations = {
      isValProductId: productId.length !== 6,
      isValTitle: title.length <= 4,
      isValCategory: !["herbal", "beverages", "cosmetics"].includes(
        category.toLowerCase()
      ),
      isValPrice: !this.evaluate(price),
      isValMemPrice: !this.evaluate(memberPrice),
      isValStock: !this.evaluate(stock),
      isValPoin: !this.evaluate(poin),
      isValWeight: !this.evaluate(weight),
      isValDesc: description.length <= 10,
    };

    const warnings = {
      validProductId: validations.isValProductId && `ID produk tidak valid!`,
      validTitle:
        validations.isValTitle && `- Nama Produk harus lebih dari 4 huruf!`,
      validCategory:
        validations.isValCategory &&
        `- Kategori produk hanya dapat berupa "herbal", "beverages", dan "cosmetics".`,
      validPrice:
        validations.isValPrice &&
        `- Harga non Member produk harus berupa angka positif!`,
      validMemPrice:
        validations.isValMemPrice &&
        `- Harga Member produk harus berupa angka positif!`,
      validStock:
        validations.isValStock && `- Stok produk harus berupa angka positif!`,
      validPoin:
        validations.isValPoin && `- Poin produk harus berupa angka positif!`,
      validWeight:
        validations.isValWeight &&
        `- Berat (gr) produk harus berupa angka positif!`,
      validDescription:
        validations.isValDesc &&
        `- Deskripsi Produk harus memiliki lebih dari 10 karakter!`,
    };

    const invalidQueries = Object.values(warnings).filter(Boolean);

    const summaryWarning = invalidQueries.length
      ? `*Perintah tidak valid!*\nDikarenakan:\n\n${invalidQueries.join(
          "\n"
        )}\n\nSilahkan ubah form sesuai dengan ketentuan yang ada.`
      : "";

    const status = Object.values(validations).every((valid) => !valid);

    return {
      status,
      message: status ? "success" : summaryWarning,
      data: {
        productId,
        title,
        category,
        price,
        memberPrice,
        stock,
        poin,
        weight,
        description,
      },
    };
  }

  /**
   *
   * @param { "order" | "checkout" | "konfirmasi_order" | "konfirmasi_checkout" } typeCmd
   * @param { import("@libs/types/purchase").QueryPartsCustomerMakeOrderProduct } queryParts
   */
  static validateQueryPartsCustomerOrderProduct(typeCmd, queryParts) {
    const [productId, qtyAmount, additionalInfo] = queryParts;
    const validation = {
      isValidProductId: productId.length !== 6,
      isValidQtyAmount: !isNaN(qtyAmount),
      isValidAdditionalInfo: additionalInfo.length >= 10,
    };
    const warnings = {
      arg_productId: validation.isValidProductId
        ? ""
        : `query ke-1 - !${typeCmd} *[IP Produk]* # [Jumlah Pemesanan] # [Informasi Tambahan].\nID Produk yang Kamu masukan tidak valid!`,
      arg_qtyAmount: validation.isValidQtyAmount
        ? ""
        : `query ke-2 - !${typeCmd} [ID Produk] # *[Jumlah Pemesanan]* # [Informasi Tambahan].\nJumlah pemesanan produk harus berupa angka!`,
      arg_additionalInfo: validation.isValidAdditionalInfo
        ? ""
        : `query ke-3 - !${typeCmd} [ID Produk] # [Jumlah Pemsanan] # *[Informasi Tambahan]*.\nInformasi Tambahan setidaknya memuat beberapa kata terkait detail pemesanan Kamu seperti (alamat, request tertentu, dll).`,
    };
    /**
     * @type { string[] }
     */
    const invalidQueries = [];
    for (const key in warnings) {
      if (warnings[key]) {
        invalidQueries.push(warnings[key]);
      }
    }
    const summary = invalidQueries.join("\n\n");
    const summaryWarning =
      `*Perintah tidak valid!*, dikarenakan:\n\n` + `${summary}`;
    return { validation, summaryWarning };
  }

  /**
   *
   * @param { string } phoneNumber The user wants to verify
   * @param { import("@config/types").AdminDataDto } adminDataDto Static Admin Data
   */
  static validateAdmin(phoneNumber, adminDataDto) {
    const { superAdmin, adminData } = adminDataDto;
    if (superAdmin.phoneNumber === phoneNumber) {
      return true;
    }
    const isAdminFromAdminData = adminData.some(
      (admin) => admin.phoneNumber === phoneNumber
    );
    return isAdminFromAdminData;
  }
}

module.exports = Validation;
