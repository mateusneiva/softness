'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, Loader2, Plus, Power, Sparkles, Trash2 } from 'lucide-react';
import { AdminListToolbar } from '@/src/components/admin/admin-list-toolbar';
import { FilterSelect } from '@/src/components/ui/filter-select';
import { ButtonLink } from '@/src/components/ui/button';
import {
  AdminPagination,
  useAdminRemotePagination,
} from '@/src/components/admin/admin-pagination';
import { useConfirmDialog } from '@/src/components/admin/confirm-dialog';
import {
  COUPON_SORT_OPTIONS,
  COUPON_STATUS_FILTER_OPTIONS,
} from '@/src/utils/admin/filter-options';
import { apiClient } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { formatShortDateTime } from '@/src/utils/format/date';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import type { Coupon } from '@/src/types';

type StatusFilter = 'all' | 'active' | 'inactive' | 'scheduled' | 'expired' | 'first';
type SortKey = 'newest' | 'code' | 'uses' | 'starts' | 'expires';

function couponLifecycle(coupon: Coupon) {
  const now = Date.now();
  if (!coupon.active) return 'inactive';
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return 'scheduled';
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) return 'expired';
  return 'active';
}

function lifecycleBadge(coupon: Coupon) {
  const state = couponLifecycle(coupon);
  const styles = {
    active: 'bg-emerald-50 text-emerald-800',
    inactive: 'bg-neutral-100 text-neutral-600',
    scheduled: 'bg-amber-50 text-amber-800',
    expired: 'bg-red-50 text-red-700',
  } as const;
  return (
    <span
      className={`inline-flex px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono ${styles[state]}`}
    >
      {state}
    </span>
  );
}

export default function AdminCouponsPage() {
  const { confirm } = useConfirmDialog();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const filters = useMemo(
    () => ({
      q: query.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort: sortKey === 'newest' ? undefined : sortKey,
    }),
    [query, statusFilter, sortKey]
  );

  const pagination = useAdminRemotePagination<Coupon>('/admin/coupons', filters);

  const toggleActive = async (coupon: Coupon) => {
    const nextActive = !coupon.active;
    const ok = await confirm({
      title: nextActive ? 'Activate coupon' : 'Deactivate coupon',
      description: nextActive
        ? `Activate ${coupon.code}? Customers will be able to use it at checkout.`
        : `Deactivate ${coupon.code}? It will stop working immediately.`,
      confirmLabel: nextActive ? 'Activate' : 'Deactivate',
      tone: nextActive ? 'default' : 'danger',
    });
    if (!ok) return;

    await apiClient.put(`/admin/coupons/${coupon.id}`, { active: nextActive });
    showSaveToast(nextActive ? 'Coupon activated' : 'Coupon deactivated');
    await pagination.refresh();
  };

  const handleDelete = async (coupon: Coupon) => {
    const ok = await confirm({
      title: 'Delete coupon',
      description: `This permanently removes ${coupon.code}. Type DELETE to confirm.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      requireText: 'DELETE',
    });
    if (!ok) return;
    await apiClient.delete(`/admin/coupons/${coupon.id}`);
    pagination.setItems((prev) => prev.filter((item) => item.id !== coupon.id));
    pagination.setTotal((prev) => Math.max(0, prev - 1));
    showSaveToast('Coupon deleted');
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
            Sales
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
            Coupons
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Manage discount codes, schedules, and first-purchase offers.
          </p>
        </div>
        <ButtonLink href="/admin/coupons/new">
          <Plus size={16} /> Add Coupon
        </ButtonLink>
      </div>

      <AdminListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search coupons..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={COUPON_STATUS_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
          options={COUPON_SORT_OPTIONS}
        />
      </AdminListToolbar>

      {pagination.loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : pagination.total === 0 ? (
        <div className="bg-white p-12 text-center text-sm text-neutral-500 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          No coupons match your filters.
        </div>
      ) : (
        <>
          <div className="bg-white overflow-x-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-mono shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Schedule</th>
                  <th className="p-4 font-medium">Uses</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)] hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-mono text-sm font-bold text-black">{coupon.code}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {coupon.description ? (
                          <p className="text-xs text-neutral-500">{coupon.description}</p>
                        ) : null}
                        {coupon.firstPurchaseOnly ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-sky-800 bg-sky-50 px-2 py-0.5">
                            <Sparkles size={10} /> First purchase
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-black">
                      {coupon.type === 'PERCENT'
                        ? `${coupon.value}%`
                        : formatPrice(coupon.value)}
                      {coupon.minSubtotal != null ? (
                        <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                          Min {formatPrice(coupon.minSubtotal)}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-4">{lifecycleBadge(coupon)}</td>
                    <td className="p-4 font-mono text-xs text-neutral-500">
                      <p>Starts {formatShortDateTime(coupon.startsAt)}</p>
                      <p className="mt-1">Ends {formatShortDateTime(coupon.expiresAt)}</p>
                    </td>
                    <td className="p-4 font-mono text-sm text-black">
                      {coupon.usedCount}
                      {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(coupon)}
                          title={coupon.active ? 'Deactivate' : 'Activate'}
                          className="cursor-pointer p-2 text-neutral-400 hover:text-black transition-colors"
                        >
                          <Power size={16} />
                        </button>
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="cursor-pointer p-2 text-neutral-400 hover:text-black transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          className="cursor-pointer p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
