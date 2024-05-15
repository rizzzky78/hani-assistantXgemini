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
  title: string;                // Nama produk
  category: ProductCategory;    // Kategori produk
  price: number;                // Harga non member
  memberPrice: number;          // Harga member
  stock: number;                // Stok ketersediaan
  sold: number;                 // Terjual
  poin: number;                 // Poin grup
  weight: number;               // Berat dalam gram (gr)
  image: string;                // Gambar produk
  description: string;          // Deskripsi produk
};

export type Product = {
  productId: string;            // ID produk
  timeStamp: string;            // Waktu diuploadnya produk
  data: ProductDataInfo;        // Data detail produk
};
