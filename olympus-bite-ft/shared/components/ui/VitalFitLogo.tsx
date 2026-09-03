"use client";

import React from "react";
import { cn } from "@/shared/lib/utils";

export interface VitalFitLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showGlow?: boolean;
  showGrid?: boolean;
  className?: string;
  glowIntensity?: "subtle" | "medium" | "high";
  layout?: "horizontal" | "vertical" | "compact";
}

export function VitalFitLogo({
  size = "md",
  showGlow = true,
  showGrid = false,
  className,
  glowIntensity = "high",
  layout = "horizontal",
}: VitalFitLogoProps) {
  // Size-specific text sizing
  const sizeStyles = {
    xs: {
      text: "text-lg tracking-tight",
      container: "py-0.5 px-1",
      glowWhite: "w-16 h-8 blur-md",
      glowRed: "w-16 h-8 blur-md",
    },
    sm: {
      text: "text-xl tracking-tight",
      container: "py-1 px-2",
      glowWhite: "w-24 h-12 blur-lg",
      glowRed: "w-24 h-12 blur-lg",
    },
    md: {
      text: "text-2xl sm:text-3xl tracking-tighter",
      container: "py-2 px-3",
      glowWhite: "w-36 h-16 blur-xl",
      glowRed: "w-36 h-16 blur-xl",
    },
    lg: {
      text: "text-4xl sm:text-5xl tracking-tighter",
      container: "py-4 px-6",
      glowWhite: "w-48 h-24 blur-2xl",
      glowRed: "w-48 h-24 blur-2xl",
    },
    xl: {
      text: "text-5xl sm:text-6xl md:text-7xl tracking-tighter",
      container: "py-6 px-8",
      glowWhite: "w-72 h-36 blur-3xl",
      glowRed: "w-72 h-36 blur-3xl",
    },
    hero: {
      text: "text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter",
      container: "py-10 px-10",
      glowWhite: "w-96 h-48 blur-[80px]",
      glowRed: "w-96 h-48 blur-[80px]",
    },
  }[size];

  // Opacities based on intensity
  const glowOpacities = {
    subtle: { white: "opacity-40", red: "opacity-40" },
    medium: { white: "opacity-70", red: "opacity-70" },
    high: { white: "opacity-95", red: "opacity-90" },
  }[glowIntensity];

  if (layout === "compact") {
    return (
      <div className={cn("relative inline-flex items-center select-none font-display font-black", className)}>
        {showGlow && (
          <div className="absolute -inset-1 bg-red-600/30 blur-md rounded-lg pointer-events-none" />
        )}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black border border-white/10 shadow-lg overflow-hidden">
          <span className="text-white text-base font-black italic">V</span>
          <span className="text-red-500 text-lg font-black italic">F</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center select-none overflow-hidden rounded-2xl",
        sizeStyles.container,
        className
      )}
    >
      {/* Background Tech Grid (Equalizer / Sport telemetry lines) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      {/* Glow Effects Container */}
      {showGlow && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
          {/* White Glow - Centered behind 'VITAL' */}
          <div
            className={cn(
              "absolute -translate-x-[28%] rounded-full bg-white/70 mix-blend-screen pointer-events-none animate-pulse",
              sizeStyles.glowWhite,
              glowOpacities.white
            )}
            style={{ animationDuration: "4s" }}
          />

          {/* Red Glow - Centered behind 'FIT' */}
          <div
            className={cn(
              "absolute translate-x-[32%] rounded-full bg-red-600/80 mix-blend-screen pointer-events-none animate-pulse",
              sizeStyles.glowRed,
              glowOpacities.red
            )}
            style={{ animationDuration: "3.5s" }}
          />
        </div>
      )}

      {/* Main Logo Typography */}
      <div className="relative z-10 flex items-center font-display font-black leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
        {/* VITAL in Bright White */}
        <span
          className={cn(
            "text-white font-extrabold uppercase",
            sizeStyles.text
          )}
          style={{
            letterSpacing: "-0.04em",
            textShadow: "0 0 24px rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          VITAL
        </span>

        {/* F in Vibrant Sport Red */}
        <span
          className={cn(
            "text-[#FF0033] font-black uppercase transition-all duration-300",
            sizeStyles.text
          )}
          style={{
            letterSpacing: "-0.04em",
            textShadow: "0 0 28px rgba(255,0,51,0.8), 0 0 40px rgba(239,68,68,0.5)",
          }}
        >
          F
        </span>

        {/* IT in Bright White */}
        <span
          className={cn(
            "text-white font-extrabold uppercase",
            sizeStyles.text
          )}
          style={{
            letterSpacing: "-0.04em",
            textShadow: "0 0 24px rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          IT
        </span>
      </div>
    </div>
  );
}
