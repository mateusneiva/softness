'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { ProductReview } from '@/src/types';
import { StarRating } from '@/src/components/product/star-rating';

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface MyReviewPanelProps {
  review: ProductReview;
  submitting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function MyReviewPanel({ review, submitting = false, onEdit, onDelete }: MyReviewPanelProps) {
  return (
    <div className="bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Your review
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Posted {formatReviewDate(review.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-neutral-950"
            aria-label="Edit review"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="cursor-pointer p-2 text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50"
            aria-label="Delete review"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <StarRating value={review.rating} size={16} />

      <div className="mt-4 space-y-2">
        {review.title ? (
          <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">{review.title}</p>
        ) : null}
        {review.comment ? (
          <p className="text-sm leading-relaxed text-neutral-600">{review.comment}</p>
        ) : !review.title ? (
          <p className="text-sm text-neutral-400">No written comment.</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        <span>{review.helpfulCount} helpful</span>
        <span>{review.notHelpfulCount} not helpful</span>
      </div>
    </div>
  );
}
