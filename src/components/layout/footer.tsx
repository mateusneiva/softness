import NextLink from 'next/link';
import { FooterBrand, FooterSocial, FooterSupport } from './footer-sections';

export function Footer() {
  return (
    <footer className="mt-12 bg-black text-white">
      <div className="site-container py-12 lg:py-18">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <FooterBrand />

          <div>
            <h3 className="text-base font-bold uppercase tracking-wide text-white mb-4">Shop</h3>
            <nav className="group/footer-shop flex flex-col gap-3.5 text-base font-bold uppercase tracking-wide">
              <NextLink
                href="/"
                className="text-neutral-400 transition-colors duration-200 group-hover/footer-shop:text-neutral-600 hover:!text-white"
              >
                New Arrivals
              </NextLink>
              <NextLink
                href="/collections"
                className="text-neutral-400 transition-colors duration-200 group-hover/footer-shop:text-neutral-600 hover:!text-white"
              >
                Collections
              </NextLink>
              <NextLink
                href="/account"
                className="text-neutral-400 transition-colors duration-200 group-hover/footer-shop:text-neutral-600 hover:!text-white"
              >
                My Account
              </NextLink>
            </nav>
          </div>

          <FooterSupport />
          <FooterSocial />
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} Softness. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
