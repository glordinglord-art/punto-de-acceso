"use client";

import { useState, useEffect } from "react";
import { SettingsDrawer } from "./SettingsDrawer";

export function SettingsTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-settings", handleOpen);
    return () => window.removeEventListener("open-settings", handleOpen);
  }, []);

  return <SettingsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
