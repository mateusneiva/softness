'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useServerStatus } from '@/src/store/server-status';

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

export function ServerStatusGate() {
  const unavailable = useServerStatus((state) => state.unavailable);
  const markOnline = useServerStatus((state) => state.markOnline);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!unavailable) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [unavailable]);

  const handleRetry = () => {
    setRetrying(true);
    markOnline();
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {unavailable ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="server-status-title"
          className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-white px-6"
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center border border-black">
              <ServerCrash size={24} strokeWidth={1.75} />
            </span>

            <h1
              id="server-status-title"
              className="mt-8 text-3xl font-black uppercase tracking-tighter text-neutral-950 sm:text-4xl"
            >
              Server unavailable
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
              We couldn&apos;t reach the server. It may be temporarily down. Check your connection and try again in a
              moment.
            </p>

            <Button type="button" size="lg" onClick={handleRetry} disabled={retrying} className="mt-8">
              <RefreshCw size={14} strokeWidth={2.25} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Reconnecting' : 'Try again'}
            </Button>
          </div>

          <footer className="flex flex-col items-center gap-4 pb-8 pt-4 text-center">
            <Image
              src="/logo/3_LOGO_PRETO.png"
              alt="Softness"
              width={110}
              height={70}
              className="h-auto object-contain opacity-90"
            />

            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              &copy; {new Date().getFullYear()} Softness. All rights reserved.
            </span>

            <nav className="flex items-center gap-5">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => markOnline()}
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
