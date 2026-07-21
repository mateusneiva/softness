'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { PasswordField } from '@/src/components/ui/password-field';
import { PasswordRequirements } from '@/src/components/ui/password-requirements';
import {
  changePasswordSchema,
  setPasswordSchema,
  type ChangePasswordFormData,
  type SetPasswordFormData,
} from '@/src/utils/validations';
import type { User } from '@/src/types';

interface AccountSecurityProps {
  user: User;
  onChangePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<void>;
  submitting: boolean;
}

export function AccountSecurity({ user, onChangePassword, submitting }: AccountSecurityProps) {
  const hasPassword = Boolean(user.hasPassword);
  const emailVerified = user.emailVerified !== false;

  const changeForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const setForm = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = hasPassword ? changeForm.watch('newPassword') : setForm.watch('newPassword');

  useEffect(() => {
    changeForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setForm.reset({ newPassword: '', confirmPassword: '' });
  }, [hasPassword, changeForm, setForm]);

  const handleChangeSubmit = changeForm.handleSubmit(async (data) => {
    await onChangePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    changeForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
  });

  const handleSetSubmit = setForm.handleSubmit(async (data) => {
    await onChangePassword({ newPassword: data.newPassword });
    setForm.reset({ newPassword: '', confirmPassword: '' });
  });

  return (
    <section>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Security</p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Account Security</h2>
        <p className="text-sm text-neutral-500 mt-2">Manage your password and review how you sign in to Softness.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4">Sign-in methods</p>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Email</p>
                <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono ${
                  emailVerified ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {emailVerified ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                {emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Password</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {hasPassword ? 'Password login enabled' : 'No password set on this account'}
                </p>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-mono ${
                  hasPassword ? 'text-emerald-700' : 'text-neutral-400'
                }`}
              >
                {hasPassword ? 'Active' : 'Not set'}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">Google</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {user.googleLinked ? 'Connected for one-click sign-in' : 'Not connected'}
                </p>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-mono ${
                  user.googleLinked ? 'text-emerald-700' : 'text-neutral-400'
                }`}
              >
                {user.googleLinked ? 'Connected' : 'Not linked'}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Password</p>
          <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-950 mb-1">
            {hasPassword ? 'Change password' : 'Set a password'}
          </h3>
          <p className="text-sm text-neutral-500 mb-5">
            {hasPassword
              ? 'Choose a strong password you do not use elsewhere.'
              : 'Add a password so you can also sign in with email.'}
          </p>

          {hasPassword ? (
            <form onSubmit={handleChangeSubmit} className="space-y-4">
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                error={changeForm.formState.errors.currentPassword?.message}
                {...changeForm.register('currentPassword')}
              />
              <PasswordField
                label="New password"
                autoComplete="new-password"
                error={changeForm.formState.errors.newPassword?.message}
                {...changeForm.register('newPassword')}
              />
              <PasswordRequirements password={newPassword ?? ''} />
              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                error={changeForm.formState.errors.confirmPassword?.message}
                {...changeForm.register('confirmPassword')}
              />
              <Button type="submit" variant="neutral" size="account" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Update password
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetSubmit} className="space-y-4">
              <PasswordField
                label="New password"
                autoComplete="new-password"
                error={setForm.formState.errors.newPassword?.message}
                {...setForm.register('newPassword')}
              />
              <PasswordRequirements password={newPassword ?? ''} />
              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                error={setForm.formState.errors.confirmPassword?.message}
                {...setForm.register('confirmPassword')}
              />
              <Button type="submit" variant="neutral" size="account" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Set password
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
