const { Moderation } = require("@controllers/admin");
const {
  collections: { customer, customerPaymentProof, customerOrderData },
} = require("@database/router");
const {
  IDGenerator,
  Tools,
  Converter,
  RajaOngkir,
} = require("@function/tools");
const logger = require("@libs/utils/logger");

class Customer {
  /**
   * **Register Customer**
   *
   * This action is automatically, no need to perform/call
   * @param { import("@interface/controllers/customer").RegisterCustomerDto } customerDto
   * @returns { Promise<import("@interface/controllers/customer").RegisterCustomerCallback> }
   */
  static async registerCustomer(customerDto) {
    const { tagName, phoneNumber } = customerDto;
    /**
     * @type { import("@interface/customer").Customer }
     */
    const customerData = {
      metadata: {
        customerId: IDGenerator.generateCustomerId(),
        tagName: tagName ? tagName : "Tidak ada Nama",
        phoneNumber,
        registeredOn: Tools.getDate(),
      },
      data: {
        buckets: [],
        purchaseHistory: [],
      },
    };
    const handleRegister = await customer.insertOne(customerData);
    return {
      status: handleRegister ? "success" : "failed",
      data: handleRegister ? customerData : null,
    };
  }

  /**
   *
   * @param { string } phoneNumber
   * @param { string } hniId
   */
  static async registerHniId(phoneNumber, hniId) {
    const register = await customer.findOneAndUpdate(
      {
        "metadata.phoneNumber": phoneNumber,
      },
      {
        $set: {
          "metadata.hniId": hniId,
        },
      }
    );
    return register ? true : false;
  }

  /**
   * **Get Single Customer Data**
   * @param { string } phoneNumber
   */
  static async getCustomerData(phoneNumber) {
    return await customer.findOne({
      "metadata.phoneNumber": phoneNumber.trim(),
    });
  }

  /**
   * **Validate Customer By: Phone Number**
   * @param { string } phoneNumber
   */
  static async validateByPhoneNumber(phoneNumber) {
    return Boolean(
      await customer.findOne({
        "metadata.phoneNumber": phoneNumber.trim(),
      })
    );
  }

  /**
   * **Delete Single Customer Data By: Phone Number**
   *
   * Note: this action is dependently from other class member function,
   * so if you apply deleting customer data independenly it will cause data loss
   * and relational data cannot be estabilished.
   * @param { string } phoneNumber
   */
  static async deleteCustomerData(phoneNumber) {
    return await customer.findOneAndDelete({
      "metadata.phoneNumber": phoneNumber,
    });
  }

  /* =================== */

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateExistingCustomerHniId(phoneNumber) {
    const { metadata } = await customer.findOne({
      "metadata.phoneNumber": phoneNumber,
    });
    return Boolean(metadata.hniId);
  }

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateBeforeAppendBuckets(phoneNumber) {
    const {
      data: { purchaseHistory },
    } = await this.getCustomerData(phoneNumber);
    if (!purchaseHistory) {
      return { status: true, data: null };
    } else {
      const incompletedOrder = purchaseHistory.filter((v) => !v.isCompleted);
      const state = incompletedOrder.length === 1;
      return state
        ? { status: false, data: incompletedOrder }
        : { status: true, data: null };
    }
  }

  /**
   *
   * @param { string } phoneNumber
   * @param { import("@interface/customer").Buckets } dto
   * @returns { Promise<import("@interface/controllers/admin").AppendSinglebucketsCallback> }
   */
  static async appendSingleBuckets(phoneNumber, dto) {
    /**
     * @type { import("@interface/customer").Buckets }
     */
    const bucketsToAppend = {
      id: IDGenerator.generateRandom(10),
      ...dto,
      totalPoin: dto.poin * dto.qtyAmount,
      totalPrice: dto.price * dto.qtyAmount,
      totalWeight: dto.weight * dto.qtyAmount,
    };
    const appendBuckets = await customer.findOneAndUpdate(
      {
        "metadata.phoneNumber": phoneNumber,
      },
      {
        $push: {
          "data.buckets": bucketsToAppend,
        },
      },
      {
        returnDocument: "after",
      }
    );
    return {
      status: appendBuckets ? "success" : "failed",
      data: appendBuckets ? bucketsToAppend : null,
    };
  }

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateExistingBuckets(phoneNumber) {
    const {
      data: { buckets },
    } = await this.getCustomerData(phoneNumber);
    return buckets.length > 0 ? true : false;
  }

