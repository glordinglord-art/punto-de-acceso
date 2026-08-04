"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import type { ExerciseDict } from "../services/exercise-dictionary.service";
import { Dumbbell, Target, Info } from "lucide-react";

interface ExerciseInfoModalProps {
  exercise: ExerciseDict | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseInfoModal({
  exercise,
  isOpen,
  onClose,
}: ExerciseInfoModalProps) {
  const [gifLoaded, setGifLoaded] = useState(false);

  if (!exercise) return null;

  const muscleInfo =
    MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];
  const steps = exercise.instructionStepsEs ?? [];
  const hasInstructions =
    steps.length > 0 || (exercise.instructionsEs && exercise.instructionsEs.length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-5 -mt-2">
        {/* GIF animado */}
        {exercise.gifUrl && (
          <div className="flex justify-center">
            <div className="relative w-[220px] h-[220px] rounded-2xl overflow-hidden bg-black/30 border border-white/10 shadow-xl">
              {!gifLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${gifLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setGifLoaded(true)}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Nombre y badges */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
            {exercise.name}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {muscleInfo && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-400 border border-primary-500/20">
                <Target className="w-3 h-3" />
                {muscleInfo.icon} {muscleInfo.label}
              </span>
            )}
            {exercise.equipment && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                <Dumbbell className="w-3 h-3" />
                {exercise.equipment}
              </span>
            )}
            {exercise.target && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                {exercise.target}
              </span>
            )}
          </div>
        </div>

        {/* Músculos secundarios */}
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Músculos secundarios
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.secondaryMuscles.map((m, i) => (
                <span
                  key={i}
                  className="rounded-md bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-300 border border-white/5"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones paso a paso */}
        {hasInstructions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Cómo hacerlo
              </p>
            </div>
            {steps.length > 0 ? (
              <ol className="space-y-2.5 pl-1">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-400 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            ) : exercise.instructionsEs ? (
              <p className="text-sm text-slate-300 leading-relaxed pl-1">
                {exercise.instructionsEs}
              </p>
            ) : null}
          </div>
        )}

        {/* Atribución */}
        {exercise.attribution && (
          <p className="text-[10px] text-center text-slate-600 pt-2 border-t border-white/5">
            {exercise.attribution}
          </p>
        )}
      </div>
    </Modal>
  );
}
