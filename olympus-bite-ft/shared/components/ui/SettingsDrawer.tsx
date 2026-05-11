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
  <div className="space-y-4">
    <p className="text-[11px] font-condensed font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
      {title} <span className="flex-1 h-px bg-white/5" />
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
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed z-50 flex flex-col",
          // mobile: full-width bottom sheet
          "bottom-0 left-0 right-0 h-[88vh] rounded-t-[32px]",
          // desktop: right sidebar
          "lg:top-0 lg:bottom-auto lg:left-auto lg:right-0 lg:h-full lg:w-80 lg:rounded-none",
          "bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-white/10 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full",
        )}
      >
        {/* Drag handle — only on mobile */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-white/10" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <Settings2 className="w-4 h-4 text-primary-500" />
            </div>
            <h2 className="text-xl font-condensed font-bold uppercase tracking-wide text-white leading-none">
              Personalización
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* MODE */}
          <Section title="Apariencia">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#1a1a1a] rounded-2xl border border-white/5">
              {[
                { id: "light", label: "Claro", icon: Sun },
                { id: "dark", label: "Oscuro", icon: Moon },
                { id: "system", label: "Sistema", icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-condensed font-bold uppercase tracking-wide transition-all",
                    theme === id
                      ? "bg-[#2a2a2a] text-white shadow-md border border-white/10"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5",
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
            <div className="flex gap-3">
              {COLOR_PRESETS.map(({ id, label, color }) => (
                <button
                  key={id}
                  title={label}
                  onClick={() => setColorPreset(id as any)}
                  className={cn(
                    "relative flex-1 h-12 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
                    colorPreset === id
                      ? "ring-2 ring-white/20 scale-105 shadow-lg shadow-black/50"
                      : "opacity-40 hover:opacity-100",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {colorPreset === id && (
                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* LAYOUT */}
          <Section title="Diseño (Layout)">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLayout("vertical")}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group overflow-hidden relative",
                  layout === "vertical"
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-white/5 bg-[#1a1a1a] hover:border-white/20 hover:bg-[#222]",
                )}
              >
                {layout === "vertical" && <div className="absolute inset-0 bg-primary-500/5" />}
                {/* Mini sidebar preview */}
                <svg
                  width="40"
                  height="30"
                  viewBox="0 0 40 30"
                  fill="none"
                  className={cn("transition-transform group-hover:scale-110", layout === "vertical" ? "opacity-100" : "opacity-40")}
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
                        : "#4b5563"
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
                        : "#374151"
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
                        : "#1f2937"
                    }
                  />
                </svg>
                <span
                  className={cn(
                    "text-[10px] font-condensed font-bold uppercase tracking-widest relative z-10",
                    layout === "vertical"
                      ? "text-primary-400"
                      : "text-neutral-500",
                  )}
                >
                  Sidebar
                </span>
              </button>
              <button
                onClick={() => setLayout("mini")}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group overflow-hidden relative",
                  layout === "mini"
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-white/5 bg-[#1a1a1a] hover:border-white/20 hover:bg-[#222]",
                )}
              >
                {layout === "mini" && <div className="absolute inset-0 bg-primary-500/5" />}
                {/* Mini topbar preview */}
                <svg
                  width="40"
                  height="30"
                  viewBox="0 0 40 30"
                  fill="none"
                  className={cn("transition-transform group-hover:scale-110", layout === "mini" ? "opacity-100" : "opacity-40")}
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
                        : "#4b5563"
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
                        : "#1f2937"
                    }
                  />
                </svg>
                <span
                  className={cn(
                    "text-[10px] font-condensed font-bold uppercase tracking-widest relative z-10",
                    layout === "mini"
                      ? "text-primary-400"
                      : "text-neutral-500",
                  )}
                >
                  Mini (Top)
                </span>
              </button>
            </div>
          </Section>

          {/* TYPOGRAPHY */}
          <Section title="Tipografía Global">
            <div className="space-y-2">
              {FONTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFontFamily(id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-xl border text-sm transition-all text-left group",
                    fontFamily === id
                      ? "border-primary-500 bg-primary-500/10 text-primary-400 font-bold"
                      : "border-white/5 bg-[#1a1a1a] text-neutral-400 hover:border-white/20 hover:bg-[#222] font-medium",
                  )}
                >
                  <span className="font-condensed uppercase tracking-wider">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-normal opacity-40 group-hover:opacity-100 transition-opacity">Aa</span>
                    {fontFamily === id && <Check className="w-5 h-5 shrink-0 text-primary-500" />}
                  </div>
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
