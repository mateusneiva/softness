import { getDefaultPhoneCountryIso, getPhoneCountries, getPhoneCountriesByDialLength } from '@/src/constants/phone-countries';

export type ParsedPhone = {
  countryIso: string;
  dialCode: string;
  nationalNumber: string;
};

export function formatInternationalPhone(countryIso: string, nationalNumber: string) {
  const country = getPhoneCountries().find((entry) => entry.isoCode === countryIso);
  const dial = country?.dialCode ?? '1';
  const national = nationalNumber.replace(/\D/g, '');
  if (!national) return '';
  return `+${dial}${national}`;
}

export function parseInternationalPhone(value: string | undefined | null, fallbackIso = getDefaultPhoneCountryIso()): ParsedPhone {
  const trimmed = (value ?? '').trim();

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');

    for (const country of getPhoneCountriesByDialLength()) {
      if (digits.startsWith(country.dialCode)) {
        return {
          countryIso: country.isoCode,
          dialCode: country.dialCode,
          nationalNumber: digits.slice(country.dialCode.length),
        };
      }
    }
  }

  const fallback = getPhoneCountries().find((country) => country.isoCode === fallbackIso);
  const national = trimmed.replace(/\D/g, '');

  return {
    countryIso: fallbackIso,
    dialCode: fallback?.dialCode ?? '1',
    nationalNumber: national,
  };
}

export function isValidInternationalPhone(value: string) {
  const normalized = value.replace(/[\s()-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}
