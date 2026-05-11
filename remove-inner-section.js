const fs = require('fs');
const file = 'olympus-bite-ft/shared/components/ui/SettingsDrawer.tsx';
let content = fs.readFileSync(file, 'utf8');

const innerSection = `  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
        {title}
      </p>
      {children}
    </div>
  );`;

content = content.replace(innerSection, '');
fs.writeFileSync(file, content);
