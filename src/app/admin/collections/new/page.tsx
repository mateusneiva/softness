'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { FieldLabel, useTouchedFields } from '@/src/components/admin/form-helpers';
import { ProductPicker } from '@/src/components/admin/product-picker';
import { PublishSettings } from '@/src/components/admin/publish-settings';
import { FormField, FormTextarea } from '@/src/components/ui/form-field';
import { Button } from '@/src/components/ui/button';
import { apiClient } from '@/src/services/api';
import type { PublishMode } from '@/src/utils/commerce/publish';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import type { Product } from '@/src/types';

type TouchedKey = 'name' | 'image';

export default function NewCollectionPage() {
  const router = useRouter();
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [featured, setFeatured] = useState(true);
  const [publishMode, setPublishMode] = useState<PublishMode>('private');
  const [releaseAt, setReleaseAt] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<Product[], Product[]>('/admin/products')
      .then(setProducts)
      .catch(console.error);
  }, []);

  const nameEmpty = !name.trim();
  const imageEmpty = !image;
  const releaseEmpty = publishMode === 'scheduled' && !releaseAt;
  const canSave = useMemo(
    () => !saving && !nameEmpty && !imageEmpty && !releaseEmpty,
    [saving, nameEmpty, imageEmpty, releaseEmpty]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave || !image) return;
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (slug) formData.append('slug', slug);
      formData.append('description', description);
      formData.append('season', season);
      formData.append('featured', String(featured));
      formData.append('publishMode', publishMode);
      if (releaseAt) formData.append('releaseAt', new Date(releaseAt).toISOString());
      formData.append('productIds', JSON.stringify(productIds));
      formData.append('image', image);

      await apiClient.post('/admin/collections', formData);
      showSaveToast('Collection created');
      router.push('/admin/collections');
    } catch (submitError: unknown) {
      setError(
        submitError && typeof submitError === 'object' && 'message' in submitError
          ? String((submitError as { message: string }).message)
          : 'Failed to save collection'
      );
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/collections"
        className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Collections
      </Link>

      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Catalog
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">
          Add Collection
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Fields marked with <span className="text-red-600">*</span> are required. Save stays
          disabled until they are filled.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection
          step={1}
          title="Basics"
          description="Name, slug and short description for the collection page."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch('name')}
              required
              invalid={isInvalid('name', nameEmpty)}
              error={isInvalid('name', nameEmpty) ? 'Name is required.' : undefined}
            />
            <FormField
              label="Slug (optional)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-from-name"
            />
          </div>
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <FormField
            label="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="SS26"
          />
          <label className="flex items-center gap-3 text-sm text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-black cursor-pointer"
            />
            Featured on home
          </label>
        </AdminFormSection>

        <AdminFormSection
          step={2}
          title="Visibility"
          description="Private draft, scheduled launch, or public right away."
        >
          <PublishSettings
            mode={publishMode}
            releaseAt={releaseAt}
            onModeChange={setPublishMode}
            onReleaseAtChange={setReleaseAt}
            entityLabel="collection"
          />
          {releaseEmpty ? (
            <p className="text-xs text-red-600 mt-2">
              Release date is required for scheduled collections.
            </p>
          ) : null}
        </AdminFormSection>

        <AdminFormSection
          step={3}
          title="Cover image"
          description="Required hero image for the collection card and detail page."
        >
          <FieldLabel required>Cover image</FieldLabel>
          <label
            className={`relative block w-full aspect-[16/9] bg-neutral-100 overflow-hidden cursor-pointer transition-shadow ${
              isInvalid('image', imageEmpty)
                ? 'shadow-[inset_0_0_0_1px_rgba(220,38,38,0.85)]'
                : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]'
            }`}
            onBlur={() => touch('image')}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                const file = e.target.files?.[0];
                touch('image');
                if (!file) return;
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Upload size={28} />
                <span className="text-xs uppercase tracking-widest font-mono">Upload image</span>
              </div>
            )}
          </label>
          {isInvalid('image', imageEmpty) ? (
            <p className="mt-1.5 text-xs text-red-600">Cover image is required.</p>
          ) : null}
        </AdminFormSection>

        <AdminFormSection
          step={4}
          title="Products"
          description="Optional — pick which products belong in this collection."
        >
          <ProductPicker products={products} selectedIds={productIds} onChange={setProductIds} />
        </AdminFormSection>

        <Button type="submit" disabled={!canSave} size="lg">
          {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Collection'}
        </Button>
      </form>
    </div>
  );
}
