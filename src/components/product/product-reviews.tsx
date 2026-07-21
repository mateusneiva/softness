'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ReviewCard } from '@/src/components/product/review-card';
import { ReviewComposer } from '@/src/components/product/review-composer';
import { ReviewRatingFilterSelect, type ReviewRatingFilter } from '@/src/components/product/review-rating-filter';
import { ReviewSortSelect } from '@/src/components/product/review-sort-select';
import { ReviewSummary } from '@/src/components/product/review-summary';
import type { ReviewFormData } from '@/src/components/product/review-form';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import { showErrorToast, showSaveToast } from '@/src/components/shared/toast-provider';
import { useAuthStore } from '@/src/store/auth';
import { apiClient } from '@/src/services/api';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import type { ProductReview, ProductReviewsResponse, ReviewSort, ReviewVoteValue } from '@/src/types';

interface ProductReviewsProps {
  productId: string;
}

const EMPTY_SUMMARY = {
  averageRating: 0,
  reviewCount: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>('all');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '15',
        sort,
      });
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);

      const response = await apiClient.get<ProductReviewsResponse, ProductReviewsResponse>(
        `/products/${productId}/reviews?${params.toString()}`,
      );
      setData(response);
      setEditing(false);
    } catch (error) {
      showErrorToast(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [productId, sort, ratingFilter]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews, isAuthenticated]);

  const myReview = data?.eligibility.myReview ?? null;
  const reason = data?.eligibility.reason;
  const showComposer = reason === null || reason === 'ALREADY_REVIEWED';

  const patchReview = (updated: ProductReview) => {
    setData((current) => {
      if (!current) return current;

      return {
        ...current,
        items: current.items.map((item) => (item.id === updated.id ? updated : item)),
        eligibility: {
          ...current.eligibility,
          myReview: current.eligibility.myReview?.id === updated.id ? updated : current.eligibility.myReview,
        },
      };
    });
  };

  const handleSubmit = async (values: ReviewFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        rating: values.rating,
        title: values.title?.trim() || undefined,
        comment: values.comment?.trim() || undefined,
      };

      if (myReview) {
        await apiClient.put(`/products/${productId}/reviews/me`, payload);
        showSaveToast('Review updated');
      } else {
        await apiClient.post(`/products/${productId}/reviews`, payload);
        showSaveToast('Review submitted');
      }
      setEditing(false);
      await loadReviews();
    } catch (error) {
      showErrorToast(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSubmitting(true);
    try {
      await apiClient.delete(`/products/${productId}/reviews/me`);
      showSaveToast('Review deleted');
      await loadReviews();
    } catch (error) {
      showErrorToast(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, value: ReviewVoteValue) => {
    setVotingId(reviewId);
    try {
      const updated = await apiClient.post<ProductReview, ProductReview>(
        `/products/${productId}/reviews/${reviewId}/vote`,
        { value },
      );
      patchReview(updated);
    } catch (error) {
      showErrorToast(getFriendlyErrorMessage(error));
    } finally {
      setVotingId(null);
    }
  };

  const listItems = (() => {
    const items = data?.items ?? [];
    if (!myReview) return items;
    if (items.some((review) => review.id === myReview.id)) return items;
    if (ratingFilter !== 'all' && String(myReview.rating) !== ratingFilter) return items;
    return [myReview, ...items];
  })();

  return (
    <section className="mt-16 border-t border-neutral-100 pt-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">Reviews</p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Customer reviews</h2>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      ) : (
        <div className="w-full gap-8 sm:flex lg:items-start lg:gap-10">
          <aside className="mb-12 w-full space-y-6 sm:w-1/3 lg:sticky lg:top-28 lg:self-start">
            <ReviewSummary
              summary={data?.summary ?? EMPTY_SUMMARY}
              activeRating={ratingFilter}
              onRatingSelect={setRatingFilter}
            />
            {showComposer && (
              <ReviewComposer
                reason={reason}
                myReview={myReview}
                editing={editing}
                submitting={submitting}
                onEdit={() => setEditing(true)}
                onCancelEdit={() => setEditing(false)}
                onDelete={() => setDeleteConfirmOpen(true)}
                onSubmit={handleSubmit}
              />
            )}
          </aside>

          <div className="w-full min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                {data?.total ?? 0} {(data?.total ?? 0) === 1 ? 'comment' : 'comments'}
                {ratingFilter !== 'all' ? ` · ${ratingFilter}★` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ReviewRatingFilterSelect value={ratingFilter} onChange={setRatingFilter} />
                <ReviewSortSelect value={sort} onChange={setSort} />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-neutral-900" size={24} />
              </div>
            ) : !listItems.length ? (
              <p className="text-sm text-neutral-500">
                {ratingFilter === 'all'
                  ? 'No reviews yet. Be the first to share your thoughts.'
                  : `No ${ratingFilter}-star reviews yet.`}
              </p>
            ) : (
              <ul className="space-y-4">
                {listItems.map((review) => (
                  <li key={review.id}>
                    <ReviewCard
                      review={review}
                      highlightOwn
                      showHelpful
                      voting={votingId === review.id}
                      onVote={(value) => void handleVote(review.id, value)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete review?"
        description="This permanently removes your review for this product. You can write a new one later if you still qualify."
        confirmLabel="Delete"
        cancelLabel="Keep review"
        tone="danger"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
