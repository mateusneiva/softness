export interface ShippingCountry {
  code: string;
  name: string;
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  deliveryDays: number | null;
  label: string;
}

export interface ShippingQuoteResponse {
  shipmentId: string;
  rates: ShippingRate[];
  currency: string;
  freeShippingApplied?: boolean;
  freeShippingThreshold?: number | null;
}

export interface ShippingRateSelection {
  rateId: string;
  carrier: string;
  service: string;
  amount: number;
}
