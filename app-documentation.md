# System Structure

## App

Rule Based Chatbot, typical:
- Nodejs app
- command or keyword based chatbot
- Can provide general informations and product ordering

## Databases

Using MongoDB Atlas

# Documentations Interface or Type

## Customer

File `interface/customer.d.ts`

```typescript
import { ExpeditionProvider } from "@interface/order-data";
import { PaymentProvider } from "@interface/payment";
import { ProductCategory } from "@interface/product";

export type CustomerMetadata = {
  /** Customer ID */
  customerId: string;
  /** Customer username */
  tagName: string;
  /** Customer phone number */
  phoneNumber: string;
  /** Customer membership ID */
  hniId?: string;
  /** Date when registered */
  registeredOn: string;
};

/**
 * Order type
 * - `takeaway` is for pickup (pre order), order via online then picked up directly in store
 * - `dropship` is for dropship order, sent to self or another recipient
 */
export type OrderType = "takeaway" | "dropship";

/**
 * Customer Buckets
 *
 * A container for Customer to append product into bucket, and then make a checkout to process the order.
 */
export type Buckets = {
  /** ids for key of each element */
  id?: string;
  /** product id */
  productId: string;
  /** product names */
  productName: string;
  /** product category */
  category: ProductCategory;
  /** prices for each single product */
  price: number;
  /** poin gained each per product */
  poin: number;
  /** net weight each per product */
  weight: number;
  /** quantity of product for a single type product */
  qtyAmount: number;
  /** total price accumulated, `qty * price each` */
  totalPrice?: number;
  /** total poin accumulated, `qty * poin each` */
  totalPoin?: number;
  /** total weight accumulated, `qty * weight` */
  totalWeight?: number;
};

export type ExpeditionDetails = {
  origin: string;
  destination: string;
  packageWeight: number;
  code: ExpeditionProvider;
  name: string;
  service: string;
  description: string;
  fees: number;
  etd: string;
  note: string;
  receiptNumber: string;
};

export type CustomerInvoice = {
  /** ID of invoice */
  invoiceId: string;
  /** Date created at */
  timeStamp: string;
  /** Invoice Images */
  images: string;
};

export type Order = {
  buckets: Buckets[];
  totalItem: number;
  totalPrice: number;
  totalPoin: number;
  totalWeight: number;
  totalExactPrice: number;
  additionalInfo: string;
  orderer: [name: string, phone: string, hniId?: string];
  expedition?: ExpeditionDetails;
  recipient: {
    adminNote?: string;
    metadata: [name: string, phone: string, hniId?: string];
    fullAddress?: [
      province: string,
      district: string,
      subDistrict: string,
      postalCode: string,
      details: string
    ];
    rajaOngkir: CourierResult[];
  };
};

export type Purchases = {
  orderId: string;
  orderType: OrderType;
  timeStamp: string;
  isCompleted: boolean;
  isPayed: boolean;
  payedVia: PaymentProvider;
  invoices?: CustomerInvoice;
  data: Order;
};

/**
 * Customer
 */
export type Customer = {
  metadata: CustomerMetadata;
  data: {
    buckets: Buckets[];
    purchaseHistory: Purchases[];
  };
};
```

## Product

File `interface/product.d.ts`

```typescript
export type StaticCategory =
  | "Herbal"
  | "Health Food & Beverages"
  | "Cosmetics & Homecare";

export type ProductCategory = "herbal" | "beverages" | "cosmetics";

export type ProductDataInfo = {
  title: string;
  category: ProductCategory;
  price: number;
  memberPrice: number;
  stock: number;
  sold: number;
  poin: number;
  weight: number;
  image: string;
  description: string;
};

export type Product = {
  productId: string;
  timeStamp: string;
  data: ProductDataInfo;
};
```

## Order Data

File `interface/order-data.d.ts`

