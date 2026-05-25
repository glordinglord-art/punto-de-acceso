'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-slate-200/50 dark:border-white/6">
      <div>
        <p className="font-display text-[11px] uppercase tracking-[0.28em] text-primary-500/80 dark:text-primary-300/70 font-semibold">
          Punto de Inflexion
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.02em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400/70 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}
