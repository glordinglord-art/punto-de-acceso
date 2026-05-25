'use client';

import { cn } from '../../lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400/70 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-slate-500',
              icon && 'pl-10',
              error && 'border-red-400/70 focus:border-red-400 focus:ring-red-500/25',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
