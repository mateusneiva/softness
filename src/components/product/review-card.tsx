'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ProductReview, ReviewVoteValue } from '@/src/types';
import { StarRating } from '@/src/components/product/star-rating';
import { useAuthStore } from '@/src/store/auth';

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ReviewCardProps {
  review: ProductReview;
  actions?: React.ReactNode;
  eyebrow?: string;
  highlightOwn?: boolean;
  showHelpful?: boolean;
  voting?: boolean;
  onVote?: (value: ReviewVoteValue) => void;
}

export function ReviewCard({
  review,
  actions,
  eyebrow,
  highlightOwn = false,
  showHelpful = false,
  voting = false,
  onVote,
}: ReviewCardProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const isOwnReview = user?.id === review.user.id;
  const canVote = showHelpful && !isOwnReview;

  return (
    <article className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
              {review.user.name}
            </p>
            {highlightOwn && isOwnReview && (
              <span className="bg-neutral-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                You
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {formatReviewDate(review.createdAt)}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <StarRating value={review.rating} />
          {actions}
        </div>
      </div>
      {review.title && (
        <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">{review.title}</p>
      )}
      {review.comment && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{review.comment}</p>
      )}

      {showHelpful && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Was this helpful?
          </p>
          {canVote ? (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={voting}
                  onClick={() => onVote?.('HELPFUL')}
                  className={`inline-flex cursor-pointer items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 ${
                    review.myVote === 'HELPFUL'
                      ? 'text-neutral-950'
                      : 'text-neutral-400 hover:text-neutral-950'
                  }`}
                  aria-pressed={review.myVote === 'HELPFUL'}
                  aria-label="Mark review as helpful"
                >
                  <ThumbsUp
                    size={12}
                    fill={review.myVote === 'HELPFUL' ? 'currentColor' : 'none'}
                    className="transition-[fill,color] duration-200"
                  />
                  {review.helpfulCount}
                </button>
                <button
                  type="button"
                  disabled={voting}
                  onClick={() => onVote?.('NOT_HELPFUL')}
                  className={`inline-flex cursor-pointer items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 ${
                    review.myVote === 'NOT_HELPFUL'
                      ? 'text-neutral-950'
                      : 'text-neutral-400 hover:text-neutral-950'
                  }`}
                  aria-pressed={review.myVote === 'NOT_HELPFUL'}
                  aria-label="Mark review as not helpful"
                >
                  <ThumbsDown
                    size={12}
                    fill={review.myVote === 'NOT_HELPFUL' ? 'currentColor' : 'none'}
                    className="transition-[fill,color] duration-200"
                  />
                  {review.notHelpfulCount}
                </button>
              </div>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="font-mono text-[10px] uppercase tracking-widest text-neutral-950 underline-offset-4 hover:underline"
              >
                Sign in to vote
              </Link>
            )
          ) : (
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <ThumbsUp size={12} />
                {review.helpfulCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ThumbsDown size={12} />
                {review.notHelpfulCount}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
