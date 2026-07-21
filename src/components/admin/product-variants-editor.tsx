'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  ImageGalleryEditor,
  createEmptyGallery,
  type GalleryDraft,
} from '@/src/components/admin/image-gallery-editor';

export type VariantDraft = {
  key: string;
  id?: string;
  name: string;
  colorHex: string;
  sizes: string;
  unavailableSizes: string;
  available: boolean;
  gallery: GalleryDraft;
};

export function createEmptyVariant(partial?: Partial<VariantDraft>): VariantDraft {
  return {
    key: partial?.key ?? `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: partial?.id,
    name: partial?.name ?? '',
    colorHex: partial?.colorHex ?? '',
    sizes: partial?.sizes ?? 'S, M, L, XL',
    unavailableSizes: partial?.unavailableSizes ?? '',
    available: partial?.available ?? true,
    gallery: partial?.gallery ?? createEmptyGallery(),
  };
}

export function variantsToJson(variants: VariantDraft[]) {
  return JSON.stringify(
    variants.map((variant, index) => ({
      id: variant.id,
      name: variant.name.trim(),
      colorHex: variant.colorHex.trim() || null,
      sizes: variant.sizes
        .split(',')
        .map((size) => size.trim().toUpperCase())
        .filter(Boolean),
      unavailableSizes: variant.unavailableSizes
        .split(',')
        .map((size) => size.trim().toUpperCase())
        .filter(Boolean),
      available: variant.available,
      order: index,
      imageUrl: variant.gallery.existing[0] ?? null,
      images: variant.gallery.existing,
    }))
  );
}

interface ProductVariantsEditorProps {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}

export function ProductVariantsEditor({ variants, onChange }: ProductVariantsEditorProps) {
  const updateVariant = (key: string, patch: Partial<VariantDraft>) => {
    onChange(variants.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)));
  };

  const removeVariant = (key: string) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((variant) => variant.key !== key));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-1">
            Color / Model Variants
          </p>
          <p className="text-xs text-neutral-400">
            Each variant can have multiple photos. Shared lifestyle shots go in the product gallery
            above.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...variants, createEmptyVariant()])}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-black bg-white px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow"
        >
          <Plus size={14} /> Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={variant.key}
            className="bg-white p-4 space-y-4 shadow-[0_8px_28px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                Variant {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeVariant(variant.key)}
                disabled={variants.length <= 1}
                className="p-1.5 text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Remove variant"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px] gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-mono">
                  Name
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.key, { name: e.target.value })}
                  required
                  placeholder="Black / White / Oversized"
                  className="w-full bg-neutral-50 p-3 text-sm text-neutral-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-mono">
                  Color
                </label>
                <input
                  type="color"
                  value={variant.colorHex || '#111111'}
                  onChange={(e) => updateVariant(variant.key, { colorHex: e.target.value })}
                  className="w-full h-[46px] bg-neutral-50 cursor-pointer shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-mono">
                  Sizes
                </label>
                <input
                  type="text"
                  value={variant.sizes}
                  onChange={(e) => updateVariant(variant.key, { sizes: e.target.value })}
                  required
                  placeholder="S, M, L, XL"
                  className="w-full bg-neutral-50 p-3 text-sm text-neutral-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-mono">
                  Unavailable Sizes
                </label>
                <input
                  type="text"
                  value={variant.unavailableSizes}
                  onChange={(e) =>
                    updateVariant(variant.key, { unavailableSizes: e.target.value })
                  }
                  placeholder="M, XL"
                  className="w-full bg-neutral-50 p-3 text-sm text-neutral-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-neutral-500 cursor-pointer">
              <input
                type="checkbox"
                checked={variant.available}
                onChange={(e) => updateVariant(variant.key, { available: e.target.checked })}
                className="accent-black"
              />
              Variant available
            </label>

            <ImageGalleryEditor
              title="Variant photos"
              hint="Upload one or more images for this color/model only."
              value={variant.gallery}
              onChange={(gallery) => updateVariant(variant.key, { gallery })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
