'use client';

import * as Flags from 'country-flag-icons/react/3x2';

type FlagComponent = (typeof Flags)[keyof typeof Flags];

const flagComponents = Flags as Record<string, FlagComponent>;

export type CountryFlagProps = {
  isoCode: string;
  className?: string;
  title?: string;
};

const DEFAULT_CLASS = 'h-4 w-6 shrink-0 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]';

export function CountryFlag({ isoCode, className = DEFAULT_CLASS, title }: CountryFlagProps) {
  const code = isoCode.trim().toUpperCase();
  const Flag = flagComponents[code];

  if (!Flag) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-neutral-200 font-mono text-[9px] uppercase text-neutral-500 ${className}`}
        title={title}
        aria-hidden={title ? undefined : true}
      >
        {code || '??'}
      </span>
    );
  }

  return <Flag className={className} title={title} aria-hidden={title ? undefined : true} />;
}
