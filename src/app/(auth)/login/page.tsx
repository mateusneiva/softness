'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { loginSchema, type LoginFormData } from '@/src/utils/validations';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import { FormField } from '@/src/components/ui/form-field';
import { PasswordField } from '@/src/components/ui/password-field';
import { button, Button } from '@/src/components/ui/button';
import { TurnstileField } from '@/src/components/ui/turnstile-field';
import GoogleIcon from '@/src/assets/icons/google.svg';
import type { ApiError, AuthFeaturesResponse } from '@/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

function LoginForm() {
  const [serverError, setServerError] = useState('');
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<AuthFeaturesResponse, AuthFeaturesResponse>('/auth/features')
      .then((features) => {
        if (!cancelled) {
          setGoogleOAuthEnabled(Boolean(features.googleOAuth));
          setTurnstileSiteKey(
            features.turnstile?.enabled && features.turnstile.siteKey ? features.turnstile.siteKey : null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleOAuthEnabled(false);
          setTurnstileSiteKey(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');

    try {
      const response = await apiClient.post<{ token: string }, { token: string }>('/auth/login', {
        ...data,
        turnstileToken: turnstileToken ?? undefined,
      });
      await login(response.token);
      router.push(redirectTo.startsWith('/') ? redirectTo : '/');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.code === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(apiError.email || getValues('email'))}`);
        return;
      }
      setServerError(getFriendlyErrorMessage(error));
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">Welcome back</h1>
        <p className="mt-2 text-sm text-neutral-500 font-sans">Sign in to continue shopping</p>
      </div>

      {serverError && <div className="mb-6 text-sm text-red-600 font-sans">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {turnstileSiteKey ? (
          <TurnstileField siteKey={turnstileSiteKey} resetKey={turnstileResetKey} onTokenChange={setTurnstileToken} />
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || (Boolean(turnstileSiteKey) && !turnstileToken)}
          variant="neutral"
          size="auth"
          fullWidth
          className="mt-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
        </Button>
      </form>

      {googleOAuthEnabled && (
        <>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-neutral-200 flex-1" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono">or</span>
            <div className="h-px bg-neutral-200 flex-1" />
          </div>

          <a
            href={`${API_URL}/auth/google`}
            className={button({ variant: 'elevated', size: 'auth', fullWidth: true, className: 'mt-6 gap-3' })}
          >
            <GoogleIcon className="size-[18px]" aria-hidden />
            Continue with Google
          </a>
        </>
      )}

      <p className="mt-8 text-center text-neutral-500 text-sm font-sans">
        New here?{' '}
        <Link href="/register" className="text-neutral-950 hover:text-neutral-700 font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
