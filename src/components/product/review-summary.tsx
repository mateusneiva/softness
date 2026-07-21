'use client';

import type { ProductReviewsSummary } from '@/src/types';
import { StarRating } from '@/src/components/product/star-rating';
import type { ReviewRatingFilter } from '@/src/components/product/review-rating-filter';

interface ReviewSummaryProps {
  summary: ProductReviewsSummary;
  activeRating?: ReviewRatingFilter;
  onRatingSelect?: (rating: ReviewRatingFilter) => void;
}

export function ReviewSummary({ summary, activeRating = 'all', onRatingSelect }: ReviewSummaryProps) {
  const { averageRating, reviewCount, distribution } = summary;
  const hasReviews = reviewCount > 0;

  return (
    <div className="w-full bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)] sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Average</p>
          <p className="text-4xl font-black tracking-tighter text-neutral-950">
            {hasReviews ? averageRating.toFixed(1) : '—'}
          </p>
          <StarRating value={hasReviews ? Math.round(averageRating) : 0} size={18} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="space-y-1">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const count = distribution[rating];
            const percent = hasReviews ? Math.round((count / reviewCount) * 100) : 0;
            const value = String(rating) as ReviewRatingFilter;
            const isActive = activeRating === value;
            const interactive = Boolean(onRatingSelect);

            return (
              <button
                key={rating}
                type="button"
                disabled={!interactive}
                onClick={() => {
                  if (!onRatingSelect) return;
                  onRatingSelect(isActive ? 'all' : value);
                }}
                className={`grid w-full grid-cols-[28px_1fr_36px] items-center gap-3 px-1 py-1.5 text-left transition-colors ${
                  interactive ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'
                } ${isActive ? 'bg-neutral-50' : ''}`}
                aria-pressed={isActive}
                aria-label={`Filter ${rating} star reviews`}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {rating}★
                </span>
                <div className="h-1.5 overflow-hidden bg-neutral-100">
                  <div
                    className="h-full bg-neutral-950 transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-right font-mono text-[10px] tabular-nums text-neutral-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
