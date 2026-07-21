'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileFieldProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
};

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function TurnstileField({ siteKey, onTokenChange, resetKey = 0 }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let cancelled = false;

    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        onTokenChangeRef.current(null);

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => onTokenChangeRef.current(token),
          'expired-callback': () => onTokenChangeRef.current(null),
          'error-callback': () => onTokenChangeRef.current(null),
        });
      })
      .catch(() => {
        onTokenChangeRef.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, resetKey]);

  return <div ref={containerRef} className="min-h-[65px]" />;
}
