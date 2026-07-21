import type { DiscountType } from './product';

export type CouponType = DiscountType;

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  active: boolean;
  firstPurchaseOnly: boolean;
  maxUses: number | null;
  usedCount: number;
  minSubtotal: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
