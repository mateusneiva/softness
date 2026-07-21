'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/src/utils/validations';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import { FormField } from '@/src/components/ui/form-field';
import { Button } from '@/src/components/ui/button';
import { TurnstileField } from '@/src/components/ui/turnstile-field';
import type { AuthFeaturesResponse } from '@/src/types';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';
  const [serverError, setServerError] = useState('');
  const [info, setInfo] = useState('');
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [resending, setResending] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  useEffect(() => {
    apiClient
      .get<AuthFeaturesResponse, AuthFeaturesResponse>('/auth/features')
      .then((features) => {
        setTurnstileSiteKey(
          features.turnstile?.enabled && features.turnstile.siteKey ? features.turnstile.siteKey : null,
        );
      })
      .catch(() => setTurnstileSiteKey(null));
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: initialEmail, code: '' },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    setServerError('');
    setInfo('');
    try {
      const response = await apiClient.post<{ token: string }, { token: string }>(
        '/auth/verify-email',
        data
      );
      await login(response.token);
      router.push('/');
    } catch (error) {
      setServerError(getFriendlyErrorMessage(error));
    }
  };

  const resend = async () => {
    setServerError('');
    setInfo('');
    setResending(true);
    const email = getValues('email');
    if (!email) {
      setServerError('Enter your email first');
      return;
    }
    try {
      await apiClient.post('/auth/resend-verification', {
        email,
        turnstileToken: turnstileToken ?? undefined,
      });
      setInfo('If verification is needed, a new code was sent. Check your inbox.');
    } catch (error) {
      setServerError(getFriendlyErrorMessage(error));
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">
          Verify email
        </h1>
        <p className="mt-2 text-sm text-neutral-500 font-sans">
          Enter the 6-digit code we sent to finish creating your account.
        </p>
      </div>

      {serverError && <div className="mb-6 text-sm text-red-600 font-sans">{serverError}</div>}
      {info && <div className="mb-6 text-sm text-neutral-600 font-sans">{info}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Verification code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          error={errors.code?.message}
          {...register('code')}
        />

        <Button type="submit" disabled={isSubmitting} variant="neutral" size="auth" fullWidth>
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify & continue'}
        </Button>
      </form>

      {turnstileSiteKey ? (
        <div className="mt-4">
          <TurnstileField
            siteKey={turnstileSiteKey}
            resetKey={turnstileResetKey}
            onTokenChange={setTurnstileToken}
          />
        </div>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="md"
        fullWidth
        className="mt-4"
        disabled={resending || (Boolean(turnstileSiteKey) && !turnstileToken)}
        onClick={resend}
      >
        {resending ? <Loader2 className="animate-spin" size={16} /> : 'Resend code'}
      </Button>

      <p className="mt-8 text-center text-neutral-500 text-sm font-sans">
        Already verified?{' '}
        <Link href="/login" className="text-neutral-950 hover:text-neutral-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
