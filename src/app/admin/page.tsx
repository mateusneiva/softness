'use client';

import Link from 'next/link';
import {
  ChevronRight,
  ImageIcon,
  Layers,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RevenueChart, StatusChart } from '@/src/components/admin/dashboard-charts';
import { pluralize } from '@/src/components/admin/form-helpers';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import { apiClient } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { Order } from '@/src/types';

interface AdminStats {
  products: { total: number; listed: number };
  banners: { total: number; active: number };
  collections: { total: number; featured: number };
  orders: {
    total: number;
    revenue: number;
    recent: Array<Order & { user?: { email: string; name: string | null } }>;
    revenueByDay: Array<{
      date: string;
      label: string;
      revenue: number;
      orders: number;
    }>;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<AdminStats, AdminStats>('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return null;
  }

  const cards = [
    {
      href: '/admin/products',
      label: 'Catalog',
      value: pluralize(stats.products.total, 'product'),
      meta: `${pluralize(stats.products.listed, 'listed')} in the store`,
      icon: Package,
      tone: 'bg-emerald-50 text-emerald-800',
    },
    {
      href: '/admin/banners',
      label: 'Homepage',
      value: pluralize(stats.banners.total, 'banner'),
      meta: `${pluralize(stats.banners.active, 'active')} on the carousel`,
      icon: ImageIcon,
      tone: 'bg-sky-50 text-sky-800',
    },
    {
      href: '/admin/collections',
      label: 'Groups',
      value: pluralize(stats.collections.total, 'collection'),
      meta: `${pluralize(stats.collections.featured, 'featured')} on home`,
      icon: Layers,
      tone: 'bg-amber-50 text-amber-800',
    },
    {
      href: '/admin/orders',
      label: 'Sales',
      value: pluralize(stats.orders.total, 'order'),
      meta: `${formatPrice(stats.orders.revenue)} paid revenue`,
      icon: ShoppingBag,
      tone: 'bg-violet-50 text-violet-800',
    },
  ];

  const recent = stats.orders.recent.slice(0, 5);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Overview
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          A quick look at catalog health, revenue and the latest purchases.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ href, label, value, meta, icon: Icon, tone }, index) => (
          <motion.div key={href} custom={index} variants={fadeUp} initial="hidden" animate="show">
            <Link
              href={href}
              className="block cursor-pointer bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition-shadow group"
            >
              <div className="flex items-center justify-between mb-5">
                <span className={`inline-flex h-9 w-9 items-center justify-center ${tone}`}>
                  <Icon size={16} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-black leading-none">{value}</p>
              <p className="text-xs text-neutral-500 mt-2.5">{meta}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <RevenueChart data={stats.orders.revenueByDay} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
        >
          <StatusChart data={stats.orders.statusBreakdown} />
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
      >
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1">
              Latest activity
            </p>
            <h2 className="text-xl font-black uppercase tracking-tighter text-black">
              Last 5 Orders
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="cursor-pointer text-[10px] uppercase tracking-widest font-mono text-neutral-500 hover:text-black"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-white p-10 text-center text-sm text-neutral-500 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            No orders yet.
          </div>
        ) : (
          <div className="bg-white overflow-x-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-mono shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr
                    key={order.id}
                    className="shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)] hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4 font-mono text-sm font-bold text-black">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-black">
                        {order.user?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {order.user?.email ?? '—'}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-black">
                      {formatPrice(order.total)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex cursor-pointer items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-neutral-500 hover:text-black transition-colors"
                      >
                        Details <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </div>
  );
}
