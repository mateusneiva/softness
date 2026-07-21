'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, ShoppingBag } from 'lucide-react';

interface AddToCartButtonProps {
  disabled?: boolean;
  soldOut?: boolean;
  onAdd: () => void | Promise<void>;
}

type ButtonState = 'idle' | 'adding' | 'added';

export function AddToCartButton({ disabled, soldOut, onAdd }: AddToCartButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleClick = async () => {
    if (disabled || soldOut || state !== 'idle') return;

    setState('adding');
    try {
      await Promise.resolve(onAdd());
      await new Promise((resolve) => setTimeout(resolve, 280));
      setState('added');
      resetTimer.current = setTimeout(() => setState('idle'), 1600);
    } catch {
      setState('idle');
    }
  };

  const isBusy = state === 'adding' || state === 'added';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || soldOut || isBusy}
      className={`relative w-full mt-8 font-bold uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2 overflow-hidden transition-[background-color,box-shadow,color] duration-300 disabled:cursor-not-allowed ${
        soldOut
          ? 'bg-neutral-200 text-neutral-500 shadow-none'
          : state === 'added'
            ? 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(5,150,105,0.35)]'
            : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === 'adding' ? (
          <motion.span
            key="adding"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-2"
          >
            <Loader2 size={17} className="animate-spin" />
            Adding…
          </motion.span>
        ) : state === 'added' ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center gap-2"
          >
            <Check size={17} strokeWidth={2.5} />
            Added to cart
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-2"
          >
            <ShoppingBag size={17} />
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
