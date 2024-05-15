import {
  Customer,
  PurchaseData,
  Purchases,
  RecordPurchaseData,
} from "@interface/customer";
import { CustomerOrderData } from "@interface/order-data";
import { CustomerPaymentProof } from "@interface/payment";
import { WithId } from "mongodb";

export type ActionStatus = "success" | "failed";

export type RegisterCustomerDto = {
  tagName: string;
  phoneNumber: string;
};

export type RegisterCustomerCallback = {
  status: ActionStatus;
  data: WithId<Customer>;
};

export type OrderDataDto = {} & RecordPurchaseData;

export type AppendOrderCallback = {
  status: ActionStatus;
  data: PurchaseData;
  callback: WithId<Customer>;
};

export type AppendOrderFromBucketsCallback = {
  status: ActionStatus | "destination-not-found";
  /**
   * Purchases data appended from buckets.
   */
  purchases: Purchases;
  /**
   * Customer order data without ObjectId
   */
  orders: CustomerOrderData;
};

export type AppendCustTakeAwayOrderFromBucketsCallback = {
  status: ActionStatus;
  /**
   * Purchases data appended from buckets.
   */
  purchases: Purchases;
  /**
   * Customer order data without ObjectId
   */
  orders: CustomerOrderData;
};

export type DeleteCustomerOrdersCallback = {
  status: "success" | "failed" | "invalid";
  data: WithId<Customer>;
};

export type UploadPaymentProofCallback = {
  status: ActionStatus;
  data: {
    payments: WithId<CustomerPaymentProof>;
    orders: WithId<CustomerOrderData>;
  };
};

export type DeleteCustomerBucketCallback = {
  status: "success" | "failed" | "invalid";
  data: WithId<CustomerOrderData>;
};

export type CancelAndClearOrdersCallback = {
  status: ActionStatus;
  orderId: string;
  data: WithId<CustomerOrderData>;
};

export type OrderDto = {
  formInfo: string;
  orderer: string[];
  fullAddress: string[];
  metadata: string[];
};
