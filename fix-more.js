const fs = require('fs');
const file = 'olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The main layout background of calendar / today
content = content.replace(
    'className="rounded-2xl bg-white p-6 shadow-xs dark:bg-neutral-900"',
    'className="rounded-3xl bg-[#0f1115] border border-white/5 p-6 shadow-2xl"'
);

// Today pill
content = content.replace(
    'className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"',
    'className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold uppercase"'
);

content = content.replace(
    'className="text-[10px] font-medium uppercase tracking-wider"',
    'className="text-[10px] font-bold uppercase tracking-widest text-slate-500"'
);

content = content.replace(
    'className="text-lg font-bold text-neutral-900 dark:text-white leading-none"',
    'className="text-lg font-black text-white leading-none"'
);

// Focus Area title
content = content.replace(
    'className="text-xl font-bold text-neutral-900 dark:text-white mb-1"',
    'className="text-xl font-black text-white mb-1 uppercase tracking-tight"'
);

content = content.replace(
    'className="text-sm font-medium text-neutral-500 dark:text-neutral-400"',
    'className="text-sm font-bold uppercase tracking-wider text-slate-500"'
);

// "Día de descanso" state
content = content.replace(
    'className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800"',
    'className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center"'
);

content = content.replace(
    'className="mb-3 text-4xl"',
    'className="mb-4 text-5xl opacity-80"'
);

content = content.replace(
    'className="text-lg font-bold text-neutral-900 dark:text-white"',
    'className="text-xl font-black text-white uppercase tracking-wider"'
);

content = content.replace(
    'className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"',
    'className="mt-2 text-sm font-medium text-slate-400"'
);

content = content.replaceAll(
    'className="h-4 w-4 text-neutral-400 dark:text-neutral-500"',
    'className="h-4 w-4 text-slate-500"'
);

// Circular Progress
content = content.replace(
    'className="text-primary-500"',
    'className="text-primary-500"'
);
content = content.replace(
    'className="text-neutral-200 dark:text-neutral-800"',
    'className="text-white/10"'
);
content = content.replace(
    'className="absolute inset-0 flex flex-col items-center justify-center"',
    'className="absolute inset-0 flex flex-col items-center justify-center filter drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]"'
);

// Progress texts
content = content.replace(
    'className="text-2xl font-bold text-neutral-900 dark:text-white leading-none"',
    'className="text-3xl font-black text-white leading-none tracking-tighter"'
);
content = content.replace(
    'className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"',
    'className="text-[10px] font-bold uppercase tracking-widest text-slate-500"'
);

// The list of exercises
content = content.replace(
    'className="space-y-3"',
    'className="space-y-4"'
);

// Empty calendar days
content = content.replace(
    'className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800"',
    'className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center"'
);


fs.writeFileSync(file, content);
