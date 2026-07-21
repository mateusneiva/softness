'use client';

import { fieldShellClass } from '@/src/components/admin/form-helpers';
import { formatPrice } from '@/src/utils/format/currency';
import { getEffectiveProductPrice, type DiscountType } from '@/src/utils/commerce/pricing';

export interface ProductDiscountDraft {
  enabled: boolean;
  type: DiscountType;
  value: string;
  startsAt: string;
  endsAt: string;
}

export function emptyDiscountDraft(): ProductDiscountDraft {
  return {
    enabled: false,
    type: 'PERCENT',
    value: '10',
    startsAt: '',
    endsAt: '',
  };
}

interface ProductDiscountSettingsProps {
  priceCents: number;
  value: ProductDiscountDraft;
  onChange: (next: ProductDiscountDraft) => void;
}

export function ProductDiscountSettings({
  priceCents,
  value,
  onChange,
}: ProductDiscountSettingsProps) {
  const update = <K extends keyof ProductDiscountDraft>(
    key: K,
    next: ProductDiscountDraft[K]
  ) => onChange({ ...value, [key]: next });

  const preview = value.enabled
    ? getEffectiveProductPrice({
        price: priceCents,
        discountType: value.type,
        discountValue:
          value.type === 'PERCENT'
            ? Number(value.value) || 0
            : Math.round((Number(value.value) || 0) * 100),
        discountStartsAt: value.startsAt || null,
        discountEndsAt: value.endsAt || null,
      })
    : priceCents;

  const fieldClass = fieldShellClass();

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition-shadow">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => update('enabled', e.target.checked)}
          className="mt-1 accent-black cursor-pointer"
        />
        <span>
          <span className="block text-sm font-semibold text-neutral-950">Enable discount</span>
          <span className="block text-xs text-neutral-500 mt-0.5">
            Optionally schedule when the sale price starts and ends.
          </span>
        </span>
      </label>

      {value.enabled ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                Discount type
              </label>
              <select
                value={value.type}
                onChange={(e) => update('type', e.target.value as DiscountType)}
                className={`${fieldClass} cursor-pointer`}
              >
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed amount (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                {value.type === 'PERCENT' ? 'Percent' : 'Amount (USD)'}
              </label>
              <input
                type="number"
                min="0.01"
                step={value.type === 'FIXED' ? '0.01' : '1'}
                value={value.value}
                onChange={(e) => update('value', e.target.value)}
                required={value.enabled}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                Starts at
              </label>
              <input
                type="datetime-local"
                value={value.startsAt}
                onChange={(e) => update('startsAt', e.target.value)}
                className={fieldClass}
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Empty = starts immediately.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
                Ends at
              </label>
              <input
                type="datetime-local"
                value={value.endsAt}
                onChange={(e) => update('endsAt', e.target.value)}
                className={fieldClass}
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Empty = no end date.
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Preview price now:{' '}
            <span className="font-mono font-semibold text-black">{formatPrice(preview)}</span>
            {preview < priceCents ? (
              <span className="ml-2 font-mono text-neutral-400 line-through">
                {formatPrice(priceCents)}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
