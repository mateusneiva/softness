'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AccountSecurity } from '@/src/components/account/account-security';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { User } from '@/src/types';

export default function AccountSecurityPage() {
  const { user, setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!user) return null;

  const handleChangePassword = async (data: { currentPassword?: string; newPassword: string }) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      await apiClient.patch('/users/me/password', data);
      const updated = await apiClient.get<User, User>('/auth/me');
      setUser(updated);
      const message = user.hasPassword ? 'Password updated successfully' : 'Password set successfully';
      setSuccessMessage(message);
      showSaveToast(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {successMessage && (
        <div className="flex items-center gap-2 text-neutral-900 mb-6 text-sm font-sans">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}
      {errorMessage && <div className="text-red-600 mb-6 text-sm">{errorMessage}</div>}
      <AccountSecurity user={user} onChangePassword={handleChangePassword} submitting={submitting} />
    </>
  );
}
