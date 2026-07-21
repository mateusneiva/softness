import { tv, type VariantProps } from 'tailwind-variants';

export const FIELD_LABEL_CLASS =
  'block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono';

export const fieldInput = tv({
  base: 'w-full bg-neutral-50 p-3.5 text-neutral-950 focus:outline-none',
  variants: {
    variant: {
      elevated:
        'placeholder:text-neutral-400 border transition-[box-shadow,border-color] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:shadow-[0_8px_22px_rgba(0,0,0,0.1)]',
      inset: 'transition-[box-shadow] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]',
    },
    invalid: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'elevated',
      invalid: true,
      class: 'border-red-600',
    },
    {
      variant: 'elevated',
      invalid: false,
      class: 'border-transparent',
    },
    {
      variant: 'inset',
      invalid: true,
      class:
        'shadow-[inset_0_0_0_1px_rgba(220,38,38,0.85)] focus:shadow-[inset_0_0_0_1px_rgba(220,38,38,1)]',
    },
    {
      variant: 'inset',
      invalid: false,
      class: 'focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]',
    },
  ],
  defaultVariants: {
    variant: 'elevated',
    invalid: false,
  },
});

export type FieldVariant = NonNullable<VariantProps<typeof fieldInput>['variant']>;

export function fieldInputClass({
  variant = 'elevated',
  invalid = false,
  className = '',
}: {
  variant?: FieldVariant;
  invalid?: boolean;
  className?: string;
} = {}) {
  return fieldInput({ variant, invalid, className });
}
