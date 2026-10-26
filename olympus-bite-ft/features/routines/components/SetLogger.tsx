"use client";

import { useState } from "react";
import { Plus, Minus, Check, Flame, Zap, Smile, Trophy, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ExerciseAutoregulationInsight } from "../utils/vital-fit-labs-engine";

interface SetLoggerProps {
  setNumber: number;
  totalSets: number;
  targetWeight?: number | null;
  targetReps?: string;
  intensity?: "relax" | "medium" | "failure" | string | null;
  previousWeight?: number | null;
  previousReps?: number | null;
  insight?: ExerciseAutoregulationInsight | null;
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
  insight,
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

  const defaultWeight =
    insight?.recommendedWeightKg ??
    previousWeight ??
    targetWeight ??
    0;

  const defaultReps =
    insight?.recommendedReps ??
    previousReps ??
    defaultTargetReps;

  const [weight, setWeight] = useState<number>(defaultWeight);
  const [reps, setReps] = useState<number>(defaultReps);
  const [prevKey, setPrevKey] = useState({
    setNumber,
    previousReps,
    previousWeight,
    recW: insight?.recommendedWeightKg,
    recR: insight?.recommendedReps,
  });

  if (
    prevKey.setNumber !== setNumber ||
    prevKey.previousReps !== previousReps ||
    prevKey.previousWeight !== previousWeight ||
    prevKey.recW !== insight?.recommendedWeightKg ||
    prevKey.recR !== insight?.recommendedReps
  ) {
    setPrevKey({
      setNumber,
      previousReps,
      previousWeight,
      recW: insight?.recommendedWeightKg,
      recR: insight?.recommendedReps,
    });
    setWeight(defaultWeight);
    setReps(defaultReps);
  }

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, Math.round((prev + delta) * 2) / 2));
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  const handleComplete = () => {
    onComplete(weight > 0 ? weight : null, reps);
  };

  // Detect live PR (Personal Record) or Smart Shield completion
  const currentE1Rm = weight > 0 ? weight * (1 + reps / 30) : reps;
  const isNewPR =
    !!insight &&
    insight.state !== "first_week" &&
    insight.state !== "fatigue_shield_2w" &&
    currentE1Rm > insight.bestE1RmKg + 0.05;
  const isShieldMode = insight?.state === "fatigue_shield_2w";

  // Intensity configuration with full explanations (no truncation)
  const intensityConfig = (() => {
    if (isShieldMode) {
      return {
        label: "Escudo Protector Vital Fit Labs (RIR 2)",
        rpe: "RPE 7-8",
        emoji: "🛡️",
        icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
        colorClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
        glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
        hint: "Semana de descarga inteligente: guarda 2 repeticiones en recámara con técnica impecable para disipar fatiga y volver a romper récords.",
      };
    }
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

  const isBodyweight = weight <= 0;

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-black/60 rounded-3xl border border-white/12 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
      {/* Header: Set Number & Previous Record */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-xs font-black uppercase tracking-wider text-red-400 border border-red-500/30 shadow-sm">
            Serie {setNumber} de {totalSets}
          </span>
          {isNewPR && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider text-amber-300 animate-pulse">
              🏆 Proyección de Nuevo PR
            </span>
          )}
        </div>
        {previousReps !== null && previousReps !== undefined ? (
          <span className="text-xs font-bold text-slate-300 tabular-nums">
            Semana pasada (S{setNumber}):{" "}
            <strong className="text-white">
              {previousWeight && previousWeight > 0 ? `${previousWeight}kg × ` : ""}
              {previousReps} reps
            </strong>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Base Coach: {targetWeight && targetWeight > 0 ? `${targetWeight}kg × ` : ""}{targetReps}
          </span>
        )}
      </div>

      {/* Semáforo de Intensidad Card */}
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

      {/* Two Pillars: Weight (Interactive Stepper) & Reps (Interactive Stepper) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pillar 1: Weight Lifted (Adjustable for Double Progression or Deload) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-amber-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-amber-400">
              🏋️ Peso (kg)
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider tabular-nums">
              {targetWeight && targetWeight > 0 ? `Base: ${targetWeight}kg` : "Libre"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustWeight(-2.5)}
              disabled={disabled}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Restar 2.5 kg"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="text-center">
              {isBodyweight ? (
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Corporal
                </span>
              ) : (
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                    {weight}
                  </span>
                  <span className="text-xs font-extrabold text-amber-400 ml-0.5">
                    kg
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(2.5)}
              disabled={disabled}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Sumar 2.5 kg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="flex justify-center items-center gap-1.5 pt-1.5 border-t border-white/5">
            {insight?.recommendedWeightKg && insight.recommendedWeightKg > 0 && (
              <button
                type="button"
                onClick={() => setWeight(insight.recommendedWeightKg!)}
                className="px-2 py-1 rounded-lg bg-amber-500/20 text-[10px] font-black text-amber-300 hover:bg-amber-500/30 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Sugerido ({insight.recommendedWeightKg}kg)
              </button>
            )}
            <button
              type="button"
              onClick={() => adjustWeight(-1)}
              className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(1)}
              className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              +1
            </button>
          </div>
        </div>

        {/* Pillar 2: Repetitions Completed (Touch Stepper) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.12)] relative">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              🔄 Reps Hechas
            </span>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              Rango: {targetReps}
            </span>
          </div>

          {/* Large touch plus/minus buttons */}
          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={disabled}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Restar reps"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {reps}
            </span>

            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Sumar reps"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick shortcuts */}
          <div className="flex justify-center items-center gap-1.5 pt-1.5 border-t border-white/5">
            <button
              type="button"
              onClick={() => setReps(defaultReps)}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 text-[10px] font-black text-red-300 hover:bg-red-500/30 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Misión ({defaultReps})
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

      {/* Main Submit Action Button (Adaptive PR / Shield / Standard Dopamine Trigger) */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className={cn(
          "w-full py-4 px-4 rounded-2xl text-white font-black uppercase tracking-wider text-sm active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer",
          isNewPR
            ? "bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)]"
            : isShieldMode
              ? "bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 shadow-[0_0_25px_rgba(6,182,212,0.45)]"
              : "bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)]"
        )}
      >
        {isNewPR ? (
          <>
            <Trophy className="w-5 h-5 stroke-[2.5]" />
            <span>
              ¡Completar Serie {setNumber} con Récord Personal ({weight > 0 ? `${weight}kg × ` : ""}{reps})!
            </span>
          </>
        ) : isShieldMode ? (
          <>
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>
              Completar Serie {setNumber} · Recuperación Inteligente ({weight > 0 ? `${weight}kg × ` : ""}{reps})
            </span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              Completar Serie {setNumber} ({weight > 0 ? `${weight}kg × ` : ""}{reps} Reps)
            </span>
          </>
        )}
      </button>
    </div>
  );
}
