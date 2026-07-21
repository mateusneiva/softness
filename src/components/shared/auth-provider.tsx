'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
