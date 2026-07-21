'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { FilterSelect } from '@/src/components/ui/filter-select';
import { Button } from '@/src/components/ui/button';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import { OrderTimeline } from '@/src/components/shared/order-timeline';
import { ORDER_STATUS_FILTER_OPTIONS } from '@/src/utils/admin/filter-options';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { showErrorToast, showSaveToast } from '@/src/components/shared/toast-provider';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { Order, OrderStatus } from '@/src/types';

type AdminOrder = Order & {
  user?: { id: string; email: string; name: string | null; phone?: string | null };
};

const STATUS_OPTIONS = ORDER_STATUS_FILTER_OPTIONS.filter((option) => option.value !== 'all');

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    apiClient.get<AdminOrder, AdminOrder>(`/admin/orders/${id}`)
      .then((data) => {
        setOrder(data);
        setCarrier(data.carrier ?? '');
        setTrackingNumber(data.trackingNumber ?? '');
        setTrackingUrl(data.trackingUrl ?? '');
      })
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await apiClient.patch<AdminOrder, AdminOrder>(`/admin/orders/${order.id}`, {
        status,
        ...(status === 'SHIPPED'
          ? {
              carrier: carrier || null,
              trackingNumber: trackingNumber || null,
              trackingUrl: trackingUrl || null,
            }
          : {}),
      });
      setOrder(updated);
      showSaveToast('Order status updated');
    } catch (err) {
      showErrorToast(getFriendlyErrorMessage(err) || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const saveTracking = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const shouldMarkShipped =
        Boolean(carrier.trim() && trackingNumber.trim()) && order.status === 'PROCESSING';

      const updated = await apiClient.patch<AdminOrder, AdminOrder>(`/admin/orders/${order.id}`, {
        ...(shouldMarkShipped ? { status: 'SHIPPED' as const } : {}),
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
      });
      setOrder(updated);
      showSaveToast(shouldMarkShipped ? 'Tracking saved and order marked shipped' : 'Tracking saved');
    } catch (err) {
      showErrorToast(getFriendlyErrorMessage(err) || 'Failed to save tracking');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-900" size={28} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500 mb-4">{error || 'Order not found'}</p>
        <Link href="/admin/orders" className="text-xs uppercase tracking-widest font-mono text-black">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/orders"
        className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
            Order Detail
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">
            #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-neutral-500 mt-2 font-mono">
            {new Date(order.createdAt).toLocaleString('en-US')}
          </p>
          <div className="mt-3">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-bold text-black">{formatPrice(order.total)}</span>
          <FilterSelect
            label="Status"
            value={order.status}
            onChange={(value) => {
              if (!saving) void updateStatus(value as OrderStatus);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </motion.div>

      {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
        <div className="mb-6">
          <OrderTimeline status={order.status} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 shadow-[0_10px_36px_rgba(0,0,0,0.08)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
            Customer
          </p>
          <p className="font-bold text-black">{order.user?.name || 'Customer'}</p>
          <p className="text-sm text-neutral-500 mt-1">{order.user?.email}</p>
          {order.user?.phone && <p className="text-sm text-neutral-500 mt-1">{order.user.phone}</p>}
        </div>

        <div className="bg-white p-5 shadow-[0_10px_36px_rgba(0,0,0,0.08)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
            Shipping
          </p>
          {order.shippingStreet || order.shippingCity ? (
            <div className="text-sm text-neutral-600 space-y-1">
              {order.shippingLabel && <p className="font-bold text-black">{order.shippingLabel}</p>}
              <p>{order.shippingStreet}</p>
              <p>
                {[order.shippingCity, order.shippingState, order.shippingZipCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No shipping address</p>
          )}
        </div>
      </div>

      <div className="bg-white p-5 mb-6 shadow-[0_10px_36px_rgba(0,0,0,0.08)] space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          Tracking (demo)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Carrier"
            className="bg-neutral-50 p-3 border border-transparent shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:outline-none"
          />
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number"
            className="bg-neutral-50 p-3 border border-transparent shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:outline-none"
          />
          <input
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="Tracking URL"
            className="bg-neutral-50 p-3 border border-transparent shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:outline-none"
          />
        </div>
        <Button type="button" onClick={saveTracking} disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save tracking / mark shipped'}
        </Button>
      </div>

      <div className="bg-white shadow-[0_10px_36px_rgba(0,0,0,0.08)]">
        <div className="px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Items</p>
        </div>
        <ul>
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]"
            >
              <div className="relative w-14 h-16 bg-neutral-100 overflow-hidden shrink-0">
                {item.imageUrl && (
                  <Image
                    src={getAssetUrl(item.imageUrl)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase tracking-wider text-sm text-black truncate">
                  {item.productName}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 mt-1">
                  {item.variantName ? `${item.variantName} · ` : ''}Size {item.size} · Qty{' '}
                  {item.quantity}
                </p>
              </div>
              <p className="font-mono text-sm text-black">
                {formatPrice(item.unitAmount * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 space-y-2 bg-neutral-50">
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
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                    Total
                  </span>
                  <span className="font-mono text-lg font-bold text-black">
                    {formatPrice(order.total)}
                  </span>
                </div>
              );
            }

            return (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                    Subtotal
                  </span>
                  <span className="font-mono text-sm text-neutral-700">{formatPrice(itemsSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                      Discount{order.couponCode ? ` · ${order.couponCode}` : ''}
                    </span>
                    <span className="font-mono text-sm text-neutral-700">
                      −{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                    Shipping
                  </span>
                  <span className="font-mono text-sm text-neutral-700">
                    {shippingAmount > 0 ? formatPrice(shippingAmount) : 'Free'}
                  </span>
                </div>
                {order.shippingMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                      Method
                    </span>
                    <span className="font-mono text-sm text-neutral-700">{order.shippingMethod}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                    Total
                  </span>
                  <span className="font-mono text-lg font-bold text-black">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