  /**
   *
   * @param { string } phoneNumber
   * @param { { formInfo: string, orderer: string[], fullAddress: string[], metadata: string[] } } orderInfo Form Order
   * @returns { Promise<import("@interface/controllers/customer").AppendOrderFromBucketsCallback> }
   */
  static async appendOrderFromBuckets(
    phoneNumber,
    { formInfo, orderer, fullAddress, metadata }
  ) {
    const {
      metadata: { hniId },
      data: { buckets },
    } = await this.getCustomerData(phoneNumber);
    const v = {
      accumulativePrice: buckets.reduce((x, y) => x + y.totalPrice, 0),
      accumulativePoin: buckets.reduce((x, y) => x + y.totalPoin, 0),
      accumulativeItem: buckets.reduce((x, y) => x + y.qtyAmount, 0),
      accumulativeWeight: buckets.reduce((x, y) => x + y.weight, 0),
    };
    /**
     * @type { import("@interface/customer").Purchases }
     */
    const purchasesData = {
      orderId: IDGenerator.generateOrderId(),
      timeStamp: Tools.getDate(),
      isCompleted: false,
      isPayed: false,
      payedVia: "UNPAID",
      data: {
        buckets,
        totalItem: v.accumulativeItem,
        totalPrice: v.accumulativePrice,
        totalPoin: accumulativePoin,
        totalWeight: v.accumulativeWeight,
        totalExactPrice: v.accumulativePrice,
        expedition: {},
        packageWeight: v.accumulativeWeight + 20, // + as additional weight
        expeditionFees: 0,
        additionalInfo: formInfo,
        orderer,
        recipient: {
          metadata,
          fullAddress,
        },
      },
    };
    /**
     * @type { import("@interface/order-data").CustomerOrderData }
     */
    const appendDataOrder = {
      ordererId: phoneNumber,
      hniId: hniId ? hniId : "-",
      status: "pending",
      metadata: {},
      data: purchasesData,
    };
    const [appendBuckets, appendOrder] = await Promise.all([
      customer.findOneAndUpdate(
        {
          "metadata.phoneNumber": phoneNumber,
        },
        {
          $push: {
            "data.purchaseHistory": purchasesData,
          },
          $set: {
            "data.buckets": [],
          },
        }
      ),
      customerOrderData.insertOne(appendDataOrder),
    ]);
    return {
      status: appendBuckets && appendOrder ? "success" : "failed",
      data: appendBuckets && appendOrder ? purchasesData : null,
      callback: appendBuckets && appendOrder ? appendBuckets : null,
    };
  }

  /**
   *
   * @param { string } phoneNumber
   * @returns { Promise<import("@interface/controllers/customer").AppendCustTakeAwayOrderFromBucketsCallback }
   */
  static async appendCustTakeAwayOrderFromBuckets(phoneNumber) {
    const {
      metadata,
      data: { buckets },
    } = await this.getCustomerData(phoneNumber);

    const products = {
      accumulativePrice: buckets.reduce((x, y) => x + y.totalPrice, 0),
      accumulativePoin: buckets.reduce((x, y) => x + y.totalPoin, 0),
      accumulativeItem: buckets.reduce((x, y) => x + y.qtyAmount, 0),
      accumulativeWeight: buckets.reduce((x, y) => x + y.totalWeight, 0),
    };
    /**
     * @type { import("@interface/customer").Purchases }
     */
    const purchasesData = {
      orderId: IDGenerator.generateOrderId(),
      timeStamp: Tools.getDate(),
      isCompleted: false,
      isPayed: false,
      payedVia: "UNPAID",
      orderType: "takeaway",
      data: {
        buckets,
        totalItem: products.accumulativeItem,
        totalPrice: products.accumulativePrice,
        totalPoin: products.accumulativePoin,
        totalWeight: products.accumulativeWeight,
        totalExactPrice: products.accumulativePrice,
        additionalInfo: "Dipesan Takeaway",
        orderer: [metadata.tagName, metadata.phoneNumber, metadata.hniId],
        expedition: {},
        recipient: {},
      },
    };
    /**
     * @type { import("@interface/order-data").CustomerOrderData }
     */
    const appendDataOrder = {
      ordererId: metadata.phoneNumber,
      ordererName: metadata.tagName,
      hniId: metadata.hniId,
      status: "pending",
      metadata: {
        hashId: IDGenerator.generateRandom(8),
        totalExactPrice: purchasesData.data.totalExactPrice,
        expedition: null,
      },
      data: purchasesData,
    };
    const [appendBuckets, appendOrder] = await Promise.all([
      customer.findOneAndUpdate(
        {
          "metadata.phoneNumber": phoneNumber,
        },
        {
          $push: {
            "data.purchaseHistory": purchasesData,
          },
          $set: {
            "data.buckets": [],
          },
        }
      ),
      customerOrderData.insertOne(appendDataOrder),
    ]);
    return {
      status: appendBuckets && appendOrder ? "success" : "failed",
      purchases: appendBuckets && appendOrder ? purchasesData : null,
      orders: appendBuckets && appendOrder ? appendDataOrder : null,
    };
  }

