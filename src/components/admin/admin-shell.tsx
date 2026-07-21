'use client';

import { useEffect } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/src/store/auth';
import { ConfirmDialogProvider } from '@/src/components/admin/confirm-dialog';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-neutral-500 gap-4">
        <ShieldAlert size={48} className="text-red-600" />
        <h1 className="text-xl font-black uppercase tracking-tighter text-neutral-950">
          Access Denied
        </h1>
      </div>
    );
  }

  return (
    <ConfirmDialogProvider>
      <div className="flex flex-1 min-h-0 bg-neutral-50">
        <aside className="w-60 lg:w-64 bg-white p-5 flex flex-col gap-8 shrink-0 shadow-[8px_0_30px_rgba(0,0,0,0.06)] z-10">
          <Link href="/admin" className="block group">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1 group-hover:text-neutral-600 transition-colors">
              Softness
            </p>
            <h2 className="text-lg font-black uppercase tracking-tighter text-black">Admin</h2>
          </Link>

          <nav className="flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest font-mono transition-all ${
                    active
                      ? 'bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="mt-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-black transition-colors"
          >
            <ArrowLeft size={13} /> Back to store
          </Link>
        </aside>

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
    </ConfirmDialogProvider>
  );
}
