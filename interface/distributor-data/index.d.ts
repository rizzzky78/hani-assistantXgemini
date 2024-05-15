import { Buckets } from "@interface/customer";
import { CustomerOrderData } from "@interface/order-data";
import { CustomerPaymentProof } from "@interface/payment";
import { Product, ProductCategory, StaticCategory } from "@interface/product";
import { WithId } from "mongodb";

export type PaginationDto = {
  category: ProductCategory;
  page: number;
  pageSize: number;
};

export type PaginationData = {
  category: StaticCategory;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  products: Product[];
};

export type ProductPaginationCallback = {
  status: "success" | "invalid";
  data: PaginationData | null;
};

export type PaginationOrderData = {
  totalPages: number;
  pageSize: number;
  currentPage: page;
  totalOrder: number;
  orderDatas: CustomerOrderData[];
};

export type PaginationOrderDataCallback = {
  status: "success" | "invalid";
  data: PaginationOrderData;
};

export type ConfirmationFormDto = {
  orderId: string;
  hniId?: string;
  products: Buckets[];
  totalItems: number;
  totalPrice: number;
  totalPoin: number;
  recipient: string[];
  fullAddress: string[];
};

export type InvoiceFormDto = {
  order: WithId<CustomerOrderData>;
  payment: WithId<CustomerPaymentProof>;
};
