import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/src/components/ui/button';

type AdminCatalogHeaderProps = {
  title: string;
  addHref: string;
  addLabel: string;
  savingOrder?: boolean;
  description?: ReactNode;
};

export function AdminCatalogHeader({
  title,
  addHref,
  addLabel,
  savingOrder = false,
  description = 'Drag to reorder when filters are clear and all rows fit on one page.',
}: AdminCatalogHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Catalog
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-950 md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {description}
          {savingOrder ? ' Saving…' : ''}
        </p>
      </div>
      <ButtonLink href={addHref}>
        <Plus size={16} /> {addLabel}
      </ButtonLink>
    </div>
  );
}
