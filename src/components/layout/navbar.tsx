'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth';
import { CartDropdown } from '@/src/components/cart/cart-dropdown';
import { NavbarSearch } from '@/src/components/layout/navbar-search';
import { User as UserIcon, Shield } from 'lucide-react';

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="bg-white">
      <div className="site-container flex items-center justify-between gap-4 py-5">
        <div className="flex flex-1 items-center gap-5 min-w-0">
          <nav className="group/nav flex items-center gap-5 uppercase font-semibold text-xs tracking-widest shrink-0">
            <NextLink
              href="/"
              className="cursor-pointer text-neutral-900 transition-colors duration-200 group-hover/nav:text-neutral-300 hover:!text-black"
            >
              Shop
            </NextLink>
            <NextLink
              href="/collections"
              className="cursor-pointer text-neutral-900 transition-colors duration-200 group-hover/nav:text-neutral-300 hover:!text-black hidden sm:inline"
            >
              Collections
            </NextLink>
            <NavbarSearch />
          </nav>
        </div>

        <NextLink href="/" className="flex-shrink-0">
          <Image
            src="/logo/3_LOGO_PRETO.png"
            alt="Softness Logo"
            width={120}
            height={70}
            className="hover:opacity-80 transition-opacity"
            priority
          />
        </NextLink>

        <div className="flex flex-1 justify-end items-center gap-4 sm:gap-5 text-neutral-900 font-medium">
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'ADMIN' && (
                <NextLink
                  href="/admin"
                  className="flex cursor-pointer items-center gap-2 hover:text-black transition-colors"
                  title="Admin home"
                >
                  <Shield size={18} />
                  <span className="hidden sm:inline text-xs uppercase tracking-widest">Admin</span>
                </NextLink>
              )}
              <NextLink
                href="/account"
              className="flex cursor-pointer items-center gap-2 hover:text-black transition-colors"
              title="My Account"
              >
                <UserIcon size={18} />
                <span className="hidden sm:inline text-xs uppercase tracking-widest max-w-[100px] truncate">
                  {user.name ?? 'Account'}
                </span>
              </NextLink>
            </div>
          ) : (
            <NextLink
              href="/login"
              className="flex cursor-pointer items-center gap-2 hover:text-black transition-colors"
            >
              <UserIcon size={18} />
              <span className="hidden sm:inline text-xs uppercase tracking-widest">Login</span>
            </NextLink>
          )}

          <CartDropdown />
        </div>
      </div>
    </header>
  );
}
