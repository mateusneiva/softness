'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { useTouchedFields } from '@/src/components/admin/form-helpers';
import { ProductPicker } from '@/src/components/admin/product-picker';
import { PublishSettings } from '@/src/components/admin/publish-settings';
import { RecordMeta } from '@/src/components/admin/record-meta';
import { FormField, FormTextarea } from '@/src/components/ui/form-field';
import { Button } from '@/src/components/ui/button';
import { apiClient, getAssetUrl } from '@/src/services/api';
import { publishModeFromItem, toDatetimeLocalValue, type PublishMode } from '@/src/utils/commerce/publish';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import type { Collection, Product } from '@/src/types';

type TouchedKey = 'name' | 'slug';

export default function EditCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [featured, setFeatured] = useState(true);
  const [publishMode, setPublishMode] = useState<PublishMode>('private');
  const [releaseAt, setReleaseAt] = useState('');
  const [meta, setMeta] = useState<
    Pick<Collection, 'createdAt' | 'updatedAt' | 'order' | 'releaseAt'>
  >({ createdAt: '', updatedAt: '', order: 0 });
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get<Collection, Collection>(`/admin/collections/${id}`),
      apiClient.get<Product[], Product[]>('/admin/products'),
    ])
      .then(([collection, productList]) => {
        setName(collection.name);
        setSlug(collection.slug);
        setDescription(collection.description || '');
        setSeason(collection.season || '');
        setFeatured(collection.featured);
        setPublishMode(
          publishModeFromItem({
            listed: collection.listed,
            releaseAt: collection.releaseAt,
          })
        );
        setReleaseAt(toDatetimeLocalValue(collection.releaseAt));
        setMeta({
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          order: collection.order,
          releaseAt: collection.releaseAt,
        });
        setProductIds(collection.products?.map((product) => product.id) ?? []);
        setPreview(getAssetUrl(collection.imageUrl));
        setProducts(productList);
      })
      .catch(() => setError('Collection not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const nameEmpty = !name.trim();
  const slugEmpty = !slug.trim();
  const releaseEmpty = publishMode === 'scheduled' && !releaseAt;
  const canSave = useMemo(
    () => !loading && !saving && !nameEmpty && !slugEmpty && !releaseEmpty,
    [loading, saving, nameEmpty, slugEmpty, releaseEmpty]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('season', season);
      formData.append('featured', String(featured));
      formData.append('publishMode', publishMode);
      formData.append(
        'releaseAt',
        publishMode === 'scheduled' && releaseAt ? new Date(releaseAt).toISOString() : ''
      );
      formData.append('productIds', JSON.stringify(productIds));
      if (image) formData.append('image', image);

      await apiClient.put(`/admin/collections/${id}`, formData);
      showSaveToast('Collection saved');
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-neutral-900" size={28} />
      </div>
    );
  }

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
          Edit Collection
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Fields marked with <span className="text-red-600">*</span> are required.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <RecordMeta
          createdAt={meta.createdAt}
          updatedAt={meta.updatedAt}
          releaseAt={meta.releaseAt}
          order={meta.order}
        />

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
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => touch('slug')}
              required
              invalid={isInvalid('slug', slugEmpty)}
              error={isInvalid('slug', slugEmpty) ? 'Slug is required.' : undefined}
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
          description="Keep the current cover or upload a replacement."
        >
          <label className="relative block w-full aspect-[16/9] bg-neutral-100 overflow-hidden cursor-pointer shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] transition-shadow">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                const file = e.target.files?.[0];
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
        </AdminFormSection>

        <AdminFormSection
          step={4}
          title="Products"
          description="Choose which products belong in this collection."
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
