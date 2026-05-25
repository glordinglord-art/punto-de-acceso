import { cn } from '../../lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  className,
  children,
  hover = false,
  padding = 'md',
  ...props
}: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 text-slate-950 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-white/5 dark:text-white dark:shadow-[0_24px_80px_rgba(2,6,23,0.28)]',
        hover && 'transition-all duration-200 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:hover:border-white/16 dark:hover:shadow-[0_28px_90px_rgba(2,6,23,0.38)]',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-xl font-bold uppercase tracking-[0.04em] text-slate-950 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-600 dark:text-slate-300/72', className)}
      {...props}
    >
      {children}
    </p>
  );
}
