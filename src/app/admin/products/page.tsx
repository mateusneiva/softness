'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { AdminCatalogHeader } from '@/src/components/admin/admin-catalog-header';
import { AdminListToolbar } from '@/src/components/admin/admin-list-toolbar';
import { AdminPagination } from '@/src/components/admin/admin-pagination';
import { SortableAdminTable } from '@/src/components/admin/sortable-admin-table';
import { VisibilityStatusBadge } from '@/src/components/admin/visibility-status-badge';
import { FilterSelect } from '@/src/components/ui/filter-select';
import { useAdminReorderableList } from '@/src/hooks/use-admin-reorderable-list';
import {
  PRODUCT_SORT_OPTIONS,
  VISIBILITY_FILTER_OPTIONS,
} from '@/src/utils/admin/filter-options';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { formatShortDate } from '@/src/utils/format/date';
import { getEffectiveProductPrice, isProductDiscountActive } from '@/src/utils/commerce/pricing';
import type { Product } from '@/src/types';

type StatusFilter = 'all' | 'private' | 'scheduled' | 'public';
type SortKey = 'manual' | 'name' | 'status' | 'release' | 'edited' | 'price';

export default function AdminProductsPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('manual');

  const filters = useMemo(
    () => ({
      q: query.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort: sortKey === 'manual' ? undefined : sortKey,
    }),
    [query, statusFilter, sortKey],
  );

  const { pagination, canReorder, savingOrder, persistOrder, handleDelete } =
    useAdminReorderableList<Product>({
      endpoint: '/admin/products',
      reorderEndpoint: '/admin/products/reorder',
      getDeletePath: (product) => `/products/${product.id}`,
      entityName: 'Product',
      filters,
    });

  return (
    <div>
      <AdminCatalogHeader
        title="Products"
        addHref="/admin/products/new"
        addLabel="Add Product"
        savingOrder={savingOrder}
      />

      <AdminListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search products..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={VISIBILITY_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
          options={PRODUCT_SORT_OPTIONS}
        />
      </AdminListToolbar>

      {pagination.loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      ) : pagination.total === 0 ? (
        <div className="bg-white p-12 text-center text-sm text-neutral-500 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          No products match your filters.
        </div>
      ) : (
        <>
          <SortableAdminTable
            items={pagination.items}
            disabled={!canReorder}
            onReorder={persistOrder}
            headers={
              <>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Release</th>
                <th className="p-4 font-medium">Edited</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </>
            }
            renderRow={(product) => (
              <>
                <td className="p-4 font-mono text-sm text-black">{product.sortOrder ?? '—'}</td>
                <td className="p-4">
                  {product.imageUrl ? (
                    <div className="relative h-12 w-12 overflow-hidden bg-neutral-100">
                      <Image
                        src={getAssetUrl(product.imageUrl)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center bg-neutral-100 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm font-bold uppercase tracking-wider text-black">
                  {product.name}
                </td>
                <td className="p-4 font-mono text-sm text-black">
                  <span>{formatPrice(getEffectiveProductPrice(product))}</span>
                  {isProductDiscountActive(product) ? (
                    <span className="mt-0.5 block text-[10px] text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  ) : null}
                </td>
                <td className="p-4">
                  <VisibilityStatusBadge {...product} />
                </td>
                <td className="p-4 font-mono text-xs text-neutral-500">
                  {formatShortDate(product.releaseAt)}
                </td>
                <td className="p-4 font-mono text-xs text-neutral-500">
                  {formatShortDate(product.updatedAt || product.createdAt)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-black"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
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
