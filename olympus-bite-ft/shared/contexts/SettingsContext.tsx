"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorPreset = "emerald" | "blue" | "purple" | "orange";
export type LayoutType = "vertical" | "mini";
export type FontFamily = "geist" | "inter" | "roboto";

interface SettingsContextType {
  colorPreset: ColorPreset;
  setColorPreset: (color: ColorPreset) => void;
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const PRESETS: Record<ColorPreset, Record<string, string>> = {
  emerald: {
    "primary-50": "#ecfdf5",
    "primary-100": "#d1fae5",
    "primary-200": "#a7f3d0",
    "primary-300": "#6ee7b7",
    "primary-400": "#34d399",
    "primary-500": "#10b981",
    "primary-600": "#059669",
    "primary-700": "#047857",
    "primary-800": "#065f46",
    "primary-900": "#064e3b",
    "primary-950": "#022c22",
  },
  blue: {
    "primary-50": "#eff6ff",
    "primary-100": "#dbeafe",
    "primary-200": "#bfdbfe",
    "primary-300": "#93c5fd",
    "primary-400": "#60a5fa",
    "primary-500": "#3b82f6",
    "primary-600": "#2563eb",
    "primary-700": "#1d4ed8",
    "primary-800": "#1e40af",
    "primary-900": "#1e3a8a",
    "primary-950": "#172554",
  },
  purple: {
    "primary-50": "#faf5ff",
    "primary-100": "#f3e8ff",
    "primary-200": "#e9d5ff",
    "primary-300": "#d8b4fe",
    "primary-400": "#c084fc",
    "primary-500": "#a855f7",
    "primary-600": "#9333ea",
    "primary-700": "#7e22ce",
    "primary-800": "#6b21a8",
    "primary-900": "#581c87",
    "primary-950": "#3b0764",
  },
  orange: {
    "primary-50": "#fff7ed",
    "primary-100": "#ffedd5",
    "primary-200": "#fed7aa",
    "primary-300": "#fdba74",
    "primary-400": "#fb923c",
    "primary-500": "#f97316",
    "primary-600": "#ea580c",
    "primary-700": "#c2410c",
    "primary-800": "#9a3412",
    "primary-900": "#7c2d12",
    "primary-950": "#431407",
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [colorPreset, setColorPreset] = useState<ColorPreset>("emerald");
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [fontFamily, setFontFamily] = useState<FontFamily>("geist");
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedColor = localStorage.getItem("ob-color") as ColorPreset;
    const savedLayout = localStorage.getItem("ob-layout") as LayoutType;
    const savedFont = localStorage.getItem("ob-font") as FontFamily;

    if (savedColor && PRESETS[savedColor]) setColorPreset(savedColor);
    if (savedLayout) setLayout(savedLayout);
    if (savedFont) setFontFamily(savedFont);
  }, []);

  // Update localStorage and CSS variables when state changes
  useEffect(() => {
    if (!isMounted) return;

    localStorage.setItem("ob-color", colorPreset);
    localStorage.setItem("ob-layout", layout);
    localStorage.setItem("ob-font", fontFamily);

    // Apply color CSS variables
    const presetColors = PRESETS[colorPreset];
    const root = document.documentElement;
    Object.entries(presetColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply font family
    let fontVar = "var(--font-geist-sans)";
    if (fontFamily === "inter") fontVar = "'Inter', sans-serif";
    if (fontFamily === "roboto") fontVar = "'Roboto', sans-serif";
    root.style.setProperty("--font-dynamic-sans", fontVar);
  }, [colorPreset, layout, fontFamily, isMounted]);

  return (
    <SettingsContext.Provider
      value={{
        colorPreset,
        setColorPreset,
        layout,
        setLayout,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