```typescript
import { CourierResult } from "@function/tools/types";
import {
  Buckets,
  CustomerInvoice,
  ExpeditionDetails,
  OrderType,
  Purchases,
  RecordPurchaseData,
} from "@interface/customer";
import { PaymentProvider } from "@interface/payment";

export type StatusOrder =
  | "never-order" // default status, indicates customer has never order or not found with exact search parameter
  | "pending" // status when customer submit form order
  | "forwarded" // status when customer confirm order with orderId
  | "confirmed" // status when admin receive and confirm ordered stuff availabe
  | "completed"; // status when the order has successfully completed

/**
 * @property Customer
 * Data individual (data pemesanan keseluruhan), relasi dengan data Customer.
 */
export type CustomerOrderData = {
  /** Orderer Phone Number */
  ordererId: string;
  ordererName: string;
  hniId?: string;
  status: StatusOrder;
  metadata: AdminConfirmedData;
  data: Purchases;
};

export type ExpeditionProvider = "JNE" | "TIKI" | "POS" | "NOT-SET";

export type AdminConfirmedData = {
  hashId: string;
  totalExactPrice: number;
  expedition: ExpeditionDetails;
};

/**
 * @property Admin
 * Data individual (data pemesanan selesai), hanya dapat diakses oleh Admin
 */
export type ApprovalOrderData = {
  orderType: OrderType;
  orderId: string;
  transactionId: string;
  timeStamp: string;
  invoice: CustomerInvoice;
  metadata: {
    custId: string;
    orderer: string;
    phone: string;
    hniId: string;
    info: string;
    adminNotes: string;
  };
  payment: {
    product: number;
    expFees: number;
    via: PaymentProvider;
    nominal: number;
  };
  expedition: ExpeditionDetails;
  products: Buckets[];
};
```

## Payment

File `interface/payment.d.ts`

```typescript
export type PaymentProvider =
  | "GOPAY"
  | "SHOPEPAY"
  | "DANA"
  | "QRIS"
  | "BSI"
  | "UNPAID"
  | "TRANSFER";

export type CustomerPaymentProof = {
  timeStamp: string;
  isVerified: boolean;
  metadata: {
    orderId: string;
    transactionId: string;
  };
  payer: {
    custId?: string;
    tagName: string;
    phoneNumber: string;
  };
  payment: {
    via: PaymentProvider;
    nominal: number;
    image: string;
  };
};
```

## Courier

File `interface/courier.d.ts`

```typescript
/**
 * ECO
 */
type CourierServicesEco = {
  /** Economy Service */
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

/**
 * REG
 */
type CourierServicesReg = {
  /** Reguler Service */
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

/**
 * EXP
 */
type CourierServicesExp = {
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

type CourierResult = {
  code: string;
  name: string;
  costs: [CourierServicesEco, CourierServicesReg, CourierServicesExp];
};
```

# Documentation Controllers

## Controllers Admin

File `controllers/admin/index.js`

