'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe2,
  Loader2,
  Mail,
  Package,
  Search,
  Shield,
  Truck,
  XCircle,
} from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { FieldLabel, fieldShellClass, pluralize } from '@/src/components/admin/form-helpers';
import { Button } from '@/src/components/ui/button';
import { apiClient } from '@/src/services/api';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import { formatPrice } from '@/src/utils/format/currency';
import { CountryFlag } from '@/src/components/ui/country-flag';
import type { SiteSettings, UpdateSiteSettingsInput } from '@/src/types';

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(value: string) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

const COUNTRY_REGIONS: Record<string, string[]> = {
  Americas: ['US', 'CA', 'BR', 'MX'],
  Europe: ['GB', 'IE', 'DE', 'FR', 'NL', 'BE', 'ES', 'IT', 'PT'],
  'Asia-Pacific': ['AU', 'NZ', 'JP', 'KR', 'SG'],
};

const TTL_PRESETS = [
  { label: '6h', value: 6 },
  { label: '12h', value: 12 },
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '72h', value: 72 },
];

type FormState = {
  flatAmount: string;
  flatLabel: string;
  selectedCountries: string[];
  freeShippingEnabled: boolean;
  freeShippingThreshold: string;
  pendingTtlHours: string;
  emailVerificationRequired: boolean;
};

function settingsToFormState(data: SiteSettings): FormState {
  return {
    flatAmount: centsToDollars(data.flatShippingAmount),
    flatLabel: data.flatShippingLabel,
    selectedCountries: data.shippingCountries,
    freeShippingEnabled: data.freeShippingThreshold != null,
    freeShippingThreshold: centsToDollars(data.freeShippingThreshold ?? 10000),
    pendingTtlHours: String(data.pendingOrderTtlHours),
    emailVerificationRequired: data.emailVerificationRequired,
  };
}

function normalizePayload(payload: UpdateSiteSettingsInput) {
  return {
    ...payload,
    shippingCountries: payload.shippingCountries?.slice().sort(),
  };
}

function formStateToPayload(form: FormState): UpdateSiteSettingsInput {
  return {
    flatShippingAmount: dollarsToCents(form.flatAmount),
    flatShippingLabel: form.flatLabel.trim(),
    shippingCountries: form.selectedCountries,
    freeShippingThreshold: form.freeShippingEnabled
      ? dollarsToCents(form.freeShippingThreshold)
      : null,
    pendingOrderTtlHours: Number.parseInt(form.pendingTtlHours, 10),
    emailVerificationRequired: form.emailVerificationRequired,
  };
}

