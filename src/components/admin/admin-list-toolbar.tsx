'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminListToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export function AdminListToolbar({
  query,
  onQueryChange,
  searchPlaceholder = 'Search...',
  children,
}: AdminListToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-white pl-9 pr-3 py-3 text-sm shadow-[0_4px_18px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
        />
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
