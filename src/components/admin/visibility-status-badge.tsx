'use client';

import { Clock, Eye, EyeOff } from 'lucide-react';
import { publishModeFromItem, type PublishMode } from '@/src/utils/commerce/publish';

const styles: Record<
  PublishMode,
  { label: string; className: string; Icon: typeof Eye }
> = {
  private: {
    label: 'Private',
    className: 'bg-neutral-100 text-neutral-600',
    Icon: EyeOff,
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-amber-50 text-amber-800',
    Icon: Clock,
  },
  public: {
    label: 'Public',
    className: 'bg-emerald-50 text-emerald-800',
    Icon: Eye,
  },
};

interface VisibilityStatusBadgeProps {
  listed?: boolean;
  available?: boolean;
  active?: boolean;
  releaseAt?: string | null;
}

export function VisibilityStatusBadge(props: VisibilityStatusBadgeProps) {
  const mode = publishModeFromItem(props);
  const { label, className, Icon } = styles[mode];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono ${className}`}
    >
      <Icon size={12} strokeWidth={2.25} />
      {label}
    </span>
  );
}
