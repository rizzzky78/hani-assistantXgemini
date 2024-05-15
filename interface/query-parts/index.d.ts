import { ProductCategory } from "@interface/product";

export type QueryMatchKeyUpdate =
  | "nama"
  | "kategori"
  | "harga"
  | "stok"
  | "deskripsi"
  | "gambar";

export type QueryPartsCreateProduct = [
  title: string,
  category: ProductCategory,
  price: string,
  stock: string,
  description: string
];

export type QueryPartsUpdateProduct = [
  productId: string,
  matchKeyUpdate: QueryMatchKeyUpdate,
  inputValue?: string | number | (string & {})
];

export type QueryPartsOrderProduct = [productId: string, qtyAmount: string];

export type QueryPartsFormOrder = [
  productId: string,
  productName: string,
  qtyAmount: string,
  ordererName: string,
  ordererPhoneNumber: string,
  ordererHniId: string,
  deliveryOption: "pickup" | "delivery",
  deliveryAddress: string
];

export type FormOrderDto = {
  ordererName: string;
  ordererPhoneNumber: string;
  ordererHniId?: string;
  deliveryOption: "pickup" | "delivery";
  deliveryAddress?: string;
};
