export interface ApiError {
  message: string;
  errors?: Record<string, string[] | undefined>;
  status?: number;
  code?: string;
  email?: string;
  /** API inacessível: sem resposta, timeout ou DATABASE_UNAVAILABLE. */
  isServerUnavailable?: boolean;
}

export interface CheckoutResponse {
  url: string;
  orderId?: string;
  message?: string;
}

export interface BillingPortalResponse {
  url?: string;
  configured: boolean;
  message?: string;
}

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface PaymentHistoryEntry {
  orderId: string;
  total: number;
  currency: string;
  createdAt: string;
  paymentBrand: string | null;
  paymentLast4: string | null;
  paymentMethodType: string | null;
}

export interface PaymentOverviewResponse {
  configured: boolean;
  savedMethods: SavedPaymentMethod[];
  recentPayments: PaymentHistoryEntry[];
  stats: {
    paidOrdersCount: number;
    totalSpent: number;
    currency: string;
  };
}
