'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddressEditor } from '@/src/components/account/address-editor';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getAddressErrorMessage } from '@/src/utils/errors';
import type { AddressFormData } from '@/src/utils/validations';
import type { User } from '@/src/types';

export default function NewAddressPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');

  const initialValues: AddressFormData = {
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
    isDefault: (user?.addresses?.length ?? 0) === 0,
  };

  const handleSubmit = async (data: AddressFormData) => {
    setError('');
    try {
      await apiClient.post('/users/me/addresses', data);
      const updated = await apiClient.get<User, User>('/auth/me');
      setUser(updated);
      router.push('/account/addresses');
    } catch (submitError) {
      setError(getAddressErrorMessage(submitError));
    }
  };

  return (
    <section>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Addresses
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">
          Add Address
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Add a complete shipping address to your account.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      <AddressEditor
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/account/addresses')}
        submitLabel="Save Address"
      />
    </section>
  );
}
