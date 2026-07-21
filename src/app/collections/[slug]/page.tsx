'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CollectionBanner } from '@/src/components/collections/collection-banner';
import { ProductGrid } from '@/src/components/catalog/product-grid';
import { SectionHeading } from '@/src/components/shared/section-heading';
import { Footer } from '@/src/components/layout/footer';
import { apiClient } from '@/src/services/api';
import { useCollectionTransitionStore } from '@/src/store/collection-transition';
import type { Collection } from '@/src/types';

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const preview = useCollectionTransitionStore((state) => state.preview);
  const setPreview = useCollectionTransitionStore((state) => state.setPreview);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (scrolledRef.current) return;
    scrolledRef.current = true;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError('');
    apiClient.get<Collection, Collection>(`/collections/${slug}`)
      .then((data) => {
        setCollection(data);
        setPreview({
          id: data.id,
          slug: data.slug,
          name: data.name,
          imageUrl: data.imageUrl,
          season: data.season,
          description: data.description,
        });
      })
      .catch(() => setError('Collection not found'))
      .finally(() => setLoading(false));
  }, [slug, setPreview]);

  const bannerData =
    collection
      ? {
          id: collection.id,
          slug: collection.slug,
          name: collection.name,
          imageUrl: collection.imageUrl,
          season: collection.season,
          description: collection.description,
        }
      : preview?.slug === slug
        ? preview
        : null;

  if (!bannerData && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-900" size={36} />
      </div>
    );
  }

  if (!bannerData) {
    return (
      <div className="flex-1 site-container py-20 text-center">
        <p className="text-neutral-500 mb-6">{error || 'Collection not found'}</p>
        <Link href="/collections" className="text-xs uppercase tracking-widest font-mono text-black">
          Back to collections
        </Link>
      </div>
    );
  }

  const products = collection?.products ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
      <CollectionBanner collection={bannerData} />

      <motion.div
        className="site-container py-12 lg:py-16"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          label="Shop the edit"
          title={
            loading
              ? 'Loading…'
              : `${products.length} ${products.length === 1 ? 'Piece' : 'Pieces'}`
          }
          animate={false}
          titleClassName="text-2xl md:text-3xl font-black uppercase tracking-tighter text-neutral-950"
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-neutral-900" size={28} />
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-neutral-300 p-12 text-center text-neutral-500 text-sm">
            Products for this collection are coming soon.
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
