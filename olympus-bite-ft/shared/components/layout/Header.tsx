'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-5 border-b border-neutral-200 dark:border-white/10">
      <div className="min-w-0 flex-1 pr-14 sm:pr-0">
        <p className="font-display text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-red-500 font-bold">
          VITALFIT
        </p>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}
