'use client';

interface RecordMetaProps {
  createdAt?: string | null;
  updatedAt?: string | null;
  releaseAt?: string | null;
  sortOrder?: number | null;
  order?: number | null;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function RecordMeta({
  createdAt,
  updatedAt,
  releaseAt,
  sortOrder,
  order,
}: RecordMetaProps) {
  const orderValue = sortOrder ?? order;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mb-1">
          Created
        </p>
        <p className="text-sm text-neutral-800">{formatDateTime(createdAt)}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mb-1">
          Last edited
        </p>
        <p className="text-sm text-neutral-800">{formatDateTime(updatedAt)}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mb-1">
          Release
        </p>
        <p className="text-sm text-neutral-800">
          {releaseAt ? formatDateTime(releaseAt) : 'Not scheduled'}
        </p>
      </div>
      {orderValue !== undefined && orderValue !== null && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mb-1">
            Order
          </p>
          <p className="text-sm text-neutral-800 font-mono">{orderValue}</p>
        </div>
      )}
    </div>
  );
}
