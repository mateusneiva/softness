/** Must stay in sync with softness-api shipping.constants.ts */
export const SHIPPING_COUNTRY_CATALOG = [
  'US',
  'CA',
  'GB',
  'IE',
  'DE',
  'FR',
  'NL',
  'BE',
  'ES',
  'IT',
  'PT',
  'AU',
  'NZ',
  'JP',
  'KR',
  'SG',
  'BR',
  'MX',
] as const;

export function isCatalogCountry(country: string) {
  return (SHIPPING_COUNTRY_CATALOG as readonly string[]).includes(country.toUpperCase());
}
