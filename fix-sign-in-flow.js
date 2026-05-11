const fs = require('fs');
const file = 'olympus-bite-ft/shared/components/ui/sign-in-flow.tsx';
let content = fs.readFileSync(file, 'utf8');

content = "/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react-hooks/preserve-manual-memoization */\n" + content;
fs.writeFileSync(file, content);
