'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import { OrderTimeline } from '@/src/components/shared/order-timeline';
import { showErrorToast, showSaveToast } from '@/src/components/shared/toast-provider';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import { Button } from '@/src/components/ui/button';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { ApiError, Order } from '@/src/types';

function formatTimeRemaining(remainingMs: number) {
  const totalMinutes = Math.ceil(Math.max(0, remainingMs) / (60 * 1000));
  if (totalMinutes <= 0) return 'Expired';
  if (totalMinutes < 60) return `${totalMinutes}m left`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) return '24h left';
  return minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`;
}

function formatPaymentLabel(order: Order) {
  const brand = order.paymentBrand?.trim();
  const last4 = order.paymentLast4?.trim();
  const type = order.paymentMethodType?.trim();

  if (brand && last4) {
    return `${brand} ······${last4}`;
  }
  if (last4) {
    return `Card ······${last4}`;
  }
  if (brand) {
    return brand;
  }
  if (type === 'card') {
    return 'Card';
  }
  if (type) {
    return type;
  }
  return null;
}

function CopyIdButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showSaveToast(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showErrorToast('Could not copy');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-neutral-950"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const canceled = searchParams.get('canceled') === '1';

  useEffect(() => {
    apiClient
      .get<Order, Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown from server-authoritative expiresInMs (not the local wall clock vs createdAt).
  useEffect(() => {
    if (order?.status !== 'PENDING' || order.expiresInMs == null) {
      setRemainingMs(null);
      return;
    }

    const baseExpiresInMs = order.expiresInMs;
    const receivedAt = Date.now();

    const tick = () => {
      const elapsed = Date.now() - receivedAt;
      setRemainingMs(Math.max(0, baseExpiresInMs - elapsed));
    };

    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, [order?.id, order?.status, order?.expiresInMs, order?.serverNow]);

  const handlePayNow = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      const result = await apiClient.post<{ url: string; orderId: string }, { url: string; orderId: string }>(
        `/orders/${order.id}/pay`,
      );
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      showErrorToast('Could not start payment');
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || 'Could not start payment');
      if (apiError.code === 'ORDER_EXPIRED' || apiError.code === 'ORDER_ALREADY_PAID') {
        const refreshed = await apiClient.get<Order, Order>(`/orders/${order.id}`).catch(() => null);
        if (refreshed) setOrder(refreshed);
      }
    } finally {
      setPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || cancelling) return;
    setCancelling(true);
    setConfirmCancelOpen(false);
    try {
      const cancelled = await apiClient.post<Order, Order>(`/orders/${order.id}/cancel`);
      setOrder(cancelled);
      showSaveToast('Order cancelled');
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-neutral-900" size={28} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-8 text-center">
        <p className="text-neutral-500 mb-4">{error || 'Order not found'}</p>
        <Link href="/account/orders" className="text-xs uppercase tracking-widest font-mono text-black">
          Back to orders
        </Link>
      </div>
    );
  }

  const hasShipping = Boolean(order.shippingStreet || order.shippingCity);
  const paymentLabel = formatPaymentLabel(order);
  const paymentAvailable = Boolean(paymentLabel);
  const hasTracking = Boolean(order.trackingNumber || order.trackingUrl || order.carrier);
  const isPending = order.status === 'PENDING';

  return (
    <section>
      <Link
        href="/account/orders"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
      >
        <ArrowLeft size={14} /> Orders
      </Link>

      {canceled && isPending && (
        <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment was canceled. You can resume payment below before this order expires.
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Order Detail
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">
              #{order.id.slice(0, 8)}
            </h2>
            <CopyIdButton value={order.id} label="Order ID" />
          </div>
          <p className="mt-2 font-mono text-xs text-neutral-500">
            {new Date(order.createdAt).toLocaleString('en-US')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {isPending && remainingMs != null && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-700">
                Expires · {formatTimeRemaining(remainingMs)}
              </span>
            )}
          </div>
        </div>
        <p className="font-mono text-xl font-bold text-neutral-950">{formatPrice(order.total)}</p>
      </div>

      {!isPending && order.status !== 'CANCELLED' && <OrderTimeline status={order.status} />}

      {isPending && (
        <div className="mb-4 flex flex-col gap-3 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Payment pending</p>
            <p className="mt-1 text-sm text-neutral-500">
              Complete payment or cancel this order. Unpaid orders are cancelled automatically after 24 hours.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="md"
              disabled={paying || cancelling}
              onClick={() => setConfirmCancelOpen(true)}
            >
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </Button>
            <Button size="md" disabled={paying || cancelling} onClick={() => void handlePayNow()}>
              {paying ? 'Redirecting…' : 'Pay now'}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-emerald-700">
              <MapPin size={15} />
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Shipping</p>
          </div>
          {hasShipping ? (
            <div className="space-y-1 text-sm text-neutral-600">
              {order.shippingLabel && (
                <p className="font-bold uppercase tracking-wider text-neutral-950">{order.shippingLabel}</p>
              )}
              <p className="font-medium text-neutral-800">{order.shippingStreet}</p>
              <p>
                {[order.shippingCity, order.shippingState, order.shippingZipCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                {order.shippingCountry}
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No shipping address on this order.</p>
          )}
        </div>

        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-sky-50 text-sky-700">
              <CreditCard size={15} />
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Payment</p>
          </div>
          {isPending ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Awaiting payment</p>
              <p className="mt-1 text-sm text-neutral-500">
                No payment has been captured yet.
              </p>
              {order.couponCode && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Coupon · {order.couponCode}
                  {order.discountAmount ? ` (−${formatPrice(order.discountAmount)})` : ''}
                </p>
              )}
            </div>
          ) : paymentAvailable ? (
            <>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">{paymentLabel}</p>
              <p className="mt-1 text-sm text-neutral-500">Paid with card via Stripe</p>
              {order.couponCode && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Coupon · {order.couponCode}
                  {order.discountAmount ? ` (−${formatPrice(order.discountAmount)})` : ''}
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Unavailable</p>
              <p className="mt-1 text-sm text-neutral-500">
                Payment details were not recorded for this order.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancel this order?"
        description="This pending order will be cancelled and can no longer be paid. You can place a new order anytime."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        tone="danger"
        onConfirm={() => void handleCancelOrder()}
        onCancel={() => setConfirmCancelOpen(false)}
      />

      {hasTracking && (
        <div className="mb-4 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-violet-50 text-violet-700">
              <Truck size={15} />
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Tracking</p>
          </div>
          <div className="space-y-1 text-sm text-neutral-600">
            {order.carrier && (
              <p className="font-bold uppercase tracking-wider text-neutral-950">{order.carrier}</p>
            )}
            {order.trackingNumber && (
              <p className="font-mono text-sm text-neutral-800">{order.trackingNumber}</p>
            )}
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-950"
              >
                Track shipment <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center bg-amber-50 text-amber-700">
            <Package size={15} />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Items</p>
        </div>
        <ul className="divide-y divide-neutral-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start gap-4 px-5 py-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-neutral-100">
                {item.imageUrl ? (
                  <Image
                    src={getAssetUrl(item.imageUrl)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-neutral-400">
                    <ShoppingBag size={16} />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold uppercase tracking-wider text-neutral-950">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-600">
                    <Tag size={12} className="shrink-0 text-neutral-400" />
                    {item.variantName}
                  </p>
                )}
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Size {item.size} · Qty {item.quantity}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
                    Product {item.productId.slice(0, 8)}
                  </span>
                  <CopyIdButton value={item.productId} label="Product ID" />
                </div>
              </div>
              <p className="shrink-0 font-mono text-sm text-neutral-950">
                {formatPrice(item.unitAmount * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-neutral-100 px-5 py-4">
          {(() => {
            const itemsSubtotal = order.items.reduce(
              (sum, item) => sum + item.unitAmount * item.quantity,
              0,
            );
            const discountAmount = order.discountAmount ?? 0;
            const shippingAmount = order.shippingAmount ?? 0;
            const showBreakdown = discountAmount > 0 || shippingAmount > 0;

            if (!showBreakdown) {
              return (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Total
                  </span>
                  <span className="font-mono text-lg font-bold text-neutral-950">
                    {formatPrice(order.total)}
                  </span>
                </div>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Subtotal
                  </span>
                  <span className="font-mono text-sm text-neutral-700">{formatPrice(itemsSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                      Discount{order.couponCode ? ` · ${order.couponCode}` : ''}
                    </span>
                    <span className="font-mono text-sm text-neutral-700">
                      −{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Shipping
                  </span>
                  <span className="font-mono text-sm text-neutral-700">
                    {shippingAmount > 0 ? formatPrice(shippingAmount) : 'Free'}
                  </span>
                </div>
                {order.shippingMethod && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                      Method
                    </span>
                    <span className="font-mono text-sm text-neutral-700">{order.shippingMethod}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Total
                  </span>
                  <span className="font-mono text-lg font-bold text-neutral-950">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
