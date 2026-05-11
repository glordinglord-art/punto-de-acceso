const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'olympus-bite-ft/features/clients/components/ClientProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the `<Modal` declaration to correctly use noPadding and className.
content = content.replace(
  `    <Modal
      isOpen={!!client}
      onClose={onClose}
      title=""
      size="lg"
      
    >`,
  `    <Modal
      isOpen={!!client}
      onClose={onClose}
      title=""
      size="lg"
      noPadding
      className="overflow-hidden sm:rounded-[2rem] border-none p-0"
    >`
);

// Remove the Close button from the profile tab footer because we now added an "X" to the modal header globally
content = content.replace(
  `              <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-white/10">
                <Button variant="ghost" size="lg" className="w-full font-condensed font-bold uppercase tracking-wider" onClick={onClose}>
                  Cerrar
                </Button>
                <Button size="lg" className="w-full font-condensed font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20" onClick={handleSave} loading={isSaving}>
                  Guardar Cambios
                </Button>
              </div>`,
  `              <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-white/10">
                <Button size="lg" className="w-full font-condensed font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20" onClick={handleSave} loading={isSaving}>
                  Guardar Cambios Nutricionales
                </Button>
              </div>`
);

fs.writeFileSync(filePath, content);
console.log('Fixed ClientProfileModal padding and styling');