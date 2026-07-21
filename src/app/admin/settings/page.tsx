'use client';

import { SettingsForm } from '@/src/components/admin/settings-form';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Store
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950 md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Control shipping, markets, checkout timing, and review how changes will appear to customers
          before saving.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
