'use client';

import { usePathname } from 'next/navigation';
import { PortfolioBanner } from '@/src/components/layout/portfolio-banner';
import { Navbar } from '@/src/components/layout/navbar';

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <PortfolioBanner />
      {!isAdmin ? (
        <div className="sticky top-0 z-50 bg-white">
          <Navbar />
        </div>
      ) : null}
    </>
  );
}
