const fs = require('fs');
const file = 'olympus-bite-ft/features/meals/components/NutritionSummary.tsx';
let content = fs.readFileSync(file, 'utf8');

content = "/* eslint-disable react/style-prop-object */\n" + content;
fs.writeFileSync(file, content);
