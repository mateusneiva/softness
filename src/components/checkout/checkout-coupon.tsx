'use client';

import { useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface CheckoutCouponProps {
  couponCode: string | null;
  onApply: (code: string) => Promise<void>;
  onClear: () => void;
}

export function CheckoutCoupon({ couponCode, onApply, onClear }: CheckoutCouponProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      await onApply(code.trim());
      setCode('');
    } catch (applyError: unknown) {
      setError(
        applyError && typeof applyError === 'object' && 'message' in applyError
          ? String((applyError as { message: string }).message)
          : 'Invalid coupon',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-fit overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="border-b border-neutral-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center bg-emerald-50 text-emerald-700">
            <Tag size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">Coupon</h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Optional discount
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {couponCode ? (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 px-3.5 py-3">
            <span className="inline-flex min-w-0 items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-800">
              <Tag size={13} className="shrink-0" />
              <span className="truncate">{couponCode}</span>
              <span className="hidden text-emerald-600/70 sm:inline">applied</span>
            </span>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-emerald-700 underline-offset-2 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void apply();
                }
              }}
              placeholder="Enter code"
              className="w-full bg-neutral-50 px-3.5 py-3.5 font-mono text-sm uppercase tracking-widest text-neutral-950 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400"
            />
            <Button
              type="button"
              onClick={() => void apply()}
              disabled={loading || !code.trim()}
              fullWidth
              size="xl"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Apply coupon'}
            </Button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}
