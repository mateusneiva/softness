'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export const button = tv({
  base: 'inline-flex cursor-pointer items-center justify-center gap-2 font-bold uppercase tracking-widest transition-[colors,box-shadow,opacity,border-color] disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    variant: {
      /** Storefront + admin default CTA */
      primary: 'bg-black text-white hover:bg-neutral-800 shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
      /** Auth, account forms — slightly softer black */
      neutral: 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
      /** White card CTA */
      secondary: 'bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
      /** Bordered secondary action */
      outline: 'border border-neutral-200 bg-transparent text-neutral-800 hover:border-neutral-400',
      /** Destructive confirm */
      danger: 'bg-red-700 text-white hover:bg-red-800 shadow-[0_8px_24px_rgba(185,28,28,0.25)]',
      /** Dialog cancel, low-emphasis actions */
      ghost: 'bg-transparent font-mono font-normal text-neutral-500 hover:bg-transparent hover:text-black',
      /** Hero / dark backgrounds */
      inverse: 'bg-white text-neutral-950 hover:bg-neutral-100',
      /** OAuth / elevated white button */
      elevated:
        'border border-transparent bg-white text-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.1)]',
    },
    size: {
      xs: 'px-3 py-2 text-[10px] font-mono',
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-5 py-3 text-xs',
      lg: 'px-6 py-3 text-xs',
      xl: 'px-8 py-4 text-xs',
      account: 'px-6 py-3 text-sm',
      auth: 'p-4 text-sm',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      size: 'xl',
      class: 'shadow-[0_10px_28px_rgba(0,0,0,0.2)]',
    },
    {
      variant: 'primary',
      fullWidth: true,
      size: 'xl',
      class: 'py-4',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
  },
});

export type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    className?: string;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidth, className, type = 'button', ...props }, ref) => {
    return (
      <button ref={ref} type={type} className={button({ variant, size, fullWidth, className })} {...props} />
    );
  },
);

Button.displayName = 'Button';

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> &
  ButtonVariants & {
    className?: string;
  };

export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={button({ variant, size, fullWidth, className })} {...props} />;
}
