import { CheckCircle2, Clock3, CreditCard, Package, Truck, XCircle, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/src/types';

const STATUS_META: Record<OrderStatus, { className: string; iconClassName: string; Icon: LucideIcon }> = {
  PENDING: {
    className: 'bg-amber-50 text-amber-800',
    iconClassName: 'text-amber-600',
    Icon: Clock3,
  },
  PAID: {
    className: 'bg-sky-50 text-sky-800',
    iconClassName: 'text-sky-600',
    Icon: CreditCard,
  },
  PROCESSING: {
    className: 'bg-orange-50 text-orange-800',
    iconClassName: 'text-orange-600',
    Icon: Package,
  },
  SHIPPED: {
    className: 'bg-violet-50 text-violet-800',
    iconClassName: 'text-violet-600',
    Icon: Truck,
  },
  FULFILLED: {
    className: 'bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  CANCELLED: {
    className: 'bg-slate-100 text-slate-600',
    iconClassName: 'text-slate-500',
    Icon: XCircle,
  },
};

export function orderStatusClassName(status: OrderStatus) {
  return STATUS_META[status]?.className ?? 'bg-neutral-200 text-neutral-700';
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta?.Icon ?? Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono px-2.5 py-1 ${orderStatusClassName(status)}`}
    >
      <Icon size={12} strokeWidth={2.25} className={meta?.iconClassName} />
      {status}
    </span>
  );
}
