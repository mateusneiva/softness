'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/src/services/api';
import { ProductGrid } from '@/src/components/catalog/product-grid';
import { SectionHeading } from '@/src/components/shared/section-heading';
import type { Product } from '@/src/types';

interface SuggestedProductsSectionProps {
  title?: string;
  description?: string;
  label?: string;
  endpoint: string;
  className?: string;
}

export function SuggestedProductsSection({
  title = 'Suggested For You',
  description = 'Curated picks based on what is trending in the store right now.',
  label = 'Suggested',
  endpoint,
  className = 'mb-20 md:mb-28',
}: SuggestedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<Product[], Product[]>(endpoint)
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (loading) {
    return (
      <section className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-neutral-950" size={28} />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={className}>
      <SectionHeading label={label} title={title} description={description} className="mb-12" />
      <ProductGrid products={products} />
    </section>
  );
}
