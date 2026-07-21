import type { ComponentType } from 'react';

export type FilterTone =
  | 'neutral'
  | 'amber'
  | 'sky'
  | 'emerald'
  | 'violet'
  | 'red'
  | 'slate';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  tone?: FilterTone;
}
