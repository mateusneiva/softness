'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getAssetUrl } from '@/src/services/api';
import { useCollectionTransitionStore } from '@/src/store/collection-transition';
import type { CollectionPreview } from '@/src/store/collection-transition';

type CollectionBannerProps = {
  collection: CollectionPreview;
};

const copyContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const copyItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CollectionBanner({ collection }: CollectionBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const startCollapse = useCollectionTransitionStore((state) => state.startCollapse);
  const clearHandoff = useCollectionTransitionStore((state) => state.clearHandoff);
  const isMorphing = useCollectionTransitionStore(
    (state) => state.active && state.preview?.slug === collection.slug
  );
  const seamlessHandoff = useCollectionTransitionStore((state) => state.seamlessHandoff);

  useEffect(() => {
    if (!isMorphing && seamlessHandoff) {
      const t = window.setTimeout(() => clearHandoff(), 50);
      return () => window.clearTimeout(t);
    }
  }, [isMorphing, seamlessHandoff, clearHandoff]);

  const handleBack = (event: React.MouseEvent) => {
    event.preventDefault();
    const node = bannerRef.current;
    if (!node) {
      window.location.href = '/collections';
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const rect = node.getBoundingClientRect();
    startCollapse(collection, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  return (
    <div
      ref={bannerRef}
      data-collection-banner={collection.slug}
      className="relative w-full h-[420px] md:h-[520px] bg-neutral-100 overflow-hidden"
      style={{ opacity: isMorphing ? 0 : 1 }}
    >
      <Image
        src={getAssetUrl(collection.imageUrl)}
        alt={collection.name}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {/* When arriving via the expand handoff the overlay already animated the
          copy in, so we show it instantly to avoid animating twice. On a direct
          visit each line fades + rises in a gentle stagger. */}
      <motion.div
        className="absolute inset-0 site-container flex flex-col justify-end pb-10 md:pb-14"
        style={{ opacity: isMorphing ? 0 : 1 }}
        variants={copyContainer}
        initial={seamlessHandoff ? false : 'hidden'}
        animate={seamlessHandoff ? false : 'show'}
      >
        <motion.div variants={seamlessHandoff ? undefined : copyItem}>
          <Link
            href="/collections"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-white/70 hover:text-white mb-6 w-fit transition-colors"
          >
            <ArrowLeft size={14} /> Collections
          </Link>
        </motion.div>
        {collection.season ? (
          <motion.p
            variants={seamlessHandoff ? undefined : copyItem}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2"
          >
            {collection.season}
          </motion.p>
        ) : null}
        <motion.h1
          variants={seamlessHandoff ? undefined : copyItem}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white max-w-3xl"
        >
          {collection.name}
        </motion.h1>
        {collection.description ? (
          <motion.p
            variants={seamlessHandoff ? undefined : copyItem}
            className="text-white/80 mt-4 max-w-xl text-sm md:text-base"
          >
            {collection.description}
          </motion.p>
        ) : null}
      </motion.div>
    </div>
  );
}
