export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'FULFILLED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  size: string;
  unitAmount: number;
  quantity: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  stripeSessionId: string | null;
  discountAmount?: number;
  shippingAmount?: number;
  shippingMethod?: string | null;
  shippingRateId?: string | null;
  couponCode?: string | null;
  shippingLabel: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  paymentMethodType?: string | null;
  paymentBrand?: string | null;
  paymentLast4?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  expiresInMs?: number | null;
  serverNow?: string | null;
}
