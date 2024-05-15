const {
  collections: {
    customer,
    product,
    customerOrderData,
    approvalOrderData,
    customerPaymentProof,
    imageData,
  },
} = require("@database/router");

const {
  IDGenerator,
  Converter,
  Tools,
  RajaOngkir,
} = require("@function/tools");
const logger = require("@libs/utils/logger");

/**
 * **Controllers: Moderation**
 *
 * Performs Async Operations:
 * - `createProduct(createProductDto)`
 * - `editProduct(productId, dto)`
 * - `checkStockProduct(productId, amount)`
 * - `updateStockProduct(productId, changes)`
 * - `deleteProduct(productId)`
 * - `validateProductById(productId)`
 * - `getProduct(productId)`
 * - `searchProductByTitle(productName)`
 * - `getAllProduct()`
 * - `getProductByCategory(category)`
 * - `validateCustomerOrder(orderId)`
 * - `validateExistingPaymentProof(orderId)`
 * - `upsertCustomerOrder(upsertDataDto)`
 * - `deleteCustomerOrders(orderId)`
 * - `getCustomerOrder(orderId)`
 * - `getBatchCustomerOrders()`
 * - `getCustomerOrderByTrxId(transactionId)`
 * - `getCustomerPaymentProof(transactionId)`
 * - `getBatchCustomerPaymentProof()`
 * - `upsertApprovalOrderData(customerOrderData)`
 * - `getApprovalOrderData(orderId)`
 * - `getBatchApprovalOrderData()`
 */
class Moderation {
  /**
   * **Create Product**
   *
   * Params data-transfer-object:
   * - `category` - "herbal" | "beverages" | "cosmetics"
   * - `title` - string
   * - `price` - number
   * - `stock` - number
   * - `image` - Buffer
   * - `description` - string
   * @param { import("@interface/controllers/admin").CreateProductDto } createProductDto
   * @return { Promise<import("@interface/controllers/admin").CreateProductCallback> }
   */
  static async createProduct(createProductDto) {
    const {
      title,
      category,
      price,
      memberPrice,
      stock,
      poin,
      weight,
      image,
      description,
    } = createProductDto;
    /**
     * Raw Data
     * @type { import("@interface/product").Product }
     */
    const productData = {
      productId: IDGenerator.generateProductId(),
      timeStamp: Tools.getDate(),
      data: {
        title: title.trim(),
        category: category.trim().toLowerCase(),
        price: parseInt(price),
        memberPrice: parseInt(memberPrice),
        stock: parseInt(stock),
        sold: 0,
        poin: parseInt(poin),
        weight: parseInt(weight),
        image: await Converter.bufferToBase64Converter(image),
        description: description.trim(),
      },
    };
    const insertProduct = await product.insertOne(productData);
    return {
      status: insertProduct ? "success" : "failed",
      data: insertProduct ? productData : null,
    };
  }

  /**
   *
   * @param { string } productId
   * @param { import("@interface/controllers/admin").EditProductDto } dto
   */
  static async editProduct(productId, dto) {
    const dtos = dto;
    const mutateProductData = await product.findOneAndUpdate(
      { productId: productId.trim().toUpperCase() },
      {
        $set: {
          "data.title": dtos.title.trim(),
          "data.category": dtos.category.toLowerCase(),
          "data.price": parseInt(dtos.price),
          "data.memberPrice": parseInt(dtos.memberPrice),
          "data.stock": parseInt(dtos.stock),
          "data.poin": parseInt(dtos.poin),
          "data.weight": parseInt(dtos.weight),
          "data.description": dtos.description.trim(),
          "data.image": await Converter.bufferToBase64Converter(dtos.image),
        },
      },
      {
        returnDocument: "after",
      }
    );
    return {
      status: mutateProductData ? "success" : "failed",
      data: mutateProductData ? dtos : null,
    };
  }

