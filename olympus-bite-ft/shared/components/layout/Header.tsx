'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.28em] text-primary-300/80">
          Punto de Inflexion
        </p>
        <h1 className="font-display text-4xl font-semibold uppercase tracking-[0.03em] text-slate-950 dark:text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300/72 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}
