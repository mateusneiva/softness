'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  CouponForm,
  formValuesToPayload,
  type CouponFormValues,
} from '@/src/components/admin/coupon-form';
import { apiClient } from '@/src/services/api';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import type { Coupon } from '@/src/types';

export default function EditCouponPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Coupon, Coupon>(`/admin/coupons/${params.id}`)
      .then(setCoupon)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (values: CouponFormValues) => {
    await apiClient.put(`/admin/coupons/${params.id}`, formValuesToPayload(values));
    showSaveToast('Coupon saved');
    router.push('/admin/coupons');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="bg-white p-10 text-sm text-neutral-500 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
        Coupon not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/coupons"
        className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to coupons
      </Link>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Sales
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
          Edit Coupon
        </h1>
        <p className="mt-2 font-mono text-sm text-neutral-500">{coupon.code}</p>
      </div>
      <CouponForm
        key={coupon.id}
        initial={coupon}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
