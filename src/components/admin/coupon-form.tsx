'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { Button } from '@/src/components/ui/button';
import {
  FieldLabel,
  fieldShellClass,
  useTouchedFields,
} from '@/src/components/admin/form-helpers';
import { toDatetimeLocalValue } from '@/src/utils/commerce/publish';
import type { Coupon, CouponType } from '@/src/types';

export interface CouponFormValues {
  code: string;
  type: CouponType;
  value: string;
  description: string;
  active: boolean;
  firstPurchaseOnly: boolean;
  maxUses: string;
  minSubtotal: string;
  startsAt: string;
  expiresAt: string;
}

export function couponToFormValues(coupon?: Coupon | null): CouponFormValues {
  if (!coupon) {
    return {
      code: '',
      type: 'PERCENT',
      value: '10',
      description: '',
      active: true,
      firstPurchaseOnly: false,
      maxUses: '',
      minSubtotal: '',
      startsAt: '',
      expiresAt: '',
    };
  }

  return {
    code: coupon.code,
    type: coupon.type,
    value:
      coupon.type === 'PERCENT'
        ? String(coupon.value)
        : (coupon.value / 100).toFixed(2),
    description: coupon.description ?? '',
    active: coupon.active,
    firstPurchaseOnly: coupon.firstPurchaseOnly,
    maxUses: coupon.maxUses != null ? String(coupon.maxUses) : '',
    minSubtotal:
      coupon.minSubtotal != null ? (coupon.minSubtotal / 100).toFixed(2) : '',
    startsAt: toDatetimeLocalValue(coupon.startsAt),
    expiresAt: toDatetimeLocalValue(coupon.expiresAt),
  };
}

export function formValuesToPayload(values: CouponFormValues) {
  const numeric =
    values.type === 'PERCENT'
      ? Number(values.value)
      : Math.round(Number(values.value) * 100);

  return {
    code: values.code,
    type: values.type,
    value: numeric,
    description: values.description.trim() || null,
    active: values.active,
    firstPurchaseOnly: values.firstPurchaseOnly,
    maxUses: values.maxUses ? Number(values.maxUses) : null,
    minSubtotal: values.minSubtotal
      ? Math.round(Number(values.minSubtotal) * 100)
      : null,
    startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
    expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
  };
}

interface CouponFormProps {
  initial?: Coupon | null;
  submitLabel: string;
  onSubmit: (values: CouponFormValues) => Promise<void>;
}

type TouchedKey = 'code' | 'value';

export function CouponForm({ initial, submitLabel, onSubmit }: CouponFormProps) {
  const [values, setValues] = useState<CouponFormValues>(() => couponToFormValues(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();

  const update = <K extends keyof CouponFormValues>(key: K, value: CouponFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const codeEmpty = !values.code.trim();
  const valueEmpty = !values.value.trim() || !(Number(values.value) > 0);
  const canSave = useMemo(
    () => !saving && !codeEmpty && !valueEmpty,
    [saving, codeEmpty, valueEmpty]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (submitError: unknown) {
      setError(
        submitError && typeof submitError === 'object' && 'message' in submitError
          ? String((submitError as { message: string }).message)
          : 'Failed to save coupon'
      );
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm text-neutral-500">
        Fields marked with <span className="text-red-600">*</span> are required.
      </p>

      <AdminFormSection
        step={1}
        title="Discount code"
        description="The code customers type at checkout and how much it takes off."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Code</FieldLabel>
            <input
              value={values.code}
              onChange={(e) => update('code', e.target.value.toUpperCase())}
              onBlur={() => touch('code')}
              placeholder="WELCOME20"
              aria-invalid={isInvalid('code', codeEmpty) || undefined}
              className={`${fieldShellClass(isInvalid('code', codeEmpty))} font-mono`}
            />
            {isInvalid('code', codeEmpty) ? (
              <p className="mt-1.5 text-xs text-red-600">Code is required.</p>
            ) : null}
          </div>
          <div>
            <FieldLabel required>Type</FieldLabel>
            <select
              value={values.type}
              onChange={(e) => update('type', e.target.value as CouponType)}
              className={`${fieldShellClass(false)} cursor-pointer`}
            >
              <option value="PERCENT">Percent off</option>
              <option value="FIXED">Fixed amount (USD)</option>
            </select>
          </div>
          <div>
            <FieldLabel required>
              {values.type === 'PERCENT' ? 'Percent' : 'Amount (USD)'}
            </FieldLabel>
            <input
              type="number"
              min="0.01"
              step={values.type === 'FIXED' ? '0.01' : '1'}
              value={values.value}
              onChange={(e) => update('value', e.target.value)}
              onBlur={() => touch('value')}
              aria-invalid={isInvalid('value', valueEmpty) || undefined}
              className={fieldShellClass(isInvalid('value', valueEmpty))}
            />
            {isInvalid('value', valueEmpty) ? (
              <p className="mt-1.5 text-xs text-red-600">Enter a value greater than 0.</p>
            ) : null}
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <input
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Optional note"
              className={fieldShellClass(false)}
            />
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        step={2}
        title="Limits"
        description="Optional usage caps and minimum order amount."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Max uses</FieldLabel>
            <input
              type="number"
              min="1"
              value={values.maxUses}
              onChange={(e) => update('maxUses', e.target.value)}
              placeholder="Unlimited"
              className={fieldShellClass(false)}
            />
          </div>
          <div>
            <FieldLabel>Min. subtotal (USD)</FieldLabel>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.minSubtotal}
              onChange={(e) => update('minSubtotal', e.target.value)}
              placeholder="None"
              className={fieldShellClass(false)}
            />
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        step={3}
        title="Schedule & rules"
        description="When the coupon becomes available and who can use it."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel>Starts at</FieldLabel>
            <input
              type="datetime-local"
              value={values.startsAt}
              onChange={(e) => update('startsAt', e.target.value)}
              className={fieldShellClass(false)}
            />
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Empty = available immediately.
            </p>
          </div>
          <div>
            <FieldLabel>Expires at</FieldLabel>
            <input
              type="datetime-local"
              value={values.expiresAt}
              onChange={(e) => update('expiresAt', e.target.value)}
              className={fieldShellClass(false)}
            />
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Last moment the coupon can be used.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-start gap-3 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition-shadow">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => update('active', e.target.checked)}
              className="mt-1 accent-black cursor-pointer"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-950">Active</span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Inactive coupons cannot be applied at checkout.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition-shadow">
            <input
              type="checkbox"
              checked={values.firstPurchaseOnly}
              onChange={(e) => update('firstPurchaseOnly', e.target.checked)}
              className="mt-1 accent-black cursor-pointer"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-950">
                First purchase only
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Valid only for customers with no completed orders yet.
              </span>
            </span>
          </label>
        </div>
      </AdminFormSection>

      <Button type="submit" disabled={!canSave}>
        {saving ? <Loader2 className="animate-spin" size={14} /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
