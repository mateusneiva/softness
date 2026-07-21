'use client';

import { useEffect, useMemo, useState } from 'react';
import { Country } from 'country-state-city';
import { RequiredMark } from '@/src/components/ui/required-mark';
import { FIELD_LABEL_CLASS, fieldInputClass } from '@/src/components/ui/field-styles';
import { CustomSelect, type SelectOption } from '@/src/components/ui/custom-select';
import { getDefaultPhoneCountryIso, getPhoneCountries } from '@/src/constants/phone-countries';
import { CountryFlag } from '@/src/components/ui/country-flag';
import { formatInternationalPhone, parseInternationalPhone } from '@/src/utils/phone';

interface PhoneFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  name?: string;
  defaultCountryIso?: string;
}

export function PhoneField({
  label = 'Phone',
  value,
  onChange,
  onBlur,
  error,
  required,
  name,
  defaultCountryIso,
}: PhoneFieldProps) {
  const fallbackIso = defaultCountryIso ?? getDefaultPhoneCountryIso();
  const parsed = useMemo(() => parseInternationalPhone(value ?? '', fallbackIso), [value, fallbackIso]);

  const [countryIso, setCountryIso] = useState(parsed.countryIso);
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber);

  useEffect(() => {
    setCountryIso(parsed.countryIso);
    setNationalNumber(parsed.nationalNumber);
  }, [parsed.countryIso, parsed.nationalNumber]);

  const countryOptions: SelectOption[] = useMemo(
    () =>
      getPhoneCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
        hint: country.dialCode,
        flagCode: country.isoCode,
      })),
    [],
  );

  const selectedCountry = getPhoneCountries().find((country) => country.isoCode === countryIso);
  const dialCode = selectedCountry?.dialCode ?? '1';

  const emitChange = (nextCountryIso: string, nextNational: string) => {
    onChange(formatInternationalPhone(nextCountryIso, nextNational));
  };

  return (
    <div>
      <label className={FIELD_LABEL_CLASS}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center">
        <CustomSelect
          label=""
          searchable
          name={name ? `${name}-country` : undefined}
          value={countryIso}
          onBlur={onBlur}
          placeholder="Country"
          options={countryOptions}
          error={error}
          onChange={(nextIso) => {
            setCountryIso(nextIso);
            emitChange(nextIso, nationalNumber);
          }}
          triggerPrefix={
            selectedCountry ? (
              <CountryFlag isoCode={selectedCountry.isoCode} className="h-4 w-6 shrink-0 rounded-[2px]" />
            ) : null
          }
          compact
        />

        <div className="relative min-w-0">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-500">
            +{dialCode}
          </span>
          <input
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            value={nationalNumber}
            onChange={(event) => {
              const cleaned = event.target.value.replace(/\D/g, '');
              setNationalNumber(cleaned);
              emitChange(countryIso, cleaned);
            }}
            onBlur={onBlur}
            placeholder={
              Country.getCountryByCode(countryIso)?.name === 'United States' ? '555 123 4567' : 'Phone number'
            }
            aria-invalid={Boolean(error) || undefined}
            className={fieldInputClass({ invalid: Boolean(error), className: 'h-12 !py-0 pl-14' })}
          />
        </div>
      </div>

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
