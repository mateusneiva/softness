'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ButtonLink } from '@/src/components/ui/button';
import { apiClient, getAssetUrl } from '@/src/services/api';
import type { Banner } from '@/src/types';

const DEFAULT_SLIDES: Banner[] = [
  {
    id: 'default-1',
    title: 'New Collection',
    subtitle: 'Minimal streetwear for the modern era',
    imageUrl: '',
    link: '/',
    buttonText: 'Explore Drop',
    order: 0,
    active: true,
  },
  {
    id: 'default-2',
    title: 'Essentials Drop',
    subtitle: 'Quality fabrics, clean cuts, timeless aesthetics',
    imageUrl: '',
    link: '/',
    buttonText: 'Shop Essentials',
    order: 1,
    active: true,
  },
  {
    id: 'default-3',
    title: 'Limited Edition',
    subtitle: 'Exclusive pieces — while supplies last',
    imageUrl: '',
    link: '/',
    buttonText: 'View Limited',
    order: 2,
    active: true,
  },
];

const GRADIENTS = [
  'from-neutral-900 via-neutral-800 to-neutral-950',
  'from-neutral-800 via-neutral-700 to-neutral-950',
  'from-neutral-950 via-neutral-800 to-neutral-700',
];

const ROTATION_TIME = 9000;
const STACK_COUNT = 3;
const CARD_WIDTH = 0.86;

/**
 * Transform stack — active largest on the left; back card ends at 100%:
 * right = x + CARD_WIDTH * scale
 */
const STACK_LAYOUT = [
  { x: 0, scale: 1, y: 0, rotateY: 0 },
  { x: 0.12, scale: 0.93, y: 10, rotateY: -6 },
  { x: 0.252, scale: 0.87, y: 20, rotateY: -10 },
] as const;

const SLIDE_TRANSITION = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as const,
};

function getForwardOffset(index: number, current: number, length: number) {
  return (index - current + length) % length;
}

export function HeroCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [slides, setSlides] = useState<Banner[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [timerCycle, setTimerCycle] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const update = () => setTrackWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBanners() {
      try {
        const { getStrapiBanners, isStrapiConfigured } = await import('@/src/services/strapi');
        if (isStrapiConfigured()) {
          const strapiBanners = await getStrapiBanners();
          if (!cancelled && strapiBanners && strapiBanners.length > 0) {
            setSlides(strapiBanners);
            return;
          }
        }
      } catch {
        // fall through to API
      }

      try {
        const data = await apiClient.get<Banner[], Banner[]>('/banners');
        if (!cancelled && data.length > 0) setSlides(data);
      } catch {
        // keep defaults
      }
    }

    void loadBanners();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, ROTATION_TIME);

    return () => window.clearTimeout(timer);
  }, [current, timerCycle, slides.length]);

  const selectSlide = (index: number) => {
    setCurrent(index);
    setTimerCycle((cycle) => cycle + 1);
  };

  const next = () => selectSlide((current + 1) % slides.length);
  const prev = () => selectSlide((current - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full mb-16 md:mb-20">
      <div
        ref={trackRef}
        className="relative h-[460px] sm:h-[540px] md:h-[620px] lg:h-[680px] overflow-hidden [perspective:1600px]"
      >
        <div className="absolute inset-0">
          {trackWidth > 0
            ? slides.map((slide, index) => {
                const offset = getForwardOffset(index, current, slides.length);
                const isActive = offset === 0;
                const isVisible = offset < STACK_COUNT && offset < slides.length;

                if (!isVisible) return null;

                const layout = STACK_LAYOUT[offset] ?? STACK_LAYOUT[STACK_LAYOUT.length - 1];
                const imageUrl = getAssetUrl(slide.imageUrl);
                const gradient = GRADIENTS[index % GRADIENTS.length];
                const cta = slide.buttonText?.trim() || 'Shop Now';

                return (
                  <motion.article
                    key={slide.id}
                    className="absolute top-0 left-0 h-full overflow-hidden cursor-pointer will-change-transform"
                    style={{
                      width: trackWidth * CARD_WIDTH,
                      transformOrigin: 'left center',
                      transformStyle: 'preserve-3d',
                      zIndex: 40 - offset,
                    }}
                    initial={false}
                    animate={{
                      x: trackWidth * layout.x,
                      y: layout.y,
                      scale: layout.scale,
                      rotateY: layout.rotateY,
                    }}
                    transition={SLIDE_TRANSITION}
                    onClick={() => {
                      if (!isActive) selectSlide(index);
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={slide.title}
                          fill
                          sizes="(max-width: 768px) 92vw, 86vw"
                          className="object-cover"
                          priority={isActive}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                      {!isActive ? (
                        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                      ) : null}
                    </div>

                    <motion.div
                      className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12"
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={SLIDE_TRANSITION}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2">
                        Softness Drop
                      </p>
                      <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-white max-w-2xl leading-none">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-white/75 mt-4 max-w-lg text-sm md:text-base font-sans">
                          {slide.subtitle}
                        </p>
                      )}
                      {isActive && slide.link && (
                        <ButtonLink
                          href={slide.link}
                          variant="inverse"
                          size="lg"
                          className="mt-7 w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cta}
                        </ButtonLink>
                      )}
                    </motion.div>
                  </motion.article>
                );
              })
            : null}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => selectSlide(index)}
              className={`relative h-1 overflow-hidden bg-neutral-200 transition-[width] duration-300 ${
                index === current ? 'w-14' : 'w-5 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === current && (
                <motion.span
                  key={`${current}-${timerCycle}`}
                  className="absolute inset-y-0 left-0 w-full origin-left bg-neutral-950"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: ROTATION_TIME / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-2.5 text-neutral-500 hover:text-neutral-950 transition-shadow shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="p-2.5 text-neutral-500 hover:text-neutral-950 transition-shadow shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] bg-white"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
