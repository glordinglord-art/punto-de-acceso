"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { CaloriesBurnedTracker } from "./CaloriesBurnedTracker";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

export function GuidedSessionView({
  routine,
  day,
  weekNumber,
  logs,
  isSaving,
  userWeightKg,
  onBack,
  onSaveSet,
}: {
  routine: Routine;
  day: RoutineDay;
  weekNumber: number;
  logs: WorkoutLog[];
  isSaving: boolean;
  userWeightKg: number;
  onBack: () => void;
  onSaveSet: (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => Promise<void>;
}) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [sessionStart] = useState(() => Date.now());
  const [showSuccess, setShowSuccess] = useState(false);

  const exercises = day.exercises;
  const exercise = exercises[exerciseIndex];

  const getCompletedCount = useCallback(
    (exId: string) => {
      const log = logs.find(
        (l) => l.exerciseId === exId && l.weekNumber === weekNumber,
      );
      return log?.setsData?.filter((s) => s.completed).length ?? 0;
    },
    [logs, weekNumber],
  );

  const totalSteps = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSteps = exercises.reduce(
    (sum, ex) => sum + getCompletedCount(ex.id),
    0,
  );
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const muscleGroups = [...new Set(exercises.map((ex) => ex.muscleGroup))];

  useEffect(() => {
    if (restRemaining <= 0) return;
    const id = window.setInterval(
      () => setRestRemaining((n) => Math.max(n - 1, 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [restRemaining]);

  const handleSetComplete = async (
    sIdx: number,
    weight: number | null,
    reps: number | null,
  ) => {
    if (!exercise) return;
    const setNumber = sIdx + 1;
    await onSaveSet(exercise, setNumber, weight, reps);

    const nextSetIdx = sIdx + 1;

    if (nextSetIdx < exercise.sets) {
      setRestRemaining(exercise.restSeconds);
      setSetIndex(nextSetIdx);
    } else {
      const nextExIdx = exerciseIndex + 1;
      if (nextExIdx < exercises.length) {
        setRestRemaining(exercise.restSeconds);
        setExerciseIndex(nextExIdx);
        setSetIndex(0);
      } else {
        setShowSuccess(true);
      }
    }
  };

  const handleRestFinish = () => setRestRemaining(0);
  const handleRestSkip = () => setRestRemaining(0);

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-8 text-center animate-in fade-in duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500 shadow-2xl shadow-primary-500/40">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">¡Rutina completada!</h2>
          <p className="mt-2 text-sm text-slate-400">{day.focusArea} · Semana {weekNumber}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-2xl bg-primary-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/30"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  const completedSetCount = getCompletedCount(exercise.id);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/10">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/60 text-slate-300"
          aria-label="Volver"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {day.focusArea} · Sem. {weekNumber}
          </p>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700/50">
            <div
              className="h-1.5 rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-bold tabular-nums text-primary-400">{progress}%</span>
      </div>

      {/* Exercise tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {exercises.map((ex, idx) => {
          const done = getCompletedCount(ex.id) >= ex.sets;
          const active = idx === exerciseIndex;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => { setExerciseIndex(idx); setSetIndex(0); setRestRemaining(0); }}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                active
                  ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : done
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400",
              )}
            >
              {done && <span className="mr-1">✓</span>}
              {ex.name}
            </button>
          );
        })}
      </div>

      {/* Main exercise area */}
      <div className="flex-1 py-4">
        <ExerciseCard
          exercise={exercise}
          activeSetIndex={setIndex}
          completedSetCount={completedSetCount}
          restRemaining={restRemaining}
          isSaving={isSaving}
          onSetComplete={handleSetComplete}
          onRestFinish={handleRestFinish}
          onRestSkip={handleRestSkip}
        />
      </div>

      {/* Calories footer */}
      <CaloriesBurnedTracker
        muscleGroups={muscleGroups}
        weightKg={userWeightKg}
        sessionStartTime={sessionStart}
      />
    </div>
  );
}
