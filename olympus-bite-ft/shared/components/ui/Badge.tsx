import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100/80 text-neutral-700 border border-neutral-200/60 dark:bg-white/8 dark:text-neutral-300 dark:border-white/8',
  success: 'bg-primary-500/10 text-primary-700 border border-primary-500/15 dark:text-primary-400 dark:border-primary-500/15',
  warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/15 dark:text-amber-400 dark:border-amber-500/15',
  danger: 'bg-red-500/10 text-red-700 border border-red-500/15 dark:text-red-400 dark:border-red-500/15',
  info: 'bg-blue-500/10 text-blue-700 border border-blue-500/15 dark:text-blue-400 dark:border-blue-500/15',
  outline: 'bg-transparent border border-current opacity-80',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
