'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth';
import { CartDropdown } from '@/src/components/cart/cart-dropdown';
import { NavbarSearch } from '@/src/components/layout/navbar-search';
import { MobileNavSidebar } from '@/src/components/layout/mobile-nav-sidebar';
import { User as UserIcon, Shield } from 'lucide-react';

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="border-b border-neutral-100 bg-white">
      <div className="site-container flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-5">
          <MobileNavSidebar />

          <nav className="group/nav hidden items-center gap-5 text-xs font-semibold uppercase tracking-widest sm:flex">
            <NextLink
              href="/"
              className="cursor-pointer text-neutral-900 transition-colors duration-200 group-hover/nav:text-neutral-300 hover:!text-black"
            >
              Shop
            </NextLink>
            <NextLink
              href="/collections"
              className="cursor-pointer text-neutral-900 transition-colors duration-200 group-hover/nav:text-neutral-300 hover:!text-black"
            >
              Collections
            </NextLink>
            <NavbarSearch />
          </nav>
        </div>

        <NextLink href="/" className="shrink-0">
          <Image
            src="/logo/3_LOGO_PRETO.png"
            alt="Softness Logo"
            width={120}
            height={70}
            className="h-7 w-auto transition-opacity hover:opacity-80 sm:h-10"
            priority
          />
        </NextLink>

        <div className="flex flex-1 items-center justify-end gap-3 font-medium text-neutral-900 sm:gap-5">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {user.role === 'ADMIN' && (
                <NextLink
                  href="/admin"
                  className="hidden cursor-pointer items-center gap-2 transition-colors hover:text-black sm:flex"
                  title="Admin home"
                >
                  <Shield size={18} />
                  <span className="text-xs uppercase tracking-widest">Admin</span>
                </NextLink>
              )}
              <NextLink
                href="/account"
                className="flex cursor-pointer items-center gap-2 transition-colors hover:text-black"
                title="My Account"
              >
                <UserIcon size={18} />
                <span className="hidden max-w-[100px] truncate text-xs uppercase tracking-widest sm:inline">
                  {user.name ?? 'Account'}
                </span>
              </NextLink>
            </div>
          ) : (
            <NextLink
              href="/login"
              className="flex cursor-pointer items-center gap-2 transition-colors hover:text-black"
            >
              <UserIcon size={18} />
              <span className="hidden text-xs uppercase tracking-widest sm:inline">Login</span>
            </NextLink>
          )}

          <CartDropdown />
        </div>
      </div>
    </header>
  );
}
