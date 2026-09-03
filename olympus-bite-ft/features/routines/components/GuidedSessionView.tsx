"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { CaloriesBurnedTracker } from "./CaloriesBurnedTracker";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { findPreciseDictEntry } from "../utils/exercise-matching";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";
import { ArrowLeft, Trophy } from "lucide-react";

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);

  // Live session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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

  // Precision dictionary lookup: exact or confident match only, no random fallbacks
  const getDictEntry = useCallback(
    (exerciseName: string): ExerciseDict | null => {
      return findPreciseDictEntry(exerciseName, dictByName, dictionary);
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

  // Countdown for rest timer
  useEffect(() => {
    if (restRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restRemaining]);

  const handleSetComplete = async (
    sIdx: number,
    weight: number | null,
    reps: number | null,
  ) => {
    if (!exercise) return;
    await onSaveSet(exercise, sIdx + 1, weight, reps);

    const nextSetIdx = sIdx + 1;
    if (nextSetIdx < exercise.sets) {
      setRestRemaining(exercise.restSeconds);
      setSetIndex(nextSetIdx);
    } else {
      const nextExIdx = exerciseIndex + 1;
      if (nextExIdx < exercises.length) {
        setRestRemaining(exercise.restSeconds);
        setExerciseIndex(nextExIdx);
        const comp = getCompletedCount(exercises[nextExIdx].id);
        setSetIndex(comp < exercises[nextExIdx].sets ? comp : Math.max(0, exercises[nextExIdx].sets - 1));
      } else {
        setShowSuccess(true);
      }
    }
  };

  const handleRestFinish = () => setRestRemaining(0);
  const handleRestSkip = () => setRestRemaining(0);

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 p-6 text-center bg-[#090a0f] text-white animate-in fade-in duration-500 overflow-y-auto">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-primary-500 to-amber-500 shadow-[0_0_60px_rgba(239,68,68,0.5)]">
          <Trophy className="h-12 w-12 text-white stroke-[2.5]" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            ¡Entrenamiento Completado!
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day.focusArea} · Semana {weekNumber}
          </p>
          <p className="text-sm text-slate-300 mt-2">
            Completaste todas tus series con la exigencia fijada por tu entrenador. ¡Gran trabajo! 🏆
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full max-w-xs space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Tiempo total de sesión</p>
          <p className="text-2xl font-black text-white tabular-nums">{formatElapsed(elapsedSeconds)}</p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-2 rounded-2xl bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 px-10 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-500/30 active:scale-95 transition-all cursor-pointer"
        >
          Volver a Mis Rutinas
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  const completedSetCount = getCompletedCount(exercise.id);
  const currentDictEntry = getDictEntry(exercise.name);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-between overflow-y-auto scrollbar-none bg-[#090a0f] text-white select-none pb-12">
      {/* Top Header: Clean and Immersive (No clutter, covers nav bar & assistants) */}
      <div className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            aria-label="Salir de la sesión"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Salir</span>
          </button>

          {/* Session Timer & Focus */}
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-wider text-white truncate max-w-[170px]">
              {day.focusArea || "Entrenamiento"}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Progress Percentage Badge */}
          <div className="text-right">
            <span className="text-xs font-black tabular-nums text-white">
              {progress}%
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {completedSteps}/{totalSteps} series
            </p>
          </div>
        </div>

        {/* Top Mini Progress Bar */}
        <div className="mt-2.5 h-1 w-full max-w-lg mx-auto rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Exercise Pills Carousel */}
        <div className="flex gap-2 overflow-x-auto pt-2.5 max-w-lg mx-auto scrollbar-none">
          {exercises.map((ex, idx) => {
            const done = getCompletedCount(ex.id) >= ex.sets;
            const active = idx === exerciseIndex;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setExerciseIndex(idx);
                  const comp = getCompletedCount(exercises[idx].id);
                  setSetIndex(comp < exercises[idx].sets ? comp : Math.max(0, exercises[idx].sets - 1));
                  setRestRemaining(0);
                }}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer",
                  active
                    ? "bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 border-red-500 text-white shadow-lg shadow-red-500/30 font-black"
                    : done
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
                )}
              >
                {done ? (
                  <span className="text-emerald-400 font-extrabold">✓</span>
                ) : (
                  <span className="text-[10px]">
                    {ex.intensity === "failure" ? "🔴" : ex.intensity === "relax" ? "🟢" : "🟡"}
                  </span>
                )}
                <span className="truncate max-w-[120px]">#{idx + 1} {ex.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exercise Card Center Stage */}
      <div className="flex-1 flex flex-col justify-center py-4 my-auto">
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
      <div className="px-4 max-w-md mx-auto w-full pt-2">
        <CaloriesBurnedTracker
          muscleGroups={muscleGroups}
          weightKg={userWeightKg}
          sessionStartTime={sessionStart}
        />
      </div>
    </div>
  );
}
