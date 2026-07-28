'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { twMerge } from 'tailwind-merge';

type DismissBackdropProps = {
  onDismiss: () => void;
  className?: string;
};

function DismissBackdrop({ onDismiss, className = 'z-30' }: DismissBackdropProps) {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      className={twMerge('fixed inset-0 cursor-default bg-transparent', className)}
      onClick={onDismiss}
    />
  );
}

type UseDismissibleOptions = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  onClose?: () => void;
  focusRef?: RefObject<HTMLElement | null>;
  focusDelay?: number;
  autoFocus?: boolean;
  backdropClassName?: string;
};

export function useDismissible<T extends HTMLElement = HTMLDivElement>({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  onClose,
  focusRef,
  focusDelay = 0,
  autoFocus = true,
  backdropClassName = 'z-30',
}: UseDismissibleOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const panelRef = useRef<T | null>(null);

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const current = isControlled ? controlledOpen : uncontrolledOpen;
      const resolved = typeof next === 'function' ? next(current) : next;

      if (!isControlled) {
        setUncontrolledOpen(resolved);
      }
      onOpenChange?.(resolved);
    },
    [controlledOpen, isControlled, onOpenChange, uncontrolledOpen],
  );

  const close = useCallback(() => {
    if (!isOpen) return;
    setOpen(false);
    onClose?.();
  }, [isOpen, onClose, setOpen]);

  const open = useCallback(() => setOpen(true), [setOpen]);

  const toggle = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  const escapeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') close();
    },
    [close],
  );

  const triggerProps = {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape' && isOpen) close();
    },
  };

  const panelProps = {
    tabIndex: -1 as const,
    onKeyDown: escapeKeyDown,
    ref: (focusRef ?? panelRef) as RefObject<T | null>,
  };

  useEffect(() => {
    if (!isOpen || !autoFocus) return;

    const target = focusRef ?? panelRef;
    if (focusDelay > 0) {
      const id = window.setTimeout(() => target.current?.focus(), focusDelay);
      return () => window.clearTimeout(id);
    }

    const frame = requestAnimationFrame(() => target.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, focusDelay, focusRef, isOpen]);

  const Backdrop = useCallback(
    () => <DismissBackdrop onDismiss={close} className={backdropClassName} />,
    [backdropClassName, close],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
    triggerProps,
    panelProps,
    panelRef,
    escapeKeyDown,
    Backdrop,
  };
}
