'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Package, ShoppingBag } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { FilterSelect } from '@/src/components/ui/filter-select';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import { ACCOUNT_ORDER_SORT_OPTIONS, ORDER_STATUS_FILTER_OPTIONS } from '@/src/utils/admin/filter-options';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { Order, OrderStatus } from '@/src/types';

type SortKey = 'date-desc' | 'date-asc' | 'status' | 'total-desc' | 'total-asc';
type StatusFilter = 'all' | OrderStatus;

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'FULFILLED', 'CANCELLED'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function orderGroupLabel(createdAt: string) {
  const orderDay = startOfDay(new Date(createdAt));
  const today = startOfDay(new Date());
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - orderDay) / dayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return 'Earlier this week';

  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatOrderDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface AccountOrdersListProps {
  orders: Order[];
  loading: boolean;
}

export function AccountOrdersList({ orders, loading }: AccountOrdersListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');

  const filtered = useMemo(() => {
    let list = statusFilter === 'all' ? [...orders] : orders.filter((order) => order.status === statusFilter);

    list.sort((a, b) => {
      if (sortKey === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortKey === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortKey === 'status') {
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      }
      if (sortKey === 'total-asc') return a.total - b.total;
      return b.total - a.total;
    });

    return list;
  }, [orders, statusFilter, sortKey]);

  const grouped = useMemo(() => {
    const groups: { label: string; orders: Order[] }[] = [];
    for (const order of filtered) {
      const label = orderGroupLabel(order.createdAt);
      const existing = groups.find((group) => group.label === label);
      if (existing) existing.orders.push(order);
      else groups.push({ label, orders: [order] });
    }
    return groups;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-neutral-900" size={28} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Package size={18} className="mt-0.5 shrink-0 text-neutral-400" />
          <div>
            <p className="text-sm text-neutral-950">No orders yet.</p>
            <p className="mt-1 text-sm text-neutral-500">When you place an order, it will show up here.</p>
          </div>
        </div>
        <ButtonLink href="/" size="md" className="shrink-0 self-start sm:self-auto">
          Start shopping
        </ButtonLink>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={ORDER_STATUS_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
          options={ACCOUNT_ORDER_SORT_OPTIONS}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border-t border-neutral-100 pt-6 text-sm text-neutral-500">No orders match this filter.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.label}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">{group.label}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
                  {group.orders.length} {group.orders.length === 1 ? 'order' : 'orders'}
                </p>
              </div>

              <div className="space-y-4">
                {group.orders.map((order) => {
                  const visibleItems = order.items.slice(0, 3);
                  const extraCount = order.items.length - visibleItems.length;

                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="block cursor-pointer bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                            Order
                          </p>
                          <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <OrderStatusBadge status={order.status} />
                          {order.status === 'PENDING' && (
                            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-700">
                              Pay or cancel
                            </p>
                          )}
                          <p className="font-mono text-lg font-bold text-neutral-950">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      <div className="px-5 py-4">
                        <ul className="divide-y divide-neutral-100 border border-neutral-100">
                          {visibleItems.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 px-3 py-3">
                              <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-neutral-100">
                                {item.imageUrl ? (
                                  <Image
                                    src={getAssetUrl(item.imageUrl)}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-neutral-400">
                                    <ShoppingBag size={14} />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold uppercase tracking-wider text-neutral-950">
                                  {item.productName}
                                </p>
                                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                  Size {item.size}
                                  {item.variantName ? ` · ${item.variantName}` : ''} · Qty {item.quantity}
                                </p>
                              </div>
                              <span className="shrink-0 font-mono text-xs text-neutral-600">
                                {formatPrice(item.unitAmount * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {extraCount > 0 && (
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            +{extraCount} more {extraCount === 1 ? 'item' : 'items'}
                          </p>
                        )}

                        {order.trackingNumber && (
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            Tracking · {order.trackingNumber}
                          </p>
                        )}

                        <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                          View details <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
