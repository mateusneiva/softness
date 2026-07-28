'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Shield, User as UserIcon, X } from 'lucide-react';
import { useDismissible } from '@/src/hooks/use-dismissible';
import { useAuthStore } from '@/src/store/auth';
import { NavbarSearch } from '@/src/components/layout/navbar-search';

const links = [
  { href: '/', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
];

export function MobileNavSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { isOpen, close, toggle, panelProps, Backdrop } = useDismissible({
    autoFocus: true,
    backdropClassName: 'z-[60] bg-black/40',
  });
  const closeRef = useRef(close);
  closeRef.current = close;

  // Only close on route change — do not depend on `close` (it changes when isOpen flips).
  useEffect(() => {
    closeRef.current();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        className="flex h-9 w-9 items-center justify-center text-neutral-900 transition-colors hover:text-black"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <Backdrop />
            <motion.aside
              {...panelProps}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[min(86vw,320px)] flex-col bg-white shadow-[12px_0_40px_rgba(0,0,0,0.18)]"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">Menu</p>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center text-neutral-500 transition-colors hover:text-black"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-3 py-4">
                {links.map((link) => {
                  const active =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className={`px-3 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                        active ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-neutral-100 px-5 py-4">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  Quick search
                </p>
                <NavbarSearch className="w-full" />
              </div>

              <div className="mt-auto border-t border-neutral-100 px-3 py-4">
                {user?.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="mb-1 flex items-center gap-3 px-3 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                  >
                    <Shield size={16} />
                    Admin
                  </Link>
                ) : null}
                <Link
                  href={user ? '/account' : '/login'}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                >
                  <UserIcon size={16} />
                  {user ? (user.name ?? 'Account') : 'Login'}
                </Link>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