  /**
   * Check stock product, to make sure customer pass order data
   * if the stock is available.
   * @param { { productId: string; amount: number } } dto
   */
  static async checkStockProduct({ productId, amount }) {
    const {
      data: { stock },
    } = await product.findOne({
      productId: productId.trim().toUpperCase(),
    });
    return stock >= amount ? true : false;
  }

  /**
   *
   * @param { string } productId
   * @param { number } changes Amount to decrement
   * @returns { Promise<import("@interface/controllers/admin").UpdateStockProductCallback> }
   */
  static async updateStockProduct(productId, changes) {
    const productData = await product.findOne({ productId });
    if (productData.data.stock >= changes) {
      const updateStock = await product.findOneAndUpdate(
        {
          productId,
        },
        {
          $inc: {
            "data.stock": -changes,
          },
        },
        {
          returnDocument: "after",
        }
      );
      return {
        status: "success",
        data: updateStock,
      };
    }
    return {
      status: "invalid-qty",
      data: null,
    };
  }

  /**
   *
   * @param { { buckets: import("@interface/customer").Buckets[] } } dto
   * @returns { Promise<import("@interface/controllers/admin").BulkUpdateStockProductCallback> }
   */
  static async bulkUpdateStockProduct({ buckets }) {
    /**
     * @type { import("mongodb").AnyBulkWriteOperation<import("@interface/product").Product>[] }
     */
    const bulkOperations = [];
    /**
     * @type { { productId: string; productName: string; validaion: "fail" | "pass"; throwStock: number; demand: number }[] }
     */
    const validationReport = [];

    for (const { productId, qtyAmount } of buckets) {
      const { data } = await product.findOne({ productId });
      if (data.stock < qtyAmount) {
        validationReport.push({
          productId,
          productName: data.title,
          validaion: "fail",
          throwStock: data.stock,
          demand: qtyAmount,
        });
      }
      bulkOperations.push({
        updateOne: {
          filter: { productId },
          update: {
            $inc: { "data.stock": -qtyAmount, "data.sold": qtyAmount },
          },
        },
      });
    }

    if (validationReport.length >= 1) {
      const mapped = validationReport
        .map(
          (v) =>
            `*${v.productName}*\nID Produk: ${v.productId}\nStok Sekarang: ${v.throwStock}\nPermintaan: ${v.demand}`
        )
        .join("\n\n");
      const caption =
        `*Gagal mengkonfirmasi pemesanan*, dikarenakan terdapat stok produk yang tidak memenuhi pemesanan.\n\n` +
        `*Daftar Produk Dengan Stok Bermasalah:*\n` +
        `${mapped}\n\n` +
        `Silahkan update stok produk terlebih dahulu agar bisa melanjutkan proses pemesanan.\n\n` +
        `Ketik *edit ID Produk*, contoh: *edit 123ABC*\n\n` +
        `Untuk mengedit data produk.`;
      return {
        status: "inv-qty",
        message: caption,
        data: null,
      };
    } else {
      const result = await product.bulkWrite(bulkOperations);
      return {
        status: result.isOk() ? "success" : "failed",
        data: result.isOk() ? result : null,
      };
    }
  }

  /**
   *
   * @param { string } productId
   * @returns { Promise<import("@interface/controllers/admin").DeleteProductCallback> }
   */
  static async deleteProduct(productId) {
    const successDeleteProduct = await product.findOneAndDelete({
      productId: productId.trim().toUpperCase(),
    });
    return {
      status: successDeleteProduct ? "success" : "failed",
      data: successDeleteProduct ? successDeleteProduct : null,
    };
  }

  /**
   * Validate productId in `Product` collections, if exist it will return `true`
   * @param { string } productId
   */
  static async validateProductById(productId) {
    return Boolean(
      await product.findOne({
        productId: productId.trim().toUpperCase(),
      })
    );
  }

  /**
   * Get single **Product** data based on `productId` in `Product` collections
   * @param { string } productId
   */
  static async getProduct(productId) {
    return await product.findOne({
      productId: productId.trim().toUpperCase(),
    });
  }

