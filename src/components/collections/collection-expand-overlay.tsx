'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getAssetUrl } from '@/src/services/api';
import {
  useCollectionTransitionStore,
  type Rect,
} from '@/src/store/collection-transition';

const copyContainer = {
  hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
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

const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

function blockEvent(event: Event) {
  event.preventDefault();
}

function blockKeys(event: KeyboardEvent) {
  if (SCROLL_KEYS.has(event.key)) event.preventDefault();
}

/** Prevent user-driven scroll while still allowing programmatic scroll. */
function lockScroll() {
  window.addEventListener('wheel', blockEvent, { passive: false });
  window.addEventListener('touchmove', blockEvent, { passive: false });
  window.addEventListener('keydown', blockKeys, { passive: false });
}

function unlockScroll() {
  window.removeEventListener('wheel', blockEvent);
  window.removeEventListener('touchmove', blockEvent);
  window.removeEventListener('keydown', blockKeys);
}

function getHeaderOffset() {
  const sticky = document.querySelector('.sticky.top-0') as HTMLElement | null;
  return sticky?.getBoundingClientRect().height ?? 0;
}

function getBannerHeight() {
  return window.matchMedia('(min-width: 768px)').matches ? 520 : 420;
}

function getViewportWidth() {
  return document.documentElement.clientWidth;
}

function toRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: Math.round(r.top),
    left: Math.round(r.left),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
}

function bannerTarget(): Rect {
  return {
    top: Math.round(getHeaderOffset()),
    left: 0,
    width: getViewportWidth(),
    height: getBannerHeight(),
  };
}

function withInstantScroll<T>(fn: () => T): T {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  try {
    return fn();
  } finally {
    html.style.scrollBehavior = previous;
  }
}

async function nextPaint() {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

async function waitForSelector(
  selector: string,
  maxAttempts = 60
): Promise<HTMLElement | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) return el;
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }
  return null;
}

function waitForCardMedia(slug: string) {
  return waitForSelector(`[data-collection-media="${slug}"]`, 40);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Bring the target card fully into view (programmatic scroll is still allowed
 * while the user scroll is locked), let layout settle, then measure it.
 */
async function resolveCardRect(slug: string): Promise<Rect | null> {
  const card = await waitForCardMedia(slug);
  if (!card) return null;

  withInstantScroll(() => {
    const rect = card.getBoundingClientRect();
    const topLimit = getHeaderOffset() + 16;
    const bottomLimit = window.innerHeight - 16;
    if (rect.top < topLimit || rect.bottom > bottomLimit) {
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    }
  });

  await nextPaint();
  return toRect(card);
}

export function CollectionExpandOverlay() {
  const router = useRouter();
  const preview = useCollectionTransitionStore((state) => state.preview);
  const from = useCollectionTransitionStore((state) => state.from);
  const direction = useCollectionTransitionStore((state) => state.direction);
  const active = useCollectionTransitionStore((state) => state.active);
  const finish = useCollectionTransitionStore((state) => state.finish);

  const [frame, setFrame] = useState<Rect | null>(null);
  const [showCopy, setShowCopy] = useState(false);
  const [ready, setReady] = useState(false);
  const runIdRef = useRef(0);

  // Trigger the morph only when a transition starts. We intentionally read
  // `preview`/`from` from the store here (not from deps) so that the detail
  // page calling `setPreview` mid-transition doesn't restart the animation.
  useLayoutEffect(() => {
    if (!active || !direction) {
      setFrame(null);
      setShowCopy(false);
      setReady(false);
      unlockScroll();
      return;
    }

    const { preview: startPreview, from: startFrom } =
      useCollectionTransitionStore.getState();
    if (!startPreview || !startFrom) return;

    const runId = ++runIdRef.current;
    const slug = startPreview.slug;
    const from = startFrom;

    lockScroll();
    setFrame({
      top: Math.round(from.top),
      left: Math.round(from.left),
      width: Math.round(from.width),
      height: Math.round(from.height),
    });
    setReady(false);
    setShowCopy(false);

    let cancelled = false;

    const isCurrent = () => !cancelled && runId === runIdRef.current;

    async function run() {
      if (direction === 'expand') {
        // Navigate first so the destination page (hidden banner + product
        // spinner) mounts underneath the overlay — the previous page never
        // shows through. The overlay clone sits over the card until then.
        router.push(`/collections/${slug}`);
        await waitForSelector(`[data-collection-banner="${slug}"]`);
        await nextPaint();
        if (!isCurrent()) return;

        // Now morph the clone from the card rect up to the banner, fading the
        // copy in as it grows.
        setReady(true);
        setFrame(bannerTarget());
        setShowCopy(true);

        await delay(560);
        if (!isCurrent()) return;

        unlockScroll();
        finish();
        return;
      }

      // Collapse — fade the copy out, then morph back to the card.
      setShowCopy(false);
      router.push('/collections');
      await nextPaint();
      if (!isCurrent()) return;

      const target = await resolveCardRect(slug);
      if (!isCurrent()) return;

      setReady(true);
      setFrame(
        target ?? {
          top: getHeaderOffset() + 120,
          left: Math.max(24, getViewportWidth() / 2 - 140),
          width: 280,
          height: 350,
        }
      );
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [active, direction, router, finish]);

  if (!active || !preview || !from || !frame) return null;

  return (
    <motion.div
      key={`collection-morph-${direction}-${preview.slug}`}
      className="fixed z-[60] overflow-hidden bg-neutral-100 pointer-events-none"
      style={{ willChange: 'top, left, width, height' }}
      initial={false}
      animate={{
        top: frame.top,
        left: frame.left,
        width: frame.width,
        height: frame.height,
      }}
      transition={
        ready
          ? {
              duration: direction === 'expand' ? 0.5 : 0.42,
              ease: [0.16, 1, 0.3, 1],
            }
          : { duration: 0 }
      }
      onAnimationComplete={async () => {
        if (!ready || direction !== 'collapse') return;
        // Snap to the live card rect so we can never land a few px off.
        const snapped = await resolveCardRect(preview.slug);
        if (snapped) {
          setReady(false);
          setFrame(snapped);
          await nextPaint();
        }
        unlockScroll();
        finish();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getAssetUrl(preview.imageUrl)}
        alt={preview.name}
        className="h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <motion.div
        className="absolute inset-0 site-container flex flex-col justify-end pb-10 md:pb-14"
        variants={copyContainer}
        initial={false}
        animate={showCopy ? 'show' : 'hidden'}
      >
        <motion.div
          variants={copyItem}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-white/70 mb-6 w-fit"
        >
          <ArrowLeft size={14} /> Collections
        </motion.div>
        {preview.season ? (
          <motion.p
            variants={copyItem}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2"
          >
            {preview.season}
          </motion.p>
        ) : null}
        <motion.h1
          variants={copyItem}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white max-w-3xl"
        >
          {preview.name}
        </motion.h1>
        {preview.description ? (
          <motion.p
            variants={copyItem}
            className="text-white/80 mt-4 max-w-xl text-sm md:text-base"
          >
            {preview.description}
          </motion.p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
