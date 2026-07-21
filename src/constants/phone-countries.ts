import { Country } from 'country-state-city';

export type PhoneCountry = {
  isoCode: string;
  name: string;
  dialCode: string;
};

let cached: PhoneCountry[] | null = null;

export function getPhoneCountries() {
  if (cached) return cached;

  cached = Country.getAllCountries()
    .filter((country) => Boolean(country.phonecode))
    .map((country) => ({
      isoCode: country.isoCode,
      name: country.name,
      dialCode: country.phonecode.replace(/\D/g, ''),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return cached;
}

export function getPhoneCountriesByDialLength() {
  return [...getPhoneCountries()].sort((a, b) => b.dialCode.length - a.dialCode.length);
}

export function getDefaultPhoneCountryIso() {
  if (typeof navigator === 'undefined') return 'US';

  const locale = navigator.language?.split('-')[1]?.toUpperCase();
  if (locale && getPhoneCountries().some((country) => country.isoCode === locale)) {
    return locale;
  }

  return 'US';
}
