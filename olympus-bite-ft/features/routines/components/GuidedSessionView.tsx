"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { CaloriesBurnedTracker } from "./CaloriesBurnedTracker";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function GuidedSessionView({
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
  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);

  const exercises = day.exercises;
  const exercise = exercises[exerciseIndex];

  // Load exercise dictionary for GIF/instructions enrichment
  useEffect(() => {
    exerciseDictionaryService
      .getAll()
      .then(setDictionary)
      .catch(console.error);
  }, []);

  // Build a lookup map by lowercase name for fast matching
  const dictByName = useMemo(() => {
    const map = new Map<string, ExerciseDict>();
    dictionary.forEach((d) => map.set(d.name.toLowerCase(), d));
    return map;
  }, [dictionary]);

  // Enhanced dictionary lookup with fuzzy matching + muscle group fallback
  const getDictEntry = useCallback(
    (exerciseName: string, muscleGroup: string): ExerciseDict | null => {
      if (!exerciseName) return null;
      const q = exerciseName.toLowerCase().trim();

      // 1. Exact name match
      const exact = dictByName.get(q);
      if (exact) return exact;

      // 2. Substring match in dictionary names
      for (const d of dictionary) {
        const dName = d.name.toLowerCase();
        if (dName.includes(q) || q.includes(dName)) return d;
      }

      // 3. Substring match of individual words (e.g. "bench", "press", "curl", "squat")
      const words = q.split(/\s+/).filter((w) => w.length >= 3);
      if (words.length > 0) {
        for (const d of dictionary) {
          const dName = d.name.toLowerCase();
          if (words.some((word) => dName.includes(word))) return d;
        }
      }

      // 4. Fallback by muscleGroup
      if (muscleGroup) {
        const mgMatch = dictionary.find(
          (d) => d.muscleGroup === muscleGroup && d.gifUrl,
        );
        if (mgMatch) return mgMatch;
      }

      // 5. General fallback: first available exercise with GIF
      return dictionary.find((d) => d.gifUrl) ?? null;
    },
    [dictByName, dictionary],
  );

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
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-8 text-center animate-in fade-in duration-500 min-h-[85vh]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-amber-400 shadow-[0_0_50px_rgba(234,88,12,0.5)]">
          <CheckCircle2 className="h-12 w-12 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            ¡Rutina completada!
          </h2>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            {day.focusArea} · Semana {weekNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 rounded-2xl bg-gradient-to-r from-primary-500 to-amber-500 px-10 py-4 text-base font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-primary-500/30 active:scale-95 transition-all"
        >
          Volver a Rutinas
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  const completedSetCount = getCompletedCount(exercise.id);
  const currentDictEntry = getDictEntry(exercise.name, exercise.muscleGroup);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-screen overflow-y-auto scrollbar-none bg-[#0d0e12] justify-between pb-4">
      {/* Mobile Clean Top Header */}
      <div className="sticky top-0 z-40 bg-[#0d0e12]/95 backdrop-blur-xl border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white hover:bg-white/15 active:scale-95 transition-all"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-primary-400 truncate">
                {day.focusArea}
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Sem. {weekNumber}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-black tabular-nums text-white shrink-0">
            {progress}%
          </span>
        </div>

        {/* Exercise Pills Carousel */}
        <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-none">
          {exercises.map((ex, idx) => {
            const done = getCompletedCount(ex.id) >= ex.sets;
            const active = idx === exerciseIndex;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setExerciseIndex(idx);
                  setSetIndex(0);
                  setRestRemaining(0);
                }}
                className={cn(
                  "shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5",
                  active
                    ? "bg-primary-500 border-primary-500 text-slate-950 shadow-md shadow-primary-500/30"
                    : done
                      ? "bg-primary-500/15 border-primary-500/30 text-primary-400"
                      : "bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white",
                )}
              >
                {done && <span>✓</span>}
                <span className="truncate max-w-[110px]">{ex.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exercise Centered View */}
      <div className="flex-1 flex flex-col justify-center py-2">
        <ExerciseCard
          exercise={exercise}
          activeSetIndex={setIndex}
          completedSetCount={completedSetCount}
          restRemaining={restRemaining}
          isSaving={isSaving}
          onSetComplete={handleSetComplete}
          onRestFinish={handleRestFinish}
          onRestSkip={handleRestSkip}
          dictEntry={currentDictEntry}
        />
      </div>

      {/* Calories Burned Tracker Footer */}
      <div className="px-2">
        <CaloriesBurnedTracker
          muscleGroups={muscleGroups}
          weightKg={userWeightKg}
          sessionStartTime={sessionStart}
        />
      </div>
    </div>
  );
}
