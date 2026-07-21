'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, LayoutDashboard, Loader2, LockKeyhole, LogOut, MapPin, Package, User } from 'lucide-react';
import { useAuthStore } from '@/src/store/auth';
import { ACCOUNT_TAB_HREFS, resolveAccountTab, type AccountTab } from '@/src/components/account/account-tabs';

export type { AccountTab };

interface AccountShellProps {
  children: ReactNode;
}

const tabs = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'orders' as const, label: 'Orders', icon: Package },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'security' as const, label: 'Security', icon: LockKeyhole },
  { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
  { id: 'payment' as const, label: 'Payment', icon: CreditCard },
];

const TAB_ORDER: AccountTab[] = ['overview', 'orders', 'profile', 'security', 'addresses', 'payment'];

function pathDepth(pathname: string) {
  return pathname.split('/').filter(Boolean).length;
}

function resolveTransitionDirection(fromPath: string, toPath: string) {
  const fromTab = resolveAccountTab(fromPath);
  const toTab = resolveAccountTab(toPath);

  if (fromTab !== toTab) {
    return TAB_ORDER.indexOf(toTab) >= TAB_ORDER.indexOf(fromTab) ? 1 : -1;
  }

  return pathDepth(toPath) >= pathDepth(fromPath) ? 1 : -1;
}

export function AccountShell({ children }: AccountShellProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = resolveAccountTab(pathname);
  const directionRef = useRef(1);
  const previousPathRef = useRef(pathname);

  if (previousPathRef.current !== pathname) {
    directionRef.current = resolveTransitionDirection(previousPathRef.current, pathname);
    previousPathRef.current = pathname;
  }

  const direction = directionRef.current;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="animate-spin text-neutral-900" size={36} />
      </div>
    );
  }

  return (
    <div className="flex-1 site-container py-8 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Account</p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">My Account</h1>
          <p className="text-neutral-500 text-sm mt-2 font-sans">{user.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="md:w-52 lg:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={ACCOUNT_TAB_HREFS[id]}
                className={`flex items-center gap-3 px-4 py-3 text-left text-xs uppercase tracking-widest font-mono transition-shadow whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]'
                    : 'text-neutral-500 hover:text-black bg-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]'
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="relative flex-1 min-w-0 max-w-3xl">
          <motion.div
            key={pathname}
            initial={{ opacity: 0.45, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 28, mass: 0.85 },
              opacity: { duration: 0.32, ease: 'easeOut' },
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
