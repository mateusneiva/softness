'use client';

import { useEffect, useState } from 'react';
import { AccountOrdersList } from '@/src/components/account/account-orders-list';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { Order } from '@/src/types';

export default function AccountOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    apiClient
      .get<Order[], Order[]>('/orders')
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getFriendlyErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <section>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Orders
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">
          Order History
        </h2>
        <p className="text-sm text-neutral-500 mt-2">Track purchases and review past deliveries.</p>
      </div>

      {error && <div className="text-red-600 mb-6 text-sm">{error}</div>}
      <AccountOrdersList orders={orders} loading={loading} />
    </section>
  );
}
