"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { SettingsDrawer } from "./SettingsDrawer";

export function SettingsTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fab button — bigger on mobile so it's tap-friendly */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40
          flex items-center gap-2
          p-3.5 sm:p-3
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          shadow-xl rounded-full
          text-neutral-600 dark:text-neutral-300
          hover:bg-neutral-50 dark:hover:bg-neutral-700
          hover:text-primary-500 dark:hover:text-primary-400
          transition-all group
          active:scale-90"
        aria-label="Abrir configuración"
      >
        <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
      </button>

      <SettingsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
