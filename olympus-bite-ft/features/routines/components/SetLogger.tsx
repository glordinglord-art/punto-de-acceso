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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SetLoggerProps {
  setNumber: number;
  totalSets: number;
  targetWeight?: number | null;
  targetReps?: string;
  intensity?: "relax" | "medium" | "failure" | string | null;
  previousWeight?: number | null;
  previousReps?: number | null;
  defaultUnit?: "kg" | "lbs";
  disabled: boolean;
  onComplete: (weight: number | null, reps: number | null) => void;
}

const LBS_FACTOR = 2.20462;

export function SetLogger({
  setNumber,
  totalSets,
  targetWeight,
  targetReps = "10-12",
  intensity = "medium",
  previousWeight,
  previousReps,
  defaultUnit = "kg",
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

  const suggestedWeightKg = targetWeight ?? previousWeight ?? null;

  // Unit toggle state: 'kg' vs 'lbs'
  const [unit, setUnit] = useState<"kg" | "lbs">(defaultUnit);

  // Conversion helpers
  const toDisplay = (kg: number | null): number | null => {
    if (kg === null || kg === undefined) return null;
    if (unit === "kg") return kg;
    return Math.round(kg * LBS_FACTOR * 2) / 2; // step of 0.5 lbs
  };

  const toKg = (val: number | null): number | null => {
    if (val === null || val === undefined) return null;
    if (unit === "kg") return val;
    return Math.round((val / LBS_FACTOR) * 10) / 10;
  };

  // State: Actual Weight Lifted (stored in current display unit)
  const [actualWeight, setActualWeight] = useState<number | null>(
    toDisplay(suggestedWeightKg)
  );
  const [reps, setReps] = useState<number>(previousReps ?? defaultTargetReps);
  const [rir, setRir] = useState<number>(2); // Default RIR 2 (safe standard)

  // Reason selector for yellow deviation
  const [adjustmentReason, setAdjustmentReason] = useState<string | null>(null);

  // Joint pain reporter
  const [showJointPicker, setShowJointPicker] = useState<boolean>(false);
  const [selectedJointPain, setSelectedJointPain] = useState<string | null>(null);

  // Key tracking for set changes
  const [prevKey, setPrevKey] = useState({ setNumber, previousReps, defaultUnit });
  if (
    prevKey.setNumber !== setNumber ||
    prevKey.previousReps !== previousReps ||
    prevKey.defaultUnit !== defaultUnit
  ) {
    setPrevKey({ setNumber, previousReps, defaultUnit });
    setActualWeight(toDisplay(suggestedWeightKg));
    setReps(previousReps ?? defaultTargetReps);
    setAdjustmentReason(null);
    setSelectedJointPain(null);
    setShowJointPicker(false);
  }

  // Unit switch handler with conversion
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
    setActualWeight((prev) => Math.max(0, Math.round(((prev ?? 0) + delta) * 2) / 2));
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  // Evaluate Semaphore Status
  const suggestedDisplay = toDisplay(suggestedWeightKg);
  const isBodyweight = !suggestedWeightKg || suggestedWeightKg <= 0;

  const semaphore = (() => {
    if (selectedJointPain) {
      return {
        status: "red" as const,
        label: `Alerta: Molestia en ${selectedJointPain}`,
        colorClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        message: "Se ha registrado dolor articular. Se notificará al coach para descarga preventiva.",
      };
    }

    if (isBodyweight || !suggestedDisplay || !actualWeight) {
      return {
        status: "green" as const,
        label: "Zona Óptima / Carga Libre",
        colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        message: "Carga dentro del rango biomecánico seguro.",
      };
    }

    const diffPercent = ((actualWeight - suggestedDisplay) / suggestedDisplay) * 100;

    if (diffPercent > 20) {
      return {
        status: "red" as const,
        label: `Sobrecarga Crítica (+${Math.round(diffPercent)}%)`,
        colorClass: "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
        message: "Salto de carga >20%. Peligro de ego lifting y sobrecarga articular.",
      };
    }

    if (Math.abs(diffPercent) > 10) {
      return {
        status: "yellow" as const,
        label: `Ajuste Moderado (${diffPercent > 0 ? "+" : ""}${Math.round(diffPercent)}%)`,
        colorClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        message: "Desviación del 10%-20%. Por favor indica el motivo del ajuste.",
      };
    }

    return {
      status: "green" as const,
      label: "Zona Óptima / Prescripción Cumplida",
      colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      message: "Carga precisa según el plan metodológico del coach.",
    };
  })();

  const handleComplete = () => {
    const finalKg = toKg(actualWeight);
    onComplete(finalKg, reps);
  };

  // Intensity configuration
  const intensityConfig = (() => {
    switch (intensity) {
      case "relax":
        return {
          label: "Modo Relax",
          rpe: "RPE 5-6",
          emoji: "🟢",
          icon: <Smile className="w-4 h-4 text-emerald-400" />,
        };
      case "failure":
        return {
          label: "Fallo Muscular",
          rpe: "RPE 9-10",
          emoji: "🔴",
          icon: <Flame className="w-4 h-4 text-red-400 animate-pulse" />,
        };
      case "medium":
      default:
        return {
          label: "Intensidad Media",
          rpe: "RPE 7-8",
          emoji: "🟡",
          icon: <Zap className="w-4 h-4 text-amber-400" />,
        };
    }
  })();

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-black/70 rounded-3xl border border-white/12 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
      {/* Header: Set Number & Unit Selector Switch */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-xs font-black uppercase tracking-wider text-red-400 border border-red-500/30 shadow-sm">
            Serie {setNumber} de {totalSets}
          </span>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            {intensityConfig.emoji} {intensityConfig.rpe}
          </span>
        </div>

        {/* Dynamic Unit Switch [ KG | LBS ] */}
        <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => handleToggleUnit("kg")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              unit === "kg"
                ? "bg-red-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            KG
          </button>
          <button
            type="button"
            onClick={() => handleToggleUnit("lbs")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              unit === "lbs"
                ? "bg-red-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            LBS
          </button>
        </div>
      </div>

      {/* Semáforo Visual Card in Real-Time */}
      <div
        className={cn(
          "rounded-2xl p-3 border transition-all flex flex-col gap-1.5",
          semaphore.colorClass
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {semaphore.status === "green" && (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            {semaphore.status === "yellow" && (
              <Activity className="w-4 h-4 text-amber-400" />
            )}
            {semaphore.status === "red" && (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {semaphore.label}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 border border-white/10">
            Semáforo
          </span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed font-medium">
          {semaphore.message}
        </p>

        {/* Micro-Selector for Yellow Adjustment Reason */}
        {semaphore.status === "yellow" && (
          <div className="mt-2 pt-2 border-t border-amber-500/30 flex flex-col gap-1.5 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
              ¿A qué se debió el ajuste de carga?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Polea / Máquina con diferente ratio",
                "Mancuernas en otro incremento",
                "Fatiga acumulada / Readiness",
                "Mayor fuerza en el día",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setAdjustmentReason(reason)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border",
                    adjustmentReason === reason
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-extrabold"
                      : "bg-black/40 text-amber-200 border-amber-500/20 hover:bg-black/60"
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dual Columns: Carga Sugerida (Coach / Lectura) vs Carga Real (Input Interactivo) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pilar 1: Carga Sugerida (Coach / Solo Lectura) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" /> Carga Sugerida
            </span>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
              Lectura
            </span>
          </div>

          <div className="py-2 text-center">
            {isBodyweight ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Corporal
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  Autocarga
                </p>
              </div>
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                  {suggestedDisplay}
                </span>
                <span className="text-sm font-extrabold text-cyan-400 ml-1">
                  {unit}
                </span>
              </div>
            )}
          </div>

          <div className="text-center pt-1.5 border-t border-white/5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Meta: {targetReps} reps
            </p>
          </div>
        </div>

        {/* Pilar 2: Carga Real Levantada (Interactivo con Stepper) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.12)] relative">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              🏋️ Carga Real
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Editable
            </span>
          </div>

          {/* Stepper for weight */}
          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? -2.5 : -5)}
              disabled={disabled}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Restar peso"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-baseline justify-center">
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {actualWeight ?? 0}
              </span>
              <span className="text-xs font-bold text-red-400 ml-1">
                {unit}
              </span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 2.5 : 5)}
              disabled={disabled}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Sumar peso"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick shortcuts for weight */}
          <div className="flex justify-center items-center gap-1 pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={() => setActualWeight(suggestedDisplay)}
              className="px-2 py-0.5 rounded bg-red-500/20 text-[9px] font-black text-red-300 hover:bg-red-500/30 transition-colors uppercase tracking-wider cursor-pointer"
            >
              = Meta
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 1 : 2.5)}
              className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              +{unit === "kg" ? "1" : "2.5"}
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(unit === "kg" ? 2.5 : 5)}
              className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              +{unit === "kg" ? "2.5" : "5"}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Reps Logradas & RIR Selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Reps Stepper */}
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-black/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              🔄 Reps Logradas
            </span>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              Meta: {defaultTargetReps}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 py-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Restar reps"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              {reps}
            </span>

            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              aria-label="Sumar reps"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* RIR (Reps in Reserve) Selector */}
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-black/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              🎯 RIR Percibido
            </span>
            <span className="text-[9px] font-bold text-amber-400 uppercase">
              {rir === 0 ? "Fallo" : `${rir} en recámara`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 py-1">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRir(val)}
                className={cn(
                  "py-2 rounded-xl text-xs font-black transition-all cursor-pointer border",
                  rir === val
                    ? val === 0
                      ? "bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30"
                      : "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                )}
              >
                {val === 0 ? "Fallo" : val === 3 ? "3+" : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Joint Pain Notification Quick Button */}
      <div className="pt-0.5">
        {!showJointPicker ? (
          <button
            type="button"
            onClick={() => setShowJointPicker(true)}
            className="w-full py-2 px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
            <span>+ Notificar molestia o dolor articular en esta serie</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <HeartCrack className="w-3 h-3 text-rose-400" /> Selecciona la articulación afectada:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedJointPain(null);
                  setShowJointPicker(false);
                }}
                className="text-[10px] text-slate-400 hover:text-white"
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
                      ? "bg-rose-500 text-white border-rose-400 font-black shadow-md shadow-rose-500/30"
                      : "bg-black/50 text-rose-200 border-rose-500/20 hover:bg-rose-500/20"
                  )}
                >
                  {joint}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Submit Action Button */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white font-black uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>
          Completar Serie {setNumber} ({actualWeight ?? 0} {unit} · {reps} Reps)
        </span>
      </button>
    </div>
  );
}
