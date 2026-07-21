export interface ProductReviewUser {
  id: string;
  name: string;
}

export type ReviewVoteValue = 'HELPFUL' | 'NOT_HELPFUL';

export type ReviewSort = 'newest' | 'highest' | 'lowest' | 'helpful';

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  myVote: ReviewVoteValue | null;
  createdAt: string;
  updatedAt: string;
  user: ProductReviewUser;
}

export type ReviewEligibilityReason =
  | 'UNAUTHENTICATED'
  | 'NOT_PURCHASED'
  | 'ALREADY_REVIEWED'
  | null;

export interface ProductReviewsSummary {
  averageRating: number;
  reviewCount: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ProductReviewsResponse {
  summary: ProductReviewsSummary;
  eligibility: {
    canReview: boolean;
    reason: ReviewEligibilityReason;
    myReview: ProductReview | null;
  };
  items: ProductReview[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductReviewInput {
  rating: number;
  title?: string;
  comment?: string;
}
