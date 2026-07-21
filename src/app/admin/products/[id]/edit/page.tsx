'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { RecordMeta } from '@/src/components/admin/record-meta';
import { apiClient } from '@/src/services/api';
import { publishModeFromItem, toDatetimeLocalValue, type PublishMode } from '@/src/utils/commerce/publish';
import { showSaveToast } from '@/src/components/shared/toast-provider';
import type { Product } from '@/src/types';

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

function discountFromProduct(product: Product): ProductDiscountDraft {
  if (!product.discountType || product.discountValue == null) {
    return emptyDiscountDraft();
  }
  return {
    enabled: true,
    type: product.discountType,
    value:
      product.discountType === 'PERCENT'
        ? String(product.discountValue)
        : (product.discountValue / 100).toFixed(2),
    startsAt: toDatetimeLocalValue(product.discountStartsAt),
    endsAt: toDatetimeLocalValue(product.discountEndsAt),
  };
}

type TouchedKey = 'name' | 'description' | 'price' | 'releaseAt';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState<ProductDiscountDraft>(emptyDiscountDraft());
  const [publishMode, setPublishMode] = useState<PublishMode>('private');
  const [releaseAt, setReleaseAt] = useState('');
  const [meta, setMeta] = useState<Pick<Product, 'createdAt' | 'updatedAt' | 'sortOrder' | 'releaseAt'>>({
    createdAt: '',
  });
  const [productGallery, setProductGallery] = useState<GalleryDraft>(createEmptyGallery());
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      !loading &&
      !saving &&
      !nameEmpty &&
      !descriptionEmpty &&
      !priceEmpty &&
      !releaseEmpty &&
      !variantsInvalid &&
      !discountInvalid,
    [
      loading,
      saving,
      nameEmpty,
      descriptionEmpty,
      priceEmpty,
      releaseEmpty,
      variantsInvalid,
      discountInvalid,
    ]
  );

  useEffect(() => {
    apiClient.get<Product, Product>(`/admin/products/${id}`)
      .then((product) => {
        setName(product.name);
        setDescription(product.description);
        setPrice((product.price / 100).toFixed(2));
        setDiscount(discountFromProduct(product));
        setPublishMode(publishModeFromItem(product));
        setReleaseAt(toDatetimeLocalValue(product.releaseAt));
        setMeta({
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          sortOrder: product.sortOrder,
          releaseAt: product.releaseAt,
        });
        setProductGallery(
          createEmptyGallery(
            product.images?.length
              ? product.images
              : product.imageUrl
                ? [product.imageUrl]
                : []
          )
        );
        const nextVariants =
          product.variants?.length
            ? product.variants.map((variant) =>
                createEmptyVariant({
                  key: variant.id,
                  id: variant.id,
                  name: variant.name,
                  colorHex: variant.colorHex || '#111111',
                  sizes: variant.sizes.join(', '),
                  unavailableSizes: variant.unavailableSizes.join(', '),
                  available: variant.available,
                  gallery: createEmptyGallery(
                    variant.images?.length
                      ? variant.images
                      : variant.imageUrl
                        ? [variant.imageUrl]
                        : []
                  ),
                })
              )
            : [
                createEmptyVariant({
                  name: 'Default',
                  sizes: (product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL']).join(
                    ', '
                  ),
                  unavailableSizes: (product.unavailableSizes ?? []).join(', '),
                  available: product.listed ?? true,
                }),
              ];
        setVariants(nextVariants);
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', priceCents.toString());
      formData.append('publishMode', publishMode);
      formData.append(
        'releaseAt',
        publishMode === 'scheduled' && releaseAt ? new Date(releaseAt).toISOString() : ''
      );
      appendDiscountFields(formData, discount);
      formData.append('productImages', JSON.stringify(productGallery.existing));
      formData.append('variants', variantsToJson(variants));
      appendGalleryFiles(formData, 'image', productGallery);

      variants.forEach((variant, index) => {
        appendGalleryFiles(formData, `variant_${index}_image`, variant.gallery);
      });

      await apiClient.put(`/products/${id}`, formData);
      showSaveToast('Product saved');
      router.push('/admin/products');
    } catch (submitError: unknown) {
      setError(
        submitError && typeof submitError === 'object' && 'message' in submitError
          ? String((submitError as { message: string }).message)
          : 'Failed to update product'
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-950" size={36} />
      </div>
    );
  }

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
          Edit Product
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Fields marked with <span className="text-red-600">*</span> are required. Save stays
          disabled until they are filled.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <RecordMeta
          createdAt={meta.createdAt}
          updatedAt={meta.updatedAt}
          releaseAt={meta.releaseAt}
          sortOrder={meta.sortOrder}
        />

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
          {saving ? <Loader2 className="animate-spin" size={16} /> : 'Update Product'}
        </Button>
      </form>
    </div>
  );
}
