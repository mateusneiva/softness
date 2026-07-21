'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { useCartStore } from '@/src/store/cart';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { Order } from '@/src/types';

function CheckoutSuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [resolved, setResolved] = useState(false);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');
  const mock = searchParams.get('mock') === 'true';
  const loading = isAuthenticated && !resolved;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    apiClient
      .post<Order, Order>('/checkout/confirm', {
        ...(sessionId ? { sessionId } : {}),
        ...(orderId ? { orderId } : {}),
        ...(mock ? { mock: true } : {}),
      })
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      })
      .finally(() => {
        if (!cancelled) setResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, sessionId, orderId, mock]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center site-container">
      <CheckCircle2 className="text-black mb-6" size={72} />
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950 mb-3">
        Payment Successful
      </h1>
      <p className="text-neutral-500 mb-8 max-w-md text-sm">
        Thank you for your purchase. Your order has been confirmed and will be prepared soon.
      </p>

      {loading ? (
        <Loader2 className="animate-spin text-neutral-400 mb-8" size={24} />
      ) : order ? (
        <div className="w-full max-w-md text-left bg-neutral-50 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">
              Order
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono text-black">
              {order.status}
            </span>
          </div>
          <p className="font-mono text-sm text-neutral-700 mb-1">#{order.id.slice(0, 8)}</p>
          <p className="text-xl font-black font-mono text-black mb-4">
            {formatPrice(order.total)}
          </p>
          <ul className="space-y-2 mb-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-neutral-600">
                <span>
                  {item.productName}
                  {item.variantName ? ` · ${item.variantName}` : ''} · {item.size} ×{' '}
                  {item.quantity}
                </span>
                <span className="font-mono">{formatPrice(item.unitAmount * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {(() => {
            const itemsSubtotal = order.items.reduce(
              (sum, item) => sum + item.unitAmount * item.quantity,
              0,
            );
            const discountAmount = order.discountAmount ?? 0;
            const shippingAmount = order.shippingAmount ?? 0;
            if (discountAmount <= 0 && shippingAmount <= 0) return null;

            return (
              <div className="space-y-1.5 border-t border-neutral-200 pt-3">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(itemsSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Discount{order.couponCode ? ` · ${order.couponCode}` : ''}</span>
                    <span className="font-mono">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {shippingAmount > 0 ? formatPrice(shippingAmount) : 'Free'}
                  </span>
                </div>
                {order.shippingMethod && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Method</span>
                    <span className="font-mono">{order.shippingMethod}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-1">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(order.total)}</span>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <ButtonLink href="/account/orders" size="xl">
          View Orders
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="xl">
          Continue Shopping
        </ButtonLink>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-neutral-900" size={36} />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
