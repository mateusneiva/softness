export interface CatalogCountry {
  code: string;
  name: string;
}

export interface SiteSettings {
  flatShippingAmount: number;
  flatShippingLabel: string;
  shippingCountries: string[];
  freeShippingThreshold: number | null;
  pendingOrderTtlHours: number;
  emailVerificationRequired: boolean;
  emailVerificationActive: boolean;
  turnstileConfigured: boolean;
  emailConfigured: boolean;
  catalogCountries: CatalogCountry[];
  updatedAt?: string;
}

export interface UpdateSiteSettingsInput {
  flatShippingAmount?: number;
  flatShippingLabel?: string;
  shippingCountries?: string[];
  freeShippingThreshold?: number | null;
  pendingOrderTtlHours?: number;
  emailVerificationRequired?: boolean;
}
