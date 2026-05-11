const fs = require('fs');

let content = fs.readFileSync('olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx', 'utf8');

// Replace light/dark classes for Collapsed view
content = content.replace(
    '"group rounded-xl bg-primary-50 px-3 py-3 transition-all dark:bg-primary-900/20 cursor-pointer"',
    '"group rounded-2xl bg-primary-500/10 border border-primary-500/20 px-4 py-4 transition-all hover:bg-primary-500/20 cursor-pointer"'
);
content = content.replace(
    'className="text-sm font-medium text-primary-700 dark:text-primary-300"',
    'className="text-sm font-bold uppercase tracking-wider text-primary-400"'
);
content = content.replace(
    'className="inline-flex items-center gap-0.5 rounded-md bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-800/40 dark:text-primary-300"',
    'className="inline-flex items-center gap-1 rounded-md bg-primary-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-300 border border-primary-500/10"'
);

// Replace expanded view wrapper
content = content.replace(
    '            ? "bg-primary-50/50 dark:bg-primary-900/10 ring-1 ring-primary-200 dark:ring-primary-800"\n            : "bg-neutral-50 dark:bg-neutral-800/50",',
    '            ? "bg-[#1a1c23] border border-primary-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]"\n            : "bg-white/5 border border-white/10 hover:bg-white/10",'
);
content = content.replace(
    'rounded-xl transition-all',
    'rounded-2xl transition-all overflow-hidden'
);

// Header text in expanded view
content = content.replace(
    'className="text-sm font-medium text-neutral-800 dark:text-neutral-200"',
    'className="text-sm font-bold uppercase tracking-wider text-white"'
);
content = content.replace(
    'className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5"',
    'className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-widest"'
);
content = content.replace(
    'className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800"',
    'className="mt-3 text-xs font-medium text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10"'
);

// Table headers
content = content.replaceAll(
    'className="pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider"',
    'className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest"'
);
content = content.replaceAll(
    'className="pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider text-center"',
    'className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center"'
);

// Table row
content = content.replaceAll(
    'className="border-t border-neutral-100 dark:border-neutral-800/50"',
    'className="border-t border-white/5 hover:bg-white/5 transition-colors"'
);
content = content.replaceAll(
    'className="py-2.5 text-xs text-neutral-500 dark:text-neutral-400"',
    'className="py-3 text-xs font-bold text-slate-400 uppercase"'
);
// Input wrapper in table
content = content.replaceAll(
    'className="w-full bg-transparent text-center text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-none"',
    'className="w-full bg-transparent text-center text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none"'
);

// Checkbox
content = content.replaceAll(
    'className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:ring-offset-neutral-900 cursor-pointer"',
    'className="h-5 w-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/50 cursor-pointer transition-colors"'
);

// Buttons
content = content.replace(
    'className="w-full justify-center rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-300 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-700"',
    'className="w-full justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:bg-primary-400 disabled:opacity-50"'
);

content = content.replace(
    'className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"',
    'className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-sm font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/20 border border-red-500/20"'
);

content = content.replace(
    'className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"',
    'className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-colors"'
);

fs.writeFileSync('olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx', content);

