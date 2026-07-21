'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  tone: ToastTone;
  visible: boolean;
};

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { className: string; Icon: typeof CheckCircle2 }> = {
  success: {
    className: 'bg-neutral-950 text-white',
    Icon: CheckCircle2,
  },
  error: {
    className: 'bg-red-700 text-white',
    Icon: AlertCircle,
  },
  info: {
    className: 'bg-neutral-800 text-white',
    Icon: Info,
  },
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;
const toastApiRef: { current: ToastContextValue | null } = { current: null };

function ToastViewport({ state }: { state: ToastState }) {
  const { className, Icon } = TONE_STYLES[state.tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {state.visible && state.message ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto inline-flex items-center gap-2.5 px-4 py-3 text-xs uppercase tracking-widest font-mono shadow-[0_16px_40px_rgba(0,0,0,0.28)] ${className}`}
          >
            <Icon size={15} strokeWidth={2.25} />
            {state.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    message: '',
    tone: 'success',
    visible: false,
  });

  const hide = useCallback(() => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    if (hideTimer) clearTimeout(hideTimer);
    setState({ message, tone, visible: true });
    hideTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  useEffect(() => {
    toastApiRef.current = { show, hide };
    return () => {
      toastApiRef.current = null;
    };
  }, [hide, show]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <ToastViewport state={state} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function showSaveToast(message = 'Changes saved') {
  toastApiRef.current?.show(message, 'success');
}

export function showErrorToast(message: string) {
  toastApiRef.current?.show(message, 'error');
}
