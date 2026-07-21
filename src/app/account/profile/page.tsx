'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { AccountProfileForm } from '@/src/components/account/account-profile-form';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { profileSchema, type ProfileFormData } from '@/src/utils/validations';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { User } from '@/src/types';

export default function AccountProfilePage() {
  const { user, setUser } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '', birthDate: '' },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    });
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setErrorMessage('');
    try {
      const updated = await apiClient.patch<User, User>('/users/me', data);
      setUser(updated);
      setSuccessMessage('Profile updated successfully');
      showSaveToast('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    }
  };

  if (!user) return null;

  return (
    <>
      {successMessage && (
        <div className="flex items-center gap-2 text-neutral-900 mb-6 text-sm font-sans">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}
      {errorMessage && <div className="text-red-600 mb-6 text-sm">{errorMessage}</div>}
      <AccountProfileForm form={form} user={user} onSubmit={onSubmit} />
    </>
  );
}