  /**
   * Query search **Product** data by product name (partially)
   * @param { string } productName
   * @returns { Promise<import("@interface/controllers/admin").SerachProductByTitleCallback> }
   */
  static async searchProductByTitle(productName) {
    const products = await product
      .find({
        "data.title": {
          $regex: new RegExp(productName.trim(), "i"),
        },
      })
      .toArray();
    return {
      status: products.length > 0 ? "success" : "failed",
      data: products.length > 0 ? products : null,
    };
  }

  /**
   *
   * @returns { Promise<import("@interface/controllers/admin").ReadBatchProductCallback> }
   */
  static async getAllProduct() {
    const productData = await product.find().toArray();
    return {
      status: productData.length <= 0 ? "no-products" : "success",
      data: productData.length <= 0 ? null : productData,
    };
  }

  /**
   *
   * @param { import("@interface/product").ProductCategory } category
   * @returns { Promise<import("@interface/controllers/admin").GetProductByCategoryCallback> }
   */
  static async getProductByCategory(category) {
    const products = await product
      .find({ "data.category": category })
      .toArray();
    return {
      status: products.length > 0 ? "success" : "no-products",
      data: products.length > 0 ? products : null,
    };
  }

  /* ================ */

  /**
   *
   * @param { Buffer } buff
   */
  static async createKeypairImages(buff) {
    const data = {
      /**
       * Key of images
       */
      key: IDGenerator.generateKeyImages(),
      timeStamp: Tools.getDate(),
      base64: await Converter.bufferToBase64Converter(buff),
    };
    const append = await imageData.insertOne(data);
    return append ? data : null;
  }

  /**
   *
   * @param { string } key
   */
  static async getKeyPairImages(key) {
    return await imageData.findOne({ key });
  }

  /* ================ */

  /**
   * *Validate Customer Orders Data**
   *
   * Perform validating customer orders data by `orderId`.
   * @param { string } orderId
   * @returns
   */
  static async validateCustomerOrder(orderId) {
    return Boolean(
      await customerOrderData.findOne({
        "data.orderId": orderId.trim().toUpperCase(),
      })
    );
  }

  /**
   *
   * @param { string } transactionId
   */
  static async validateExistingPaymentProof(transactionId) {
    return Boolean(
      await customerPaymentProof.findOne({
        "metadata.transactionId": transactionId,
      })
    );
  }

  /**
   *
   * @param { { orderId: string, transactionId: string } } dto
   */
  static async validateBothOrderAndPaymentProof({ orderId, transactionId }) {
    return {
      isOrder: await this.validateCustomerOrder(orderId),
      isTransaction: await this.validateExistingPaymentProof(transactionId),
    };
  }

  /**
   *
   * @param { string } phoneNumber
   * @returns { Promise<import("@interface/controllers/admin").ValidateStatusOrderCallback> }
   */
  static async validateStatusOrder(phoneNumber) {
    const custOrders = await customerOrderData
      .find({ ordererId: phoneNumber })
      .toArray();
    const orderData = custOrders.filter((v) => v.status !== "completed");
    if (orderData.length === 0) {
      return {
        status: "never-order",
        orderId: null,
      };
    } else {
      const [
        {
          status: statusOrder,
          data: { orderId },
        },
      ] = orderData;
      return {
        status: statusOrder,
        orderId,
      };
    }
  }

  /**
   *
   * @param { string } orderId
   * @returns { Promise<import("@interface/controllers/admin").ForwardCustomerOrderCallback> }
   */
  static async forwardCustomerOrder(orderId) {
    const orderData = await customerOrderData.findOneAndUpdate(
      { "data.orderId": orderId },
      {
        $set: {
          status: "forwarded",
        },
      },
      { returnDocument: "after" }
    );
    return {
      status: orderData ? "sucess" : "fail",
      orders: orderData ? orderData : null,
    };
  }

  /**
   * **Get Customer Orders Data**
   *
   * Perform getting single `CustomerOrderData` by `orderId`.
   * This collection data scope is global and also mutable.
   * @param { string } orderId
   */
  static async getCustomerOrder(orderId) {
    return await customerOrderData.findOne({
      "data.orderId": orderId,
    });
  }