```javascript
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
   */
  static async createProduct(createProductDto) {}

  /**
   *
   * @param { string } productId
   * @param { import("@interface/controllers/admin").EditProductDto } dto
   */
  static async editProduct(productId, dto) {}

  /**
   * Check stock product, to make sure customer pass order data
   * if the stock is available.
   * @param { { productId: string; amount: number } } dto
   */
  static async checkStockProduct({ productId, amount }) {}

  /**
   *
   * @param { string } productId
   * @param { number } changes Amount to decrement
   */
  static async updateStockProduct(productId, changes) {}

  /**
   *
   * @param { string } productId
   */
  static async deleteProduct(productId) {}

  /**
   * Get single **Product** data based on `productId` in `Product` collections
   * @param { string } productId
   */
  static async getProduct(productId) {}

  /**
   * Query search **Product** data by product name (partially)
   * @param { string } productName
   */
  static async searchProductByTitle(productName) {}

  /**
   *
   * @returns { Promise<Product[]> }
   */
  static async getAllProduct() {}

  /**
   *
   * @param { import("@interface/product").ProductCategory } category
   */
  static async getProductByCategory(category) {}

  /**
   *
   * @param { string } key
   */
  static async getKeyPairImages(key) {}

  /* ================ */

  /**
   * *Validate Customer Orders Data**
   *
   * Perform validating customer orders data by `orderId`.
   * @param { string } orderId
   * @returns
   */
  static async validateCustomerOrder(orderId) {}

  /**
   *
   * @param { string } transactionId
   */
  static async validateExistingPaymentProof(transactionId) {}

  /**
   *
   * @param { { orderId: string, transactionId: string } } dto
   */
  static async validateBothOrderAndPaymentProof({ orderId, transactionId }) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateStatusOrder(phoneNumber) {}

  /**
   *
   * @param { string } orderId
   */
  static async forwardCustomerOrder(orderId) {}

  /**
   * **Get Customer Orders Data**
   *
   * Perform getting single `CustomerOrderData` by `orderId`.
   * This collection data scope is global and also mutable.
   * @param { string } orderId
   */
  static async getCustomerOrder(orderId) {}

  /**
   *
   * @param { string } orderId
   */
  static async deleteOneCustomerOrder(orderId) {}

  static async getBatchCustomerOrders() {}

  /**
   *
   * @param { string } transactionId
   */
  static async getCustomerPaymentProof(transactionId) {}

  /**
   *
   * @param { string } transactionId
   */
  static async deleteOneCustomerPaymentProof(transactionId) {}

  static async getBatchCustomerPaymentProof() {}

  /**
   *
   * @param { string } orderId
   */
  static async getApprovalOrderData(orderId) {}

  static async getBatchApprovalOrderData() {}

  /**
   *
   * @param { string } invoiceId
   */
  static async validateInvoiceId(invoiceId) {}

  /**
   *
   * @param { string } invoiceId
   */
  static async getOrdersDetails(invoiceId) {}
}

/**
 * **Controllers: Admin**
 */
class Admin {
  /**
   * **Confirm Customer Payment**
   * @param { string } trxId Transaction Id
   */
  static confirmCustomerPayment = async (trxId) => {};

  /**
   *
   * @param { string } trxId
   */
  static cancelCustomerPayment = async (trxId) => {};

  /**
   *
   * @param { "Dropship" | "Takeaway" } orderType
   * @param { import("@interface/controllers/admin").InvoiceDto } dto
   */
  static completeCustomerOrder = async (orderType, dto) => {};
}
```

## Controllers Customer

File `controllers/customer.index.js`

```javascript
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
   */
  static async registerCustomer(customerDto) {}

  /**
   *
   * @param { string } phoneNumber
   * @param { string } hniId
   */
  static async registerHniId(phoneNumber, hniId) {}

  /**
   * **Get Single Customer Data**
   * @param { string } phoneNumber
   */
  static async getCustomerData(phoneNumber) {}

  /**
   * **Validate Customer By: Phone Number**
   * @param { string } phoneNumber
   */
  static async validateByPhoneNumber(phoneNumber) {}

  /**
   * @param { string } phoneNumber
   */
  static async deleteCustomerData(phoneNumber) {}

  /* =================== */

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateExistingCustomerHniId(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateBeforeAppendBuckets(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   * @param { import("@interface/customer").Buckets } dto
   */
  static async appendSingleBuckets(phoneNumber, dto) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async validateExistingBuckets(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   * @param { { formInfo: string, orderer: string[], fullAddress: string[], metadata: string[] } } orderInfo Form Order
   */
  static async appendOrderFromBuckets(
    phoneNumber,
    { formInfo, orderer, fullAddress, metadata }
  ) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async appendCustTakeAwayOrderFromBuckets(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   * @param { import("@interface/controllers/customer").OrderDto } orderDto Form Order
   */
  static async appendCustomerOrderFromBuckets(phoneNumber, orderDto) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async pullCustomerBuckets(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   */
  static async cancelAndClearOrders(phoneNumber) {}

  /**
   *
   * @param { string } phoneNumber
   * @param { { orderId: string, via: import("@interface/payment").PaymentProvider, image: Buffer } } dto
   */
  static async uploadPaymentProof(phoneNumber, { orderId, via, image }) {}
}
```
