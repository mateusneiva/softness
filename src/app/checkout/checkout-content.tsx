'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '@/src/store/cart';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage, getShippingErrorMessage } from '@/src/utils/errors';
import { CheckoutItems } from '@/src/components/checkout/checkout-items';
import { CheckoutShipping } from '@/src/components/checkout/checkout-shipping';
import { CheckoutShippingRates } from '@/src/components/checkout/checkout-shipping-rates';
import { CheckoutCoupon } from '@/src/components/checkout/checkout-coupon';
import { CheckoutSummary } from '@/src/components/checkout/checkout-summary';
import type { CheckoutResponse, ShippingQuoteResponse, ShippingRate, User } from '@/src/types';

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, updateQuantity, removeItem, setIsOpen } = useCartStore();
  const { user, isAuthenticated, isLoading: authLoading, setUser } = useAuthStore();
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
  const [freeShippingApplied, setFreeShippingApplied] = useState(false);

  const canceled = searchParams.get('canceled') === '1';
  const addresses = useMemo(() => user?.addresses ?? [], [user?.addresses]);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingAmount = selectedRate?.amount ?? 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingAmount;
  const selectedAddressIdResolved =
    selectedAddressId ||
    addresses.find((address) => address.isDefault)?.id ||
    addresses[0]?.id ||
    '';

  useEffect(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get<User, User>('/auth/me')
      .then(setUser)
      .catch(() => {});
  }, [isAuthenticated, setUser]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressIdResolved),
    [addresses, selectedAddressIdResolved],
  );

  const quoteItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        size: item.size,
      })),
    [items],
  );

  useEffect(() => {
    if (!isAuthenticated || !selectedAddressIdResolved || items.length === 0) {
      setShippingRates([]);
      setSelectedRate(null);
      setRatesError('');
      return;
    }

    let cancelled = false;
    setRatesLoading(true);
    setRatesError('');

    apiClient
      .post<ShippingQuoteResponse, ShippingQuoteResponse>('/shipping/quote', {
        addressId: selectedAddressIdResolved,
        items: quoteItems,
      })
      .then((quote) => {
        if (cancelled) return;
        setShippingRates(quote.rates);
        setFreeShippingThreshold(quote.freeShippingThreshold ?? null);
        setFreeShippingApplied(Boolean(quote.freeShippingApplied));
        setSelectedRate((current) => {
          if (current && quote.rates.some((rate) => rate.id === current.id)) {
            return quote.rates.find((rate) => rate.id === current.id) ?? quote.rates[0] ?? null;
          }
          return quote.rates[0] ?? null;
        });
      })
      .catch((quoteError) => {
        if (cancelled) return;
        setShippingRates([]);
        setSelectedRate(null);
        setFreeShippingApplied(false);
        setRatesError(getShippingErrorMessage(quoteError));
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedAddressIdResolved, quoteItems, items.length]);

  const applyCoupon = async (code: string) => {
    const preview = await apiClient.post<
      { code: string; discountAmount: number },
      { code: string; discountAmount: number }
    >('/coupons/preview', { code, subtotal });
    setCouponCode(preview.code);
    setDiscountAmount(preview.discountAmount);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!selectedAddressIdResolved) {
      setError('Add a shipping address before completing payment.');
      return;
    }

    if (!selectedRate) {
      setError('Select a shipping method before completing payment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiClient.post<CheckoutResponse, CheckoutResponse>('/checkout', {
        items: quoteItems,
        addressId: selectedAddressIdResolved,
        shippingRate: {
          rateId: selectedRate.id,
          carrier: selectedRate.carrier,
          service: selectedRate.service,
          amount: selectedRate.amount,
        },
        ...(couponCode ? { couponCode } : {}),
      });

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError('Checkout URL was not returned.');
      setLoading(false);
    } catch (checkoutError) {
      setError(getFriendlyErrorMessage(checkoutError));
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-neutral-900" size={36} />
      </div>
    );
  }

  return (
    <div className="site-container flex-1 py-8 lg:py-12">
      <motion.button
        type="button"
        onClick={() => router.push('/')}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
      >
        <ArrowLeft size={15} /> Continue shopping
      </motion.button>

      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Checkout
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950 md:text-4xl">
          Review Order
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Confirm your items, shipping address, and delivery method before payment.
        </p>
      </motion.div>

      {canceled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mb-6 flex items-center gap-2 bg-amber-50 px-4 py-3 text-sm text-amber-950/80"
        >
          <AlertCircle size={16} className="shrink-0 text-amber-700" />
          Payment was canceled. Your cart is still available.
        </motion.div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)] xl:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <CheckoutItems
            items={items}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        </motion.div>

        <motion.div
          className="space-y-6 lg:sticky lg:top-28 lg:self-start"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
        >
          <CheckoutShipping
            addresses={addresses}
            selectedAddressId={selectedAddressIdResolved}
            onSelect={setSelectedAddressId}
            isAuthenticated={isAuthenticated}
          />
          <CheckoutShippingRates
            rates={shippingRates}
            selectedRateId={selectedRate?.id ?? ''}
            loading={ratesLoading && Boolean(selectedAddressIdResolved && items.length > 0)}
            error={ratesError}
            onSelect={setSelectedRate}
            freeShippingThreshold={freeShippingThreshold}
            freeShippingApplied={freeShippingApplied}
            cartSubtotal={subtotal}
          />
          <CheckoutCoupon
            couponCode={couponCode}
            onApply={applyCoupon}
            onClear={() => {
              setCouponCode(null);
              setDiscountAmount(0);
            }}
          />
          <CheckoutSummary
            itemCount={itemCount}
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingAmount={shippingAmount}
            shippingMethod={selectedRate?.label ?? null}
            couponCode={couponCode}
            total={total}
            selectedAddress={selectedAddress}
            error={error}
            loading={loading}
            isAuthenticated={isAuthenticated}
            canPay={
              isAuthenticated &&
              Boolean(selectedAddress) &&
              Boolean(selectedRate) &&
              itemCount > 0 &&
              !ratesLoading
            }
            needsShippingMethod={Boolean(selectedAddress) && !selectedRate && !ratesLoading}
            onPay={handleCheckout}
          />
        </motion.div>
      </div>
    </div>
  );
}
