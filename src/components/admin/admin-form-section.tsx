'use client';

import type { ReactNode } from 'react';

interface AdminFormSectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function AdminFormSection({
  step,
  title,
  description,
  children,
}: AdminFormSectionProps) {
  return (
    <section className="bg-white p-5 md:p-6 shadow-[0_8px_28px_rgba(0,0,0,0.07)] space-y-5">
      <header className="flex items-start gap-3 pb-4 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-black text-white text-[10px] font-mono">
          {String(step).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
