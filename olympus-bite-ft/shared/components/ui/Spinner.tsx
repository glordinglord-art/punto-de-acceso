export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-primary-500 dark:border-white/10 dark:border-t-primary-400 ${sizeStyles[size]}`}
      />
    </div>
  );
}
