'use client';

import { useEffect, useState } from 'react';
import { AccountOverview } from '@/src/components/account/account-overview';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { AccountOverviewResponse } from '@/src/types';

export default function AccountOverviewPage() {
  const { user, setUser } = useAuthStore();
  const [overview, setOverview] = useState<AccountOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    apiClient
      .get<AccountOverviewResponse, AccountOverviewResponse>('/users/me/overview')
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setUser(data.user);
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
  }, [user?.id, setUser]);

  return (
    <>
      {error && <div className="text-red-600 mb-6 text-sm">{error}</div>}
      <AccountOverview overview={overview} loading={loading && !overview} />
    </>
  );
}
