'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useDismissible } from '@/src/hooks/use-dismissible';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { getEffectiveProductPrice, isProductDiscountActive } from '@/src/utils/commerce/pricing';
import type { Collection, Product } from '@/src/types';

interface NavbarSearchProps {
  className?: string;
}

export function NavbarSearch({ className = '' }: NavbarSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { isOpen: open, toggle, close, triggerProps, escapeKeyDown, Backdrop } =
    useDismissible({
      focusRef: inputRef,
      focusDelay: 40,
      backdropClassName: 'z-40',
    });

  useEffect(() => {
    if (!open || loaded) return;
    Promise.all([apiClient.get<Product[], Product[]>('/products'), apiClient.get<Collection[], Collection[]>('/collections')])
      .then(([productList, collectionList]) => {
        setProducts(productList);
        setCollections(collectionList);
        setLoaded(true);
      })
      .catch(console.error);
  }, [open, loaded]);

  const normalized = query.trim().toLowerCase();

  const matchedProducts = useMemo(() => {
    if (!normalized) return [];
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized)
      )
      .slice(0, 5);
  }, [products, normalized]);

  const matchedCollections = useMemo(() => {
    if (!normalized) return [];
    return collections
      .filter(
        (collection) =>
          collection.name.toLowerCase().includes(normalized) ||
          collection.slug.toLowerCase().includes(normalized) ||
          collection.season?.toLowerCase().includes(normalized)
      )
      .slice(0, 4);
  }, [collections, normalized]);

  const hasResults = matchedProducts.length > 0 || matchedCollections.length > 0;

  const goToSearch = () => {
    if (!normalized) return;
    close();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        {...triggerProps}
        className="flex cursor-pointer items-center gap-2 text-neutral-900 transition-colors duration-200 group-hover/nav:text-neutral-300 hover:!text-black"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Search size={16} />
        <span className="text-xs uppercase tracking-widest font-semibold">Search</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <Backdrop />
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              onKeyDown={escapeKeyDown}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 top-full mt-3 z-50 w-[min(92vw,360px)] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)]"
            >
            <div className="flex items-center gap-2 px-3 py-3 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
              <Search size={14} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    goToSearch();
                  }
                  escapeKeyDown(e);
                }}
                placeholder="Search products & collections..."
                className="w-full min-w-0 bg-transparent text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="cursor-pointer text-neutral-400 hover:text-black"
                  aria-label="Clear"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!normalized ? (
                <p className="px-4 py-5 text-sm text-neutral-500">
                  Type to search the catalog.
                </p>
              ) : !hasResults ? (
                <p className="px-4 py-5 text-sm text-neutral-500">
                  No results for “{query.trim()}”
                </p>
              ) : (
                <>
                  {matchedProducts.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-400">
                        Products
                      </p>
                      <ul>
                        {matchedProducts.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.id}`}
                              onClick={close}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="relative w-10 h-12 bg-neutral-100 overflow-hidden shrink-0">
                                {product.imageUrl && (
                                  <Image
                                    src={getAssetUrl(product.imageUrl)}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-black truncate">
                                  {product.name}
                                </p>
                                <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                                  {formatPrice(getEffectiveProductPrice(product))}
                                  {isProductDiscountActive(product) ? (
                                    <span className="ml-1.5 line-through text-neutral-400">
                                      {formatPrice(product.price)}
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchedCollections.length > 0 && (
                    <div className="py-2 shadow-[inset_0_1px_0_rgba(0,0,0,0.05)]">
                      <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-400">
                        Collections
                      </p>
                      <ul>
                        {matchedCollections.map((collection) => (
                          <li key={collection.id}>
                            <Link
                              href={`/collections/${collection.slug}`}
                              onClick={close}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="relative w-10 h-12 bg-neutral-100 overflow-hidden shrink-0">
                                <Image
                                  src={getAssetUrl(collection.imageUrl)}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-black truncate">
                                  {collection.name}
                                </p>
                                <p className="font-mono text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">
                                  {collection.season || 'Collection'}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {normalized ? (
              <button
                type="button"
                onClick={goToSearch}
                className="w-full cursor-pointer px-4 py-3 text-[10px] uppercase tracking-widest font-mono text-black hover:bg-neutral-50 transition-colors shadow-[inset_0_1px_0_rgba(0,0,0,0.06)] text-left"
              >
                View all results
              </button>
            ) : null}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
