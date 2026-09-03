'use client';

import { cn } from '../../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-red-400 font-bold',
  secondary:
    'border border-neutral-200 bg-white/90 text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white',
  danger:
    'bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
