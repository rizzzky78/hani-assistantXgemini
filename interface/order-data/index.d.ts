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
