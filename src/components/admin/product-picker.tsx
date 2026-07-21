'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { getAssetUrl } from '@/src/services/api';
import type { Product } from '@/src/types';

interface ProductPickerProps {
  products: Product[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ProductPicker({ products, selectedIds, onChange }: ProductPickerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized)
    );
  }, [products, query]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-3">
        <span className="block text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Products ({selectedIds.length})
        </span>
      </div>

      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-white pl-9 pr-3 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[0_4px_18px_rgba(0,0,0,0.1)]"
        />
      </div>

      <div className="bg-white max-h-64 overflow-y-auto divide-y divide-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">No products match your search.</p>
        ) : (
          filtered.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggle(product.id)}
                className="accent-black"
              />
              <div className="relative w-10 h-10 bg-neutral-100 shrink-0 overflow-hidden">
                {product.imageUrl && (
                  <Image
                    src={getAssetUrl(product.imageUrl)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-black truncate">{product.name}</p>
                <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">
                  {product.variants?.length
                    ? `${product.variants.length} variants`
                    : 'No variants'}
                </p>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
