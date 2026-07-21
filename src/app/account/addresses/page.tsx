'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Country, State } from 'country-state-city';
import { CheckCircle2, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getAddressErrorMessage } from '@/src/utils/errors';
import type { User } from '@/src/types';

export default function AccountAddressesPage() {
  const { user, setUser } = useAuthStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const addresses = useMemo(() => {
    const list = [...(user?.addresses ?? [])];
    list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return list;
  }, [user?.addresses]);

  const countryName = (code: string) => Country.getCountryByCode(code)?.name ?? code;
  const stateName = (country: string, code: string) =>
    State.getStateByCodeAndCountry(code, country)?.name ?? code;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    setDeletingId(id);
    setErrorMessage('');
    try {
      await apiClient.delete(`/users/me/addresses/${id}`);
      const updated = await apiClient.get<User, User>('/auth/me');
      setUser(updated);
      setSuccessMessage('Address deleted');
      showSaveToast('Address deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(getAddressErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
            Addresses
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">
            Saved Addresses
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            Manage your home, work and delivery locations.
          </p>
        </div>
        {addresses.length > 0 && (
          <Link
            href="/account/addresses/new"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-950 hover:text-neutral-600 shrink-0"
          >
            <Plus size={14} /> Add address
          </Link>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 text-neutral-900 mb-6 text-sm font-sans">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}
      {errorMessage && <div className="text-red-600 mb-6 text-sm">{errorMessage}</div>}

      {addresses.length === 0 ? (
        <div className="flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-950">No addresses saved yet.</p>
              <p className="mt-1 text-sm text-neutral-500">
                You&apos;ll need one to complete checkout.
              </p>
            </div>
          </div>
          <ButtonLink href="/account/addresses/new" size="md" className="shrink-0 self-start sm:self-auto">
            <Plus size={14} />
            Add address
          </ButtonLink>
        </div>
      ) : (
        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <ul>
            {addresses.map((address, index) => (
              <li
                key={address.id}
                className={`flex items-start justify-between gap-4 ${
                  index > 0 ? 'mt-5 border-t border-neutral-100 pt-5' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                      {address.label}
                    </p>
                    {address.isDefault && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-medium leading-snug text-neutral-800">
                    {address.street}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    {address.city}, {stateName(address.country, address.state)} {address.zipCode}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    {countryName(address.country)}
                  </p>

                  {address.notes && (
                    <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                      <span className="font-mono uppercase tracking-widest">Note</span>
                      <span className="mx-1.5 text-neutral-300">·</span>
                      {address.notes}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/account/addresses/${address.id}/edit`}
                    className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-neutral-950"
                    aria-label="Edit address"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50"
                    aria-label="Delete address"
                  >
                    {deletingId === address.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
