import { TextareaHTMLAttributes, forwardRef } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex min-h-[120px] w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
