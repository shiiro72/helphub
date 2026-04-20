import { InputHTMLAttributes, forwardRef } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', autoComplete = 'off', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        autoComplete={autoComplete}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