function ToggleCard({
  checked,
  disabled,
  title,
  description,
  onChange,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onChange: (next: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden transition-shadow ${
        checked
          ? 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]'
          : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 accent-black cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-neutral-950">{title}</span>
          <span className="mt-1 block text-xs leading-relaxed text-neutral-500">{description}</span>
        </span>
      </label>
      {checked && children ? (
        <div className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'success' | 'warning';
}) {
  const tones = {
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-emerald-50 text-emerald-800',
    warning: 'bg-amber-50 text-amber-800',
  };

  return (
    <div className={`px-3 py-2 ${tones[tone]}`}>
      <p className="font-mono text-[9px] uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');

  useEffect(() => {
    apiClient
      .get<SiteSettings, SiteSettings>('/admin/settings')
      .then((data) => {
        setSettings(data);
        setForm(settingsToFormState(data));
      })
      .finally(() => setLoading(false));
  }, []);

  const catalog = useMemo(() => settings?.catalogCountries ?? [], [settings?.catalogCountries]);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter(
      (country) =>
        country.code.toLowerCase().includes(query) ||
        country.name.toLowerCase().includes(query),
    );
  }, [catalog, countryQuery]);

  const isDirty = useMemo(() => {
    if (!settings || !form) return false;
    return (
      JSON.stringify(normalizePayload(formStateToPayload(form))) !==
      JSON.stringify(normalizePayload(formStateToPayload(settingsToFormState(settings))))
    );
  }, [settings, form]);

  const flatAmountCents = form ? dollarsToCents(form.flatAmount) : 0;
  const freeThresholdCents = form ? dollarsToCents(form.freeShippingThreshold) : 0;
  const ttl = form ? Number.parseInt(form.pendingTtlHours, 10) : 24;

  const canSave =
    Boolean(form?.flatLabel.trim()) &&
    (form?.selectedCountries.length ?? 0) > 0 &&
    Number.isFinite(ttl) &&
    ttl >= 1 &&
    ttl <= 168;

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const toggleCountry = (code: string) => {
    if (!form) return;
    updateForm(
      'selectedCountries',
      form.selectedCountries.includes(code)
        ? form.selectedCountries.filter((c) => c !== code)
        : [...form.selectedCountries, code],
    );
  };

  const catalogCodes = useMemo(() => catalog.map((country) => country.code), [catalog]);

  const toggleAllCountries = () => {
    if (!form) return;
    const allSelected =
      catalogCodes.length > 0 && catalogCodes.every((code) => form.selectedCountries.includes(code));
    updateForm('selectedCountries', allSelected ? [] : catalogCodes);
  };

  const toggleRegion = (codes: string[]) => {
    if (!form) return;
    const regionCodes = codes.filter((code) => catalogCodes.includes(code));
    if (regionCodes.length === 0) return;

    const allSelected = regionCodes.every((code) => form.selectedCountries.includes(code));
    updateForm(
      'selectedCountries',
      allSelected
        ? form.selectedCountries.filter((code) => !regionCodes.includes(code))
        : Array.from(new Set([...form.selectedCountries, ...regionCodes])),
    );
  };

  const allCountriesSelected =
    Boolean(form) &&
    catalogCodes.length > 0 &&
    catalogCodes.every((code) => form!.selectedCountries.includes(code));

  const handleSave = async () => {
    if (!form || !canSave) return;
    setSaving(true);
    try {
      const updated = await apiClient.patch<SiteSettings, SiteSettings>(
        '/admin/settings',
        formStateToPayload(form),
      );
      setSettings(updated);
      setForm(settingsToFormState(updated));
      showSaveToast('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form || !settings) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  const shippingPreview = `${form.flatLabel.trim() || 'Standard shipping'} · ${formatPrice(flatAmountCents)}`;

  return (
    <div className="pb-24">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatusPill label="Shipping" value="Flat rate" tone="neutral" />
        <StatusPill
          label="Markets"
          value={pluralize(form.selectedCountries.length, 'country')}
          tone={form.selectedCountries.length > 0 ? 'success' : 'warning'}
        />
        <StatusPill
          label="Email"
          value={settings.emailConfigured ? 'SMTP live' : 'Console only'}
          tone={settings.emailConfigured ? 'success' : 'warning'}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <AdminFormSection
            step={1}
            title="Flat shipping rate"
            description="One predictable shipping fee shown at checkout for every eligible order."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Shipping fee (USD)</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.flatAmount}
                  onChange={(event) => updateForm('flatAmount', event.target.value)}
                  className={fieldShellClass(false)}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Customers will see {formatPrice(flatAmountCents)} unless free shipping applies.
                </p>
              </div>
              <div>
                <FieldLabel>Checkout label</FieldLabel>
                <input
                  type="text"
                  maxLength={120}
                  value={form.flatLabel}
                  onChange={(event) => updateForm('flatLabel', event.target.value)}
                  placeholder="Standard shipping"
                  className={fieldShellClass(false)}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Shown next to the shipping line in checkout and order summaries.
                </p>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            step={2}
            title="Free shipping rule"
            description="Reward larger carts with complimentary delivery. Based on merchandise subtotal before coupons."
          >
            <ToggleCard
              checked={form.freeShippingEnabled}
              title="Enable free shipping threshold"
              description="When the cart subtotal reaches your threshold, shipping becomes free automatically."
              onChange={(next) => updateForm('freeShippingEnabled', next)}
            >
              <div className="max-w-xs">
                <FieldLabel>Minimum subtotal (USD)</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeShippingThreshold}
                  onChange={(event) => updateForm('freeShippingThreshold', event.target.value)}
                  className={fieldShellClass(false)}
                />
              </div>
            </ToggleCard>
          </AdminFormSection>

          <AdminFormSection
            step={3}
            title="Delivery countries"
            description="Only checked countries appear in address forms and can complete checkout."
          >
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleAllCountries}
                className={`cursor-pointer px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  allCountriesSelected
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                }`}
              >
                {allCountriesSelected ? 'All countries' : 'Select all'}
              </button>
              {Object.entries(COUNTRY_REGIONS).map(([region, codes]) => {
                const regionCodes = codes.filter((code) => catalogCodes.includes(code));
                const selectedInRegion = regionCodes.filter((code) =>
                  form.selectedCountries.includes(code),
                ).length;
                const regionFullySelected =
                  regionCodes.length > 0 && selectedInRegion === regionCodes.length;
                const regionPartiallySelected =
                  selectedInRegion > 0 && selectedInRegion < regionCodes.length;

                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(codes)}
                    className={`cursor-pointer px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                      regionFullySelected
                        ? 'bg-neutral-950 text-white'
                        : regionPartiallySelected
                          ? 'bg-neutral-200 text-neutral-800'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                    }`}
                  >
                    {region}
                    {regionPartiallySelected ? ` (${selectedInRegion}/${regionCodes.length})` : ''}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => updateForm('selectedCountries', [])}
                className="cursor-pointer px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-600"
              >
                Clear
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={countryQuery}
                onChange={(event) => setCountryQuery(event.target.value)}
                placeholder="Search by name or code…"
                className={`${fieldShellClass(false)} pl-10`}
              />
            </div>

            <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
              <span>
                {pluralize(form.selectedCountries.length, 'country enabled')} of{' '}
                {catalog.length}
              </span>
              {form.selectedCountries.length === 0 ? (
                <span className="text-red-600">Select at least one</span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredCountries.map((country) => {
                const active = form.selectedCountries.includes(country.code);
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.code)}
                    className={`cursor-pointer px-3 py-2.5 text-left transition-all ${
                      active
                        ? 'bg-neutral-950 text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]'
                        : 'bg-neutral-50 text-neutral-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CountryFlag isoCode={country.code} className="h-4 w-6 shrink-0 rounded-[2px]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                        {country.code}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-snug">
                      {country.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredCountries.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No countries match your search.</p>
            ) : null}
          </AdminFormSection>

          <AdminFormSection
            step={4}
            title="Checkout timing"
            description="Unpaid orders are automatically cancelled after this window. Stripe sessions follow the same limit."
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {TTL_PRESETS.map((preset) => {
                const active = form.pendingTtlHours === String(preset.value);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => updateForm('pendingTtlHours', String(preset.value))}
                    className={`cursor-pointer px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                      active
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="max-w-xs">
              <FieldLabel>Custom duration (hours)</FieldLabel>
              <input
                type="number"
                min="1"
                max="168"
                step="1"
                value={form.pendingTtlHours}
                onChange={(event) => updateForm('pendingTtlHours', event.target.value)}
                className={fieldShellClass(false)}
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">Allowed range: 1–168 hours (7 days max).</p>
            </div>
          </AdminFormSection>

          <AdminFormSection
            step={5}
            title="Transactional email"
            description="SMTP credentials live in the API environment. This panel shows delivery status only."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                {settings.emailConfigured ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {settings.emailConfigured ? 'SMTP configured' : 'Development fallback'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    {settings.emailConfigured
                      ? 'Verification, order confirmation, and shipping emails are sent to customers.'
                      : 'Emails are logged to the server console until SMTP_HOST and EMAIL_FROM are set.'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-950">
                  Messages sent
                </p>
                <ul className="space-y-1.5 text-xs text-neutral-500">
                  <li className="flex items-center gap-2">
                    <Mail size={12} className="text-violet-600" /> Account verification code
                  </li>
                  <li className="flex items-center gap-2">
                    <Package size={12} className="text-sky-600" /> Order confirmation
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck size={12} className="text-emerald-600" /> Shipment notification
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.22)]">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-neutral-950">Highly recommended: email verification</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  Requiring email verification on sign-up helps block automated bot registrations and disposable
                  addresses. Combine it with Cloudflare Turnstile (below) for stronger protection on login and
                  registration forms.
                </p>
              </div>
            </div>
            <ToggleCard
              checked={form.emailVerificationRequired}
              disabled={!settings.emailConfigured}
              title="Require email verification on sign-up"
              description={
                settings.emailConfigured
                  ? 'New accounts must confirm their email before signing in. Turn off to let customers use the store immediately after registration.'
                  : 'Configure SMTP first — without email delivery, verification stays off automatically.'
              }
              onChange={(next) => updateForm('emailVerificationRequired', next)}
            />
          </AdminFormSection>

          <AdminFormSection
            step={6}
            title="Bot protection"
            description="Cloudflare Turnstile keys live in the API environment (TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY)."
          >
            <div className="flex items-start gap-3 p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              {settings.turnstileConfigured ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              )}
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {settings.turnstileConfigured ? 'Turnstile active' : 'Turnstile not configured'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {settings.turnstileConfigured
                    ? 'Login, registration, and resend-verification forms require a successful Turnstile challenge.'
                    : 'Add both Turnstile keys to the API .env to enable bot protection on auth forms.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              <Shield size={18} className="mt-0.5 shrink-0 text-sky-700" />
              <div className="space-y-2 text-xs leading-relaxed text-neutral-500">
                <p className="font-semibold uppercase tracking-wider text-neutral-950">Setup</p>
                <ol className="list-decimal space-y-1 pl-4">
                  <li>Create a Turnstile widget in the Cloudflare dashboard.</li>
                  <li>Set <span className="font-mono text-neutral-700">TURNSTILE_SITE_KEY</span> and{' '}
                    <span className="font-mono text-neutral-700">TURNSTILE_SECRET_KEY</span> in the API environment.</li>
                  <li>Restart the API — auth forms will show the challenge automatically.</li>
                </ol>
              </div>
            </div>
          </AdminFormSection>

          <Button type="submit" disabled={!canSave || saving || !isDirty} size="lg">
            {saving ? <Loader2 className="animate-spin" size={14} /> : null}
            Save settings
          </Button>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-8">
          <div className="overflow-hidden bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <div className="border-b border-neutral-100 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                Checkout preview
              </p>
              <h3 className="mt-1 text-sm font-black uppercase tracking-wider text-neutral-950">
                What customers see
              </h3>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div className="flex items-start gap-3">
                <Truck size={15} className="mt-0.5 shrink-0 text-sky-700" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">Shipping</p>
                  <p className="mt-1 font-medium text-neutral-950">{shippingPreview}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">Markets</p>
                  <p className="mt-1 font-medium text-neutral-950">
                    {form.selectedCountries.length === catalog.length
                      ? 'Worldwide (all enabled)'
                      : `${form.selectedCountries.length} countries`}
                  </p>
                </div>
              </div>
              {form.freeShippingEnabled ? (
                <div className="bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
                  Free shipping on orders over {formatPrice(freeThresholdCents)}
                </div>
              ) : null}
              <div className="flex items-start gap-3">
                <Clock size={15} className="mt-0.5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">Pay within</p>
                  <p className="mt-1 font-medium text-neutral-950">
                    {Number.isFinite(ttl) ? `${ttl} hours` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isDirty ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-700">
              Unsaved changes
            </p>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              All changes saved
            </p>
          )}
        </aside>
      </div>

      {isDirty ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-6 py-4 backdrop-blur-sm lg:left-60 xl:left-64">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">You have unsaved store settings.</p>
            <Button type="button" onClick={() => void handleSave()} disabled={!canSave || saving} size="md">
              {saving ? <Loader2 className="animate-spin" size={14} /> : null}
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
