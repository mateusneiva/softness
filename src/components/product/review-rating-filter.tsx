'use client';

import { Star } from 'lucide-react';
import { FilterSelect, type FilterOption } from '@/src/components/ui/filter-select';

export type ReviewRatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

const RATING_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All ratings', tone: 'neutral', icon: Star },
  { value: '5', label: '5 stars', tone: 'amber', icon: Star },
  { value: '4', label: '4 stars', tone: 'amber', icon: Star },
  { value: '3', label: '3 stars', tone: 'slate', icon: Star },
  { value: '2', label: '2 stars', tone: 'slate', icon: Star },
  { value: '1', label: '1 star', tone: 'red', icon: Star },
];

interface ReviewRatingFilterSelectProps {
  value: ReviewRatingFilter;
  onChange: (value: ReviewRatingFilter) => void;
}

export function ReviewRatingFilterSelect({ value, onChange }: ReviewRatingFilterSelectProps) {
  return (
    <FilterSelect
      label="Rating"
      value={value}
      onChange={(next) => onChange(next as ReviewRatingFilter)}
      options={RATING_OPTIONS}
    />
  );
}
