"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { SettingsDrawer } from "./SettingsDrawer";

export function SettingsTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-primary-500 dark:hover:text-primary-400 transition-all z-40 group"
      >
        <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </button>

      <SettingsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
