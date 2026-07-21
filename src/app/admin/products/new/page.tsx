'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { Button } from '@/src/components/ui/button';
import { FormField, FormTextarea } from '@/src/components/ui/form-field';
import { useTouchedFields } from '@/src/components/admin/form-helpers';
import {
  ProductDiscountSettings,
  emptyDiscountDraft,
  type ProductDiscountDraft,
} from '@/src/components/admin/product-discount-settings';
import {
  ProductVariantsEditor,
  createEmptyVariant,
  variantsToJson,
  type VariantDraft,
} from '@/src/components/admin/product-variants-editor';
import {
  ImageGalleryEditor,
  appendGalleryFiles,
  createEmptyGallery,
  type GalleryDraft,
} from '@/src/components/admin/image-gallery-editor';
import { PublishSettings } from '@/src/components/admin/publish-settings';
import { apiClient } from '@/src/services/api';
import type { PublishMode } from '@/src/utils/commerce/publish';
import { showSaveToast } from '@/src/components/shared/toast-provider';

function appendDiscountFields(formData: FormData, discount: ProductDiscountDraft) {
  if (!discount.enabled) {
    formData.append('discountType', '');
    formData.append('discountValue', '');
    formData.append('discountStartsAt', '');
    formData.append('discountEndsAt', '');
    return;
  }

  const value =
    discount.type === 'PERCENT'
      ? Number(discount.value)
      : Math.round(Number(discount.value) * 100);

  formData.append('discountType', discount.type);
  formData.append('discountValue', String(value));
  formData.append(
    'discountStartsAt',
    discount.startsAt ? new Date(discount.startsAt).toISOString() : ''
  );
  formData.append(
    'discountEndsAt',
    discount.endsAt ? new Date(discount.endsAt).toISOString() : ''
  );
}

type TouchedKey = 'name' | 'description' | 'price' | 'releaseAt';

export default function NewProductPage() {
  const router = useRouter();
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState<ProductDiscountDraft>(emptyDiscountDraft());
  const [publishMode, setPublishMode] = useState<PublishMode>('private');
  const [releaseAt, setReleaseAt] = useState('');
  const [productGallery, setProductGallery] = useState<GalleryDraft>(createEmptyGallery());
  const [variants, setVariants] = useState<VariantDraft[]>([
    createEmptyVariant({ name: 'Default' }),
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priceCents = Math.round((parseFloat(price) || 0) * 100);
  const nameEmpty = !name.trim();
  const descriptionEmpty = !description.trim();
  const priceEmpty = !price.trim() || !(parseFloat(price) > 0);
  const releaseEmpty = publishMode === 'scheduled' && !releaseAt;
  const variantsInvalid = variants.some((variant) => !variant.name.trim());
  const discountInvalid =
    discount.enabled && (!(Number(discount.value) > 0) || Number.isNaN(Number(discount.value)));

  const canSave = useMemo(
    () =>
      !nameEmpty &&
      !descriptionEmpty &&
      !priceEmpty &&
      !releaseEmpty &&
      !variantsInvalid &&
      !discountInvalid &&
      !loading,
    [nameEmpty, descriptionEmpty, priceEmpty, releaseEmpty, variantsInvalid, discountInvalid, loading]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', priceCents.toString());
      formData.append('publishMode', publishMode);
      if (releaseAt) formData.append('releaseAt', new Date(releaseAt).toISOString());
      appendDiscountFields(formData, discount);
      formData.append('productImages', JSON.stringify(productGallery.existing));
      formData.append('variants', variantsToJson(variants));
      appendGalleryFiles(formData, 'image', productGallery);

      variants.forEach((variant, index) => {
        appendGalleryFiles(formData, `variant_${index}_image`, variant.gallery);
      });

      await apiClient.post('/products', formData);
      showSaveToast('Product created');
      router.push('/admin/products');
    } catch (submitError: unknown) {
      setError(
        submitError && typeof submitError === 'object' && 'message' in submitError
          ? String((submitError as { message: string }).message)
          : 'Failed to create product'
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/products"
        className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Products
      </Link>

      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Catalog
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950">
          Add Product
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
          description="Name and story customers see on the product page."
        >
          <FormField
            variant="inset"
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch('name')}
            invalid={isInvalid('name', nameEmpty)}
            error={isInvalid('name', nameEmpty) ? 'Name is required.' : undefined}
          />
          <FormTextarea
            variant="inset"
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => touch('description')}
            rows={4}
            invalid={isInvalid('description', descriptionEmpty)}
            error={isInvalid('description', descriptionEmpty) ? 'Description is required.' : undefined}
          />
        </AdminFormSection>

        <AdminFormSection
          step={2}
          title="Pricing & discount"
          description="Set the regular price and an optional timed sale."
        >
          <FormField
            variant="inset"
            label="Regular price (USD)"
            required
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => touch('price')}
            placeholder="0.00"
            invalid={isInvalid('price', priceEmpty)}
            error={isInvalid('price', priceEmpty) ? 'Enter a price greater than 0.' : undefined}
          />
          <ProductDiscountSettings
            priceCents={priceCents}
            value={discount}
            onChange={setDiscount}
          />
        </AdminFormSection>

        <AdminFormSection
          step={3}
          title="Visibility"
          description="Control whether the product is private, scheduled or public."
        >
          <PublishSettings
            mode={publishMode}
            releaseAt={releaseAt}
            onModeChange={(mode) => {
              setPublishMode(mode);
              if (mode === 'scheduled') touch('releaseAt');
            }}
            onReleaseAtChange={setReleaseAt}
            entityLabel="product"
          />
          {publishMode === 'scheduled' && releaseEmpty ? (
            <p className="text-xs text-red-600 mt-2">
              Release date is required for scheduled products.
            </p>
          ) : null}
        </AdminFormSection>

        <AdminFormSection
          step={4}
          title="Product gallery"
          description="Optional shared photos — lookbooks, flat lays, multi-variant shots."
        >
          <ImageGalleryEditor
            title="Images"
            hint="Drag to reorder. First image becomes the cover."
            value={productGallery}
            onChange={setProductGallery}
          />
        </AdminFormSection>

        <AdminFormSection
          step={5}
          title="Variants"
          description="Each variant needs a name. Colors, sizes and photos are optional extras."
        >
          <ProductVariantsEditor variants={variants} onChange={setVariants} />
          {variantsInvalid ? (
            <p className="text-xs text-red-600">Every variant needs a name.</p>
          ) : null}
        </AdminFormSection>

        <Button type="submit" disabled={!canSave} size="lg">
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Product'}
        </Button>
      </form>
    </div>
  );
}
