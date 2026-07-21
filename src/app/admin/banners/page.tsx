'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/src/components/admin/confirm-dialog';
import { ButtonLink } from '@/src/components/ui/button';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { showErrorToast, showSaveToast } from '@/src/components/shared/toast-provider';
import type { Banner } from '@/src/types';

export default function AdminBannersPage() {
  const { confirm } = useConfirmDialog();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Banner[], Banner[]>('/banners/all')
      .then(setBanners)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (banner: Banner) => {
    const ok = await confirm({
      title: 'Delete banner',
      description: `This permanently removes “${banner.title}”. Type DELETE to confirm.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      requireText: 'DELETE',
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/banners/${banner.id}`);
      setBanners((prev) => prev.filter((item) => item.id !== banner.id));
      showSaveToast('Banner deleted');
    } catch {
      showErrorToast('Failed to delete banner');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
            Content
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
            Banners
          </h1>
        </div>
        <ButtonLink href="/admin/banners/new">
          <Plus size={16} /> Add Banner
        </ButtonLink>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
          No banners yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="border border-neutral-200 overflow-hidden">
              <div className="relative aspect-[16/9] bg-neutral-100">
                <Image
                  src={getAssetUrl(banner.imageUrl)}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold uppercase tracking-wider text-sm text-black">
                      {banner.title}
                    </h3>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-mono ${
                        banner.active ? 'text-black' : 'text-neutral-400'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1">
                    {banner.subtitle || 'No subtitle'} · Order {banner.order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="p-2 text-neutral-400 hover:text-black transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
