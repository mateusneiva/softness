import type { Product } from './product';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  season: string | null;
  featured: boolean;
  listed: boolean;
  order: number;
  releaseAt?: string | null;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}
