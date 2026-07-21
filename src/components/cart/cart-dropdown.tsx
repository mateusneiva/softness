'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button, ButtonLink } from '@/src/components/ui/button';
import { useDismissible } from '@/src/hooks/use-dismissible';
import { useCartStore } from '@/src/store/cart';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';

export function CartDropdown() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, toggleCart } = useCartStore();
  const router = useRouter();

  const { close, triggerProps, panelProps, Backdrop } = useDismissible<HTMLDivElement>({
    open: isOpen,
    onOpenChange: setIsOpen,
    autoFocus: false,
    backdropClassName: 'z-40',
  });

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    close();
    router.push('/checkout');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleCart}
        {...triggerProps}
        className="relative flex items-center gap-2 text-neutral-900 transition-colors hover:text-black"
        aria-label="Toggle cart"
        aria-expanded={isOpen}
      >
        <ShoppingBag size={20} />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center bg-black text-[10px] font-bold text-white">
            {cartItemsCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop />
            <motion.div
              {...panelProps}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,380px)] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]"
            >
              <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center bg-white text-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                      <ShoppingBag size={16} />
                    </span>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tighter text-black">Your cart</h2>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  {items.length > 0 ? (
                    <span className="font-mono text-sm font-bold text-neutral-950">{formatPrice(total)}</span>
                  ) : null}
                </div>
              </div>

              <div className="max-h-[min(52vh,360px)] overflow-y-auto px-5 py-2">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center bg-neutral-100 text-neutral-400">
                      <ShoppingBag size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Your cart is empty</p>
                      <p className="mt-1 text-xs text-neutral-500">Add pieces from the store to checkout.</p>
                    </div>
                    <ButtonLink href="/" onClick={close} variant="outline" size="sm">
                      Continue shopping
                    </ButtonLink>
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {items.map((item) => (
                      <li key={item.cartId} className="flex gap-3 py-4 first:pt-2">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={close}
                          className="relative h-16 w-14 shrink-0 overflow-hidden bg-neutral-100"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={getAssetUrl(item.imageUrl)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/products/${item.productId}`}
                                onClick={close}
                                className="block truncate text-xs font-bold uppercase tracking-wider text-black transition-colors hover:text-neutral-600"
                              >
                                {item.name}
                              </Link>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.variantName ? (
                                  <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-700">
                                    {item.colorHex ? (
                                      <span
                                        className="h-2 w-2 shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                                        style={{ backgroundColor: item.colorHex }}
                                        aria-hidden
                                      />
                                    ) : null}
                                    {item.variantName}
                                  </span>
                                ) : null}
                                <span className="inline-flex items-center bg-amber-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-800">
                                  Size {item.size}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.cartId)}
                              className="shrink-0 cursor-pointer p-1 text-neutral-300 transition-colors hover:text-red-600"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 p-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.cartId, Math.max(1, item.quantity - 1))
                                }
                                className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-white hover:text-black"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="min-w-6 text-center font-mono text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-white hover:text-black"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="font-mono text-sm font-bold text-neutral-950">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        Subtotal
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">Shipping calculated at checkout</p>
                    </div>
                    <span className="font-mono text-lg font-black tracking-tight text-black">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button onClick={handleCheckout} fullWidth className="gap-2">
                    Checkout <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
