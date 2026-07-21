'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  CollectionCard,
  collectionLayoutForIndex,
} from '@/src/components/collections/collection-card';
import { SectionHeading } from '@/src/components/shared/section-heading';
import { Footer } from '@/src/components/layout/footer';
import { apiClient } from '@/src/services/api';
import type { Collection } from '@/src/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Collection[], Collection[]>('/collections')
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 site-container py-8 lg:py-12">
      <SectionHeading
        as="h1"
        label="Softness"
        title="Collections"
        description="Seasonal edits and focused drops. Each collection gathers pieces built around a single idea."
        className="mb-12 md:mb-16 max-w-2xl"
        titleClassName="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-950"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neutral-900" size={36} />
        </div>
      ) : collections.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-12 text-center text-neutral-500 text-sm">
          No collections available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              layout={collectionLayoutForIndex(index)}
            />
          ))}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
