'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { AdminListToolbar } from '@/src/components/admin/admin-list-toolbar';
import { FilterSelect } from '@/src/components/ui/filter-select';
import {
  AdminPagination,
  useAdminRemotePagination,
} from '@/src/components/admin/admin-pagination';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
} from '@/src/utils/admin/filter-options';
import { formatPrice } from '@/src/utils/format/currency';
import { formatShortDate } from '@/src/utils/format/date';
import type { Order, OrderStatus } from '@/src/types';

type AdminOrder = Order & {
  user?: { id: string; email: string; name: string | null };
};

type StatusFilter = 'all' | OrderStatus;
type SortKey =
  | 'date-desc'
  | 'date-asc'
  | 'status'
  | 'total-desc'
  | 'total-asc'
  | 'items-desc';

export default function AdminOrdersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');

  const filters = useMemo(
    () => ({
      q: query.trim() || undefined,
      status: status === 'all' ? undefined : status,
      sort: sortKey === 'date-desc' ? undefined : sortKey,
    }),
    [query, status, sortKey]
  );

  const pagination = useAdminRemotePagination<AdminOrder>('/admin/orders', filters);

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Sales
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
          Orders
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Search, filter and review every store order.
        </p>
      </div>

      <AdminListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search order, customer or tracking..."
      >
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as StatusFilter)}
          options={ORDER_STATUS_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
          options={ORDER_SORT_OPTIONS}
        />
      </AdminListToolbar>

      {pagination.loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      ) : pagination.total === 0 ? (
        <div className="bg-white p-12 text-center text-sm text-neutral-500 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          No orders found.
        </div>
      ) : (
        <>
          <div className="bg-white overflow-x-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-mono shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Tracking</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((order) => (
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
                      {formatShortDate(order.createdAt)}
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="p-4 font-mono text-sm text-black">{order.items.length}</td>
                    <td className="p-4 font-mono text-xs text-neutral-500">
                      {order.trackingNumber ? (
                        <span>
                          {order.carrier ? `${order.carrier} · ` : ''}
                          {order.trackingNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-black">
                      {formatPrice(order.total)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex cursor-pointer items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-neutral-500 hover:text-black transition-colors"
                      >
                        Open <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            from={pagination.from}
            to={pagination.to}
            total={pagination.total}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}
    </div>
  );
}
