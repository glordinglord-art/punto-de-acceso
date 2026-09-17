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
import type {
  Exercise,
  Routine,
  RoutineDay,
  SetLogData,
  WorkoutLog,
} from "../types/routines.types";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";

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
  // Aviso flotante: confirma correcciones y avisa de series pendientes
  const [flash, setFlash] = useState<string | null>(null);

  // Live session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart]);

  // El aviso flotante se limpia solo
  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(timeout);
  }, [flash]);

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

  const getSetsData = useCallback(
    (exId: string): SetLogData[] => {
      const log = logs.find(
        (l) => l.exerciseId === exId && l.weekNumber === weekNumber,
      );
      return log?.setsData ?? [];
    },
    [logs, weekNumber],
  );

  const getCompletedCount = useCallback(
    (exId: string) => getSetsData(exId).filter((s) => s.completed).length,
    [getSetsData],
  );

  // Con navegacion libre las series pueden registrarse en desorden, asi que la
  // siguiente pendiente se busca en el log y no con un contador secuencial.
  const firstPendingSetIndex = useCallback((ex: Exercise, sets: SetLogData[]) => {
    for (let i = 0; i < ex.sets; i += 1) {
      if (!sets.some((s) => s.set === i + 1 && s.completed)) return i;
    }
    return Math.max(0, ex.sets - 1);
  }, []);

  // Siguiente ejercicio con series pendientes a partir de fromIdx, dando la
  // vuelta al final para recuperar lo que se haya saltado antes. Devuelve -1
  // cuando ya no queda nada pendiente. La serie recien guardada se cuenta a
  // mano porque los logs del padre aun no se han refrescado en ese momento.
  const nextPendingExerciseIndex = useCallback(
    (fromIdx: number, justSavedExId: string, justSavedSet: number) => {
      const total = exercises.length;
      for (let step = 0; step < total; step += 1) {
        const i = (fromIdx + step) % total;
        const ex = exercises[i];
        const sets = getSetsData(ex.id);
        let done = sets.filter((s) => s.completed).length;
        if (
          ex.id === justSavedExId &&
          !sets.some((s) => s.set === justSavedSet && s.completed)
        ) {
          done += 1;
        }
        if (done < ex.sets) return i;
      }
      return -1;
    },
    [exercises, getSetsData],
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

    const wasAlreadyLogged = getSetsData(exercise.id).some(
      (s) => s.set === sIdx + 1 && s.completed,
    );

    await onSaveSet(exercise, sIdx + 1, weight, reps);

    // Correccion de una serie ya registrada: se queda donde esta, sin descanso
    // ni salto automatico, para poder seguir revisando el resto.
    if (wasAlreadyLogged) {
      setFlash(`Serie ${sIdx + 1} actualizada`);
      return;
    }

    // La sesion se cierra cuando no queda ninguna serie pendiente en ningun
    // ejercicio, sin importar el orden en que se hayan ido registrando.
    if (nextPendingExerciseIndex(0, exercise.id, sIdx + 1) === -1) {
      setShowSuccess(true);
      return;
    }

    // Siguiente serie pendiente de este ejercicio, saltando las ya registradas.
    const currentExSets = getSetsData(exercise.id);
    for (let i = sIdx + 1; i < exercise.sets; i += 1) {
      if (!currentExSets.some((s) => s.set === i + 1 && s.completed)) {
        setRestRemaining(exercise.restSeconds);
        setSetIndex(i);
        return;
      }
    }

    // Este ejercicio queda cerrado: al siguiente que tenga series pendientes.
    const nextExIdx = nextPendingExerciseIndex(
      (exerciseIndex + 1) % exercises.length,
      exercise.id,
      sIdx + 1,
    );
    if (nextExIdx === -1) {
      setShowSuccess(true);
      return;
    }

    const nextEx = exercises[nextExIdx];
    setRestRemaining(exercise.restSeconds);
    setExerciseIndex(nextExIdx);
    setSetIndex(firstPendingSetIndex(nextEx, getSetsData(nextEx.id)));

    // Si toca retroceder es porque antes se salto algo: conviene avisarlo.
    if (nextExIdx <= exerciseIndex) {
      setFlash(`Te quedan series pendientes en ${nextEx.name}`);
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
  const currentSets = getSetsData(exercise.id);
  const currentDictEntry = getDictEntry(exercise.name);

  // Ir a cualquier serie del ejercicio actual, este registrada o no.
  const handleSelectSet = (idx: number) => {
    setRestRemaining(0);
    setSetIndex(idx);
  };

  // Saltar avanza sin registrar nada: a la siguiente serie, o al siguiente
  // ejercicio. Siempre se puede volver desde las pildoras de serie.
  const skipTarget = (() => {
    if (setIndex + 1 < exercise.sets) {
      return { exerciseIdx: exerciseIndex, setIdx: setIndex + 1 };
    }
    if (exerciseIndex + 1 < exercises.length) {
      const nextEx = exercises[exerciseIndex + 1];
      return {
        exerciseIdx: exerciseIndex + 1,
        setIdx: firstPendingSetIndex(nextEx, getSetsData(nextEx.id)),
      };
    }
    return null;
  })();

  const handleSkipSet = skipTarget
    ? () => {
        setRestRemaining(0);
        setExerciseIndex(skipTarget.exerciseIdx);
        setSetIndex(skipTarget.setIdx);
      }
    : undefined;

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
                  setSetIndex(firstPendingSetIndex(ex, getSetsData(ex.id)));
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
          loggedSets={currentSets}
          restRemaining={restRemaining}
          isSaving={isSaving}
          onSetComplete={handleSetComplete}
          onSelectSet={handleSelectSet}
          onSkipSet={handleSkipSet}
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

      {/* Aviso flotante de correccion / series pendientes */}
      {flash && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-[#141620]/95 px-4 py-2.5 text-center shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <RefreshCw className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
              {flash}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
