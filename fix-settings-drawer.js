const fs = require('fs');
const file = 'olympus-bite-ft/shared/components/ui/SettingsDrawer.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = `  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const Section = ({
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

const newStr = `  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;`;

content = content.replace(oldStr, newStr);

const sectionStr = `const Section = ({
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
);

export function SettingsDrawer`;

content = content.replace('export function SettingsDrawer', sectionStr);

fs.writeFileSync(file, content);
