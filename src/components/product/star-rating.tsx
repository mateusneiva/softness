'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  tone?: 'dark' | 'light';
}

export function StarRating({ value, onChange, size = 16, interactive = false, tone = 'dark' }: StarRatingProps) {
  const filledClass = tone === 'light' ? 'text-white' : 'text-neutral-950';
  const emptyClass = tone === 'light' ? 'text-white/25' : 'text-neutral-300';

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${value} of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const className = filled ? filledClass : emptyClass;

        if (!interactive) {
          return <Star key={star} size={size} className={className} fill={filled ? 'currentColor' : 'none'} />;
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`cursor-pointer p-0.5 transition-colors ${
              tone === 'light' ? 'hover:text-white' : 'hover:text-neutral-950'
            } ${className}`}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
