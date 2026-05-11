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
    "color-p50": "#ecfdf5",
    "color-p100": "#d1fae5",
    "color-p200": "#a7f3d0",
    "color-p300": "#6ee7b7",
    "color-p400": "#34d399",
    "color-p500": "#10b981",
    "color-p600": "#059669",
    "color-p700": "#047857",
    "color-p800": "#065f46",
    "color-p900": "#064e3b",
    "color-p950": "#022c22",
  },
  blue: {
    "color-p50": "#eff6ff",
    "color-p100": "#dbeafe",
    "color-p200": "#bfdbfe",
    "color-p300": "#93c5fd",
    "color-p400": "#60a5fa",
    "color-p500": "#3b82f6",
    "color-p600": "#2563eb",
    "color-p700": "#1d4ed8",
    "color-p800": "#1e40af",
    "color-p900": "#1e3a8a",
    "color-p950": "#172554",
  },
  purple: {
    "color-p50": "#faf5ff",
    "color-p100": "#f3e8ff",
    "color-p200": "#e9d5ff",
    "color-p300": "#d8b4fe",
    "color-p400": "#c084fc",
    "color-p500": "#a855f7",
    "color-p600": "#9333ea",
    "color-p700": "#7e22ce",
    "color-p800": "#6b21a8",
    "color-p900": "#581c87",
    "color-p950": "#3b0764",
  },
  orange: {
    "color-p50": "#fff7ed",
    "color-p100": "#ffedd5",
    "color-p200": "#fed7aa",
    "color-p300": "#fdba74",
    "color-p400": "#fb923c",
    "color-p500": "#f97316",
    "color-p600": "#ea580c",
    "color-p700": "#c2410c",
    "color-p800": "#9a3412",
    "color-p900": "#7c2d12",
    "color-p950": "#431407",
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [colorPreset, setColorPreset] = useState<ColorPreset>("emerald");
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [fontFamily, setFontFamily] = useState<FontFamily>("geist");
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
