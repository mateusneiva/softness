'use client';

import { useMemo, useState } from 'react';
import { apiClient } from '@/src/services/api';
import { useConfirmDialog } from '@/src/components/admin/confirm-dialog';
import { useAdminRemotePagination } from '@/src/components/admin/admin-pagination';
import { showErrorToast, showSaveToast } from '@/src/components/shared/toast-provider';

type NamedEntity = { id: string; name: string };

type UseAdminReorderableListOptions<T extends NamedEntity> = {
  endpoint: string;
  reorderEndpoint: string;
  getDeletePath: (item: T) => string;
  entityName: string;
  filters: Record<string, string | undefined>;
};

export function useAdminReorderableList<T extends NamedEntity>({
  endpoint,
  reorderEndpoint,
  getDeletePath,
  entityName,
  filters,
}: UseAdminReorderableListOptions<T>) {
  const { confirm } = useConfirmDialog();
  const [savingOrder, setSavingOrder] = useState(false);
  const pagination = useAdminRemotePagination<T>(endpoint, filters);

  const canReorder = useMemo(
    () =>
      !filters.q &&
      !filters.status &&
      !filters.sort &&
      pagination.total > 0 &&
      pagination.total <= pagination.pageSize &&
      pagination.page === 1,
    [filters.q, filters.sort, filters.status, pagination.page, pagination.pageSize, pagination.total],
  );

  const persistOrder = async (next: T[]) => {
    pagination.setItems(next);
    setSavingOrder(true);
    try {
      const updated = await apiClient.put<T[], T[]>(reorderEndpoint, {
        orderedIds: next.map((item) => item.id),
      });
      pagination.setItems(updated);
      pagination.setTotal(updated.length);
      showSaveToast(`${entityName} order saved`);
    } catch {
      showErrorToast(`Failed to save ${entityName.toLowerCase()} order`);
      await pagination.refresh();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (item: T) => {
    const ok = await confirm({
      title: `Delete ${entityName.toLowerCase()}`,
      description: `This permanently removes “${item.name}”. Type DELETE to confirm.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      requireText: 'DELETE',
    });
    if (!ok) return;

    try {
      await apiClient.delete(getDeletePath(item));
      pagination.setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      pagination.setTotal((prev) => Math.max(0, prev - 1));
      showSaveToast(`${entityName} deleted`);
    } catch {
      showErrorToast(`Failed to delete ${entityName.toLowerCase()}`);
    }
  };

  return {
    pagination,
    canReorder,
    savingOrder,
    persistOrder,
    handleDelete,
  };
}
