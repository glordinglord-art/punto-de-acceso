const fs = require('fs');
const file = 'olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /expanded\s*\n\s*\?\s*"bg-primary-50\/50 dark:bg-primary-900\/10 ring-1 ring-primary-200 dark:ring-primary-800"\s*\n\s*:\s*"bg-neutral-50 dark:bg-neutral-800\/50"/,
  'expanded ? "bg-[#1a1c23] border border-primary-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]" : "bg-white/5 border border-white/10 hover:bg-white/10"'
);

fs.writeFileSync(file, content);
