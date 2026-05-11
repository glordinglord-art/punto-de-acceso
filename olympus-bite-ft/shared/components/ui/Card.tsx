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
        'overflow-hidden rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-md shadow-[0_24px_80px_rgba(2,6,23,0.28)] dark:border-white/8 dark:bg-white/5',
        hover && 'transition-all duration-200 hover:border-white/16 hover:shadow-[0_28px_90px_rgba(2,6,23,0.38)]',
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
      className={cn('font-display text-xl font-semibold uppercase tracking-[0.04em] text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-300/72', className)}
      {...props}
    >
      {children}
    </p>
  );
}