  /**
   *
   * @param { string } phoneNumber
   * @param { import("@interface/controllers/customer").OrderDto } orderDto Form Order
   * @returns { Promise<import("@interface/controllers/customer").AppendOrderFromBucketsCallback> }
   */
  static async appendCustomerOrderFromBuckets(phoneNumber, orderDto) {
    const { formInfo, orderer, fullAddress, metadata } = orderDto;
    const {
      metadata: { hniId, tagName },
      data: { buckets },
    } = await this.getCustomerData(phoneNumber);

    const v = {
      accumulativePrice: buckets.reduce((x, y) => x + y.totalPrice, 0),
      accumulativePoin: buckets.reduce((x, y) => x + y.totalPoin, 0),
      accumulativeItem: buckets.reduce((x, y) => x + y.qtyAmount, 0),
      accumulativeWeight: buckets.reduce((x, y) => x + y.totalWeight, 0),
    };

    const [province, district] = fullAddress;
    const {
      status,
      courier,
      data: {
        data: { results: rajaOngkirCourier },
      },
    } = await RajaOngkir.checkStaticCost("jne", {
      destination: district,
      weight: v.accumulativeWeight + 20,
    });

    if (!status) {
      return {
        status: "destination-not-found",
        data: null,
        callback: null,
      };
    } else {
      const [expeditionData] = rajaOngkirCourier;
      const {
        code,
        name,
        costs: [economyService, regulerService],
      } = expeditionData;
      const {
        service,
        description,
        cost: [courierCost],
      } = regulerService;

      const exactPrice = v.accumulativePrice + courierCost.value;
      /**
       * @type { import("@interface/customer").Purchases }
       */
      const purchasesData = {
        orderId: IDGenerator.generateOrderId(),
        timeStamp: Tools.getDate(),
        isCompleted: false,
        isPayed: false,
        payedVia: "UNPAID",
        orderType: "dropship",
        data: {
          buckets,
          totalItem: v.accumulativeItem,
          totalPrice: v.accumulativePrice,
          totalPoin: v.accumulativePoin,
          totalWeight: v.accumulativeWeight,
          totalExactPrice: exactPrice,
          additionalInfo: formInfo,
          orderer,
          expedition: {
            origin: "Cilacap",
            destination: district,
            packageWeight: v.accumulativeWeight + 20,
            code,
            name,
            service,
            description,
            fees: courierCost.value,
            etd: courierCost.etd,
            note: courierCost.note,
          },
          recipient: {
            metadata,
            fullAddress,
            rajaOngkir: rajaOngkirCourier,
          },
        },
      };
      /**
       * @type { import("@interface/order-data").CustomerOrderData }
       */
      const appendDataOrder = {
        ordererId: phoneNumber,
        ordererName: tagName,
        hniId: hniId ? hniId : "-",
        status: "pending",
        metadata: {
          hashId: IDGenerator.generateRandom(8),
          totalExactPrice: exactPrice,
          expedition: purchasesData.data.expedition,
        },
        data: purchasesData,
      };
      const [appendBuckets, appendOrder] = await Promise.all([
        customer.findOneAndUpdate(
          {
            "metadata.phoneNumber": phoneNumber,
          },
          {
            $push: {
              "data.purchaseHistory": purchasesData,
            },
            $set: {
              "data.buckets": [],
            },
          }
        ),
        customerOrderData.insertOne(appendDataOrder),
      ]);
      return {
        status: appendBuckets && appendOrder ? "success" : "failed",
        purchases: appendBuckets && appendOrder ? purchasesData : null,
        orders: appendBuckets && appendOrder ? appendDataOrder : null,
      };
    }
  }

