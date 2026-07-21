'use client';

import { AlertCircle, CreditCard, Loader2, Receipt, Tag, Truck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatPrice } from '@/src/utils/format/currency';
import type { Address } from '@/src/types';

interface CheckoutSummaryProps {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  shippingMethod?: string | null;
  couponCode: string | null;
  total: number;
  selectedAddress?: Address;
  error?: string;
  loading: boolean;
  isAuthenticated: boolean;
  canPay: boolean;
  needsShippingMethod?: boolean;
  onPay: () => void;
}

export function CheckoutSummary({
  itemCount,
  subtotal,
  discountAmount,
  shippingAmount,
  shippingMethod,
  couponCode,
  total,
  selectedAddress,
  error,
  loading,
  isAuthenticated,
  canPay,
  needsShippingMethod = false,
  onPay,
}: CheckoutSummaryProps) {
  const hasDiscount = discountAmount > 0;
  const showBreakdown = hasDiscount || shippingAmount > 0 || Boolean(shippingMethod);

  return (
    <aside>
      <div className="overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="border-b border-neutral-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center bg-violet-50 text-violet-700">
              <Receipt size={16} strokeWidth={2.25} />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">
                Order summary
              </h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                Amount due
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-4">
            {showBreakdown && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Subtotal</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-neutral-950">{formatPrice(subtotal)}</p>
                </div>

                {hasDiscount && (
                  <div className="flex items-start justify-between gap-4 text-emerald-700">
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-sm">
                        <Tag size={13} />
                        Discount
                      </p>
                      {couponCode ? (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-emerald-600/80">
                          {couponCode}
                        </p>
                      ) : null}
                    </div>
                    <p className="font-mono text-sm">-{formatPrice(discountAmount)}</p>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 text-neutral-500">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-sm">
                      <Truck size={13} className="text-sky-700" />
                      Shipping
                    </p>
                    {shippingMethod ? (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        {shippingMethod}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-mono text-sm text-neutral-950">
                    {shippingAmount > 0 ? formatPrice(shippingAmount) : 'Free'}
                  </p>
                </div>
              </>
            )}

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Total due
                </p>
                {!showBreakdown && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    {shippingAmount === 0 ? ' · free shipping' : ''}
                  </p>
                )}
              </div>
              <p className="font-mono text-2xl font-black tracking-tight text-neutral-950">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          {shippingAmount > 0 && (
            <p className="text-xs leading-relaxed text-neutral-400">
              {shippingMethod
                ? `${shippingMethod} is included and confirmed on the Stripe payment page.`
                : 'Shipping is included and confirmed on the Stripe payment page.'}
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-xs text-neutral-500">
              You can review your bag now. Sign in is required to complete payment.
            </p>
          )}

          {isAuthenticated && !selectedAddress && (
            <p className="text-xs text-amber-800/80">
              Add a shipping address before completing payment.
            </p>
          )}

          {isAuthenticated && selectedAddress && needsShippingMethod && (
            <p className="text-xs text-amber-800/80">
              Choose a shipping method above before completing payment.
            </p>
          )}

          <Button onClick={onPay} disabled={loading || !canPay} fullWidth size="xl">
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : !isAuthenticated ? (
              'Sign in to pay'
            ) : !selectedAddress ? (
              'Add address to pay'
            ) : needsShippingMethod ? (
              'Select shipping'
            ) : itemCount === 0 ? (
              'Bag is empty'
            ) : (
              <>
                <CreditCard size={16} />
                Pay with Stripe
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
