'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { FIELD_LABEL_CLASS, fieldInputClass } from '@/src/components/ui/field-styles';
import { RequiredMark } from '@/src/components/ui/required-mark';

export { RequiredMark };

export function fieldShellClass(invalid?: boolean) {
  return fieldInputClass({ variant: 'inset', invalid });
}

export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

export function useTouchedFields<K extends string>() {
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});

  const touch = useCallback((key: K) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const isInvalid = useCallback(
    (key: K, empty: boolean) => Boolean(touched[key] && empty),
    [touched],
  );

  return { touched, touch, isInvalid };
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
