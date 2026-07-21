import type { Metadata } from 'next';
import { apiClient, getAssetUrl } from '@/src/services/api';

type CollectionMeta = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await apiClient.get<CollectionMeta, CollectionMeta>(`/collections/${slug}`);
    const description =
      collection.description?.slice(0, 160) ||
      `${collection.name} — Softness collection.`;
    const image = collection.imageUrl ? getAssetUrl(collection.imageUrl) : undefined;

    return {
      title: collection.name,
      description,
      openGraph: {
        title: collection.name,
        description,
        images: image ? [{ url: image, alt: collection.name }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: collection.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: 'Collection' };
  }
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
