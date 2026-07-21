import axios from 'axios';
import type { ApiError } from '@/src/types';
import { useServerStatus } from '@/src/store/server-status';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

const isBrowser = typeof window !== 'undefined';

apiClient.interceptors.response.use(
  (response) => {
    if (isBrowser) useServerStatus.getState().markOnline();
    if (response.status === 204) return null;
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code as string | undefined;
    const noResponse = !error.response;
    const isTimeout = error.code === 'ECONNABORTED';
    const isNetworkError = error.code === 'ERR_NETWORK' || noResponse;
    // 503 só conta como "fora do ar" quando o banco/API de fato caiu —
    // não erros de negócio como PAYMENT_PROVIDER_NOT_CONFIGURED.
    const isServerUnavailable = isNetworkError || isTimeout || (status === 503 && code === 'DATABASE_UNAVAILABLE');

    if (isServerUnavailable && isBrowser) {
      useServerStatus.getState().markUnavailable();
    }

    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        (isServerUnavailable
          ? 'Could not connect to the server. Please try again in a moment.'
          : 'An unexpected error occurred'),
      errors: error.response?.data?.errors,
      status: status ?? 0,
      code: code || (isTimeout ? 'API_TIMEOUT' : isNetworkError ? 'API_UNREACHABLE' : undefined),
      email: error.response?.data?.email,
      isServerUnavailable,
    };

    return Promise.reject(apiError);
  },
);

export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}
