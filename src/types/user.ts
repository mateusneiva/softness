export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  birthDate: string | null;
  role: UserRole;
  emailVerified?: boolean;
  hasPassword?: boolean;
  googleLinked?: boolean;
  addresses?: Address[];
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface AccountOverviewStats {
  ordersCount: number;
  addressesCount: number;
  latestOrder: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    trackingNumber?: string | null;
    items: Array<{
      productName: string;
      quantity: number;
      imageUrl?: string | null;
      variantName?: string | null;
    }>;
  } | null;
  defaultAddress: Address | null;
}

export interface AccountOverviewResponse {
  user: User;
  stats: AccountOverviewStats;
}
