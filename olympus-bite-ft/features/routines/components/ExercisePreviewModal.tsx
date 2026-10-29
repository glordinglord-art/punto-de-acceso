"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { formatRest } from "@/shared/lib/utils";
import type { Exercise, RoutineDay } from "../types/routines.types";
import type { ExerciseDict } from "../services/exercise-dictionary.service";
import { Target, Dumbbell, Info, Play, Sparkles } from "lucide-react";

interface ExercisePreviewModalProps {
  exercise: Exercise | null;
  dictEntry?: ExerciseDict | null;
  day?: RoutineDay | null;
  isOpen: boolean;
  onClose: () => void;
  onStartSession?: (day: RoutineDay) => void;
  weightUnit?: "kg" | "lbs";
}

export function ExercisePreviewModal({
  exercise,
  dictEntry,
  day,
  isOpen,
  onClose,
  onStartSession,
  weightUnit = "kg",
}: ExercisePreviewModalProps) {
  const [gifLoaded, setGifLoaded] = useState(false);

  if (!exercise) return null;

  const muscleInfo = MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];
  const activeGif = dictEntry?.gifUrl || exercise.gifUrl || null;
  const activeInstructions = dictEntry?.instructionsEs || exercise.instructionsEs || null;
  const steps = dictEntry?.instructionStepsEs ?? [];
  const hasInstructions = steps.length > 0 || (activeInstructions && activeInstructions.length > 0);

  const formattedWeight =
    exercise.targetWeight && exercise.targetWeight > 0
      ? weightUnit === "lbs"
        ? `${Math.round(exercise.targetWeight * 2.20462 * 2) / 2} lbs`
        : `${exercise.targetWeight} kg`
      : "Corporal";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="border border-white/10 bg-[#0c0e17]">
      <div className="space-y-5 -mt-1 pb-2">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                {muscleInfo?.icon || "🏋️"} {muscleInfo?.label || exercise.muscleGroup}
              </span>
              {dictEntry?.equipment && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 border border-white/15 text-xs font-semibold uppercase tracking-wider">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                  {dictEntry.equipment}
                </span>
              )}
              {exercise.intensity === "failure" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  🔴 Al Fallo
                </span>
              )}
              {exercise.intensity === "relax" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 Relax
                </span>
              )}
              {(!exercise.intensity || exercise.intensity === "medium") && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🟡 Media
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1.5 leading-snug">
              {exercise.name}
            </h2>
          </div>
        </div>

        {/* Media / GIF Section */}
        {activeGif ? (
          <div className="flex justify-center">
            <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl flex items-center justify-center">
              {!gifLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeGif}
                alt={exercise.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  gifLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setGifLoaded(true)}
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                Demo Técnica
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl">
              {muscleInfo?.icon || "🏋️"}
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Sigue las pautas de cadencia controlada y rango completo de movimiento prescritas por tu coach.
            </p>
          </div>
        )}

        {/* Prescribed Target Parameters */}
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prescripción de Entrenamiento</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Series
              </span>
              <span className="text-lg font-black text-white tabular-nums">
                {exercise.sets}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Repeticiones
              </span>
              <span className="text-lg font-black text-cyan-300 tabular-nums">
                {exercise.reps}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Carga Asignada
              </span>
              <span className="text-lg font-black text-amber-300 tabular-nums">
                {formattedWeight}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Descanso
              </span>
              <span className="text-lg font-black text-emerald-300 tabular-nums">
                {formatRest(exercise.restSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Coach Notes/Observations if present */}
        {exercise.observations && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <span>💬</span>
              <span>Indicación de tu Coach:</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
              &quot;{exercise.observations}&quot;
            </p>
          </div>
        )}

        {/* Technique & Execution steps */}
        {hasInstructions && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                Técnica y Ejecución Paso a Paso
              </p>
            </div>
            {steps.length > 0 ? (
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 items-start p-2.5 rounded-xl bg-white/[0.03] border border-white/6"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-black text-cyan-300 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            ) : activeInstructions ? (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeInstructions}
              </div>
            ) : null}
          </div>
        )}

        {/* Secondary Muscles */}
        {dictEntry?.secondaryMuscles && dictEntry.secondaryMuscles.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Músculos sinérgicos / secundarios
            </span>
            <div className="flex flex-wrap gap-1.5">
              {dictEntry.secondaryMuscles.map((m, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-white/6 px-2 py-0.5 text-xs text-slate-300 border border-white/10"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            Entendido
          </button>
          {onStartSession && day && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartSession(day);
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Entrenar Hoy</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
