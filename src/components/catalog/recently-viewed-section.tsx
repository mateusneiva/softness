'use client';

import { useEffect, useState } from 'react';
import { useRecentlyViewedStore } from '@/src/store/recently-viewed';
import { ProductGrid } from '@/src/components/catalog/product-grid';
import { SectionHeading } from '@/src/components/shared/section-heading';

export function RecentlyViewedSection() {
  const items = useRecentlyViewedStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) return null;

  const products = items.map((product) => ({
    ...product,
    unavailableSizes: product.unavailableSizes ?? [],
    available: product.available ?? true,
    createdAt: '',
  }));

  return (
    <section className="mb-20 md:mb-28">
      <SectionHeading
        label="Your activity"
        title="Recently Viewed"
        description="Pieces you checked out recently — pick up where you left off."
      />
      <ProductGrid products={products} />
    </section>
  );
}
