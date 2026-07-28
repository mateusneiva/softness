import NextLink from 'next/link';
import Image from 'next/image';
import InstagramIcon from '@/src/assets/icons/instagram.svg';
import XIcon from '@/src/assets/icons/x.svg';
import TikTokIcon from '@/src/assets/icons/tiktok.svg';

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: '#',
    icon: InstagramIcon,
  },
  {
    label: 'X',
    href: '#',
    icon: XIcon,
  },
  {
    label: 'TikTok',
    href: '#',
    icon: TikTokIcon,
  },
] as const;

export function FooterSocial() {
  return (
    <div>
      <h3 className="text-base font-bold uppercase tracking-wide text-white mb-4">Social</h3>
      <nav className="group/footer-social flex flex-col gap-3.5 text-base font-bold uppercase tracking-wide">
        {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className="text-neutral-400 transition-colors duration-200 group-hover/footer-social:text-neutral-600 hover:!text-white flex items-center gap-2"
          >
            <Icon className="size-[15px]" aria-hidden /> {label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function FooterSupport() {
  return (
    <div>
      <h3 className="text-base font-bold uppercase tracking-wide text-white mb-4">Support</h3>
      <nav className="group/footer-support flex flex-col gap-3.5 text-base font-bold uppercase tracking-wide">
        <a
          href="mailto:hello@softness.com"
          className="text-neutral-400 transition-colors duration-200 group-hover/footer-support:text-neutral-600 hover:!text-white"
        >
          Contact
        </a>
        <NextLink
          href="/privacy"
          className="text-neutral-400 transition-colors duration-200 group-hover/footer-support:text-neutral-600 hover:!text-white"
        >
          Privacy
        </NextLink>
        <NextLink
          href="/terms"
          className="text-neutral-400 transition-colors duration-200 group-hover/footer-support:text-neutral-600 hover:!text-white"
        >
          Terms
        </NextLink>
      </nav>
    </div>
  );
}

export function FooterBrand() {
  return (
    <div className="md:col-span-2 lg:col-span-2">
      <Image
        src="/logo/3_LOGO_PRETO.png"
        alt="Softness"
        width={110}
        height={60}
        className="invert opacity-90 mb-5"
      />
      <p className="text-neutral-400 font-medium text-sm leading-relaxed max-w-sm">
        Minimalist streetwear designed for the modern era. Quality fabrics, clean cuts, and timeless
        aesthetics.
      </p>
    </div>
  );
}
