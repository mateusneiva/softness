'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check, MapPin, Plus, Truck, X } from 'lucide-react';
import type { Address } from '@/src/types';

interface CheckoutShippingPickerDialogProps {
  open: boolean;
  addresses: Address[];
  selectedAddressId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function CheckoutShippingPickerDialog({
  open,
  addresses,
  selectedAddressId,
  onSelect,
  onClose,
}: CheckoutShippingPickerDialogProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close dialog"
        className={`absolute inset-0 cursor-pointer bg-black/40 transition-opacity duration-150 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col bg-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-150 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        <div className="flex items-start gap-3 border-b border-neutral-100 p-5 pr-12 sm:p-6">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-sky-50 text-sky-700">
            <Truck size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 id={titleId} className="text-lg font-black uppercase tracking-tighter text-neutral-950">
              Choose shipping
            </h2>
            <p className="mt-1 text-sm text-neutral-500">Select the address for this order.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-neutral-400 transition-colors hover:text-neutral-950"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
          {addresses.map((address) => {
            const active = selectedAddressId === address.id;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => {
                  onSelect(address.id);
                  onClose();
                }}
                className={`w-full px-4 py-3.5 text-left transition-colors ${
                  active
                    ? 'bg-sky-50 shadow-[inset_0_0_0_1px_rgba(3,105,161,0.25)]'
                    : 'bg-neutral-50 hover:bg-sky-50/50'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin size={14} className={active ? 'text-sky-700' : 'text-neutral-400'} />
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-sky-700">
                      Default
                    </span>
                  )}
                  {active && <Check size={14} className="ml-auto text-sky-700" strokeWidth={2.5} />}
                </div>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {address.country}
                </p>
              </button>
            );
          })}
        </div>

        <div className="border-t border-neutral-100 px-5 py-4 sm:px-6">
          <Link
            href="/account/addresses/new"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-sky-700 transition-colors hover:text-sky-900"
          >
            <Plus size={12} />
            Add new address
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
