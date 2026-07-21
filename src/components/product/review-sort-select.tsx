'use client';

import { ArrowDownWideNarrow, Star } from 'lucide-react';
import { FilterSelect, type FilterOption } from '@/src/components/ui/filter-select';
import type { ReviewSort } from '@/src/types';

const SORT_OPTIONS: FilterOption[] = [
  { value: 'newest', label: 'Newest', tone: 'neutral', icon: ArrowDownWideNarrow },
  { value: 'highest', label: 'Highest', tone: 'amber', icon: Star },
  { value: 'lowest', label: 'Lowest', tone: 'slate', icon: Star },
  { value: 'helpful', label: 'Most helpful', tone: 'emerald', icon: ArrowDownWideNarrow },
];

interface ReviewSortSelectProps {
  value: ReviewSort;
  onChange: (value: ReviewSort) => void;
}

export function ReviewSortSelect({ value, onChange }: ReviewSortSelectProps) {
  return (
    <FilterSelect
      label="Sort"
      value={value}
      onChange={(next) => onChange(next as ReviewSort)}
      options={SORT_OPTIONS}
    />
  );
}
