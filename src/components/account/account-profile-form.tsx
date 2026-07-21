'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { FormField } from '../ui/form-field';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { PhoneField } from '../ui/phone-field';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { apiClient } from '@/src/services/api';
import { useAuthStore } from '@/src/store/auth';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { ProfileFormData } from '@/src/utils/validations';
import type { User } from '@/src/types';

interface AccountProfileFormProps {
  form: UseFormReturn<ProfileFormData>;
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

function formatMemberSince(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function AccountProfileForm({ form, user, onSubmit }: AccountProfileFormProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isAdmin = user.role === 'ADMIN';
  const emailVerified = user.emailVerified !== false;

  const handleDeleteAccount = async () => {
    if (isAdmin) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await apiClient.delete('/users/me');
      logout();
      router.push('/');
    } catch (error) {
      setDeleteError(getFriendlyErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <>
      <section>
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Profile</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Personal Information</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Manage your contact details and review your account information.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4">Account</p>
            <ul className="space-y-3">
              <li className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Email</p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">{user.email}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
                    emailVerified ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {emailVerified ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                  {emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </li>
              <li className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Member since</p>
                  <p className="mt-0.5 text-xs text-neutral-500">When you joined Softness</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {formatMemberSince(user.createdAt)}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Details</p>
            <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">Contact information</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Used for order updates and account communication. Your email cannot be changed here.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Full Name" error={form.formState.errors.name?.message} {...form.register('name')} />
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={form.formState.errors.birthDate?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <PhoneField
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={form.formState.errors.phone?.message}
                  />
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
                variant="neutral"
                size="account"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </form>
          </div>

          <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Danger zone</p>
            <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">Delete account</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Permanently remove your account, saved addresses, and order history. This action cannot be undone.
            </p>

            {isAdmin ? (
              <p className="mb-5 text-sm text-neutral-500">Admin accounts cannot be deleted from the storefront.</p>
            ) : null}

            {deleteError ? <p className="mb-4 text-sm text-red-600">{deleteError}</p> : null}

            <Button
              type="button"
              variant="danger"
              size="account"
              disabled={isAdmin}
              onClick={() => setDeleteOpen(true)}
            >
              Delete my account
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete account"
        description="Your profile, addresses, and order history will be permanently deleted. You will be signed out immediately."
        confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
        cancelLabel="Keep account"
        tone="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          if (deleting) return;
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
