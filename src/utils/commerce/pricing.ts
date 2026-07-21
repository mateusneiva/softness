import type { DiscountType } from '@/src/types/product';

export type { DiscountType };

export type PricedProduct = {
  price: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountStartsAt?: string | Date | null;
  discountEndsAt?: string | Date | null;
};

function toTime(value?: string | Date | null) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

export function isProductDiscountActive(product: PricedProduct, now = Date.now()) {
  if (!product.discountType || product.discountValue == null || product.discountValue <= 0) {
    return false;
  }
  const startsAt = toTime(product.discountStartsAt);
  const endsAt = toTime(product.discountEndsAt);
  if (startsAt != null && now < startsAt) return false;
  if (endsAt != null && now > endsAt) return false;
  return true;
}

export function computeProductDiscountAmount(product: PricedProduct, now = Date.now()) {
  if (!isProductDiscountActive(product, now)) return 0;
  const value = product.discountValue ?? 0;
  if (product.discountType === 'PERCENT') {
    return Math.min(product.price, Math.max(0, Math.round((product.price * value) / 100)));
  }
  return Math.min(product.price, Math.max(0, value));
}

export function getEffectiveProductPrice(product: PricedProduct, now = Date.now()) {
  return Math.max(0, product.price - computeProductDiscountAmount(product, now));
}
