'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

function getIntroDurationMs() {
  if (typeof performance === 'undefined') return 700;
  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  // Reload (F5): ~0.4s. First visit / cold navigate: ~0.7s.
  return nav?.type === 'reload' ? 400 : 700;
}

export function StoreIntro() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const [show, setShow] = useState(!isAdmin);
  const [durationMs] = useState(getIntroDurationMs);

  useEffect(() => {
    if (isAdmin) {
      setShow(false);
      return;
    }

    setShow(true);
    const hide = window.setTimeout(() => setShow(false), durationMs);
    return () => window.clearTimeout(hide);
    // Only on first mount of a store page load (F5 / cold open).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="store-intro"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <div className="relative flex flex-col items-center gap-8">
            <motion.img
              src="/logo/3_LOGO_PRETO.png"
              alt="Softness"
              className="h-14 w-auto sm:h-16"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="relative h-[2px] w-28 overflow-hidden bg-neutral-100">
              <motion.div
                className="absolute inset-y-0 left-0 bg-black"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: durationMs / 1000, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
