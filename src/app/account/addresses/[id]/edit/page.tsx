'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AddressEditor } from '@/src/components/account/address-editor';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getAddressErrorMessage } from '@/src/utils/errors';
import type { AddressFormData } from '@/src/utils/validations';
import type { User } from '@/src/types';

export default function EditAddressPage() {
  const { id } = useParams<{ id: string }>();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');

  const address = user?.addresses?.find((item) => item.id === id);

  if (!address) {
    return <p className="text-neutral-500">Address not found.</p>;
  }

  const initialValues: AddressFormData = {
    label: address.label,
    street: address.street,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode ?? '',
    country: address.country,
    notes: address.notes ?? '',
    isDefault: address.isDefault,
  };

  const handleSubmit = async (data: AddressFormData) => {
    setError('');
    try {
      await apiClient.put(`/users/me/addresses/${id}`, data);
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
          Edit Address
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Update the shipping details for {address.label}.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      <AddressEditor
        key={address.id}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/account/addresses')}
        submitLabel="Update Address"
      />
    </section>
  );
}
