import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'full' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      primary: 'bg-brand-primary text-brand-on-primary hover:opacity-90',
      secondary: 'bg-brand-secondary text-brand-on-secondary hover:opacity-90',
      outline: 'border border-brand-primary bg-transparent hover:bg-brand-surface-container-low text-brand-primary',
      ghost: 'hover:bg-brand-surface-container-low text-brand-text-main',
    };

    const sizes = {
      sm: 'h-10 px-3 text-xs',
      md: 'h-12 px-4 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
      full: 'h-12 w-full px-4 py-2 text-sm',
      icon: 'h-12 w-12',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button ref={ref} className={combinedClassName} {...props} />;
  }
);

Button.displayName = 'Button';
