'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CheckoutPage from './checkout-content';

export default function CheckoutPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-neutral-900" size={36} />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}