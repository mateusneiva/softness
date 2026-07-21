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
  COLLECTION_SORT_OPTIONS,
  COLLECTION_STATUS_FILTER_OPTIONS,
} from '@/src/utils/admin/filter-options';
import { getAssetUrl } from '@/src/services/api';
import { formatShortDate } from '@/src/utils/format/date';
import type { Collection } from '@/src/types';

type StatusFilter = 'all' | 'private' | 'scheduled' | 'public' | 'featured';
type SortKey = 'manual' | 'name' | 'status' | 'release' | 'edited' | 'products';

export default function AdminCollectionsPage() {
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
    useAdminReorderableList<Collection>({
      endpoint: '/admin/collections',
      reorderEndpoint: '/admin/collections/reorder',
      getDeletePath: (collection) => `/admin/collections/${collection.id}`,
      entityName: 'Collection',
      filters,
    });

  return (
    <div>
      <AdminCatalogHeader
        title="Collections"
        addHref="/admin/collections/new"
        addLabel="Add Collection"
        savingOrder={savingOrder}
      />

      <AdminListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search collections..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={COLLECTION_STATUS_FILTER_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
          options={COLLECTION_SORT_OPTIONS}
        />
      </AdminListToolbar>

      {pagination.loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      ) : pagination.total === 0 ? (
        <div className="bg-white p-12 text-center text-sm text-neutral-500 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          No collections match your filters.
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
                <th className="p-4 font-medium">Cover</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Products</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Release</th>
                <th className="p-4 font-medium">Edited</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </>
            }
            renderRow={(collection) => (
              <>
                <td className="p-4 font-mono text-sm text-black">{collection.order}</td>
                <td className="p-4">
                  <div className="relative h-14 w-14 overflow-hidden bg-neutral-100">
                    <Image
                      src={getAssetUrl(collection.imageUrl)}
                      alt={collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-black">
                    {collection.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-neutral-400">
                    /{collection.slug}
                  </p>
                </td>
                <td className="p-4 font-mono text-sm text-black">
                  {collection.products?.length ?? 0}
                </td>
                <td className="p-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <VisibilityStatusBadge
                      listed={collection.listed}
                      releaseAt={collection.releaseAt}
                    />
                    {collection.featured ? (
                      <span className="bg-neutral-100 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-black">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-neutral-500">
                  {formatShortDate(collection.releaseAt)}
                </td>
                <td className="p-4 font-mono text-xs text-neutral-500">
                  {formatShortDate(collection.updatedAt || collection.createdAt)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/collections/${collection.id}/edit`}
                      className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-black"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(collection)}
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
