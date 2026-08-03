import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/src/components/shared/auth-provider';
import { SiteHeader } from '@/src/components/layout/site-header';
import { ToastProvider } from '@/src/components/shared/toast-provider';
import { ServerStatusGate } from '@/src/components/shared/server-status-gate';
import { StoreIntro } from '@/src/components/layout/store-intro';
import { CollectionExpandOverlay } from '@/src/components/collections/collection-expand-overlay';
import '../styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://softness.store';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Softness — Streetwear',
    template: '%s · Softness',
  },
  description:
    'Minimalist streetwear designed for the modern era. Quality fabrics, clean cuts, and timeless aesthetics.',
  applicationName: 'Softness',
  keywords: [
    'streetwear',
    'softness',
    'minimalist fashion',
    'clothing',
    'apparel',
    'modern streetwear',
  ],
  authors: [{ name: 'Softness' }],
  creator: 'Softness',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Softness',
    title: 'Softness — Streetwear',
    description:
      'Minimalist streetwear designed for the modern era. Quality fabrics, clean cuts, and timeless aesthetics.',
    images: [
      {
        url: '/logo/3_LOGO_PRETO.png',
        width: 1200,
        height: 630,
        alt: 'Softness',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Softness — Streetwear',
    description:
      'Minimalist streetwear designed for the modern era. Quality fabrics, clean cuts, and timeless aesthetics.',
    images: ['/logo/3_LOGO_PRETO.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black selection:bg-black selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <StoreIntro />
            <SiteHeader />
            <main className="flex-1 flex flex-col">{children}</main>
            <CollectionExpandOverlay />
            <ServerStatusGate />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
