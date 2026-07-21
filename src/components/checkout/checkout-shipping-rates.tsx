'use client';

import { Check, Loader2, Truck } from 'lucide-react';
import { formatPrice } from '@/src/utils/format/currency';
import type { ShippingRate } from '@/src/types/shipping';

interface CheckoutShippingRatesProps {
  rates: ShippingRate[];
  selectedRateId: string;
  loading: boolean;
  error?: string;
  onSelect: (rate: ShippingRate) => void;
  freeShippingThreshold?: number | null;
  freeShippingApplied?: boolean;
  cartSubtotal?: number;
}

function formatDeliveryDays(days: number | null) {
  if (days == null) return 'Standard delivery';
  if (days <= 1) return '1 business day';
  return `${days} business days`;
}

export function CheckoutShippingRates({
  rates,
  selectedRateId,
  loading,
  error,
  onSelect,
  freeShippingThreshold = null,
  freeShippingApplied = false,
  cartSubtotal = 0,
}: CheckoutShippingRatesProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 bg-white px-5 py-6 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        <Loader2 className="animate-spin text-neutral-900" size={18} />
        <p className="text-sm text-neutral-500">Loading shipping options…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 px-5 py-4 text-sm text-red-700 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        {error}
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        Shipping options are unavailable for this address right now.
      </div>
    );
  }

  const remainingForFree =
    freeShippingThreshold != null && !freeShippingApplied
      ? Math.max(0, freeShippingThreshold - cartSubtotal)
      : 0;

  return (
    <div className="overflow-hidden bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <span className="inline-flex h-9 w-9 items-center justify-center bg-sky-50 text-sky-700">
          <Truck size={16} />
        </span>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">
            Shipping method
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Select a delivery option
          </p>
        </div>
      </div>

      {freeShippingApplied && (
        <p className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-xs text-emerald-800">
          Free shipping unlocked for this order.
        </p>
      )}

      {!freeShippingApplied && remainingForFree > 0 && (
        <p className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 text-xs text-neutral-600">
          Add {formatPrice(remainingForFree)} more for free shipping.
        </p>
      )}

      <ul className="space-y-2 p-4">
        {rates.map((rate) => {
          const selected = rate.id === selectedRateId;
          return (
            <li key={rate.id}>
              <button
                type="button"
                onClick={() => onSelect(rate)}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-all ${
                  selected
                    ? 'bg-sky-50 shadow-[inset_0_0_0_2px_rgba(14,165,233,0.55)]'
                    : 'bg-neutral-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-white hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]'
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    selected
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : 'border-neutral-300 bg-white text-transparent'
                  }`}
                  aria-hidden
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-950">{rate.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{formatDeliveryDays(rate.deliveryDays)}</p>
                </div>
                <p className="shrink-0 font-mono text-sm font-bold text-neutral-950">
                  {rate.amount > 0 ? formatPrice(rate.amount) : 'Free'}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
