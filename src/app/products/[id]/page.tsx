'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import { getEffectiveProductPrice, isProductDiscountActive } from '@/src/utils/commerce/pricing';
import { useCartStore } from '@/src/store/cart';
import { useRecentlyViewedStore } from '@/src/store/recently-viewed';
import { AddToCartButton } from '@/src/components/cart/add-to-cart-button';
import { Footer } from '@/src/components/layout/footer';
import { ProductReviews } from '@/src/components/product/product-reviews';
import { SuggestedProductsSection } from '@/src/components/catalog/suggested-products-section';
import type { Product, ProductVariant } from '@/src/types';

const easeOut = [0.22, 1, 0.36, 1] as const;

function fallbackVariant(product: Product): ProductVariant {
  return {
    id: 'default',
    name: 'Default',
    colorHex: null,
    imageUrl: product.imageUrl,
    images: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [],
    sizes: product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'],
    unavailableSizes: product.unavailableSizes ?? [],
    available: product.available !== false,
    order: 0,
  };
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const track = useRecentlyViewedStore((state) => state.track);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get<Product, Product>(`/products/${id}`)
      .then((data) => {
        const variants = data.variants?.length ? data.variants : [fallbackVariant(data)];
        const firstPurchasable =
          variants.find(
            (variant) => variant.available && variant.sizes.some((size) => !variant.unavailableSizes.includes(size)),
          ) ?? variants[0];

        const unavailable = new Set(firstPurchasable.unavailableSizes ?? []);
        const defaultSize =
          firstPurchasable.available === false
            ? ''
            : (firstPurchasable.sizes.find((size) => !unavailable.has(size)) ?? '');

        setProduct(data);
        setSelectedVariantId(firstPurchasable.id);
        setSelectedImage(
          firstPurchasable.images?.[0] ?? firstPurchasable.imageUrl ?? data.images?.[0] ?? data.imageUrl ?? '',
        );
        setSelectedSize(defaultSize);
        track({
          id: data.id,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          images: data.images ?? [],
          sizes: data.sizes ?? [],
          unavailableSizes: data.unavailableSizes ?? [],
          available: data.available,
          description: data.description,
        });
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id, track]);

  const variants = useMemo(() => {
    if (!product) return [];
    return product.variants?.length ? product.variants : [fallbackVariant(product)];
  }, [product]);

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];

  const gallery = useMemo(() => {
    if (!product) return [];
    const shared = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
    const variantImages = variants.flatMap((variant) =>
      variant.images?.length ? variant.images : variant.imageUrl ? [variant.imageUrl] : [],
    );
    return [...new Set([...shared, ...variantImages].filter(Boolean))];
  }, [product, variants]);

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    const target = variant.images?.[0] ?? variant.imageUrl ?? product?.images?.[0] ?? product?.imageUrl ?? '';
    if (target) setSelectedImage(target);
    const unavailable = new Set(variant.unavailableSizes ?? []);
    const nextSize = variant.available === false ? '' : (variant.sizes.find((size) => !unavailable.has(size)) ?? '');
    setSelectedSize(nextSize);
    setError('');

    requestAnimationFrame(() => {
      const thumb = document.querySelector<HTMLElement>(`[data-gallery-src="${CSS.escape(target)}"]`);
      thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (selectedVariant.id === 'default') {
      setError('This product needs a saved variant. Please try again later.');
      return;
    }
    if (!selectedVariant.available) {
      setError('This color/model is currently unavailable.');
      return;
    }
    if (!selectedSize) {
      setError('No sizes are currently available.');
      return;
    }

    setError('');
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      colorHex: selectedVariant.colorHex,
      name: product.name,
      price: getEffectiveProductPrice(product),
      imageUrl: selectedImage || selectedVariant.imageUrl || product.imageUrl,
      size: selectedSize,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-neutral-950" size={36} />
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="site-container flex-1 py-20 text-center">
        <p className="text-neutral-500">{error}</p>
      </div>
    );
  }

  const displayedSizes = selectedVariant.sizes?.length ? selectedVariant.sizes : ['S', 'M', 'L', 'XL'];
  const unavailableSizes = new Set(selectedVariant.unavailableSizes ?? []);
  const hasAvailableSize = displayedSizes.some((size) => !unavailableSizes.has(size));
  const canPurchase = selectedVariant.available !== false && hasAvailableSize;
  const showVariantPicker = variants.length > 1 || variants[0]?.name !== 'Default';
  const effectivePrice = getEffectiveProductPrice(product);
  const onSale = isProductDiscountActive(product);

  return (
    <div className="flex flex-1 flex-col">
      <div className="site-container flex-1 py-8 lg:py-12">
        <motion.button
          type="button"
          onClick={() => router.back()}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <ArrowLeft size={15} /> Back
        </motion.button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)] xl:gap-16">
          <motion.div
            className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 sm:grid-cols-[96px_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto px-1">
              {gallery.map((image, index) => (
                <motion.button
                  key={image}
                  type="button"
                  data-gallery-src={image}
                  onClick={() => setSelectedImage(image)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + index * 0.04, ease: easeOut }}
                  className={`relative aspect-[3/4] shrink-0 overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${
                    selectedImage === image ? 'ring-1 ring-neutral-950' : ''
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image src={getAssetUrl(image)} alt="" fill className="object-cover" />
                </motion.button>
              ))}
            </div>

            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
              <AnimatePresence mode="wait">
                {selectedImage ? (
                  <motion.div
                    key={selectedImage}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <Image
                      src={getAssetUrl(selectedImage)}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 80vw, 55vw"
                      className="object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-neutral-400">
                    No Image
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.aside
            className="lg:sticky lg:top-28 lg:self-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: easeOut }}
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-950">
              Softness Collection
            </p>
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-neutral-950 xl:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 font-mono text-2xl text-neutral-950">
              {formatPrice(effectivePrice)}
              {onSale ? (
                <span className="ml-3 text-base text-neutral-400 line-through">{formatPrice(product.price)}</span>
              ) : null}
            </p>
            {!canPurchase && (
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-red-600">Currently unavailable</p>
            )}
            <p className="mt-7 font-sans leading-relaxed text-neutral-500">{product.description}</p>

            {showVariantPicker && (
              <div className="mt-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Select Color / Model
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {selectedVariant.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const soldOut =
                      !variant.available || !variant.sizes.some((size) => !variant.unavailableSizes.includes(size));
                    const active = variant.id === selectedVariant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={soldOut}
                        onClick={() => selectVariant(variant)}
                        className={`inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition duration-200 ease-out ${
                          soldOut
                            ? 'bg-white text-neutral-400 shadow-[0_4px_14px_rgba(0,0,0,0.05)]'
                            : active
                              ? 'bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
                              : 'bg-white text-neutral-600 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]'
                        }`}
                        title={variant.name}
                      >
                        {variant.colorHex ? (
                          <span
                            className="h-3 w-3 shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        ) : null}
                        {variant.name}
                        {soldOut ? ' · Sold out' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Select Size</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Size Guide</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {displayedSizes.map((size) => {
                  const sizeUnavailable = selectedVariant.available === false || unavailableSizes.has(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={sizeUnavailable}
                      onClick={() => {
                        setSelectedSize(size);
                        setError('');
                      }}
                      className={`h-12 font-mono text-xs uppercase tracking-widest transition duration-200 ease-out ${
                        sizeUnavailable
                          ? 'bg-neutral-100 text-neutral-400 line-through'
                          : selectedSize === size
                            ? 'bg-neutral-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
                            : 'bg-white text-neutral-500 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:text-neutral-900 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <AddToCartButton soldOut={!canPurchase} disabled={!canPurchase} onAdd={handleAddToCart} />

            <div className="mt-8 grid grid-cols-2 gap-6 pt-6 font-mono text-[10px] uppercase tracking-widest text-neutral-400 shadow-[inset_0_1px_0_rgba(0,0,0,0.06)]">
              <span>Worldwide shipping</span>
              <span>Secure checkout</span>
              <span>Premium materials</span>
              <span>Easy returns</span>
            </div>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: easeOut }}
        >
          <SuggestedProductsSection
            endpoint={`/products/${product.id}/suggestions`}
            label="You may also like"
            title="Suggested For You"
            description="More pieces from the same collection and curated alternatives."
            className="mb-16 mt-16"
          />
          <ProductReviews productId={product.id} />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
