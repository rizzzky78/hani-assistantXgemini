export type FormFieldProductData = [
  title: string,
  category: ProductCategory,
  price: string,
  memberPrice: string,
  stock: string,
  poin: string,
  weight: string,
  description: string
];

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
