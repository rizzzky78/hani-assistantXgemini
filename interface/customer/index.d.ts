import { CourierResult } from "@function/tools/types";
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

export type RecordPurchaseData = {
  /** ID of product */
  productId: string;
  /** Ordered product name */
  productName: string;
  /** Price of product */
  price: number;
  /** Qty pf item or product */
  quantity: number;
  /** Total price: qty times price product each */
  totalPrice: number;
  /** Order information form: name, phone number, shipping options, full address. */
  additionalInfo: string;
};

export type PurchaseData = {
  /** ID of order data */
  orderId: string;
  /** Date of when order created */
  timeStamp: string;
  /** Status completion of order */
  isCompleted: boolean;
  /** Payment status */
  isPayed: boolean;
  /** Payed via what banks */
  payedVia: PaymentProvider;
  /** Details of order data */
  data: RecordPurchaseData;
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
 * Customer, dapat berupa Agen atau Pelanggan
 */
export type Customer = {
  metadata: CustomerMetadata;
  data: {
    buckets: Buckets[];
    purchaseHistory: Purchases[];
  };
};
