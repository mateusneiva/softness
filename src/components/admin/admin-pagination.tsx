'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from '@/src/services/api';
import {
  PAGE_SIZE_OPTIONS,
  type PageSize,
  type PaginatedResponse,
} from '@/src/utils/admin/pagination';
import type { FilterOption } from '@/src/types/filters';
import { FilterSelect } from '@/src/components/ui/filter-select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export { PAGE_SIZE_OPTIONS, type PageSize, type PaginatedResponse };

const PAGE_SIZE_FILTER_OPTIONS: FilterOption[] = PAGE_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size} / page`,
  tone: 'neutral' as const,
}));

type QueryParams = Record<string, string | number | undefined | null>;

function buildQuery(params: QueryParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Server-driven admin pagination.
 * Skips refetch when raising pageSize if the full result set is already loaded.
 */
export function useAdminRemotePagination<T>(
  endpoint: string,
  filters: QueryParams,
  options?: { debounceMs?: number }
) {
  const debounceMs = options?.debounceMs ?? 300;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSize>(15);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const cacheRef = useRef<{
    filterKey: string;
    total: number;
    items: T[];
  } | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const debouncedKey = useMemo(() => JSON.stringify(debouncedFilters), [debouncedFilters]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedFilters(filters), debounceMs);
    return () => window.clearTimeout(t);
  }, [filters, debounceMs, filterKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKey, pageSize]);

  const load = useCallback(
    async (opts?: { force?: boolean }) => {
      const nextFilterKey = JSON.stringify(debouncedFilters);
      const cached = cacheRef.current;

      const canSkip =
        !opts?.force &&
        page === 1 &&
        cached &&
        cached.filterKey === nextFilterKey &&
        cached.total > 0 &&
        cached.items.length >= cached.total &&
        pageSize >= cached.total;

      if (canSkip) {
        setItems(cached.items);
        setTotal(cached.total);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient.get<PaginatedResponse<T>, PaginatedResponse<T>>(
          `${endpoint}${buildQuery({
            ...debouncedFilters,
            page,
            pageSize,
          })}`
        );
        setItems(data.items);
        setTotal(data.total);
        cacheRef.current = {
          filterKey: nextFilterKey,
          total: data.total,
          // Complete dataset only when everything fits in this page response
          items: data.total <= pageSize && page === 1 ? data.items : data.items,
        };
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedFilters, endpoint, page, pageSize]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const refresh = useCallback(() => load({ force: true }), [load]);

  const replaceItems = useCallback((next: T[] | ((prev: T[]) => T[])) => {
    setItems((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (cacheRef.current && cacheRef.current.total <= pageSize) {
        cacheRef.current = {
          ...cacheRef.current,
          items: resolved,
          total: resolved.length,
        };
      }
      return resolved;
    });
  }, [pageSize]);

  const setTotalCount = useCallback((value: number | ((prev: number) => number)) => {
    setTotal((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (cacheRef.current) cacheRef.current = { ...cacheRef.current, total: next };
      return next;
    });
  }, []);

  return {
    items,
    setItems: replaceItems,
    total,
    setTotal: setTotalCount,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    from,
    to,
    refresh,
  };
}

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export function AdminPagination({
  page,
  totalPages,
  pageSize,
  from,
  to,
  total,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  if (total === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex flex-wrap items-stretch gap-2">
        <FilterSelect
          label="Rows"
          value={String(pageSize)}
          onChange={(value) => onPageSizeChange(Number(value) as PageSize)}
          options={PAGE_SIZE_FILTER_OPTIONS}
          className="[&>button]:h-11"
        />
        <div className="inline-flex h-11 items-center gap-1 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="cursor-pointer flex h-full items-center px-3 text-neutral-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-xs font-mono uppercase tracking-wider text-neutral-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="cursor-pointer flex h-full items-center px-3 text-neutral-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
