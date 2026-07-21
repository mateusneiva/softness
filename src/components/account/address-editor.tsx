'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { City, Country, State } from 'country-state-city';
import { Loader2 } from 'lucide-react';
import { addressSchema, type AddressFormData } from '@/src/utils/validations';
import { FormField, FormTextarea } from '@/src/components/ui/form-field';
import { FormSelect } from '@/src/components/ui/form-select';
import { Button } from '@/src/components/ui/button';
import { apiClient } from '@/src/services/api';
import { isCatalogCountry } from '@/src/constants/shipping-countries';
import type { ShippingCountry } from '@/src/types';

interface AddressEditorProps {
  initialValues: AddressFormData;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function AddressEditor({ initialValues, onSubmit, onCancel, submitLabel }: AddressEditorProps) {
  const [allowedCountries, setAllowedCountries] = useState<ShippingCountry[]>([]);

  useEffect(() => {
    apiClient
      .get<{ countries: ShippingCountry[] }, { countries: ShippingCountry[] }>('/shipping/countries')
      .then((response) => setAllowedCountries(response.countries))
      .catch(() => setAllowedCountries([]));
  }, []);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues,
  });

  const selectedCountry = useWatch({ control: form.control, name: 'country' });
  const selectedState = useWatch({ control: form.control, name: 'state' });
  const countries = useMemo(() => {
    const allowedCodes = new Set(
      allowedCountries.length > 0
        ? allowedCountries.map((country) => country.code)
        : [],
    );

    return Country.getAllCountries().filter((country) =>
      allowedCountries.length > 0
        ? allowedCodes.has(country.isoCode)
        : isCatalogCountry(country.isoCode),
    );
  }, [allowedCountries]);
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          label="Address Name"
          placeholder="Home, Work..."
          error={form.formState.errors.label?.message}
          {...form.register('label')}
        />

        <Controller
          name="country"
          control={form.control}
          render={({ field }) => (
            <FormSelect
              label="Country"
              placeholder="Select country"
              searchable
              error={form.formState.errors.country?.message}
              options={countries.map((country) => ({
                value: country.isoCode,
                label: country.name,
                flagCode: country.isoCode,
              }))}
              value={field.value}
              onBlur={field.onBlur}
              name={field.name}
              onChange={(event) => {
                field.onChange(event.target.value);
                form.setValue('state', '');
                form.setValue('city', '');
              }}
            />
          )}
        />
      </div>

      <FormField
        label="Street Address"
        placeholder="Street, number, unit"
        error={form.formState.errors.street?.message}
        {...form.register('street')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Controller
          name="state"
          control={form.control}
          render={({ field }) =>
            states.length > 0 ? (
              <FormSelect
                label="State / Province"
                placeholder="Select region"
                disabled={!selectedCountry}
                error={form.formState.errors.state?.message}
                options={states.map((state) => ({
                  value: state.isoCode,
                  label: state.name,
                }))}
                value={field.value}
                onBlur={field.onBlur}
                name={field.name}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  form.setValue('city', '');
                }}
              />
            ) : (
              <FormField
                label="State / Province"
                placeholder={selectedCountry ? 'Enter region' : 'Select a country first'}
                disabled={!selectedCountry}
                error={form.formState.errors.state?.message}
                value={field.value}
                onBlur={field.onBlur}
                name={field.name}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  form.setValue('city', '');
                }}
              />
            )
          }
        />

        <Controller
          name="city"
          control={form.control}
          render={({ field }) =>
            cities.length > 0 ? (
              <FormSelect
                label="City"
                placeholder="Select city"
                disabled={!selectedState}
                error={form.formState.errors.city?.message}
                options={cities.map((city) => ({
                  value: city.name,
                  label: city.name,
                }))}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            ) : (
              <FormField
                label="City"
                placeholder={selectedState ? 'Enter city' : 'Select a state first'}
                disabled={!selectedState}
                error={form.formState.errors.city?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )
          }
        />
      </div>

      <FormField
        label="ZIP / Postal Code"
        placeholder="10013"
        error={form.formState.errors.zipCode?.message}
        {...form.register('zipCode')}
      />

      <FormTextarea
        label="Notes (optional)"
        placeholder="Delivery instructions, gate code..."
        error={form.formState.errors.notes?.message}
        {...form.register('notes')}
      />

      <label className="flex items-center gap-3 text-sm text-neutral-500 font-sans cursor-pointer">
        <Controller
          name="isDefault"
          control={form.control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="accent-neutral-950"
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        Set as default address
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" onClick={onCancel} variant="outline" size="account" className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="neutral"
          size="account"
          className="flex-[1.4]"
        >
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" size={18} /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
