'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  /** If set, user must type this exact text to enable confirm */
  requireText?: string;
};

type InternalState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState | null>(null);
  const [typed, setTyped] = useState('');
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [state]);

  useEffect(() => {
    if (!state?.requireText || !visible) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [state?.requireText, visible]);

  const confirm = useCallback((options: ConfirmOptions) => {
    setTyped('');
    setVisible(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, resolve });
    });
  }, []);

  const finish = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setVisible(false);
    setState(null);
    setTyped('');
  }, []);

  const canConfirm = !state?.requireText || typed.trim() === state.requireText;
  const value = useMemo(() => ({ confirm }), [confirm]);

  const dialog =
    mounted && state
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            role="presentation"
          >
            <button
              type="button"
              aria-label="Close dialog"
              className={`absolute inset-0 cursor-pointer bg-black/45 transition-opacity duration-150 ease-out ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => finish(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`relative w-full max-w-md bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.28)] transition-[opacity,transform] duration-150 ease-out ${
                visible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-2 scale-[0.98]'
              }`}
            >
              <button
                type="button"
                onClick={() => finish(false)}
                className="absolute right-3 top-3 cursor-pointer p-1.5 text-neutral-400 hover:text-black transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-3 mb-4 pr-6">
                {state.tone === 'danger' ? (
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-red-50 text-red-700">
                    <AlertTriangle size={16} />
                  </span>
                ) : null}
                <div>
                  <h2
                    id={titleId}
                    className="text-lg font-black uppercase tracking-tighter text-neutral-950"
                  >
                    {state.title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {state.description}
                  </p>
                </div>
              </div>

              {state.requireText ? (
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-widest font-mono text-neutral-500 mb-2">
                    Type <span className="text-black font-bold">{state.requireText}</span> to
                    confirm
                  </label>
                  <input
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    className="w-full bg-neutral-50 p-3.5 font-mono text-sm text-neutral-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)]"
                    autoComplete="off"
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canConfirm) finish(true);
                      if (e.key === 'Escape') finish(false);
                    }}
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" size="md" onClick={() => finish(false)}>
                  {state.cancelLabel ?? 'Cancel'}
                </Button>
                <Button
                  type="button"
                  variant={state.tone === 'danger' ? 'danger' : 'primary'}
                  size="md"
                  disabled={!canConfirm}
                  onClick={() => finish(true)}
                >
                  {state.confirmLabel ?? 'Confirm'}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog}
    </ConfirmContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return ctx;
}
