"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VitalFitLogo } from "./VitalFitLogo";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SplashScreenProps {
  onFinish?: () => void;
  autoCloseTimeoutMs?: number;
  forceShow?: boolean;
}

export function SplashScreen({
  onFinish,
  autoCloseTimeoutMs = 2800,
  forceShow = false,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (forceShow) {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
    try {
      const hasShown = sessionStorage.getItem("vf_splash_shown");
      if (!hasShown) {
        const timer = setTimeout(() => setVisible(true), 0);
        return () => clearTimeout(timer);
      }
    } catch {
      /* ignore */
    }
  }, [forceShow]);

  const handleDismiss = useCallback(() => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      setAnimatingOut(false);
      if (onFinish) onFinish();
    }, 600);
  }, [onFinish]);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem("vf_splash_shown", "true");
    } catch {
      /* ignore */
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoCloseTimeoutMs);

    return () => clearTimeout(timer);
  }, [visible, autoCloseTimeoutMs, handleDismiss]);

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer select-none transition-all duration-700 ease-out",
        animatingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      {/* Top Status Simulation Bar */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-20 text-white/40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Cerrar Splash"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-mono tracking-widest text-white/30 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          VITALFIT SYSTEM
        </span>
      </div>

      {/* Tech Grid Background Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Central Dramatic Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_80%,#000000_100%)] pointer-events-none" />

      {/* Ambient Red & White Light Flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 pointer-events-none overflow-visible">
        <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-72 h-44 rounded-full bg-white/20 blur-[90px] mix-blend-screen animate-pulse" />
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-72 h-48 rounded-full bg-red-600/35 blur-[90px] mix-blend-screen animate-pulse" />
      </div>

      {/* Main Logo Container with Entrance Animation */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-90 duration-700">
        <VitalFitLogo size="xl" showGlow={true} showGrid={true} glowIntensity="high" />

        <p className="mt-8 text-xs font-condensed uppercase tracking-[0.35em] text-white/50 animate-pulse">
          Plataforma de Alto Rendimiento
        </p>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center text-white/30 text-[11px] font-condensed uppercase tracking-widest gap-2">
        <span className="flex items-center gap-1.5 text-white/40">
          <Sparkles className="w-3.5 h-3.5 text-red-500 animate-spin" style={{ animationDuration: "8s" }} />
          Toca cualquier lugar para entrar
        </span>
      </div>
    </div>
  );
}
