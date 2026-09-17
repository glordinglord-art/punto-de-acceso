"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { SetLogger } from "./SetLogger";
import { RestTimer } from "./RestTimer";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import type { Exercise, SetLogData } from "../types/routines.types";
import type { ExerciseDict } from "../services/exercise-dictionary.service";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { Info, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ExerciseCard({
  exercise,
  activeSetIndex,
  completedSetCount,
  loggedSets,
  restRemaining,
  isSaving,
  onSetComplete,
  onSelectSet,
  onSkipSet,
  onRestFinish,
  onRestSkip,
  dictEntry,
}: {
  exercise: Exercise;
  activeSetIndex: number;
  completedSetCount: number;
  /** Series ya guardadas de este ejercicio en la semana en curso */
  loggedSets: SetLogData[];
  restRemaining: number;
  isSaving: boolean;
  onSetComplete: (setIndex: number, weight: number | null, reps: number | null) => void;
  /** Salta a cualquier serie, este registrada o no */
  onSelectSet: (setIndex: number) => void;
  /** Avanza sin registrar; undefined cuando no hay a donde saltar */
  onSkipSet?: () => void;
  onRestFinish: () => void;
  onRestSkip: () => void;
  dictEntry?: ExerciseDict | null;
}) {
  const { user } = useAuth();
  const userUnit = (user?.weightUnitPreference === "lbs" ? "lbs" : "kg") as "kg" | "lbs";

  const isResting = restRemaining > 0;
  const allDone = completedSetCount >= exercise.sets;
  const [showGuide, setShowGuide] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);

  // Las series pueden completarse en desorden, asi que el estado se lee del log
  // real y no de un contador secuencial.
  const isSetLogged = (setNumber: number) =>
    loggedSets.some((s) => s.set === setNumber && s.completed);
  const activeSetLog =
    loggedSets.find((s) => s.set === activeSetIndex + 1) ?? null;

  const hasGuide = !!dictEntry?.gifUrl || !!dictEntry?.instructionsEs;
  const gifUrl = dictEntry?.gifUrl ?? null;
  const muscleInfo =
    MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];

  return (
    <div className="flex flex-col gap-3.5 px-4 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Exercise Media Card (Framed & Centered) */}
      {gifUrl ? (
        <div className="flex justify-center pt-1">
          <div className="relative w-[180px] h-[180px] rounded-3xl overflow-hidden bg-[#141620] border border-white/12 shadow-2xl p-2 shrink-0 group">
            {!gifLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifUrl}
              alt={exercise.name}
              className={`w-full h-full object-contain rounded-2xl transition-opacity duration-300 ${gifLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setGifLoaded(true)}
              loading="eager"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
              <span>{muscleInfo?.icon || "💪"} {muscleInfo?.label || exercise.muscleGroup}</span>
              <span className="text-emerald-400 font-extrabold">Técnica</span>
            </div>
          </div>
        </div>
      ) : (
        /* Stylized fallback card when no GIF is available */
        <div className="flex justify-center pt-1">
          <div className="w-[180px] h-[180px] rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-center p-4 text-center space-y-2 shrink-0">
            <span className="text-5xl">{muscleInfo?.icon || "🏋️"}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-red-400">
                {muscleInfo?.label || exercise.muscleGroup}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Técnica recomendada</p>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Title Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
            {exercise.name}
          </h2>
          {/* Intensity Pill */}
          {exercise.intensity === "failure" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20">
              🔴 Al Fallo
            </span>
          )}
          {exercise.intensity === "relax" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              🟢 Relax
            </span>
          )}
          {(!exercise.intensity || exercise.intensity === "medium") && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              🟡 Media
            </span>
          )}
        </div>

        {/* Goal metadata pills */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
            {exercise.sets} Series
          </span>
          <span>·</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
            {exercise.reps} Reps
          </span>
          <span>·</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-black">
            🔒 {exercise.targetWeight && exercise.targetWeight > 0 ? `${exercise.targetWeight} kg` : "Peso Corporal"}
          </span>
        </div>

        {exercise.observations && (
          <p className="text-xs text-slate-400 italic">
            &quot;{exercise.observations}&quot;
          </p>
        )}

        {hasGuide && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-red-400 border border-red-500/25 hover:bg-red-500/25 active:scale-95 transition-all shadow-md shadow-red-500/10 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              ¿Cómo hacerlo? (Guía Técnica)
            </button>
          </div>
        )}
      </div>

      {/* Navegador de series: cada pildora salta a esa serie, registrada o no */}
      <div className="flex flex-col items-center gap-1 py-1">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {Array.from({ length: exercise.sets }, (_, i) => {
            const done = isSetLogged(i + 1);
            const active = i === activeSetIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectSet(i)}
                aria-current={active ? "step" : undefined}
                aria-label={
                  done
                    ? `Serie ${i + 1} registrada. Tocar para corregirla`
                    : `Ir a la serie ${i + 1}`
                }
                className="group flex items-center justify-center px-1 py-2 cursor-pointer"
              >
                <span
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    done
                      ? "w-8 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                      : active
                        ? "w-8 bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse"
                        : "w-4 bg-white/10 border border-white/10 group-hover:bg-white/25",
                    active &&
                      done &&
                      "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#090a0f]"
                  )}
                />
              </button>
            );
          })}
          <span className="ml-1 text-xs font-black text-slate-300 tabular-nums uppercase tracking-wider">
            {completedSetCount}/{exercise.sets} listos
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Toca una serie para revisarla o corregirla
        </p>
      </div>

      {/* Descanso, o el registro de la serie. El ejercicio completado ya no
          esconde el formulario: se muestra un aviso y se sigue pudiendo corregir. */}
      {isResting ? (
        <RestTimer
          duration={exercise.restSeconds}
          remaining={restRemaining}
          onFinish={onRestFinish}
          onSkip={onRestSkip}
        />
      ) : (
        <>
          {allDone && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 animate-in zoom-in-95 duration-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
                <CheckCircle className="h-6 w-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                  ¡Ejercicio completado!
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Pasa al siguiente en la barra superior, o corrige aquí abajo
                  cualquier serie.
                </p>
              </div>
            </div>
          )}

          <SetLogger
            setNumber={activeSetIndex + 1}
            totalSets={exercise.sets}
            targetWeight={exercise.targetWeight}
            targetReps={exercise.reps}
            intensity={exercise.intensity}
            loggedWeight={activeSetLog?.weight ?? null}
            loggedReps={activeSetLog?.reps ?? null}
            isLogged={!!activeSetLog?.completed}
            defaultUnit={userUnit}
            disabled={isSaving}
            onComplete={(w, r) => onSetComplete(activeSetIndex, w, r)}
            onSkip={onSkipSet}
          />
        </>
      )}

      {/* Guide modal */}
      {dictEntry && (
        <ExerciseInfoModal
          exercise={dictEntry}
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
