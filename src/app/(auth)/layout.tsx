'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.includes('/login');

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:py-16">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-lg'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: isLogin ? -24 : 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: isLogin ? 24 : -24, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