  /**
   *
   * @param { string } orderId
   */
  static async deleteOneCustomerOrder(orderId) {
    return Boolean(
      await customerOrderData.findOneAndDelete({
        "data.orderId": orderId,
      })
    );
  }

  static async getBatchCustomerOrders() {
    return await customerOrderData.find().toArray();
  }

  /**
   *
   * @param { string } transactionId
   */
  static async getCustomerPaymentProof(transactionId) {
    return await customerPaymentProof.findOne({
      "metadata.transactionId": transactionId.toUpperCase(),
    });
  }

  /**
   *
   * @param { string } transactionId
   */
  static async deleteOneCustomerPaymentProof(transactionId) {
    return Boolean(
      await customerPaymentProof.findOneAndDelete({
        "metadata.transactionId": transactionId,
      })
    );
  }

  static async getBatchCustomerPaymentProof() {
    return await customerPaymentProof.find().toArray();
  }

  /**
   *
   * @param { string } orderId
   */
  static async getApprovalOrderData(orderId) {
    return await approvalOrderData.findOne({ orderId: orderId.trim() });
  }

  static async getBatchApprovalOrderData() {
    return await approvalOrderData.find().toArray();
  }

  /**
   *
   * @param { string } invoiceId
   */
  static async validateInvoiceId(invoiceId) {
    return Boolean(
      await approvalOrderData.findOne({ "invoice.invoiceId": invoiceId })
    );
  }

  /**
   *
   * @param { string } invoiceId
   * @returns { Promise<import("@interface/controllers/admin").GetOrderDetailsCallback> }
   */
  static async getOrdersDetails(invoiceId) {
    const approvalData = await approvalOrderData.findOne({
      "invoice.invoiceId": invoiceId,
    });
    const [orderData, paymentData] = await Promise.all([
      customerOrderData.findOne({ "data.orderId": approvalData.orderId }),
      customerPaymentProof.findOne({
        "metadata.orderId": approvalData.orderId,
      }),
    ]);
    return [orderData, paymentData, approvalData];
  }
}

/**
 * **Controllers: Admin**
 *
 * Performs Async Operations:
 * - `confirmCustomerOrder(transactionId)`
 * - `cancelCustomerPayment(transactionId)`
 * - `validateCustomerPayment(transactionId)`
 * - `confirmCustomerPayment(transactionId)`
 */
class Admin {
  /**
   * **Confirm Customer Payment**
   * @param { string } trxId Transaction Id
   * @returns { Promise<import("@interface/controllers/admin").ConfirmCustomerPaymentCallback> }
   */
  static confirmCustomerPayment = async (trxId) => {
    const {
      isVerified,
      metadata: { orderId, transactionId },
      payer: { custId, phoneNumber },
      payment: { via },
    } = await Moderation.getCustomerPaymentProof(trxId);
    if (isVerified) {
      return {
        status: "confirmed",
        data: null,
      };
    } else {
      const [custChanges, payChanges, orderData] = await Promise.all([
        customer.findOneAndUpdate(
          {
            "metadata.customerId": custId,
            "data.purchaseHistory.orderId": orderId,
          },
          {
            $set: {
              "data.purchaseHistory.$.isPayed": true,
              "data.purchaseHistory.$.payedVia": via,
            },
          },
          { returnDocument: "after" }
        ),
        customerPaymentProof.findOneAndUpdate(
          { "metadata.transactionId": transactionId },
          { $set: { isVerified: true } },
          { returnDocument: "after" }
        ),
        customerOrderData.findOneAndUpdate(
          { "data.orderId": orderId },
          {
            $set: {
              "data.isPayed": true,
              "data.payedVia": via,
            },
          },
          { returnDocument: "after" }
        ),
      ]);
      const state = custChanges && payChanges && orderData ? true : false;
      const objData = {
        custPhoneId: `${phoneNumber}@s.whatsapp.net`,
        payment: payChanges,
        order: orderData,
      };
      return {
        status: state ? "success" : "failed",
        data: state ? objData : null,
      };
    }
  };

