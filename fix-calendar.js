const fs = require('fs');
const file = 'olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Calendar layout replacements
content = content.replace(
    'className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"',
    'className="rounded-3xl border border-white/5 bg-[#0f1115] shadow-2xl p-6"'
);

// Calendar header
content = content.replace(
    'className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800"',
    'className="flex items-center justify-between mb-6"'
);
content = content.replace(
    'className="text-base font-semibold text-neutral-900 dark:text-white capitalize"',
    'className="text-lg font-black text-white uppercase tracking-wider"'
);

// Calendar prev/next buttons
content = content.replaceAll(
    'className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"',
    'className="rounded-xl p-2 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all"'
);

// Calendar today button
content = content.replaceAll(
    'className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"',
    'className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all"'
);

// Weekday headers
content = content.replace(
    'className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800"',
    'className="grid grid-cols-7 mb-2 gap-2"'
);
content = content.replace(
    'className="py-2 text-center text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"',
    'className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500"'
);

// Days grid
content = content.replace(
    'className="grid grid-cols-7"',
    'className="grid grid-cols-7 gap-2"'
);

fs.writeFileSync(file, content);
