import type { ApiError } from '@/src/types';

const GENERIC_FALLBACK = 'Something went wrong. Please try again.';

const SHIPPING_ERROR_CODES = new Set([
  'SHIPPING_UNAVAILABLE',
  'SHIPPING_RATES_EMPTY',
  'SHIPPING_RATE_INVALID',
  'SHIPPING_COUNTRY_NOT_SUPPORTED',
  'SHIPPING_ADDRESS_REQUIRED',
]);

const SHIPPING_GENERIC_MESSAGE =
  'Shipping is temporarily unavailable. Please try again later or choose a different address.';

const ADDRESS_ERROR_CODES = new Set([
  'ADDRESS_INVALID',
]);

const ADDRESS_GENERIC_MESSAGE =
  'We could not save this address. Please check the details and try again.';

const PAYMENT_ERROR_CODES = new Set([
  'PAYMENT_PROVIDER_NOT_CONFIGURED',
  'PAYMENT_PROVIDER_ERROR',
]);

const PAYMENT_GENERIC_MESSAGE =
  'Payment could not be started. Please try again in a moment.';

const FRIENDLY_MESSAGES: Record<string, string> = {
  'Invalid credentials': 'Email or password is incorrect. Please try again.',
  'Email already registered': 'This email is already in use. Try logging in instead.',
  'Phone number already registered': 'This phone number is already linked to another account.',
  'Complete the security check before continuing': 'Complete the security check before continuing.',
  'Security check failed. Please try again.': 'Security check failed. Please try again.',
  'Something went wrong. Please try again later.': 'We could not complete your request. Please try again in a moment.',
  'Service temporarily unavailable. Please try again later.': 'Our servers are temporarily unavailable. Please try again shortly.',
  Unauthorized: 'Your session has expired. Please sign in again.',
  'User not found': 'Account not found. Please check your credentials.',
  'Validation error': 'Please check the highlighted fields and try again.',
  'Delivery is not available to this country yet.': 'Delivery is not available to this country yet.',
};

function asApiError(error: unknown): ApiError | null {
  if (!error || typeof error !== 'object') return null;
  return error as ApiError;
}

export function getFriendlyErrorMessage(error: unknown, fallback = GENERIC_FALLBACK): string {
  const apiError = asApiError(error);
  if (!apiError) return fallback;

  if (apiError.code && SHIPPING_ERROR_CODES.has(apiError.code)) {
    if (apiError.code === 'SHIPPING_COUNTRY_NOT_SUPPORTED') {
      return FRIENDLY_MESSAGES['Delivery is not available to this country yet.'] ?? SHIPPING_GENERIC_MESSAGE;
    }
    return SHIPPING_GENERIC_MESSAGE;
  }

  if (apiError.code && ADDRESS_ERROR_CODES.has(apiError.code)) {
    return ADDRESS_GENERIC_MESSAGE;
  }

  if (apiError.code && PAYMENT_ERROR_CODES.has(apiError.code)) {
    return PAYMENT_GENERIC_MESSAGE;
  }

  return FRIENDLY_MESSAGES[apiError.message] ?? apiError.message ?? fallback;
}

export function getShippingErrorMessage(error: unknown): string {
  const apiError = asApiError(error);
  if (apiError?.code && SHIPPING_ERROR_CODES.has(apiError.code)) {
    return getFriendlyErrorMessage(error, SHIPPING_GENERIC_MESSAGE);
  }
  return getFriendlyErrorMessage(error);
}

export function getAddressErrorMessage(error: unknown): string {
  const apiError = asApiError(error);
  if (apiError?.code && ADDRESS_ERROR_CODES.has(apiError.code)) {
    return getFriendlyErrorMessage(error, ADDRESS_GENERIC_MESSAGE);
  }
  return getFriendlyErrorMessage(error);
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const apiError = asApiError(error);
  if (!apiError?.errors) return {};

  const fieldErrors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(apiError.errors)) {
    if (messages?.[0]) {
      fieldErrors[field] = messages[0];
    }
  }

  return fieldErrors;
}

const REGISTRATION_FIELD_CODES: Record<string, 'email' | 'phone'> = {
  EMAIL_ALREADY_REGISTERED: 'email',
  PHONE_ALREADY_REGISTERED: 'phone',
};

export function getRegistrationFieldError(error: unknown): { field: 'email' | 'phone'; message: string } | null {
  const apiError = asApiError(error);
  if (!apiError?.code) return null;

  const field = REGISTRATION_FIELD_CODES[apiError.code];
  if (!field) return null;

  return {
    field,
    message: getFriendlyErrorMessage(error),
  };
}
