'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink, Loader2, Receipt, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatPrice } from '@/src/utils/format/currency';
import type { PaymentHistoryEntry, PaymentOverviewResponse } from '@/src/types';

interface AccountPaymentProps {
  overview: PaymentOverviewResponse | null;
  loading: boolean;
  portalLoading: boolean;
  errorMessage: string;
  onManagePayment: () => void;
}

function formatCardBrand(brand: string) {
  return brand
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPaymentLabel(payment: PaymentHistoryEntry) {
  const brand = payment.paymentBrand?.trim();
  const last4 = payment.paymentLast4?.trim();

  if (brand && last4) return `${formatCardBrand(brand)} ···· ${last4}`;
  if (last4) return `Card ···· ${last4}`;
  if (brand) return formatCardBrand(brand);
  if (payment.paymentMethodType === 'card') return 'Card';
  if (payment.paymentMethodType) return payment.paymentMethodType;

  return 'Payment confirmed';
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatExpiry(month: number, year: number) {
  if (!month || !year) return '—';
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}

export function AccountPayment({
  overview,
  loading,
  portalLoading,
  errorMessage,
  onManagePayment,
}: AccountPaymentProps) {
  return (
    <section>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Payment</p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Payment Methods</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Review saved cards, recent charges, and manage billing through Stripe.
        </p>
      </div>

      {errorMessage ? <div className="text-red-600 mb-6 text-sm">{errorMessage}</div> : null}

      {loading ? (
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Loader2 className="animate-spin" size={18} />
          Loading payment information…
        </div>
      ) : !overview?.configured ? (
        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <CreditCard className="mb-3 text-neutral-400" size={28} />
          <p className="text-sm font-semibold text-neutral-900">Payments not configured</p>
          <p className="mt-2 text-sm text-neutral-500">
            Stripe is not connected yet. Saved cards and billing management will appear here once checkout is live.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Saved cards</p>
            <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">Payment methods</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Cards saved during checkout or through the billing portal below.
            </p>

            {overview.savedMethods.length === 0 ? (
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-600">No saved cards yet.</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Your first checkout will save a card here if you choose to. You can also add one through the billing
                  portal below.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {overview.savedMethods.map((method) => (
                  <li key={method.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-neutral-100 text-neutral-700">
                        <CreditCard size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                          {formatCardBrand(method.brand)} ···· {method.last4}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Expires {formatExpiry(method.expMonth, method.expYear)}
                        </p>
                      </div>
                    </div>
                    {method.isDefault ? (
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-emerald-700">
                        Default
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">History</p>
                <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">Recent payments</h3>
                <p className="text-sm text-neutral-500">Your latest completed charges on Softness.</p>
              </div>
              {overview.stats.paidOrdersCount > 0 ? (
                <div className="sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Total spent</p>
                  <p className="mt-1 font-mono text-sm font-bold text-neutral-950">
                    {formatPrice(overview.stats.totalSpent)}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {overview.stats.paidOrdersCount} {overview.stats.paidOrdersCount === 1 ? 'order' : 'orders'}
                  </p>
                </div>
              ) : null}
            </div>

            {overview.recentPayments.length === 0 ? (
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-600">No completed payments yet.</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Once you place an order, the payment details will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {overview.recentPayments.map((payment) => (
                  <li key={payment.orderId}>
                    <Link
                      href={`/account/orders/${payment.orderId}`}
                      className="flex items-center justify-between gap-4 py-4 transition-colors first:pt-0 hover:text-neutral-600"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-neutral-100 text-neutral-700">
                          <Receipt size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                            {formatPaymentLabel(payment)}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">{formatOrderDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-bold text-neutral-950">
                        {formatPrice(payment.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Billing portal</p>
            <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">Manage in Stripe</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Add or remove cards, update billing details, and review receipts in Stripe&apos;s secure customer portal.
            </p>

            <div className="mb-5 flex items-start gap-3 border-t border-neutral-100 pt-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-sky-50 text-sky-700">
                <ShieldCheck size={16} />
              </span>
              <p className="text-xs leading-relaxed text-neutral-500">
                You&apos;ll be redirected to Stripe to manage payment methods. Softness never stores full card numbers
                on our servers.
              </p>
            </div>

            <Button onClick={onManagePayment} disabled={portalLoading} variant="neutral" size="account">
              {portalLoading ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
              Open billing portal
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
