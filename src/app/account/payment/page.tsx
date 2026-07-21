'use client';

import { useCallback, useEffect, useState } from 'react';
import { AccountPayment } from '@/src/components/account/account-payment';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { BillingPortalResponse, PaymentOverviewResponse } from '@/src/types';

export default function AccountPaymentPage() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<PaymentOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<PaymentOverviewResponse, PaymentOverviewResponse>(
        '/users/me/payment-overview',
      );
      setOverview(response);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadOverview();
  }, [user, loadOverview]);

  const handleManagePayment = async () => {
    setPortalLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.post<BillingPortalResponse, BillingPortalResponse>(
        '/users/me/billing-portal',
      );
      if (response.url) {
        window.location.href = response.url;
        return;
      }
      setErrorMessage('Billing portal is unavailable right now.');
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <AccountPayment
      overview={overview}
      loading={loading}
      portalLoading={portalLoading}
      errorMessage={errorMessage}
      onManagePayment={handleManagePayment}
    />
  );
}
