import { z } from 'zod';
import { isCatalogCountry } from '@/src/constants/shipping-countries';
import { isValidInternationalPhone } from '@/src/utils/phone';

export type PasswordCriterionStatus = 'neutral' | 'met' | 'unmet';

export const passwordCriteria = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'lower',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'upper',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export function getPasswordCriteriaStatus(password: string) {
  const hasStarted = password.length > 0;

  return passwordCriteria.map((criterion) => {
    const passed = criterion.test(password);
    let status: PasswordCriterionStatus = 'neutral';
    if (hasStarted) status = passed ? 'met' : 'unmet';

    return {
      id: criterion.id,
      label: criterion.label,
      status,
      passed,
    };
  });
}

export function isStrongPassword(password: string) {
  return passwordCriteria.every((criterion) => criterion.test(password));
}

export const strongPasswordMessage =
  'Use at least 8 characters with uppercase, lowercase, number, and special character';

const strongPassword = z
  .string()
  .min(1, 'Password is required')
  .refine(isStrongPassword, strongPasswordMessage);

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .refine(isValidInternationalPhone, 'Enter a valid phone number with country code');

export const registerStepOneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: phoneField,
  birthDate: z.string().min(1, 'Birth date is required'),
});

export const registerStepTwoSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: phoneField,
    birthDate: z.string().min(1, 'Birth date is required'),
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'Enter the 6-digit code'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneField,
  birthDate: z.string().min(1, 'Birth date is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const setPasswordSchema = z
  .object({
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const addressSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(3, 'ZIP / Postal code is required'),
  country: z
    .string()
    .length(2, 'Country is required')
    .refine(isCatalogCountry, 'Delivery is not available to this country yet'),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterStepOneData = z.infer<typeof registerStepOneSchema>;
export type RegisterStepTwoData = z.infer<typeof registerStepTwoSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
