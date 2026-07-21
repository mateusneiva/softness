export type PublishMode = 'private' | 'scheduled' | 'public';

export function publishModeFromItem(item: {
  listed?: boolean;
  available?: boolean;
  active?: boolean;
  releaseAt?: string | null;
}): PublishMode {
  const listed = item.listed ?? item.available ?? item.active ?? false;
  if (!listed) return 'private';
  if (item.releaseAt && new Date(item.releaseAt).getTime() > Date.now()) return 'scheduled';
  return 'public';
}

export function toDatetimeLocalValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function visibilityLabel(item: {
  listed?: boolean;
  available?: boolean;
  active?: boolean;
  releaseAt?: string | null;
}) {
  const mode = publishModeFromItem(item);
  if (mode === 'private') return 'Private';
  if (mode === 'scheduled') return 'Scheduled';
  return 'Public';
}
