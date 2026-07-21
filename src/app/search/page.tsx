'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { ProductGrid } from '@/src/components/catalog/product-grid';
import { Footer } from '@/src/components/layout/footer';
import type { Collection, Product } from '@/src/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.get<Product[], Product[]>('/products'), apiClient.get<Collection[], Collection[]>('/collections')])
      .then(([productList, collectionList]) => {
        setProducts(productList);
        setCollections(collectionList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const normalized = q.trim().toLowerCase();

  const matchedProducts = useMemo(() => {
    if (!normalized) return [];
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized)
    );
  }, [products, normalized]);

  const matchedCollections = useMemo(() => {
    if (!normalized) return [];
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(normalized) ||
        collection.slug.toLowerCase().includes(normalized) ||
        collection.season?.toLowerCase().includes(normalized) ||
        collection.description?.toLowerCase().includes(normalized)
    );
  }, [collections, normalized]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 site-container py-10 lg:py-14">
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Search
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
          {normalized ? `Results for “${q.trim()}”` : 'Search the catalog'}
        </h1>
        {!normalized && (
          <p className="text-sm text-neutral-500 mt-3">
            Use the search in the navbar to find products and collections.
          </p>
        )}
      </div>

      {normalized && matchedProducts.length === 0 && matchedCollections.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <Search className="mx-auto text-neutral-300 mb-3" size={28} />
          <p className="text-sm text-neutral-500 mb-5">No matches found.</p>
          <ButtonLink href="/">Back to shop</ButtonLink>
        </div>
      ) : (
        <div className="space-y-14">
          {matchedCollections.length > 0 && (
            <section>
              <h2 className="text-xl font-black uppercase tracking-tighter text-black mb-6">
                Collections
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    className="group block bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)] transition-shadow"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                      <Image
                        src={getAssetUrl(collection.imageUrl)}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-bold uppercase tracking-wider text-sm text-black">
                        {collection.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                        {collection.season || 'Collection'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {matchedProducts.length > 0 && (
            <section>
              <h2 className="text-xl font-black uppercase tracking-tighter text-black mb-6">
                Products
                <span className="ml-2 font-mono text-xs text-neutral-400 normal-case tracking-wider">
                  ({matchedProducts.length})
                </span>
              </h2>
              <ProductGrid products={matchedProducts} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-neutral-900" size={32} />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
