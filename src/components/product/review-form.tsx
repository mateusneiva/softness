'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/src/components/ui/button';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import { FormField, FormTextarea } from '@/src/components/ui/form-field';
import { StarRating } from '@/src/components/product/star-rating';
import type { ProductReview } from '@/src/types';

export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, 'Select a rating').max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  initialReview?: ProductReview | null;
  submitting: boolean;
  onSubmit: (values: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ initialReview, submitting, onSubmit, onCancel }: ReviewFormProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialReview?.rating ?? 0,
      title: initialReview?.title ?? '',
      comment: initialReview?.comment ?? '',
    },
  });

  const ratingValue = form.watch('rating');

  const handleCancelClick = () => {
    if (!onCancel) return;
    if (form.formState.isDirty) {
      setConfirmCancelOpen(true);
      return;
    }
    onCancel();
  };

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]"
        noValidate
      >
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            {initialReview ? 'Update review' : 'Write a review'}
          </p>
          <StarRating
            value={ratingValue}
            interactive
            size={20}
            onChange={(value) => form.setValue('rating', value, { shouldValidate: true, shouldDirty: true })}
          />
          {form.formState.errors.rating && (
            <p className="mt-2 text-xs text-red-600">{form.formState.errors.rating.message}</p>
          )}
        </div>

        <FormField
          label="Title (optional)"
          placeholder="Sum up your experience"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />

        <FormTextarea
          label="Comment (optional)"
          placeholder="Share fit, quality, and what stood out"
          rows={4}
          error={form.formState.errors.comment?.message}
          {...form.register('comment')}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting} size="sm">
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : initialReview ? (
              'Save changes'
            ) : (
              'Submit review'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={handleCancelClick}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Discard changes?"
        description="You have unsaved edits on this review. If you leave now, those changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={() => {
          setConfirmCancelOpen(false);
          onCancel?.();
        }}
      />
    </>
  );
}
