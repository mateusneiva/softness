'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ImageIcon,
  Layers,
  ShoppingBag,
  Tag,
  Settings2,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/src/store/auth';
import { ConfirmDialogProvider } from '@/src/components/admin/confirm-dialog';
import { useDismissible } from '@/src/hooks/use-dismissible';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings2 },
];

function AdminNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-all ${
              active
                ? 'bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminSidebarBody({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/admin" className="group block" onClick={onNavigate}>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 transition-colors group-hover:text-neutral-600">
          Softness
        </p>
        <h2 className="text-lg font-black uppercase tracking-tighter text-black">Admin</h2>
      </Link>

      <AdminNavLinks pathname={pathname} onNavigate={onNavigate} />

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-black"
      >
        <ArrowLeft size={13} /> Back to store
      </Link>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close, toggle, panelProps, Backdrop } = useDismissible({
    autoFocus: true,
    backdropClassName: 'z-[60] bg-black/40 md:hidden',
  });
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-neutral-500">
        <ShieldAlert size={48} className="text-red-600" />
        <h1 className="text-xl font-black uppercase tracking-tighter text-neutral-950">Access Denied</h1>
      </div>
    );
  }

  return (
    <ConfirmDialogProvider>
      <div className="flex min-h-0 flex-1 bg-neutral-50">
        <aside className="z-10 hidden w-60 shrink-0 flex-col gap-8 bg-white p-5 shadow-[8px_0_30px_rgba(0,0,0,0.06)] md:flex lg:w-64">
          <AdminSidebarBody pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center text-neutral-900"
              aria-label={isOpen ? 'Close admin menu' : 'Open admin menu'}
              aria-expanded={isOpen}
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">Softness</p>
              <p className="text-sm font-black uppercase tracking-tighter text-black">Admin</p>
            </div>
          </div>

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
                  className="fixed inset-y-0 left-0 z-[70] flex w-[min(86vw,288px)] flex-col gap-8 bg-white p-5 shadow-[12px_0_40px_rgba(0,0,0,0.18)] md:hidden"
                  aria-label="Admin navigation"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">Menu</p>
                    <button
                      type="button"
                      onClick={close}
                      className="flex h-9 w-9 items-center justify-center text-neutral-500 hover:text-black"
                      aria-label="Close admin menu"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <AdminSidebarBody pathname={pathname} onNavigate={close} />
                </motion.aside>
              </>
            ) : null}
          </AnimatePresence>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </ConfirmDialogProvider>
  );
}
