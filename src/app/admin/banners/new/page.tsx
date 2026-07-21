'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { AdminFormSection } from '@/src/components/admin/admin-form-section';
import { FieldLabel, useTouchedFields } from '@/src/components/admin/form-helpers';
import { FormField } from '@/src/components/ui/form-field';
import { Button } from '@/src/components/ui/button';
import { apiClient } from '@/src/services/api';
import { showSaveToast } from '@/src/components/shared/toast-provider';

type TouchedKey = 'title' | 'image';

export default function NewBannerPage() {
  const router = useRouter();
  const { touch, isInvalid } = useTouchedFields<TouchedKey>();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('/collections');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [order, setOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const titleEmpty = !title.trim();
  const imageEmpty = !image;
  const canSave = useMemo(
    () => !saving && !titleEmpty && !imageEmpty,
    [saving, titleEmpty, imageEmpty]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave || !image) return;
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('link', link);
      formData.append('buttonText', buttonText);
      formData.append('order', order);
      formData.append('active', String(active));
      formData.append('image', image);

      await apiClient.post('/banners', formData);
      showSaveToast('Banner created');
      router.push('/admin/banners');
    } catch (submitError: unknown) {
      setError(
        submitError && typeof submitError === 'object' && 'message' in submitError
          ? String((submitError as { message: string }).message)
          : 'Failed to save banner'
      );
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/banners"
        className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest font-mono text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Banners
      </Link>

      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">
          Content
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950">
          Add Banner
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
          title="Copy"
          description="Headline and supporting text shown over the hero."
        >
          <FormField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => touch('title')}
            required
            invalid={isInvalid('title', titleEmpty)}
            error={isInvalid('title', titleEmpty) ? 'Title is required.' : undefined}
          />
          <FormField
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </AdminFormSection>

        <AdminFormSection
          step={2}
          title="Call to action"
          description="Where the button goes and how it is labeled."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Link" value={link} onChange={(e) => setLink(e.target.value)} />
            <FormField
              label="Button text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
          </div>
          <FormField
            label="Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
          <label className="flex items-center gap-3 text-sm text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-black cursor-pointer"
            />
            Active on homepage
          </label>
        </AdminFormSection>

        <AdminFormSection
          step={3}
          title="Image"
          description="Required full-bleed visual for the carousel slide."
        >
          <FieldLabel required>Banner image</FieldLabel>
          <label
            className={`relative block w-full aspect-video bg-neutral-100 overflow-hidden cursor-pointer transition-shadow ${
              isInvalid('image', imageEmpty)
                ? 'shadow-[inset_0_0_0_1px_rgba(220,38,38,0.85)]'
                : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]'
            }`}
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
            <p className="mt-1.5 text-xs text-red-600">Image is required.</p>
          ) : null}
        </AdminFormSection>

        <Button type="submit" disabled={!canSave} size="lg">
          {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Banner'}
        </Button>
      </form>
    </div>
  );
}
