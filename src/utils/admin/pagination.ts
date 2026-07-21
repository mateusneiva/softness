export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const PAGE_SIZE_OPTIONS = [15, 30, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