  /**
   *
   * @param { string } trxId
   * @returns { Promise<import("@interface/controllers/admin").CancelCustomerPaymentCallback> }
   */
  static cancelCustomerPayment = async (trxId) => {
    const {
      isVerified,
      metadata: { orderId, transactionId },
      payer: { custId, phoneNumber },
    } = await Moderation.getCustomerPaymentProof(trxId);
    if (isVerified) {
      return {
        status: "confirmed",
        data: null,
      };
    } else {
      const [custChanges, delOrder, delPaymProof] = await Promise.all([
        customer.findOneAndUpdate(
          {
            "metadata.customerId": custId,
            "data.purchaseHistory.orderId": orderId,
          },
          {
            $pull: {
              "data.purchaseHistory.$.orderId": orderId,
            },
          },
          { returnDocument: "after" }
        ),
        customerOrderData.findOneAndDelete({
          "data.orderId": orderId,
        }),
        customerPaymentProof.findOneAndDelete({
          "metadata.transactionId": transactionId,
        }),
      ]);
      const state = custChanges && delOrder && delPaymProof ? true : false;
      const objData = {
        custPhoneId: `${phoneNumber}@s.whatsapp.net`,
        payment: delPaymProof,
        order: delOrder,
      };
      return {
        status: state ? "success" : "failed",
        data: state ? objData : null,
      };
    }
  };

