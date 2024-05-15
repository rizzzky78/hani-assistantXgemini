import { QueryMatchKeyUpdate } from "@interface/query-parts";
import {
  Buckets,
  Customer,
  CustomerInvoice,
  PurchaseData,
} from "@interface/customer";
import {
  ApprovalOrderData,
  CustomerOrderData,
  StatusOrder,
} from "@interface/order-data";
import { CustomerPaymentProof } from "@interface/payment";
import { Product, ProductCategory } from "@interface/product";
import { BulkWriteResult, WithId } from "mongodb";

export type ActionStatus = "success" | "failed";

export type CreateProductDto = {
  category: ProductCategory;
  title: string;
  price: string;
  memberPrice: string;
  stock: number;
  poin: string;
  weight: string;
  image: Buffer;
  description: string;
};

export type CreateProductCallback = {
  status: ActionStatus;
  data: Product | null;
};

export interface EditProductDto extends CreateProductDto {}

export type QueryPartsUpdateProduct = [
  productId: string,
  matchKey: QueryMatchKeyUpdate,
  value?: string | number | (string & {})
];

export type MatchKeyUpdate = keyof CreateProductDto;

export type UpdateProductDto = {
  matchKey: QueryMatchKeyUpdate;
  value: string | number;
};

export type InvoiceDto = {
  metadata: [orderId: string, transactionId: string];
  receiptNumber: string;
  adminNotes: string;
  image: Buffer;
};

export type UpdateProductCallback = {
  status: ActionStatus;
  data: Product | null;
};

export type DeleteProductCallback = {
  status: ActionStatus;
  data: Product | null;
};

export type ConfirmPurchaseDto = {
  phoneNumber: string;
  orderId: string;
};

export type ConfirmCustomerPurchaseCallback = {
  status: ActionStatus;
  data: WithId<Customer>;
};

export type ConfirmCustomerOrderCallback = {
  status: "success" | "failed";
  data: {
    ordererPhoneId: string;
    customer: WithId<Customer>;
    order: WithId<CustomerOrderData>;
  };
};

export type UpsertApprovalOrderDataCallback = {
  status: ActionStatus;
  data: WithId<ApprovalOrderData>;
};

export type UpdateStockProductCallback = {
  status: "invalid-qty" | "success";
  data: WithId<Product>;
};

export type ReadBatchProductCallback = {
  status: "success" | "no-products";
  data: WithId<Product>[];
};

export type ConfirmCustomerPaymentCallback = {
  status: ActionStatus | "confirmed";
  data: {
    custPhoneId: string;
    payment: WithId<CustomerPaymentProof>;
    order: WithId<CustomerOrderData>;
  };
};

export type CancelCustomerPaymentCallback = {
  status: ActionStatus | "confirmed";
  data: {
    custPhoneId: string;
    payment: WithId<CustomerPaymentProof>;
    order: WithId<CustomerOrderData>;
  };
};

export type CompleteCustomerOrderCallback = {
  status:
    | ActionStatus
    | "completed"
    | "confirmed"
    | "pay-unconfirmed"
    | "inv-qty";
  message?: string;
  data: {
    custPhoneId: string;
    invoice: Partial<CustomerInvoice>;
    order: WithId<CustomerOrderData>;
    approval: WithId<ApprovalOrderData>;
  };
};

export type UpsertOrderDataDto = {} & PurchaseData;

export type UpsertCustomerOrdersCallback = {
  status: ActionStatus;
  data: WithId<CustomerOrderData>;
};

export type GetProductByCategoryCallback = {
  status: "success" | "failed" | "no-products";
  data: Product[];
};

export type SerachProductByTitleCallback = {
  status: ActionStatus;
  data: WithId<Product>[];
};

export type AppendSinglebucketsCallback = {
  status: ActionStatus;
  data: Buckets;
};

export type ForwardCustomerOrderCallback = {
  status: ActionStatus;
  orders: WithId<CustomerOrderData>;
};

export type ValidateStatusOrderCallback = {
  status: StatusOrder;
  orderId: string;
};

export type GetOrderDetailsCallback = [
  orderData: CustomerOrderData,
  paymentData: CustomerPaymentProof,
  approvalData: ApprovalOrderData
];

export type BulkUpdateStockProductCallback = {
  status: ActionStatus | "inv-qty";
  message?: string;
  data: BulkWriteResult;
};
