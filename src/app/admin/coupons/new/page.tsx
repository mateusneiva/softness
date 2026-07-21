'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  CouponForm,
  formValuesToPayload,
  type CouponFormValues,
} from '@/src/components/admin/coupon-form';
import { apiClient } from '@/src/services/api';
import { showSaveToast } from '@/src/components/shared/toast-provider';

export default function NewCouponPage() {
  const router = useRouter();

  const handleSubmit = async (values: CouponFormValues) => {
    await apiClient.post('/admin/coupons', formValuesToPayload(values));
    showSaveToast('Coupon created');
    router.push('/admin/coupons');
  };

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
          New Coupon
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Work through each section. Fields marked with{' '}
          <span className="text-red-600">*</span> are required.
        </p>
      </div>
      <CouponForm submitLabel="Create coupon" onSubmit={handleSubmit} />
    </div>
  );
}
