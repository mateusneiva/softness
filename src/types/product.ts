/** Shared by product discounts and coupons. */
export type DiscountType = 'PERCENT' | 'FIXED';

export interface ProductVariant {
  id: string;
  name: string;
  colorHex: string | null;
  imageUrl: string | null;
  images: string[];
  sizes: string[];
  unavailableSizes: string[];
  available: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountStartsAt?: string | null;
  discountEndsAt?: string | null;
  imageUrl: string | null;
  images: string[];
  sizes: string[];
  unavailableSizes: string[];
  available: boolean;
  listed?: boolean;
  sortOrder?: number;
  releaseAt?: string | null;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}
