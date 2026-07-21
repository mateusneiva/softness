'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CollectionCard } from '@/src/components/collections/collection-card';
import { SectionHeading } from '@/src/components/shared/section-heading';
import { apiClient } from '@/src/services/api';
import type { Collection } from '@/src/types';

export function CollectionsMarquee() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    apiClient.get<Collection[], Collection[]>('/collections/featured')
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (collections.length === 0) return;

    const speed = 0.45;

    const animate = () => {
      const track = trackRef.current;
      if (track && !pausedRef.current) {
        offsetRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(offsetRef.current) >= halfWidth) {
          offsetRef.current = 0;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [collections]);

  // Only hide once we know there's genuinely nothing to show. While loading we
  // keep the section (heading + skeleton) mounted so it holds its place at the
  // top — otherwise sections below jump up into this slot for a frame.
  if (loaded && collections.length === 0) return null;

  const loopItems = [...collections, ...collections];

  return (
    <section className="mb-20 md:mb-28">
      <SectionHeading
        label="Latest"
        title="Collections"
        description="Seasonal edits moving across the season — explore the latest drops."
        className="mb-8"
        action={
          <Link
            href="/collections"
            className="hidden sm:inline text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black transition-colors"
          >
            View all
          </Link>
        }
      />

      {collections.length === 0 ? (
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-[280px] sm:w-[320px] md:w-[360px] aspect-[4/5] shrink-0 animate-pulse bg-neutral-100"
            />
          ))}
        </div>
      ) : (
        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div ref={trackRef} className="flex gap-5 w-max will-change-transform">
            {loopItems.map((collection, index) => (
              <CollectionCard
                key={`${collection.id}-${index}`}
                collection={collection}
                index={index % collections.length}
                layout="marquee"
              />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
