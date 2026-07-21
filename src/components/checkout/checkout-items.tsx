'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Package, Plus, Ruler, Shirt, ShoppingBag, Trash2 } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { CartItem } from '@/src/store/cart';

interface CheckoutItemsProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
}

export function CheckoutItems({ items, onUpdateQuantity, onRemove }: CheckoutItemsProps) {
  return (
    <section className="h-fit self-start overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="border-b border-neutral-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center bg-amber-50 text-amber-700">
            <Package size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-950">Your bag</h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              {items.length} {items.length === 1 ? 'line' : 'lines'}
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-12 text-center sm:px-6">
          <span className="mb-4 inline-flex h-11 w-11 items-center justify-center bg-amber-50 text-amber-700">
            <ShoppingBag size={20} />
          </span>
          <p className="text-sm text-neutral-600">Your bag is empty.</p>
          <p className="mt-1 text-xs text-neutral-400">Add pieces to continue checkout.</p>
          <ButtonLink href="/" size="xl" className="mt-5">
            Browse products
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100 px-5 sm:px-6">
          {items.map((item) => (
            <li key={item.cartId} className="flex gap-4 py-5">
              <Link
                href={`/products/${item.productId}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden bg-neutral-100"
              >
                {item.imageUrl && (
                  <Image
                    src={getAssetUrl(item.imageUrl)}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2.5">
                    <Link
                      href={`/products/${item.productId}`}
                      className="block truncate text-sm font-bold uppercase tracking-wider text-neutral-950 transition-colors hover:text-neutral-600"
                    >
                      {item.name}
                    </Link>

                    <div className="flex flex-wrap gap-1.5">
                      {item.variantName ? (
                        <span className="inline-flex items-center gap-1.5 bg-neutral-100 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-700">
                          {item.colorHex ? (
                            <span
                              className="h-2.5 w-2.5 shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                              style={{ backgroundColor: item.colorHex }}
                              aria-hidden
                            />
                          ) : (
                            <Shirt size={11} strokeWidth={2.25} />
                          )}
                          {item.variantName}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-800">
                        <Ruler size={11} strokeWidth={2.25} />
                        Size {item.size}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.cartId)}
                    className="p-1.5 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 bg-neutral-50 px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                      className="p-1 text-neutral-400 transition-colors hover:text-neutral-950"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-mono text-sm text-neutral-950">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                      className="p-1 text-neutral-400 transition-colors hover:text-neutral-950"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-mono text-sm font-medium text-neutral-950">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
