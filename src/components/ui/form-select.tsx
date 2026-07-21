'use client';

import { CustomSelect, type SelectOption } from '@/src/components/ui/custom-select';

interface FormSelectProps {
  label: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  searchable?: boolean;
}

export function FormSelect({
  label,
  error,
  placeholder,
  options,
  value = '',
  onChange,
  onValueChange,
  onBlur,
  disabled,
  name,
  searchable,
}: FormSelectProps) {
  return (
    <CustomSelect
      label={label}
      error={error}
      placeholder={placeholder}
      options={options}
      value={value}
      disabled={disabled}
      name={name}
      searchable={searchable}
      onBlur={onBlur}
      onChange={(next) => {
        onValueChange?.(next);
        onChange?.({ target: { value: next } });
      }}
    />
  );
}

export type { SelectOption };
