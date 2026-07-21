'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Pencil, Truck } from 'lucide-react';
import { CheckoutShippingPickerDialog } from '@/src/components/checkout/checkout-shipping-picker-dialog';
import type { Address } from '@/src/types';

interface CheckoutShippingProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelect: (id: string) => void;
  isAuthenticated: boolean;
}

export function CheckoutShipping({
  addresses,
  selectedAddressId,
  onSelect,
  isAuthenticated,
}: CheckoutShippingProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = addresses.find((address) => address.id === selectedAddressId);

  return (
    <>
      <section className="overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="border-b border-neutral-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center bg-sky-50 text-sky-700">
              <Truck size={16} strokeWidth={2.25} />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">
                Shipping
              </h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                Delivery address
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!isAuthenticated ? (
            <div className="bg-sky-50/60 px-4 py-4 text-sm text-neutral-600">
              Sign in to choose a saved shipping address before payment.{' '}
              <Link href="/login?redirect=/checkout" className="font-medium text-sky-800 underline">
                Log in
              </Link>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-amber-50/70 px-4 py-4 text-sm text-amber-950/80">
              A shipping address is required to complete checkout.{' '}
              <Link href="/account/addresses/new" className="font-medium text-amber-900 underline">
                Add one
              </Link>{' '}
              before paying.
            </div>
          ) : selected ? (
            <div className="bg-sky-50/50 px-4 py-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-sky-700" />
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                    {selected.label}
                  </span>
                  {selected.isDefault && (
                    <span className="bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-sky-700">
                      Default
                    </span>
                  )}
                </div>
                {addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-sky-700 transition-colors hover:text-sky-900"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-neutral-600">
                {selected.street}
                <br />
                {selected.city}, {selected.state} {selected.zipCode}
                <br />
                {selected.country}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <CheckoutShippingPickerDialog
        open={pickerOpen}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelect={onSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
