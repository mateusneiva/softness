import type { MetadataRoute } from 'next';
import { apiClient } from '@/src/services/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://softness.store';

type CollectionSlug = { slug: string; updatedAt?: string };
type ProductId = { id: string; updatedAt?: string };

async function loadSafe<T>(path: string): Promise<T[]> {
  try {
    const data = await apiClient.get<T[] | { items: T[] }, T[] | { items: T[] }>(path);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    loadSafe<ProductId>('/products'),
    loadSafe<CollectionSlug>('/collections'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/collections',
    '/search',
    '/privacy',
    '/terms',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${siteUrl}/collections/${collection.slug}`,
    lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
