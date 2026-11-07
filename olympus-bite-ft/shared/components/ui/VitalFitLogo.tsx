"use client";

import React from "react";
import { cn } from "@/shared/lib/utils";

export interface VitalFitLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero" | number;
  showGlow?: boolean;
  showSubtitle?: boolean;
  className?: string;
  glowIntensity?: "subtle" | "medium" | "high";
  layout?: "horizontal" | "vertical" | "compact" | "icon";
  variant?: "full" | "compact" | "icon";
}

/**
 * Official Vital Fit Labs Monogram (Geometric Inverted Triangle "VF")
 * Handcrafted SVG matching the physical gym signage in Electric Cyan (#00F0FF).
 */
export function VfMonogram({
  className,
  size = 32,
  glow = true,
}: {
  className?: string;
  size?: number;
  glow?: boolean;
}) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: (size * 54) / 64 }}
    >
      {glow && (
        <div
          className="absolute inset-0 bg-[#00F0FF]/35 blur-md rounded-full pointer-events-none scale-110"
          style={{ filter: "drop-shadow(0 0 12px rgba(0, 240, 255, 0.7))" }}
        />
      )}
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Left 'V' Segment */}
        <path
          d="M 5 15 L 58 15 L 43 30 L 26 30 L 53 72 L 40 92 L 5 15 Z"
          fill="#00F0FF"
        />
        {/* Right 'F' Main Diagonal & Top Arm */}
        <path
          d="M 68 15 L 115 15 L 102 30 L 78 30 L 58 62 L 67 78 L 82 54 L 95 54 L 75 92 L 60 92 L 68 15 Z"
          fill="#00F0FF"
        />
        {/* F Middle Horizontal Arm */}
        <path
          d="M 75 42 L 102 42 L 95 53 L 68 53 Z"
          fill="#00F0FF"
        />
      </svg>
    </div>
  );
}

export function VitalFitLogo({
  size = "md",
  showGlow = true,
  showSubtitle = true,
  className,
  layout = "horizontal",
  variant,
}: VitalFitLogoProps) {
  const presets = {
    xs: { icon: 20, text: "text-sm", sub: "text-[8px] tracking-[0.25em]", gap: "gap-2" },
    sm: { icon: 26, text: "text-base", sub: "text-[9px] tracking-[0.3em]", gap: "gap-2.5" },
    md: { icon: 34, text: "text-xl", sub: "text-[10px] tracking-[0.35em]", gap: "gap-3" },
    lg: { icon: 44, text: "text-2xl sm:text-3xl", sub: "text-xs tracking-[0.4em]", gap: "gap-3.5" },
    xl: { icon: 58, text: "text-3xl sm:text-4xl", sub: "text-sm tracking-[0.45em]", gap: "gap-4" },
    hero: { icon: 78, text: "text-4xl sm:text-6xl", sub: "text-base tracking-[0.5em]", gap: "gap-5" },
  };

  const sizeConfig =
    typeof size === "number"
      ? { icon: size, text: "text-base", sub: "text-[9px] tracking-[0.3em]", gap: "gap-2.5" }
      : presets[size] ?? presets.md;

  const effectiveLayout = variant === "icon" ? "icon" : variant === "compact" ? "compact" : layout;

  if (effectiveLayout === "icon") {
    return <VfMonogram size={sizeConfig.icon} glow={showGlow} className={className} />;
  }

  if (effectiveLayout === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-2 select-none", className)}>
        <VfMonogram size={sizeConfig.icon} glow={showGlow} />
        <span className={cn("font-black tracking-tight text-white uppercase font-display", sizeConfig.text)}>
          VITAL <span className="text-[#00F0FF]">FIT</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center select-none",
        sizeConfig.gap,
        layout === "vertical" ? "flex-col text-center" : "flex-row",
        className
      )}
    >
      <VfMonogram size={sizeConfig.icon} glow={showGlow} />

      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span className={cn("font-black uppercase tracking-tight text-white font-display", sizeConfig.text)}>
            VITAL FIT
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center justify-between w-full mt-1">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#00F0FF]/80" />
            <span className={cn("px-1.5 font-bold uppercase text-[#00F0FF] font-mono", sizeConfig.sub)}>
              LABS
            </span>
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#00F0FF]/80" />
          </div>
        )}
      </div>
    </div>
  );
}
