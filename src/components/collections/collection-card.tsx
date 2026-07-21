'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAssetUrl } from '@/src/services/api';
import { useCollectionTransitionStore } from '@/src/store/collection-transition';
import type { Collection } from '@/src/types';

export type CollectionLayoutSize =
  | 'hero'
  | 'tall'
  | 'wide'
  | 'square'
  | 'compact'
  | 'marquee';

type CollectionCardProps = {
  collection: Collection;
  index?: number;
  layout?: CollectionLayoutSize;
  className?: string;
};

const LAYOUT_CLASS: Record<CollectionLayoutSize, string> = {
  hero: 'md:col-span-6 aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[360px]',
  tall: 'md:col-span-2 aspect-[3/4] min-h-[320px]',
  wide: 'md:col-span-4 aspect-[16/10] min-h-[260px]',
  square: 'md:col-span-3 aspect-square min-h-[260px]',
  compact: 'md:col-span-3 aspect-[5/4] min-h-[220px]',
  marquee: 'w-[280px] sm:w-[320px] md:w-[360px] aspect-[4/5] shrink-0',
};

/** Repeating bento pattern for the collections index. */
export function collectionLayoutForIndex(index: number): CollectionLayoutSize {
  const pattern: CollectionLayoutSize[] = [
    'hero',
    'tall',
    'tall',
    'tall',
    'wide',
    'compact',
    'square',
    'square',
    'hero',
    'compact',
    'tall',
    'wide',
  ];
  return pattern[index % pattern.length];
}

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: Math.min(index * 0.06, 0.42),
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function CollectionCard({
  collection,
  index = 0,
  layout = 'square',
  className = '',
}: CollectionCardProps) {
  const router = useRouter();
  const mediaRef = useRef<HTMLDivElement>(null);
  const startExpand = useCollectionTransitionStore((state) => state.startExpand);
  const transitionActive = useCollectionTransitionStore((state) => state.active);
  const transitioningSlug = useCollectionTransitionStore((state) =>
    state.active ? state.preview?.slug : null
  );
  // If a transition is running when this card first mounts (e.g. collapsing back),
  // render it at rest so its position is stable to measure — no entrance replay.
  const skipEntranceRef = useRef(useCollectionTransitionStore.getState().active);
  const isMarquee = layout === 'marquee';
  const skipEntrance = isMarquee || skipEntranceRef.current;
  const isMorphTarget = transitioningSlug === collection.slug;

  const openCollection = (event: React.MouseEvent) => {
    event.preventDefault();
    const node = mediaRef.current;
    if (!node) {
      router.push(`/collections/${collection.slug}`);
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const rect = node.getBoundingClientRect();
    startExpand(
      {
        id: collection.id,
        slug: collection.slug,
        name: collection.name,
        imageUrl: collection.imageUrl,
        season: collection.season,
        description: collection.description,
      },
      {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }
    );
  };

  const titleClass =
    layout === 'hero'
      ? 'text-3xl md:text-5xl'
      : layout === 'marquee' || layout === 'compact'
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-3xl';

  return (
    <motion.div
      custom={index}
      variants={isMarquee ? undefined : cardVariants}
      initial={skipEntrance ? false : 'hidden'}
      animate={isMarquee ? undefined : 'show'}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`${LAYOUT_CLASS[layout]} ${className}`}
      style={isMorphTarget ? { transform: 'none' } : undefined}
    >
      <Link
        href={`/collections/${collection.slug}`}
        onClick={openCollection}
        className="group relative block h-full w-full overflow-hidden bg-neutral-100"
      >
        <div
          ref={mediaRef}
          data-collection-media={collection.slug}
          className="absolute inset-0"
          style={{ opacity: isMorphTarget ? 0 : 1 }}
        >
          <Image
            src={getAssetUrl(collection.imageUrl)}
            alt={collection.name}
            fill
            sizes={
              layout === 'hero'
                ? '100vw'
                : layout === 'marquee'
                  ? '360px'
                  : '(max-width: 768px) 100vw, 50vw'
            }
            className={`object-cover transition-transform duration-700 ease-out ${
              transitionActive ? '' : 'group-hover:scale-[1.04]'
            }`}
            priority={!isMarquee && index < 2}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <motion.div
          className={`absolute inset-x-0 bottom-0 ${
            isMarquee || layout === 'compact' ? 'p-5' : 'p-6 md:p-8'
          }`}
          initial={false}
          animate={{ opacity: isMorphTarget ? 0 : 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {collection.season ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2">
              {collection.season}
            </p>
          ) : null}
          <h2 className={`font-black uppercase tracking-tighter text-white ${titleClass}`}>
            {collection.name}
          </h2>
          {collection.description && layout !== 'compact' && layout !== 'marquee' ? (
            <p
              className={`text-white/75 mt-2 md:mt-3 ${
                layout === 'hero' ? 'max-w-xl text-sm md:text-base' : 'line-clamp-2 text-sm'
              }`}
            >
              {collection.description}
            </p>
          ) : null}
          {layout === 'hero' ? (
            <span className="inline-block mt-5 text-[10px] uppercase tracking-widest font-mono text-white">
              Explore collection →
            </span>
          ) : null}
        </motion.div>
      </Link>
    </motion.div>
  );
}
