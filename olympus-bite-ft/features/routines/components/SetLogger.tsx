"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  Check,
  Flame,
  Zap,
  Smile,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Activity,
  HeartCrack,
  RefreshCw,
  SkipForward,
  Trophy,
} from "lucide-react";
import type { ExerciseAutoregulationInsight } from "../utils/vital-fit-labs-engine";
import type { SetLogData } from "../types/routines.types";
import { cn } from "@/shared/lib/utils";

interface SetLoggerProps {
  setNumber: number;
  totalSets: number;
  targetWeight?: number | null;
  targetReps?: string;
  intensity?: "relax" | "medium" | "failure" | string | null;
  loggedWeight?: number | null;
  loggedReps?: number | null;
  isLogged?: boolean;
  loggedSets?: SetLogData[];
  onSelectSet?: (setIdx: number) => void;
  defaultUnit?: "kg" | "lbs";
  previousWeight?: number | null;
  previousReps?: number | null;
  insight?: ExerciseAutoregulationInsight | null;
  disabled: boolean;
  onComplete: (weight: number | null, reps: number | null) => void;
  onSkip?: () => void;
}

const LBS_FACTOR = 2.20462;

export function SetLogger({
  setNumber,
  totalSets,
  targetWeight,
  targetReps = "10-12",
  intensity = "medium",
  loggedWeight = null,
  loggedReps = null,
  isLogged = false,
  loggedSets = [],
  onSelectSet,
  defaultUnit = "kg",
  insight,
  disabled,
  onComplete,
  onSkip,
}: SetLoggerProps) {
  const defaultTargetReps = (() => {
    if (!targetReps) return 10;
    const matches = targetReps.match(/\d+/g);
    if (!matches || matches.length === 0) return 10;
    return parseInt(matches[matches.length - 1], 10);
  })();

  const suggestedWeightKg = targetWeight ?? null;
  const startingWeightKg = loggedWeight ?? suggestedWeightKg;

  const [unit, setUnit] = useState<"kg" | "lbs">(defaultUnit);

  const toDisplay = (kg: number | null): number | null => {
    if (kg === null || kg === undefined) return null;
    if (unit === "kg") return kg;
    return Math.round(kg * LBS_FACTOR * 2) / 2;
  };

  const toKg = (val: number | null): number | null => {
    if (val === null || val === undefined) return null;
    if (unit === "kg") return val;
    return Math.round((val / LBS_FACTOR) * 10) / 10;
  };

  const [actualWeight, setActualWeight] = useState<number | null>(
    toDisplay(startingWeightKg),
  );
  const [reps, setReps] = useState<number>(loggedReps ?? defaultTargetReps);
  const [rir, setRir] = useState<number>(2);
  const [adjustmentReason, setAdjustmentReason] = useState<string | null>(null);

  const currentKg = toKg(actualWeight) ?? 0;
  const currentE1Rm = currentKg > 0 ? currentKg * (1 + reps / 30) : reps;
  const isShieldMode = insight?.state === "fatigue_shield_2w";
  const isNewPR =
    !isLogged &&
    !!insight &&
    insight.state !== "first_week" &&
    insight.state !== "fatigue_shield_2w" &&
    currentE1Rm > insight.bestE1RmKg + 0.05;

  const [showJointPicker, setShowJointPicker] = useState<boolean>(false);
  const [selectedJointPain, setSelectedJointPain] = useState<string | null>(
    null,
  );

  const [prevKey, setPrevKey] = useState({
    setNumber,
    loggedWeight,
    loggedReps,
    defaultUnit,
  });
  if (
    prevKey.setNumber !== setNumber ||
    prevKey.loggedWeight !== loggedWeight ||
    prevKey.loggedReps !== loggedReps ||
    prevKey.defaultUnit !== defaultUnit
  ) {
    setPrevKey({ setNumber, loggedWeight, loggedReps, defaultUnit });
    setActualWeight(toDisplay(startingWeightKg));
    setReps(loggedReps ?? defaultTargetReps);
    setAdjustmentReason(null);
    setSelectedJointPain(null);
    setShowJointPicker(false);
  }

  const handleToggleUnit = (newUnit: "kg" | "lbs") => {
    if (newUnit === unit) return;
    if (actualWeight !== null) {
      if (newUnit === "lbs") {
        setActualWeight(Math.round(actualWeight * LBS_FACTOR * 2) / 2);
      } else {
        setActualWeight(Math.round((actualWeight / LBS_FACTOR) * 2) / 2);
      }
    }
    setUnit(newUnit);
  };

  const adjustWeight = (delta: number) => {
    setActualWeight((prev) =>
      Math.max(0, Math.round(((prev ?? 0) + delta) * 2) / 2),
    );
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  const suggestedDisplay = toDisplay(suggestedWeightKg);
  const isBodyweight = !suggestedWeightKg || suggestedWeightKg <= 0;

  const semaphore = (() => {
    if (selectedJointPain) {
      return {
        status: "red" as const,
        label: `Alerta: Molestia en ${selectedJointPain}`,
        colorClass: "bg-rose-500/15 text-rose-300 border-rose-500/35",
        message:
          "Se ha registrado dolor articular. Se notificará al coach para descarga preventiva.",
      };
    }

    if (isBodyweight || !suggestedDisplay || !actualWeight) {
      return {
        status: "green" as const,
        label: "Zona Óptima · Carga Segura",
        colorClass: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
        message: "Dentro del rango biomecánico.",
      };
    }

    const diffPercent =
      ((actualWeight - suggestedDisplay) / suggestedDisplay) * 100;

    if (diffPercent > 20) {
      return {
        status: "red" as const,
        label: `Sobrecarga Crítica (+${Math.round(diffPercent)}%)`,
        colorClass:
          "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
        message:
          "Salto de carga >20%. Peligro de sobrecarga articular.",
      };
    }

    if (Math.abs(diffPercent) > 10) {
      return {
        status: "yellow" as const,
        label: `Ajuste Moderado (${diffPercent > 0 ? "+" : ""}${Math.round(diffPercent)}%)`,
        colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/35",
        message:
          "Desviación del 10%-20%. Indica el motivo del ajuste.",
      };
    }

    return {
      status: "green" as const,
      label: "Zona Óptima · Prescripción Cumplida",
      colorClass: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
      message: "Carga precisa según el plan del coach.",
    };
  })();

  const handleComplete = () => {
    const finalKg = toKg(actualWeight);
    onComplete(finalKg, reps);
  };

  const intensityConfig = (() => {
    switch (intensity) {
      case "relax":
        return {
          label: "Modo Relax",
          rpe: "RPE 5-6",
          emoji: "🟢",
          icon: <Smile className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "failure":
        return {
          label: "Fallo Muscular",
          rpe: "RPE 9-10",
          emoji: "🔴",
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
        };
      case "medium":
      default:
        return {
          label: "Intensidad Media",
          rpe: "RPE 7-8",
          emoji: "🟡",
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  })();

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#12141a] rounded-[26px] border border-white/[0.06] shadow-[0_14px_34px_rgba(0,0,0,0.45)] animate-in slide-in-from-bottom-2 duration-200">
      {/* ── Top Row: Integrated Set Pills + RPE + KG/LBS Toggle ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: totalSets }, (_, i) => {
            const sNum = i + 1;
            const done = loggedSets.some((s) => s.set === sNum && s.completed);
            const active = sNum === setNumber;
            return (
              <button
                key={sNum}
                type="button"
                onClick={() => onSelectSet?.(i)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 border",
                  active
                    ? "bg-white text-black border-white font-black shadow-xs"
                    : done
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-[#090b10] text-neutral-400 border-white/[0.06] hover:text-white",
                )}
              >
                {done && (
                  <span
                    className={cn(
                      "text-[10px] font-black",
                      active ? "text-emerald-700" : "text-emerald-400",
                    )}
                  >
                    ✓
                  </span>
                )}
                <span>Serie {sNum}</span>
              </button>
            );
          })}
          <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1 ml-1 shrink-0">
            {intensityConfig.emoji} {intensityConfig.rpe}
          </span>
        </div>

        {/* KG / LBS Pill Switch */}
        <div className="flex items-center bg-[#090b10] border border-white/[0.08] rounded-full p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => handleToggleUnit("kg")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              unit === "kg"
                ? "bg-white text-black font-black"
                : "text-neutral-400 hover:text-white",
            )}
          >
            KG
          </button>
          <button
            type="button"
            onClick={() => handleToggleUnit("lbs")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              unit === "lbs"
                ? "bg-white text-black font-black"
                : "text-neutral-400 hover:text-white",
            )}
          >
            LBS
          </button>
        </div>
      </div>

      {/* ── Sleek Semáforo Status Bar (Compact when Green, Expandable when Yellow/Red) ── */}
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2.5 border transition-all flex flex-col gap-1",
          semaphore.colorClass,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {semaphore.status === "green" && (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {semaphore.status === "yellow" && (
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            {semaphore.status === "red" && (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
            )}
            <span className="text-xs font-bold truncate">
              {semaphore.label}
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 border border-white/10 shrink-0">
            Semáforo
          </span>
        </div>

        {semaphore.status !== "green" && (
          <p className="text-[11px] opacity-90 leading-snug">
            {semaphore.message}
          </p>
        )}

        {semaphore.status === "yellow" && (
          <div className="mt-1.5 pt-2 border-t border-amber-500/25 flex flex-wrap gap-1.5">
            {[
              "Máquina con otro ratio",
              "Otro salto de mancuerna",
              "Fatiga / Readiness",
              "Más fuerza hoy",
            ].map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setAdjustmentReason(reason)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border",
                  adjustmentReason === reason
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                    : "bg-black/40 text-amber-200 border-amber-500/20 hover:bg-black/60",
                )}
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 1: Carga Sugerida vs Carga Real ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Carga Sugerida */}
        <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-[#090b10] border border-white/[0.06]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3 h-3 text-neutral-500" /> Sugerida
            </span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase">
              Meta: {targetReps}
            </span>
          </div>

          <div className="py-2 text-center">
            {isBodyweight ? (
              <div>
                <span className="text-xl font-display font-black text-white">
                  Corporal
                </span>
                <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
                  Autocarga
                </p>
              </div>
            ) : (
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-display font-black text-white tabular-nums">
                  {suggestedDisplay}
                </span>
                <span className="text-xs font-bold text-neutral-400 ml-1">
                  {unit}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center gap-1 pt-1 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setActualWeight(suggestedDisplay)}
              className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-bold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              Igualar a Meta
            </button>
          </div>
        </div>

        {/* Carga Real Editable */}
        <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-[#161922] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              🏋️ Carga Real
            </span>
            <span className="text-[9px] font-bold text-cyan-400 uppercase">
              Editable
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? -2.5 : -5)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/10 active:scale-95 transition cursor-pointer"
              aria-label="Restar peso"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-display font-black text-white tabular-nums">
                {actualWeight ?? 0}
              </span>
              <span className="text-xs font-bold text-neutral-400 ml-0.5">
                {unit}
              </span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 2.5 : 5)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/10 active:scale-95 transition cursor-pointer"
              aria-label="Sumar peso"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <div className="flex justify-center items-center gap-1.5 pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 1 : 2.5)}
              className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-bold text-neutral-300 hover:bg-white/15 transition cursor-pointer"
            >
              +{unit === "kg" ? "1" : "2.5"}
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 2.5 : 5)}
              className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-bold text-neutral-300 hover:bg-white/15 transition cursor-pointer"
            >
              +{unit === "kg" ? "2.5" : "5"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Reps Logradas & RIR Percibido ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-[#090b10] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              🔄 Reps Logradas
            </span>
            <span className="text-[10px] font-semibold text-neutral-500 tabular-nums">
              Meta: {defaultTargetReps}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 py-0.5">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/10 active:scale-95 transition cursor-pointer"
              aria-label="Restar reps"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <span className="text-2xl sm:text-3xl font-display font-black text-white tabular-nums">
              {reps}
            </span>

            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/10 active:scale-95 transition cursor-pointer"
              aria-label="Sumar reps"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between p-3 rounded-2xl bg-[#090b10] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              🎯 RIR
            </span>
            <span className="text-[9px] font-semibold text-neutral-500 uppercase">
              {rir === 0 ? "Al Fallo" : `${rir} reserva`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 py-0.5">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRir(val)}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  rir === val
                    ? val === 0
                      ? "bg-rose-500 text-white border-rose-400 font-black"
                      : "bg-white text-slate-950 border-white font-black"
                    : "bg-white/[0.04] text-neutral-400 border-white/[0.08] hover:text-white",
                )}
              >
                {val === 0 ? "0" : val === 3 ? "3+" : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Joint Pain Reporter ── */}
      <div>
        {!showJointPicker ? (
          <button
            type="button"
            onClick={() => setShowJointPicker(true)}
            className="w-full py-2 px-3 rounded-xl border border-white/[0.06] bg-[#090b10] hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 text-neutral-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
            <span>Notificar molestia articular en esta serie</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <HeartCrack className="w-3 h-3 text-rose-400" /> Articulación con molestia:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedJointPain(null);
                  setShowJointPicker(false);
                }}
                className="text-[10px] text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "Hombro",
                "Rodilla",
                "Lumbar",
                "Codo",
                "Muñeca",
                "Cadera",
                "Cuello",
              ].map((joint) => (
                <button
                  key={joint}
                  type="button"
                  onClick={() => setSelectedJointPain(joint)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border",
                    selectedJointPain === joint
                      ? "bg-rose-500 text-white border-rose-400 font-black"
                      : "bg-black/50 text-rose-200 border-rose-500/20 hover:bg-rose-500/20",
                  )}
                >
                  {joint}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Primary Submit CTA (Vital Fit Labs Electric Cyan) ── */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className={cn(
          "w-full py-3.5 px-5 rounded-2xl font-display font-black uppercase tracking-wider text-xs sm:text-sm active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer",
          isLogged
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            : isNewPR
              ? "bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
              : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(0,240,255,0.35)]",
        )}
      >
        {isLogged ? (
          <>
            <RefreshCw className="w-4 h-4 stroke-[3]" />
            <span>
              Actualizar Serie {setNumber} ({actualWeight ?? 0} {unit} · {reps} Reps)
            </span>
          </>
        ) : isNewPR ? (
          <>
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            <span>
              ¡Completar Serie {setNumber} · Nuevo PR ({actualWeight ? `${actualWeight} ${unit} × ` : ""}{reps} Reps)!
            </span>
          </>
        ) : isShieldMode ? (
          <>
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>
              Completar Serie {setNumber} · Descarga ({actualWeight ? `${actualWeight} ${unit} × ` : ""}{reps} Reps)
            </span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Completar Serie {setNumber} ({actualWeight ?? 0} {unit} · {reps} Reps)
            </span>
          </>
        )}
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-1 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          {isLogged
            ? "Ir a la siguiente serie"
            : "Saltar esta serie sin registrar"}
        </button>
      )}
    </div>
  );
}
