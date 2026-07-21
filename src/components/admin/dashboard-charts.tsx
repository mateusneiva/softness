'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '@/src/utils/format/currency';
import { pluralize } from '@/src/components/admin/form-helpers';

interface DayPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface StatusPoint {
  status: string;
  count: number;
}

const STATUS_BAR: Record<string, string> = {
  PENDING: 'bg-amber-500',
  PAID: 'bg-sky-500',
  PROCESSING: 'bg-orange-500',
  SHIPPED: 'bg-violet-500',
  FULFILLED: 'bg-emerald-500',
  CANCELLED: 'bg-slate-400',
};

const STATUS_CHIP: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  PAID: 'bg-sky-50 text-sky-800',
  PROCESSING: 'bg-orange-50 text-orange-800',
  SHIPPED: 'bg-violet-50 text-violet-800',
  FULFILLED: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export function RevenueChart({ data }: { data: DayPoint[] }) {
  const max = Math.max(...data.map((point) => point.revenue), 1);

  return (
    <div className="bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1">
          Last 14 days
        </p>
        <h3 className="text-lg font-black uppercase tracking-tighter text-black">Revenue</h3>
      </div>

      <div className="flex items-end gap-1.5 h-40">
        {data.map((point, index) => {
          const height = Math.max((point.revenue / max) * 100, point.revenue > 0 ? 8 : 2);
          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${height}%`, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.025, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full bg-black/90 hover:bg-black transition-colors relative group min-h-[2px]"
                title={`${point.label}: ${formatPrice(point.revenue)} · ${pluralize(point.orders, 'order')}`}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[9px] font-mono px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatPrice(point.revenue)}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 mt-2">
        {data.map((point, index) => (
          <span
            key={point.date}
            className={`flex-1 text-center text-[8px] font-mono text-neutral-400 ${
              index % 2 === 1 ? 'invisible sm:visible' : ''
            }`}
          >
            {point.label.split(' ')[1] ?? point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatusChart({ data }: { data: StatusPoint[] }) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.count, 0),
    1
  );

  return (
    <div className="bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1">
          Distribution
        </p>
        <h3 className="text-lg font-black uppercase tracking-tighter text-black">Order Status</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.count / total) * 100;
          return (
            <div key={item.status}>
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span
                  className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono ${STATUS_CHIP[item.status] ?? 'bg-neutral-100 text-neutral-600'}`}
                >
                  {item.status}
                </span>
                <span className="text-xs font-mono text-neutral-600">
                  {pluralize(item.count, 'order')}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.65, delay: 0.08 + index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`h-full ${STATUS_BAR[item.status] ?? 'bg-black'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
