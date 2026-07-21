'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { RequiredMark } from '@/src/components/ui/required-mark';
import {
  FIELD_LABEL_CLASS,
  fieldInputClass,
  type FieldVariant,
} from '@/src/components/ui/field-styles';

export { FIELD_LABEL_CLASS, fieldInputClass, type FieldVariant };

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  invalid?: boolean;
  variant?: FieldVariant;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, invalid, variant = 'elevated', className = '', id, required, ...props }, ref) => {
    const fieldId = id ?? props.name;
    const showInvalid = Boolean(error || invalid);

    return (
      <div>
        <label htmlFor={fieldId} className={FIELD_LABEL_CLASS}>
          {label}
          {required ? <RequiredMark /> : null}
        </label>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={showInvalid || undefined}
          className={fieldInputClass({ variant, invalid: showInvalid, className })}
          {...props}
        />
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  invalid?: boolean;
  variant?: FieldVariant;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, invalid, variant = 'elevated', className = '', id, required, ...props }, ref) => {
    const fieldId = id ?? props.name;
    const showInvalid = Boolean(error || invalid);

    return (
      <div>
        <label htmlFor={fieldId} className={FIELD_LABEL_CLASS}>
          {label}
          {required ? <RequiredMark /> : null}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={showInvalid || undefined}
          className={`${fieldInputClass({ variant, invalid: showInvalid, className })} resize-y min-h-[96px]`}
          {...props}
        />
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

FormTextarea.displayName = 'FormTextarea';
