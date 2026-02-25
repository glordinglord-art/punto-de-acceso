"use client";

import { useTheme } from "next-themes";
import { useSettings } from "@/shared/contexts/SettingsContext";
import {
  X,
  Moon,
  Sun,
  Settings2,
  Check,
  LayoutPanelLeft,
  LayoutPanelTop,
} from "lucide-react";
import { Button } from "./Button";
import { useEffect, useState } from "react";

export function SettingsDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const {
    colorPreset,
    setColorPreset,
    layout,
    setLayout,
    fontFamily,
    setFontFamily,
  } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#111] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Configuración
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-60px)]">
          {/* Theme Mode */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Modo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                  theme === "light"
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <Sun className="w-4 h-4" /> Claro
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                  theme === "dark"
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <Moon className="w-4 h-4" /> Oscuro
              </button>
            </div>
          </div>

          {/* Color Presets */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Color Principal
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "emerald", color: "bg-emerald-500" },
                { id: "blue", color: "bg-blue-500" },
                { id: "purple", color: "bg-purple-500" },
                { id: "orange", color: "bg-orange-500" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setColorPreset(preset.id as any)}
                  className={`relative flex items-center justify-center h-10 rounded-xl transition-transform hover:scale-105 active:scale-95 ${preset.color} ${
                    colorPreset === preset.id
                      ? "ring-2 ring-offset-2 dark:ring-offset-neutral-900 ring-primary-500"
                      : ""
                  }`}
                >
                  {colorPreset === preset.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Layout type */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Diseño (Layout)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLayout("vertical")}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  layout === "vertical"
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <LayoutPanelLeft className="w-6 h-6" />
                <span className="text-xs font-medium">Sidebar</span>
              </button>
              <button
                onClick={() => setLayout("mini")}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  layout === "mini"
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <LayoutPanelTop className="w-6 h-6" />
                <span className="text-xs font-medium">Mini (Top)</span>
              </button>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Tipografía
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: "geist",
                  label: "Geist Sans (Moderna)",
                  fontClass: "font-sans",
                },
                {
                  id: "inter",
                  label: "Inter (Clásica)",
                  fontClass: "font-inter",
                },
                {
                  id: "roboto",
                  label: "Roboto (Legible)",
                  fontClass: "font-roboto",
                },
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFontFamily(font.id as any)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all text-left ${
                    fontFamily === font.id
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  <span className={`${font.fontClass}`}>{font.label}</span>
                  {fontFamily === font.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
