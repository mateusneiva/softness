'use client';

import Image from 'next/image';
import { Plus, Trash2, Upload } from 'lucide-react';
import { getAssetUrl } from '@/src/services/api';

export type GalleryDraft = {
  existing: string[];
  files: File[];
  previewUrls: string[];
};

export function createEmptyGallery(existing: string[] = []): GalleryDraft {
  return { existing, files: [], previewUrls: [] };
}

interface ImageGalleryEditorProps {
  title: string;
  hint: string;
  value: GalleryDraft;
  onChange: (value: GalleryDraft) => void;
}

export function ImageGalleryEditor({ title, hint, value, onChange }: ImageGalleryEditorProps) {
  const previews = [
    ...value.existing.map((src) => ({ key: src, src: getAssetUrl(src), existing: true as const })),
    ...value.previewUrls.map((src, index) => ({
      key: `new-${index}`,
      src,
      existing: false as const,
      fileIndex: index,
    })),
  ];

  const removeExisting = (src: string) => {
    onChange({
      ...value,
      existing: value.existing.filter((item) => item !== src),
    });
  };

  const removeFile = (fileIndex: number) => {
    onChange({
      ...value,
      files: value.files.filter((_, index) => index !== fileIndex),
      previewUrls: value.previewUrls.filter((_, index) => index !== fileIndex),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-1">{title}</p>
        <p className="text-xs text-neutral-400">{hint}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {previews.map((item) => (
          <div
            key={item.key}
            className="relative w-20 h-24 bg-neutral-100 overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.08)] group"
          >
            <Image src={item.src} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() =>
                item.existing ? removeExisting(item.key) : removeFile(item.fileIndex ?? 0)
              }
              className="absolute top-1 right-1 p-1 bg-white/90 text-neutral-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <label className="w-20 h-24 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-shadow text-neutral-400 hover:text-black">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (!files.length) return;
              onChange({
                ...value,
                files: [...value.files, ...files],
                previewUrls: [
                  ...value.previewUrls,
                  ...files.map((file) => URL.createObjectURL(file)),
                ],
              });
              e.target.value = '';
            }}
          />
          <Upload size={16} />
          <span className="text-[9px] uppercase tracking-widest font-mono">Add</span>
        </label>
      </div>

      {previews.length === 0 && (
        <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">
          No images yet
        </p>
      )}
    </div>
  );
}

export function appendGalleryFiles(formData: FormData, fieldName: string, gallery: GalleryDraft) {
  gallery.files.forEach((file) => formData.append(fieldName, file));
}
