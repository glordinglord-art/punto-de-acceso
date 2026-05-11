/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTheme } from "next-themes";
import { useSettings } from "@/shared/contexts/SettingsContext";
import {
  X,
  Moon,
  Sun,
  Monitor,
  Settings2,
  Check,
  LayoutPanelLeft,
  LayoutPanelTop,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

const COLOR_PRESETS = [
  { id: "emerald", label: "Esmeralda", color: "#10b981" },
  { id: "blue", label: "Azul", color: "#3b82f6" },
  { id: "purple", label: "Morado", color: "#a855f7" },
  { id: "orange", label: "Naranja", color: "#f97316" },
];

const FONTS = [
  { id: "geist", label: "Geist", sample: "Aa" },
  { id: "inter", label: "Inter", sample: "Aa" },
  { id: "roboto", label: "Roboto", sample: "Aa" },
];

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
);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer — bottom-sheet on mobile, right-sidebar on desktop */}
      <div
        className={cn(
          "fixed z-50 flex flex-col",
          // mobile: full-width bottom sheet
          "bottom-0 left-0 right-0 h-[88vh] rounded-t-3xl",
          // desktop: right sidebar
          "lg:top-0 lg:bottom-auto lg:left-auto lg:right-0 lg:h-full lg:w-72 lg:rounded-none",
          "bg-white dark:bg-neutral-950 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full",
        )}
      >
        {/* Drag handle — only on mobile */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Personalización
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-7">
          {/* MODE */}
          <Section title="Modo">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
              {[
                { id: "light", label: "Claro", icon: Sun },
                { id: "dark", label: "Oscuro", icon: Moon },
                { id: "system", label: "Sistema", icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all",
                    theme === id
                      ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* COLOR */}
          <Section title="Color Principal">
            <div className="flex gap-2">
              {COLOR_PRESETS.map(({ id, label, color }) => (
                <button
                  key={id}
                  title={label}
                  onClick={() => setColorPreset(id as any)}
                  className={cn(
                    "relative flex-1 h-9 rounded-xl transition-all hover:scale-105 active:scale-95",
                    colorPreset === id
                      ? "ring-2 ring-offset-2 dark:ring-offset-neutral-950"
                      : "opacity-60 hover:opacity-90",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {colorPreset === id && (
                    <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* LAYOUT */}
          <Section title="Diseño (Layout)">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLayout("vertical")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  layout === "vertical"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                    : "border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700",
                )}
              >
                {/* Mini sidebar preview */}
                <svg
                  width="40"
                  height="30"
                  viewBox="0 0 40 30"
                  fill="none"
                  className="opacity-80"
                >
                  <rect
                    x="0"
                    y="0"
                    width="9"
                    height="30"
                    rx="2"
                    fill={
                      layout === "vertical"
                        ? "var(--primary-500, #10b981)"
                        : "#d1d5db"
                    }
                  />
                  <rect
                    x="12"
                    y="3"
                    width="25"
                    height="4"
                    rx="1"
                    fill={
                      layout === "vertical"
                        ? "var(--primary-300, #6ee7b7)"
                        : "#e5e7eb"
                    }
                  />
                  <rect
                    x="12"
                    y="10"
                    width="25"
                    height="17"
                    rx="1"
                    fill={
                      layout === "vertical"
                        ? "var(--primary-100, #d1fae5)"
                        : "#f3f4f6"
                    }
                  />
                </svg>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    layout === "vertical"
                      ? "text-primary-700 dark:text-primary-400"
                      : "text-neutral-500",
                  )}
                >
                  Sidebar
                </span>
              </button>
              <button
                onClick={() => setLayout("mini")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  layout === "mini"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                    : "border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700",
                )}
              >
                {/* Mini topbar preview */}
                <svg
                  width="40"
                  height="30"
                  viewBox="0 0 40 30"
                  fill="none"
                  className="opacity-80"
                >
                  <rect
                    x="0"
                    y="0"
                    width="40"
                    height="8"
                    rx="2"
                    fill={
                      layout === "mini"
                        ? "var(--primary-500, #10b981)"
                        : "#d1d5db"
                    }
                  />
                  <rect
                    x="0"
                    y="11"
                    width="40"
                    height="19"
                    rx="1"
                    fill={
                      layout === "mini"
                        ? "var(--primary-100, #d1fae5)"
                        : "#f3f4f6"
                    }
                  />
                </svg>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    layout === "mini"
                      ? "text-primary-700 dark:text-primary-400"
                      : "text-neutral-500",
                  )}
                >
                  Mini (Top)
                </span>
              </button>
            </div>
          </Section>

          {/* TYPOGRAPHY */}
          <Section title="Tipografía">
            <div className="space-y-1.5">
              {FONTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFontFamily(id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                    fontFamily === id
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-700",
                  )}
                >
                  {label}
                  {fontFamily === id && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
