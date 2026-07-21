'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/src/services/api';
import { HeroCarousel } from '@/src/components/catalog/hero-carousel';
import { ProductGrid } from '@/src/components/catalog/product-grid';
import { SectionHeading } from '@/src/components/shared/section-heading';
import { RecentlyViewedSection } from '@/src/components/catalog/recently-viewed-section';
import { SuggestedProductsSection } from '@/src/components/catalog/suggested-products-section';
import { CollectionsMarquee } from '@/src/components/collections/collections-marquee';
import { ScrollToTop } from '@/src/components/layout/scroll-to-top';
import { Footer } from '@/src/components/layout/footer';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/src/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Product[], Product[]>('/products')
      .then((data) => setProducts(data.slice(0, 16)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 site-container py-6 lg:py-12">
      <motion.div
        key="home-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroCarousel />
      </motion.div>

      <CollectionsMarquee key="home-marquee" />

      <RecentlyViewedSection key="home-recent" />

      <SuggestedProductsSection
        key="home-suggested"
        endpoint="/products/suggestions"
        label="Suggested"
        title="Suggested For You"
        description="Hand-picked pieces worth a closer look."
      />

      <SectionHeading
        key="home-new-arrivals"
        label="Shop"
        title="New Arrivals"
        description="Discover our latest collection. Minimalist streetwear designed for the modern era."
        className="mb-12"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neutral-950" size={40} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-200 ">
          <p className="uppercase tracking-widest text-sm font-mono">No products available yet</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
      <ScrollToTop />
      </div>
      <Footer />
    </div>
  );
}
