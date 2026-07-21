'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const fieldId = id ?? props.name;

    return (
      <div>
        <label htmlFor={fieldId} className="block text-xs uppercase tracking-widest text-neutral-500 mb-2 font-mono">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error) || undefined}
            className={`w-full bg-neutral-50 p-3.5 pr-11 text-neutral-950 placeholder:text-neutral-400 transition-[box-shadow,border-color] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:shadow-[0_8px_22px_rgba(0,0,0,0.1)] ${
              error ? 'border-red-600' : 'border-transparent'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';
