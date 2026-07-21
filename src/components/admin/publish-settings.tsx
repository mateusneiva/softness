'use client';

import type { PublishMode } from '@/src/utils/commerce/publish';

interface PublishSettingsProps {
  mode: PublishMode;
  releaseAt: string;
  onModeChange: (mode: PublishMode) => void;
  onReleaseAtChange: (value: string) => void;
  entityLabel?: string;
}

export function PublishSettings({
  mode,
  releaseAt,
  onModeChange,
  onReleaseAtChange,
  entityLabel = 'item',
}: PublishSettingsProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Visibility</p>
      <div className="space-y-3">
        {(
          [
            {
              value: 'private' as const,
              title: 'Private',
              description: `Hidden from the store indefinitely — draft ${entityLabel}.`,
            },
            {
              value: 'scheduled' as const,
              title: 'Scheduled',
              description: 'Goes live automatically at the release date.',
            },
            {
              value: 'public' as const,
              title: 'Public',
              description: 'Visible on the store right away.',
            },
          ] as const
        ).map((option) => (
          <label
            key={option.value}
            className={`flex gap-3 p-3 cursor-pointer transition-shadow ${
              mode === option.value
                ? 'bg-neutral-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]'
                : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]'
            }`}
          >
            <input
              type="radio"
              name="publishMode"
              value={option.value}
              checked={mode === option.value}
              onChange={() => onModeChange(option.value)}
              className="mt-1 accent-black"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-950">{option.title}</span>
              <span className="block text-xs text-neutral-500 mt-0.5">{option.description}</span>
            </span>
          </label>
        ))}
      </div>

      {mode === 'scheduled' && (
        <div>
          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
            Release date & time
          </label>
          <input
            type="datetime-local"
            value={releaseAt}
            onChange={(e) => onReleaseAtChange(e.target.value)}
            required
            className="w-full bg-neutral-50 p-3.5 text-neutral-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
          />
        </div>
      )}
    </div>
  );
}
