"use client";

import { useState } from "react";
import { Plus, Minus, Check, Lock, Flame, Zap, Smile } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SetLoggerProps {
  setNumber: number;
  totalSets: number;
  targetWeight?: number | null;
  targetReps?: string;
  intensity?: "relax" | "medium" | "failure" | string | null;
  previousWeight?: number | null;
  previousReps?: number | null;
  disabled: boolean;
  onComplete: (weight: number | null, reps: number | null) => void;
}

export function SetLogger({
  setNumber,
  totalSets,
  targetWeight,
  targetReps = "10-12",
  intensity = "medium",
  previousWeight,
  previousReps,
  disabled,
  onComplete,
}: SetLoggerProps) {
  // Parse target reps from string (e.g. "10-12" -> 12, "10" -> 10)
  const defaultTargetReps = (() => {
    if (!targetReps) return 10;
    const matches = targetReps.match(/\d+/g);
    if (!matches || matches.length === 0) return 10;
    return parseInt(matches[matches.length - 1], 10);
  })();

  const assignedWeight = targetWeight ?? previousWeight ?? null;

  const [reps, setReps] = useState<number>(previousReps ?? defaultTargetReps);
  const [prevKey, setPrevKey] = useState({ setNumber, previousReps });

  if (prevKey.setNumber !== setNumber || prevKey.previousReps !== previousReps) {
    setPrevKey({ setNumber, previousReps });
    setReps(previousReps ?? defaultTargetReps);
  }

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  const handleComplete = () => {
    onComplete(assignedWeight, reps);
  };

  // Intensity configuration with full explanations (no truncation)
  const intensityConfig = (() => {
    switch (intensity) {
      case "relax":
        return {
          label: "Modo Relax / Calentamiento",
          rpe: "RPE 5-6",
          emoji: "🟢",
          icon: <Smile className="w-5 h-5 text-emerald-400" />,
          colorClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          hint: "Carga controlada y ritmo tranquilo. Prioriza la técnica y respira fluido.",
        };
      case "failure":
        return {
          label: "Llegar al Fallo Muscular",
          rpe: "RPE 9-10",
          emoji: "🔴",
          icon: <Flame className="w-5 h-5 text-red-400 animate-pulse" />,
          colorClass: "border-red-500/40 bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
          glowClass: "shadow-[0_0_25px_rgba(239,68,68,0.25)]",
          hint: "¡Máxima exigencia! Da el 100% hasta que no puedas sacar ni una repetición más.",
        };
      case "medium":
      default:
        return {
          label: "Intensidad Media / Estricto",
          rpe: "RPE 7-8",
          emoji: "🟡",
          icon: <Zap className="w-5 h-5 text-amber-400" />,
          colorClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
          glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          hint: "Exigencia moderada. Mantén cadencia estricta y control en cada repetición.",
        };
    }
  })();

  const isBodyweight = !assignedWeight || assignedWeight <= 0;

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-black/60 rounded-3xl border border-white/12 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
      {/* Header: Set Number & Previous Record */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-xs font-black uppercase tracking-wider text-red-400 border border-red-500/30 shadow-sm">
            Serie {setNumber} de {totalSets}
          </span>
        </div>
        {previousReps !== null && previousReps !== undefined ? (
          <span className="text-xs font-bold text-slate-300 tabular-nums">
            Anterior: <strong className="text-white">{previousReps} reps</strong>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Primera serie
          </span>
        )}
      </div>

      {/* Semáforo de Intensidad Card (Full text, clear and readable) */}
      <div
        className={cn(
          "rounded-2xl p-3 sm:p-3.5 border transition-all flex flex-col gap-1.5",
          intensityConfig.colorClass,
          intensityConfig.glowClass
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{intensityConfig.emoji}</span>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {intensityConfig.label}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-slate-200">
            {intensityConfig.rpe}
          </span>
        </div>
        <p className="text-xs text-slate-200/90 leading-relaxed">
          {intensityConfig.hint}
        </p>
      </div>

      {/* Two Pillars: Weight (Locked) & Reps (Active Stepper) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pillar 1: Weight Prescribed by Coach (Locked) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Lock className="w-3 h-3 text-red-400" /> Peso Coach
            </span>
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
              Fijado
            </span>
          </div>

          <div className="py-2.5 text-center">
            {isBodyweight ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Corporal
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  Sin peso extra
                </p>
              </div>
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                  {assignedWeight}
                </span>
                <span className="text-sm font-extrabold text-amber-400 ml-1">
                  kg
                </span>
              </div>
            )}
          </div>

          <div className="text-center pt-1.5 border-t border-white/5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {isBodyweight ? "🔒 Peso libre" : "🔒 Asignado por coach"}
            </p>
          </div>
        </div>

        {/* Pillar 2: Repetitions Completed (Touch Stepper) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.12)] relative">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              🔄 Reps Hechas
            </span>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              Meta: {targetReps}
            </span>
          </div>

          {/* Large touch plus/minus buttons */}
          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={disabled}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Restar reps"
            >
              <Minus className="w-5 h-5 stroke-[3]" />
            </button>

            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {reps}
            </span>

            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Sumar reps"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Quick shortcuts */}
          <div className="flex justify-center items-center gap-1.5 pt-1.5 border-t border-white/5">
            <button
              type="button"
              onClick={() => setReps(defaultTargetReps)}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 text-[10px] font-black text-red-300 hover:bg-red-500/30 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Meta ({defaultTargetReps})
            </button>
            <button
              type="button"
              onClick={() => adjustReps(-2)}
              className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              -2
            </button>
            <button
              type="button"
              onClick={() => adjustReps(2)}
              className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              +2
            </button>
          </div>
        </div>
      </div>

      {/* Main Submit Action Button (Large, high-contrast, easy to hit) */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white font-black uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>Completar Serie {setNumber} ({reps} Reps)</span>
      </button>
    </div>
  );
}
