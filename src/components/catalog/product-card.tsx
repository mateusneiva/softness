'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { getEffectiveProductPrice, isProductDiscountActive } from '@/src/utils/commerce/pricing';
import type { Product } from '@/src/types';

interface ProductCardProps {
  product: Product;
  index?: number;
  /** When false, the card renders without its own entrance so a parent
   *  container (e.g. a staggered grid) can orchestrate the reveal. */
  animateOnMount?: boolean;
}

export function ProductCard({ product, index = 0, animateOnMount = true }: ProductCardProps) {
  const primaryImage = product.images?.[0] ?? product.imageUrl;
  const alternateImage = product.images?.[1];
  const isAvailable = product.available !== false;
  const effectivePrice = getEffectiveProductPrice(product);
  const onSale = isProductDiscountActive(product);

  return (
    <motion.div
      initial={animateOnMount ? { opacity: 0, y: 16 } : false}
      animate={animateOnMount ? { opacity: 1, y: 0 } : undefined}
      transition={animateOnMount ? { duration: 0.35, delay: index * 0.04 } : undefined}
      className="group flex flex-col"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
          {primaryImage ? (
            <>
              <Image
                src={getAssetUrl(primaryImage)}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  alternateImage ? 'group-hover:opacity-0' : ''
                }`}
              />
              {alternateImage && (
                <Image
                  src={getAssetUrl(alternateImage)}
                  alt={`${product.name} alternate view`}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm font-mono">
              No Image
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-x-0 bottom-0 bg-white/90 px-4 py-3 text-center text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-700">
              Sold Out
            </div>
          )}
          
          {onSale && isAvailable ? (
            <div className="absolute left-0 top-0 bg-black px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white">
              Sale
            </div>
          ) : null}
        </div>

        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-sm truncate">
              {product.name}
            </h3>
            <p className="text-neutral-500 text-sm mt-1 line-clamp-1 font-sans">{product.description}</p>
          </div>
          <div className="text-right whitespace-nowrap">
            <span className="font-mono font-semibold text-neutral-950 text-sm">
              {formatPrice(effectivePrice)}
            </span>
            {onSale ? (
              <span className="block font-mono text-[11px] text-neutral-400 line-through mt-0.5">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
