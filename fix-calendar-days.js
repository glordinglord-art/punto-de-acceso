const fs = require('fs');
const file = 'olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Calendar day buttons
content = content.replace(
    'className={cn(\n                      "relative flex flex-col items-center justify-center border-b border-r border-neutral-100 p-2 transition-colors last:border-r-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50",',
    'className={cn(\n                      "relative flex flex-col items-center justify-center p-3 transition-all rounded-2xl border border-transparent",\n                      day.currentMonth ? "hover:bg-white/5 hover:border-white/10" : "",'
);

content = content.replace(
    'className={cn(\n                          "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",\n                          isSelected\n                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"\n                            : isToday\n                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400"\n                              : day.currentMonth\n                                ? "text-neutral-900 dark:text-neutral-100"\n                                : "text-neutral-400 dark:text-neutral-600"\n                        )}',
    'className={cn(\n                          "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition-all",\n                          isSelected\n                            ? "bg-primary-500 text-slate-950 shadow-[0_0_15px_rgba(234,88,12,0.4)]"\n                            : isToday\n                              ? "bg-white/10 text-white border border-white/20"\n                              : day.currentMonth\n                                ? "text-slate-300"\n                                : "text-slate-700"\n                        )}'
);

content = content.replace(
    'className="absolute bottom-1.5 flex gap-0.5"',
    'className="absolute bottom-1 flex gap-1"'
);
content = content.replace(
    'className="h-1 w-1 rounded-full bg-primary-500"',
    'className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_5px_rgba(234,88,12,0.8)]"'
);
content = content.replace(
    'className="h-1 w-1 rounded-full bg-amber-400"',
    'className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"'
);
content = content.replace(
    'className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"',
    'className="h-1.5 w-1.5 rounded-full bg-white/20"'
);

fs.writeFileSync(file, content);