  /**
   *
   * @param { "Dropship" | "Takeaway" } orderType
   * @param { import("@interface/controllers/admin").InvoiceDto } dto
   * @returns { Promise<import("@interface/controllers/admin").CompleteCustomerOrderCallback> } dto
   */
  static completeCustomerOrder = async (orderType, dto) => {
    const {
      metadata: [orderId, transactionId],
      receiptNumber,
      adminNotes,
      image,
    } = dto;
    try {
      const {
        ordererName,
        hniId,
        data: {
          isCompleted,
          data: { buckets, totalPrice, expedition, additionalInfo },
        },
      } = await Moderation.getCustomerOrder(orderId);
      const {
        isVerified,
        payer: { custId, phoneNumber },
        payment: { via, nominal },
      } = await Moderation.getCustomerPaymentProof(transactionId);

      if (!isVerified) {
        return {
          status: "pay-unconfirmed",
          data: null,
        };
      }
      if (isCompleted) {
        return {
          status: "completed",
          data: null,
        };
      } else {
        const { status, message } = await Moderation.bulkUpdateStockProduct({
          buckets,
        });

        if (status === "inv-qty") {
          return {
            status: "inv-qty",
            message,
            data: null,
          };
        } else {
          const stateTypeOrder = orderType === "Dropship";
          const { key } = await Moderation.createKeypairImages(image);
          /**
           * @type { import("@interface/customer").CustomerInvoice }
           */
          const customerInvoice = {
            invoiceId: IDGenerator.generateInvoiceId(),
            timeStamp: Tools.getDate(),
            images: key,
          };
          /**
           * @type { import("@interface/order-data").ApprovalOrderData }
           */
          const approvalData = {
            orderType: stateTypeOrder ? "dropship" : "takeaway",
            orderId,
            transactionId,
            timeStamp: Tools.getDate(),
            invoice: customerInvoice,
            metadata: {
              custId,
              orderer: ordererName,
              phone: phoneNumber,
              hniId,
              adminNotes,
              info: additionalInfo,
            },
            payment: {
              via,
              nominal,
              product: totalPrice,
              expFees: stateTypeOrder ? expedition.fees : 0,
            },
            expedition: stateTypeOrder
              ? { ...expedition, receiptNumber }
              : { receiptNumber },
            products: buckets,
          };

          const v = {
            receiptNumber: stateTypeOrder ? receiptNumber : "Dipesan Takeaway",
          };

          /**
           * @type { Promise<[customer: import("@interface/customer").Customer, orderData: import("@interface/order-data").CustomerOrderData, approvalData: import("@interface/order-data").ApprovalOrderData]> }
           */
          let orderVia;
          if (stateTypeOrder) {
            orderVia = await Promise.all([
              customer.findOneAndUpdate(
                {
                  "metadata.customerId": custId,
                  "data.purchaseHistory.orderId": orderId,
                },
                {
                  $set: {
                    "data.purchaseHistory.$.isCompleted": true,
                    "data.purchaseHistory.$.invoices": customerInvoice,
                    "data.purchaseHistory.$.data.expedition.receiptNumber":
                      v.receiptNumber,
                    "data.purchaseHistory.$.data.recipient.adminNote":
                      adminNotes ? adminNotes : "-",
                  },
                },
                { returnDocument: "after" }
              ),
              customerOrderData.findOneAndUpdate(
                { "data.orderId": orderId },
                {
                  $set: {
                    status: "completed",
                    "data.isCompleted": true,
                    "data.data.invoices": customerInvoice,
                    "data.data.expedition.receiptNumber": v.receiptNumber,
                  },
                },
                { returnDocument: "after" }
              ),
              approvalOrderData.insertOne(approvalData),
            ]);
          }
          if (!stateTypeOrder) {
            orderVia = await Promise.all([
              customer.findOneAndUpdate(
                {
                  "metadata.customerId": custId,
                  "data.purchaseHistory.orderId": orderId,
                },
                {
                  $set: {
                    "data.purchaseHistory.$.isCompleted": true,
                    "data.purchaseHistory.$.invoices": customerInvoice,
                    "data.purchaseHistory.$.data.recipient.adminNote":
                      adminNotes ? adminNotes : "-",
                  },
                },
                { returnDocument: "after" }
              ),
              customerOrderData.findOneAndUpdate(
                { "data.orderId": orderId },
                {
                  $set: {
                    status: "completed",
                    "data.isCompleted": true,
                    "data.data.invoices": customerInvoice,
                  },
                },
                { returnDocument: "after" }
              ),
              approvalOrderData.insertOne(approvalData),
            ]);
          }

          const [custChanges, ordChanges, approvalOrd] = orderVia;
          const state = custChanges && ordChanges && approvalOrd ? true : false;
          const objData = {
            custPhoneId: `${phoneNumber}@s.whatsapp.net`,
            invoice: customerInvoice,
            order: ordChanges,
            approval: approvalData,
          };
          return {
            status: state ? "success" : "failed",
            data: state ? objData : null,
          };
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  // BELOW IS DEPRECATED

  /**
   *
   * @param { string[] } dto
   * @returns { Promise<import("@interface/controllers/admin").ConfirmCustomerOrderCallback> }
   */
  static async confirmCustomerOrder(dto) {
    try {
      const [
        orderId,
        ordererHniId,
        products,
        totalItems,
        totalPrice,
        totalPoin,
        recipientNames,
        recipientPhoneNumber,
        recipientHniId,
        fullAddreses,
        packageWeight,
        expeditionFees,
        totalExactPrice,
        adminNotes,
      ] = dto;

      const {
        ordererId,
        data: {
          data: {
            recipient: {
              fullAddress: [province, district],
            },
          },
        },
      } = await Moderation.getCustomerOrder(orderId);

      const {
        status,
        courier,
        data: {
          data: { results: rajaOngkirCourier },
        },
      } = await RajaOngkir.checkStaticCost("jne", {
        destination: district,
        weight: parseInt(packageWeight),
      });
      const realPrice = parseInt(totalExactPrice) + parseInt(expeditionFees);
      /**
       * @type { import("@interface/order-data").AdminConfirmedData }
       */
      const orderMetadata = {
        hashId: IDGenerator.generateRandom(8),
        totalExactPrice: realPrice,
        expedition: {
          origin: "Cilacap",
          provider: "JNE",
          destination: district,
          fullAddress: fullAddreses,
          packageWeight: parseInt(packageWeight),
          fees: parseInt(expeditionFees),
        },
        rajaOngkir: {
          courier,
          origin: "Cilacap",
          destination: district,
          courierResult: status ? rajaOngkirCourier : [],
        },
      };

      const [custChanges, orderChanges] = await Promise.all([
        customer.findOneAndUpdate(
          {
            "metadata.phoneNumber": ordererId,
            "data.purchaseHistory.orderId": orderId,
          },
          {
            $set: {
              "data.purchaseHistory.$.data.provider":
                orderMetadata.expedition.provider,
              "data.purchaseHistory.$.data.totalExactPrice":
                orderMetadata.totalExactPrice,
              "data.purchaseHistory.$.data.packageWeight":
                orderMetadata.expedition.packageWeight,
              "data.purchaseHistory.$.data.expeditionFees":
                orderMetadata.expedition.fees,
            },
            $push: {
              "data.purchaseHistory.$.data.recipient.rajaOngkir":
                orderMetadata.rajaOngkir.courierResult,
            },
          },
          { returnDocument: "after" }
        ),
        customerOrderData.findOneAndUpdate(
          { "data.orderId": orderId },
          {
            $set: {
              status: "confirmed",
              metadata: orderMetadata,
            },
          },
          { returnDocument: "after" }
        ),
      ]);
      const custOrder = await Moderation.getCustomerOrder(orderId);
      return {
        status: custChanges && orderChanges ? "success" : "failed",
        data: {
          ordererPhoneId: `${ordererId}@s.whatsapp.net`,
          customer: custChanges,
          order: custOrder,
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to confirm customer order");
    }
  }

  /* BELLOW IS DEPRECATED  */

  /**
   * @param { string } transactionId
   * @returns { Promise<import("@interface/controllers/admin").ConfirmCustomerOrderCallback> }
   */
  static async confirmCustomerOrderX(transactionId) {
    const {
      orderId,
      isConfirmed,
      metadata: { phoneNumber, paymentVia },
      data: { productId, quantity },
    } = await Moderation.getCustomerOrderByTrxId(transactionId);
    if (isConfirmed) {
      return {
        status: "invalid",
        data: null,
      };
    }
    const { timeStamp, data } = await Moderation.getCustomerOrder(orderId);
    /**
     * @type { import("@interface/order-data").ApprovalOrderData }
     */
    const approvalData = {
      orderId,
      timeStamp,
      payedVia: paymentVia,
      data,
    };
    const { status } = await Moderation.updateStockProduct(productId, quantity);
    if (status === "invalid-qty") {
      return {
        status: "invalid-qty",
        data: null,
      };
    }
    const [
      updateCustomerOrder,
      updateOrder,
      updateOrdData,
      upsertApprovalOrderData,
    ] = await Promise.all([
      customer.findOneAndUpdate(
        {
          "metadata.phoneNumber": phoneNumber,
          "data.purchaseHistory.orderId": orderId,
        },
        {
          $set: {
            "data.purchaseHistory.$.isCompleted": true,
            "data.purchaseHistory.$.isPayed": true,
            "data.purchaseHistory.$.payedVia": paymentVia.trim(),
          },
        }
      ),
      customerPaymentProof.findOneAndUpdate(
        {
          transactionId: transactionId.trim().toUpperCase(),
        },
        {
          $set: { isConfirmed: true },
        }
      ),
      customerOrderData.findOneAndUpdate(
        { orderId },
        {
          $set: {
            isCompleted: true,
            isPayed: true,
            payedVia: paymentVia.trim(),
          },
        }
      ),
      approvalOrderData.insertOne(approvalData),
    ]);
    if (
      updateCustomerOrder &&
      updateOrder &&
      updateOrdData &&
      upsertApprovalOrderData
    ) {
      return {
        status: "success",
        data: {
          ordererPhoneId: `${phoneNumber}@s.whatsapp.net`,
          approvalOrder: approvalData,
        },
      };
    }
    return {
      status: "failed",
      data: null,
    };
  }
}

module.exports = { Moderation, Admin };
