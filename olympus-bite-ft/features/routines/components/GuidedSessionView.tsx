"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { calcCalories } from "./CaloriesBurnedTracker";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { findPreciseDictEntry } from "../utils/exercise-matching";
import { analyzeExerciseProgression } from "../utils/vital-fit-labs-engine";
import type {
  Exercise,
  Routine,
  RoutineDay,
  SetLogData,
  WorkoutLog,
} from "../types/routines.types";
import { ArrowLeft, RefreshCw, Trophy, Flame } from "lucide-react";

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
  const [flash, setFlash] = useState<string | null>(null);
  const [prCount, setPrCount] = useState(0);
  const [achievementBanner, setAchievementBanner] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart]);

  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(timeout);
  }, [flash]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const exercises = day.exercises;
  const exercise = exercises[exerciseIndex];

  useEffect(() => {
    exerciseDictionaryService
      .getAll()
      .then((data) => setDictionary(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const dictByName = useMemo(() => {
    const map = new Map<string, ExerciseDict>();
    dictionary.forEach((d) => map.set(d.name.toLowerCase(), d));
    return map;
  }, [dictionary]);

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

  const firstPendingSetIndex = useCallback(
    (ex: Exercise, sets: SetLogData[]) => {
      for (let i = 0; i < ex.sets; i += 1) {
        if (!sets.some((s) => s.set === i + 1 && s.completed)) return i;
      }
      return Math.max(0, ex.sets - 1);
    },
    [],
  );

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
  const progress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const todayVolume = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      const log = logs.find(
        (l) => l.exerciseId === ex.id && l.weekNumber === weekNumber,
      );
      if (!log || !Array.isArray(log.setsData)) return acc;
      const exVol = log.setsData.reduce(
        (sAcc, s) => sAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
        0,
      );
      return acc + exVol;
    }, 0);
  }, [exercises, logs, weekNumber]);

  const prevWeekVolume = useMemo(() => {
    if (weekNumber <= 1) return 0;
    return exercises.reduce((acc, ex) => {
      const log = logs.find(
        (l) => l.exerciseId === ex.id && l.weekNumber === weekNumber - 1,
      );
      if (!log || !Array.isArray(log.setsData)) return acc;
      const exVol = log.setsData.reduce(
        (sAcc, s) => sAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
        0,
      );
      return acc + exVol;
    }, 0);
  }, [exercises, logs, weekNumber]);

  const volumeDeltaKg = todayVolume - prevWeekVolume;
  const volumeDeltaPct =
    prevWeekVolume > 0
      ? Math.round((volumeDeltaKg / prevWeekVolume) * 100)
      : 0;

  const muscleGroups = useMemo(
    () => [...new Set(exercises.map((ex) => ex.muscleGroup))],
    [exercises],
  );
  const burnedKcal = useMemo(
    () => calcCalories(muscleGroups, userWeightKg, elapsedSeconds),
    [muscleGroups, userWeightKg, elapsedSeconds],
  );

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

  const currentInsight = useMemo(() => {
    if (!exercise) return null;
    return analyzeExerciseProgression(exercise, logs, weekNumber);
  }, [exercise, logs, weekNumber]);

  const handleSetComplete = async (
    sIdx: number,
    weight: number | null,
    reps: number | null,
  ) => {
    if (!exercise) return;

    const wasAlreadyLogged = getSetsData(exercise.id).some(
      (s) => s.set === sIdx + 1 && s.completed,
    );

    if (!wasAlreadyLogged && currentInsight) {
      const w = weight ?? 0;
      const r = reps ?? 0;
      const e1Rm = w > 0 ? w * (1 + r / 30) : r;
      if (
        currentInsight.state !== "first_week" &&
        currentInsight.state !== "fatigue_shield_2w" &&
        e1Rm > currentInsight.bestE1RmKg + 0.05
      ) {
        setPrCount((prev) => prev + 1);
        setAchievementBanner(
          `🏆 ¡NUEVO RÉCORD PERSONAL en ${exercise.name}: ${w > 0 ? `${w}kg × ` : ""}${r} reps!`,
        );
        setTimeout(() => setAchievementBanner(null), 4500);
      } else if (currentInsight.state === "fatigue_shield_2w") {
        setAchievementBanner(
          `🛡️ ¡Recuperación Inteligente cumplida en Serie ${sIdx + 1}! Cero lesión, máxima calidad.`,
        );
        setTimeout(() => setAchievementBanner(null), 4000);
      }
    }

    await onSaveSet(exercise, sIdx + 1, weight, reps);

    if (wasAlreadyLogged) {
      setFlash(`Serie ${sIdx + 1} actualizada`);
      return;
    }

    if (nextPendingExerciseIndex(0, exercise.id, sIdx + 1) === -1) {
      setShowSuccess(true);
      return;
    }

    const currentExSets = getSetsData(exercise.id);
    for (let i = sIdx + 1; i < exercise.sets; i += 1) {
      if (!currentExSets.some((s) => s.set === i + 1 && s.completed)) {
        setRestRemaining(exercise.restSeconds);
        setSetIndex(i);
        return;
      }
    }

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

    if (nextExIdx <= exerciseIndex) {
      setFlash(`Te quedan series pendientes en ${nextEx.name}`);
    }
  };

  const handleRestFinish = () => setRestRemaining(0);
  const handleRestSkip = () => setRestRemaining(0);

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 p-6 text-center bg-[#07080b] text-white animate-in fade-in duration-500 overflow-y-auto">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-[0_0_40px_rgba(0,240,255,0.35)]">
          <Trophy className="h-12 w-12 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white">
            ¡Sesión Completada!
          </h2>
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            {day.focusArea} · Semana {weekNumber}
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            Completaste todas tus series con el sistema de autorregulación de
            Vital Fit Labs. ¡Gran trabajo, Atleta! 🏆
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
          <div className="p-3.5 rounded-[22px] bg-[#12141a] border border-white/[0.06] space-y-0.5 text-center">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">
              Tiempo
            </p>
            <p className="text-lg font-black text-white tabular-nums">
              {formatElapsed(elapsedSeconds)}
            </p>
          </div>
          <div className="p-3.5 rounded-[22px] bg-amber-500/10 border border-amber-500/30 space-y-0.5 text-center">
            <p className="text-[10px] font-bold text-amber-300 uppercase">
              Récords PR
            </p>
            <p className="text-lg font-black text-amber-400 tabular-nums">
              🏆 {prCount}
            </p>
          </div>
          <div className="p-3.5 rounded-[22px] bg-[#12141a] border border-white/[0.06] space-y-0.5 text-center">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">
              Energía
            </p>
            <p className="text-lg font-black text-orange-400 tabular-nums">
              🔥 {Math.max(15, burnedKcal)}
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm p-4 rounded-[24px] bg-[#12141a] border border-white/[0.06] space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Tonelaje Movido Hoy:
            </span>
            <span className="font-mono font-black text-white text-sm">
              {todayVolume > 0
                ? `${todayVolume.toLocaleString()} kg`
                : "Completado"}
            </span>
          </div>

          {weekNumber > 1 && prevWeekVolume > 0 && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Delta vs Semana {weekNumber - 1}:
              </span>
              <span
                className={cn(
                  "font-mono font-black text-sm",
                  volumeDeltaKg > 0 ? "text-emerald-400" : "text-amber-400",
                )}
              >
                {volumeDeltaKg > 0
                  ? `+${volumeDeltaKg} kg (+${volumeDeltaPct}%) 🚀`
                  : `${volumeDeltaKg} kg (${volumeDeltaPct}%)`}
              </span>
            </div>
          )}

          <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
            {volumeDeltaKg > 0
              ? `¡Excelente sobrecarga progresiva! Moviste +${volumeDeltaKg} kg más que la semana pasada.`
              : `Consolidación de técnica y estímulo completado para la Semana ${weekNumber}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-1 w-full max-w-sm rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-8 py-4 text-sm font-display font-black uppercase tracking-wider shadow-[0_0_24px_rgba(0,240,255,0.35)] active:scale-95 transition-all cursor-pointer"
        >
          Finalizar y Volver a Rutina
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  const completedSetCount = getCompletedCount(exercise.id);
  const currentSets = getSetsData(exercise.id);
  const currentDictEntry = getDictEntry(exercise.name);

  const handleSelectSet = (idx: number) => {
    setRestRemaining(0);
    setSetIndex(idx);
  };

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
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#07080b] text-white select-none pb-10">
      {/* Live Dopamine Toast Banner */}
      {achievementBanner && (
        <div className="fixed bottom-6 left-4 right-4 z-[70] max-w-md mx-auto rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-cyan-600 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {achievementBanner}
        </div>
      )}

      {/* ── FITIA + VITAL FIT LABS TOP STICKY BAR ── */}
      <div className="sticky top-0 z-40 bg-[#07080b]/95 backdrop-blur-2xl border-b border-white/[0.06] px-4 pt-3 pb-2.5">
        <div className="max-w-md mx-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Back / Exit Pill */}
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#12141a] hover:bg-white/10 border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              aria-label="Salir de la sesión"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Salir</span>
            </button>

            {/* Center: Focus Area + Live Timer + Burned Kcal */}
            <div className="text-center min-w-0 flex-1 px-1">
              <p className="text-xs font-display font-bold text-white truncate">
                {day.focusArea || "Entrenamiento"}
              </p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {formatElapsed(elapsedSeconds)}
                </span>
                {burnedKcal > 0 && (
                  <>
                    <span className="text-neutral-700 text-[10px]">•</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-orange-400 tabular-nums">
                      <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                      {burnedKcal} kcal
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Progress Badge */}
            <div className="text-right shrink-0">
              <span className="text-xs font-black tabular-nums text-cyan-400">
                {progress}%
              </span>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider tabular-nums">
                {completedSteps}/{totalSteps} series
              </p>
            </div>
          </div>

          {/* Thin Progress Line */}
          <div className="h-1 w-full rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Exercise Selector Strip (Zero Native Scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
            {exercises.map((ex, idx) => {
              const completedCount = getCompletedCount(ex.id);
              const done = completedCount >= ex.sets;
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
                    "shrink-0 rounded-2xl px-3 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95",
                    active
                      ? "bg-white text-black border-white font-black shadow-sm"
                      : done
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-[#12141a] border-white/[0.06] text-neutral-400 hover:text-white",
                  )}
                >
                  {done ? (
                    <span
                      className={cn(
                        "font-black text-xs",
                        active ? "text-emerald-700" : "text-emerald-400",
                      )}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        ex.intensity === "failure"
                          ? "bg-rose-500"
                          : ex.intensity === "relax"
                            ? "bg-emerald-400"
                            : "bg-amber-400",
                      )}
                    />
                  )}
                  <span className="font-mono text-[10px] opacity-70">
                    #{idx + 1}
                  </span>
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">
                    {ex.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-md",
                      active
                        ? "bg-black/10 text-black font-black"
                        : "bg-white/[0.06] text-neutral-400",
                    )}
                  >
                    {completedCount}/{ex.sets}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN WORKOUT STAGE ── */}
      <div className="flex-1 py-3">
        <ExerciseCard
          key={exercise.id}
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
          insight={currentInsight}
        />
      </div>

      {flash && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-[#12141a]/95 px-4 py-2.5 text-center shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
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
