"use client";

import { cn } from "@/shared/lib/utils";
import { SetLogger } from "./SetLogger";
import { RestTimer } from "./RestTimer";
import type { Exercise } from "../types/routines.types";

export function ExerciseCard({
  exercise,
  activeSetIndex,
  completedSetCount,
  restRemaining,
  isSaving,
  onSetComplete,
  onRestFinish,
  onRestSkip,
}: {
  exercise: Exercise;
  activeSetIndex: number;
  completedSetCount: number;
  restRemaining: number;
  isSaving: boolean;
  onSetComplete: (setIndex: number, weight: number | null, reps: number | null) => void;
  onRestFinish: () => void;
  onRestSkip: () => void;
}) {
  const isResting = restRemaining > 0;
  const allDone = completedSetCount >= exercise.sets;

  return (
    <div className="flex flex-col gap-5 px-4 animate-in fade-in duration-300">
      {/* Exercise header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
          {exercise.name}
        </h2>
        <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest">
          {exercise.sets} series · {exercise.reps} reps
          {exercise.observations ? ` · ${exercise.observations}` : ""}
        </p>
      </div>

      {/* Set dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-full transition-all duration-300",
              i < completedSetCount
                ? "bg-primary-500 scale-110"
                : i === activeSetIndex
                  ? "bg-primary-500/40 ring-2 ring-primary-500"
                  : "bg-slate-700",
            )}
          />
        ))}
        <span className="ml-3 text-xs font-bold text-slate-400 tabular-nums">
          {completedSetCount}/{exercise.sets}
        </span>
      </div>

      {/* Rest timer or SetLogger */}
      {isResting ? (
        <RestTimer
          duration={exercise.restSeconds}
          remaining={restRemaining}
          onFinish={onRestFinish}
          onSkip={onRestSkip}
        />
      ) : allDone ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-bold text-primary-400 uppercase tracking-wider">
            Ejercicio completado
          </p>
        </div>
      ) : (
        <SetLogger
          setNumber={activeSetIndex + 1}
          totalSets={exercise.sets}
          previousWeight={null}
          previousReps={null}
          disabled={isSaving}
          onComplete={(w, r) => onSetComplete(activeSetIndex, w, r)}
        />
      )}
    </div>
  );
}
