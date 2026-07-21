'use client';

import { CheckCircle2, CreditCard, Package, Truck, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/src/types';

type TimelineStep = {
  key: OrderStatus;
  label: string;
  description: string;
  Icon: LucideIcon;
};

const FULFILLMENT_STEPS: TimelineStep[] = [
  {
    key: 'PAID',
    label: 'Payment approved',
    description: 'Your payment was confirmed.',
    Icon: CreditCard,
  },
  {
    key: 'PROCESSING',
    label: 'Preparing order',
    description: 'We are organizing and packing your items.',
    Icon: Package,
  },
  {
    key: 'SHIPPED',
    label: 'With carrier',
    description: 'Your order is on its way.',
    Icon: Truck,
  },
  {
    key: 'FULFILLED',
    label: 'Delivered',
    description: 'Delivery completed.',
    Icon: CheckCircle2,
  },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  FULFILLED: 4,
  CANCELLED: -1,
};

function stepState(status: OrderStatus, step: OrderStatus) {
  if (status === 'CANCELLED') return 'cancelled' as const;
  const current = STATUS_RANK[status];
  const target = STATUS_RANK[step];
  if (current >= target) return 'complete' as const;
  if (current + 1 === target) return 'current' as const;
  return 'upcoming' as const;
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'PENDING') {
    return (
      <div className="mb-4 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Payment is still pending. Complete checkout to start fulfillment.
      </div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <div className="mb-4 bg-slate-100 px-4 py-3 text-sm text-slate-700">
        This order was cancelled and will not be fulfilled.
      </div>
    );
  }

  return (
    <div className="mb-4 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        Fulfillment timeline
      </p>
      <ol className="space-y-0">
        {FULFILLMENT_STEPS.map((step, index) => {
          const state = stepState(status, step.key);
          const Icon = step.Icon;
          const isLast = index === FULFILLMENT_STEPS.length - 1;

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px ${
                    state === 'complete' ? 'bg-neutral-900' : 'bg-neutral-200'
                  }`}
                />
              )}
              <span
                className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center ${
                  state === 'complete'
                    ? 'bg-neutral-950 text-white'
                    : state === 'current'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <Icon size={15} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-bold uppercase tracking-wider ${
                    state === 'upcoming' ? 'text-neutral-400' : 'text-neutral-950'
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