  /**
   *
   * @param { string } phoneNumber
   */
  static async pullCustomerBuckets(phoneNumber) {
    const pullBuckets = await customer.findOneAndUpdate(
      {
        "metadata.phoneNumber": phoneNumber,
      },
      {
        $set: {
          "data.buckets": [],
        },
      }
    );
    return pullBuckets ? true : false;
  }

  /**
   *
   * @param { string } phoneNumber
   * @returns { Promise<import("@interface/controllers/customer").CancelAndClearOrdersCallback> }
   */
  static async cancelAndClearOrders(phoneNumber) {
    const custOrderData = await customerOrderData
      .find({ ordererId: phoneNumber })
      .toArray();
    const [
      {
        data: { orderId },
      },
    ] = custOrderData.filter((v) => v.status !== "completed");
    const [custPullOrder, pullOrderData] = await Promise.all([
      customer.findOneAndUpdate(
        {
          "metadata.phoneNumber": phoneNumber,
        },
        {
          $pull: {
            "data.purchaseHistory": { orderId },
          },
          $set: {
            "data.buckets": [],
          },
        }
      ),
      customerOrderData.findOneAndDelete({ "data.orderId": orderId }),
    ]);
    return {
      status: custPullOrder && pullOrderData ? "success" : "failed",
      orderId: custPullOrder && pullOrderData ? orderId : null,
      data: custPullOrder && pullOrderData ? pullOrderData : null,
    };
  }
  /**
   *
   * @param { { phoneNumber: string, orderId: string } } dto
   */
  static async validatePaymentStatus({ phoneNumber, orderId }) {
    const orderData = await Customer.getCustomerData(phoneNumber);
    const {
      data: { purchaseHistory },
    } = orderData;
    const custPurchases = purchaseHistory.find((v) => v.orderId === orderId);
    if (custPurchases) {
      return custPurchases.isPayed;
    }
    return false;
  }

  /**
   *
   * @param { string } phoneNumber
   * @param { { orderId: string, via: import("@interface/payment").PaymentProvider, image: Buffer } } dto
   * @returns { Promise<import("@interface/controllers/customer").UploadPaymentProofCallback> }
   */
  static async uploadPaymentProof(phoneNumber, { orderId, via, image }) {
    try {
      const { metadata } = await this.getCustomerData(phoneNumber);
      const custOrderData = await Moderation.getCustomerOrder(orderId);

      const { key } = await Moderation.createKeypairImages(image);

      /**
       * @type { import("@interface/payment").CustomerPaymentProof }
       */
      const payments = {
        timeStamp: Tools.getDate(),
        isVerified: false,
        metadata: {
          orderId,
          transactionId: IDGenerator.generateTransactionId(),
        },
        payer: {
          custId: metadata.customerId,
          tagName: metadata.tagName,
          phoneNumber: metadata.phoneNumber,
        },
        payment: {
          via,
          nominal: custOrderData.metadata.totalExactPrice,
          image: key,
        },
      };
      const [custPayments, dataPayments] = await Promise.all([
        customer.findOneAndUpdate(
          {
            "metadata.phoneNumber": phoneNumber,
            "data.purchaseHistory.orderId": orderId,
          },
          {
            $set: {
              "data.purchaseHistory.$.isPayed": true,
              "data.purchaseHistory.$.payedVia": via,
            },
          }
        ),
        customerPaymentProof.insertOne(payments),
      ]);
      return {
        status: custPayments && dataPayments ? "success" : "failed",
        data:
          custPayments && dataPayments
            ? { payments, orders: custOrderData }
            : null,
      };
    } catch (e) {
      throw new Error(e);
    }
  }
}
module.exports = { Customer };
