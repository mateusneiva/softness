'use client';

import { ReviewForm, type ReviewFormData } from '@/src/components/product/review-form';
import { MyReviewPanel } from '@/src/components/product/my-review-panel';
import type { ProductReview, ReviewEligibilityReason } from '@/src/types';

interface ReviewComposerProps {
  reason: ReviewEligibilityReason | undefined;
  myReview: ProductReview | null;
  editing: boolean;
  submitting: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onSubmit: (values: ReviewFormData) => Promise<void>;
}

export function ReviewComposer({
  reason,
  myReview,
  editing,
  submitting,
  onEdit,
  onCancelEdit,
  onDelete,
  onSubmit,
}: ReviewComposerProps) {
  if (reason === 'UNAUTHENTICATED' || reason === 'NOT_PURCHASED') {
    return null;
  }

  if (myReview && !editing) {
    return (
      <MyReviewPanel
        review={myReview}
        submitting={submitting}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  if (reason === null || editing) {
    return (
      <ReviewForm
        initialReview={editing ? myReview : null}
        submitting={submitting}
        onSubmit={onSubmit}
        onCancel={editing ? onCancelEdit : undefined}
      />
    );
  }

  return null;
}
