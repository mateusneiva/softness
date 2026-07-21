import type { Metadata } from 'next';
import { apiClient, getAssetUrl } from '@/src/services/api';

type ProductMeta = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await apiClient.get<ProductMeta, ProductMeta>(`/products/${id}`);
    const description = product.description?.slice(0, 160) || `${product.name} — minimalist streetwear from Softness.`;
    const image = product.imageUrl ? getAssetUrl(product.imageUrl) : undefined;

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
