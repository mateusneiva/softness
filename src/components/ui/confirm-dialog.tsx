'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close dialog"
        className={`absolute inset-0 cursor-pointer bg-black/40 transition-opacity duration-150 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-150 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 cursor-pointer p-1.5 text-neutral-400 transition-colors hover:text-neutral-950"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex items-start gap-3 pr-6">
          {tone === 'danger' ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-red-50 text-red-700">
              <AlertTriangle size={16} />
            </span>
          ) : null}
          <div>
            <h2 id={titleId} className="text-lg font-black uppercase tracking-tighter text-neutral-950">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
