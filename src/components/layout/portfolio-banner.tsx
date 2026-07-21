'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'softness-portfolio-banner-dismissed';

export function PortfolioBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-black text-white">
      <div className="site-container flex items-start sm:items-center justify-between gap-4 py-2.5">
        <p className="text-[11px] sm:text-xs leading-relaxed font-sans text-neutral-200 pr-2">
          <span className="font-semibold text-white">Portfolio project</span>
          {' — '}
          this is not a real store. Prices, checkout and shipping are for demo purposes only. Interested
          in the work?{' '}
          <a
            href="mailto:hello@softness.com"
            className="underline underline-offset-2 text-white hover:text-neutral-300"
          >
            Contact me
          </a>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
