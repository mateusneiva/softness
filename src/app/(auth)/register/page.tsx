'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { apiClient } from '@/src/services/api';
import { useAuthStore } from '@/src/store/auth';
import {
  registerStepOneSchema,
  registerStepTwoSchema,
  isStrongPassword,
  type RegisterStepOneData,
  type RegisterStepTwoData,
} from '@/src/utils/validations';
import { getFriendlyErrorMessage, getFieldErrors, getRegistrationFieldError } from '@/src/utils/errors';
import { FormField } from '@/src/components/ui/form-field';
import { PasswordField } from '@/src/components/ui/password-field';
import { Button } from '@/src/components/ui/button';
import { DatePicker } from '@/src/components/ui/date-picker';
import { PhoneField } from '@/src/components/ui/phone-field';
import { TurnstileField } from '@/src/components/ui/turnstile-field';
import { PasswordRequirements } from '@/src/components/ui/password-requirements';
import type { AuthFeaturesResponse } from '@/src/types';

const STEPS = ['Details', 'Password', 'Confirm'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState('');
  const [stepOne, setStepOne] = useState<RegisterStepOneData | null>(null);
  const [stepTwo, setStepTwo] = useState<RegisterStepTwoData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStepOne, setCheckingStepOne] = useState(false);
  const [authFeatures, setAuthFeatures] = useState<AuthFeaturesResponse | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const turnstileSiteKey = authFeatures?.turnstile?.enabled ? authFeatures.turnstile.siteKey : null;

  useEffect(() => {
    apiClient
      .get<AuthFeaturesResponse, AuthFeaturesResponse>('/auth/features')
      .then(setAuthFeatures)
      .catch(() => setAuthFeatures(null));
  }, []);

  useEffect(() => {
    if (step === 2) {
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    }
  }, [step]);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetKey((value) => value + 1);
  };

  const formOne = useForm<RegisterStepOneData>({
    resolver: zodResolver(registerStepOneSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
    },
  });

  const formTwo = useForm<RegisterStepTwoData>({
    resolver: zodResolver(registerStepTwoSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = formTwo.watch('password') ?? '';
  const confirmPasswordValue = formTwo.watch('confirmPassword') ?? '';
  const passwordStepReady =
    isStrongPassword(passwordValue) && confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const onStepOne = async (data: RegisterStepOneData) => {
    setCheckingStepOne(true);
    setServerError('');

    try {
      await apiClient.post('/auth/check-registration', {
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        turnstileToken: turnstileToken ?? undefined,
      });

      setStepOne({
        ...data,
        email: data.email.trim().toLowerCase(),
      });
      setStep(1);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.email) {
        formOne.setError('email', { type: 'server', message: fieldErrors.email });
      }
      if (fieldErrors.phone) {
        formOne.setError('phone', { type: 'server', message: fieldErrors.phone });
      }

      const fieldError = getRegistrationFieldError(error);
      if (fieldError) {
        formOne.setError(fieldError.field, { type: 'server', message: fieldError.message });
      }

      if (!fieldErrors.email && !fieldErrors.phone && !fieldError) {
        setServerError(getFriendlyErrorMessage(error));
      }
      resetTurnstile();
    } finally {
      setCheckingStepOne(false);
    }
  };

  const onStepTwo = (data: RegisterStepTwoData) => {
    setStepTwo(data);
    setServerError('');
    setStep(2);
  };

  const onFinish = async () => {
    if (!stepOne || !stepTwo) return;

    setSubmitting(true);
    setServerError('');

    try {
      const response = await apiClient.post<
        { requiresVerification?: boolean; email?: string; token?: string },
        { requiresVerification?: boolean; email?: string; token?: string }
      >('/auth/register', {
        name: stepOne.name,
        email: stepOne.email,
        phone: stepOne.phone,
        birthDate: stepOne.birthDate,
        password: stepTwo.password,
        turnstileToken: turnstileToken ?? undefined,
      });

      if (response.token) {
        await login(response.token);
        router.push('/account');
        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(stepOne.email)}`);
    } catch (error) {
      setServerError(getFriendlyErrorMessage(error));
      resetTurnstile();
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">Create account</h1>
        <p className="mt-2 text-sm text-neutral-500 font-sans">A few quick steps to get started</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7  text-[10px] font-mono font-bold transition-colors ${
                index < step
                  ? 'bg-neutral-950 text-white'
                  : index === step
                    ? 'bg-neutral-950/20 text-neutral-950 border border-neutral-950/40'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
              }`}
            >
              {index < step ? <Check size={12} /> : index + 1}
            </div>
            <span
              className={`hidden sm:inline text-[10px] uppercase tracking-widest font-mono ${
                index === step ? 'text-neutral-700' : 'text-neutral-400'
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && <div className="flex-1 h-px bg-neutral-200" />}
          </div>
        ))}
      </div>

      {serverError && <div className="mb-6 text-sm text-red-600 font-sans">{serverError}</div>}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.form
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={formOne.handleSubmit(onStepOne)}
            className="space-y-5"
            noValidate
          >
            <FormField
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              error={formOne.formState.errors.name?.message}
              {...formOne.register('name')}
            />
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={formOne.formState.errors.email?.message}
              {...formOne.register('email')}
            />
            <Controller
              name="phone"
              control={formOne.control}
              render={({ field }) => (
                <PhoneField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={formOne.formState.errors.phone?.message}
                />
              )}
            />
            <Controller
              name="birthDate"
              control={formOne.control}
              render={({ field }) => (
                <DatePicker
                  label="Date of Birth"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={formOne.formState.errors.birthDate?.message}
                />
              )}
            />
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              We use these details only for account and order-related communication.
            </p>
            {turnstileSiteKey ? (
              <TurnstileField
                siteKey={turnstileSiteKey}
                resetKey={turnstileResetKey}
                onTokenChange={setTurnstileToken}
              />
            ) : null}
            <Button
              type="submit"
              variant="neutral"
              size="auth"
              fullWidth
              disabled={checkingStepOne || (Boolean(turnstileSiteKey) && !turnstileToken)}
            >
              {checkingStepOne ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </Button>
          </motion.form>
        )}

        {step === 1 && (
          <motion.form
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={formTwo.handleSubmit(onStepTwo)}
            className="space-y-5"
            noValidate
          >
            <PasswordField
              label="Password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              error={
                formTwo.formState.touchedFields.password || formTwo.formState.isSubmitted
                  ? formTwo.formState.errors.password?.message
                  : undefined
              }
              {...formTwo.register('password')}
            />
            <PasswordRequirements password={passwordValue} />
            <PasswordField
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              error={
                formTwo.formState.touchedFields.confirmPassword || formTwo.formState.isSubmitted
                  ? formTwo.formState.errors.confirmPassword?.message
                  : undefined
              }
              {...formTwo.register('confirmPassword')}
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="auth" className="flex-1" onClick={() => setStep(0)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="submit" disabled={!passwordStepReady} variant="neutral" size="auth" className="flex-[1.4]">
                Continue <ArrowRight size={16} />
              </Button>
            </div>
          </motion.form>
        )}

        {step === 2 && stepOne && stepTwo && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-4 font-sans">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">Name</p>
                <p className="text-neutral-900">{stepOne.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">Email</p>
                <p className="text-neutral-900">{stepOne.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">Phone</p>
                  <p className="text-neutral-900">{stepOne.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">Birth Date</p>
                  <p className="text-neutral-900">
                    {new Date(`${stepOne.birthDate}T00:00:00`).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">Password</p>
                <p className="text-neutral-900 tracking-widest">{'•'.repeat(Math.min(stepTwo.password.length, 12))}</p>
              </div>
            </div>

            {turnstileSiteKey ? (
              <TurnstileField
                siteKey={turnstileSiteKey}
                resetKey={turnstileResetKey}
                onTokenChange={setTurnstileToken}
              />
            ) : null}

            <div className="flex gap-3">
              <Button type="button" variant="outline" size="auth" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button
                type="button"
                onClick={onFinish}
                disabled={submitting || (Boolean(turnstileSiteKey) && !turnstileToken)}
                variant="neutral"
                size="auth"
                className="flex-[1.4]"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-center text-neutral-500 text-sm font-sans">
        Already have an account?{' '}
        <Link href="/login" className="text-neutral-950 hover:text-neutral-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
