"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { cn, formatRest } from "@/shared/lib/utils";
import { routinesService } from "@/features/routines/services/routines.service";
import type {
  Routine,
  WorkoutLog,
  Exercise,
  RoutineDay,
  SetLogData,
} from "@/features/routines/types/routines.types";

const DAY_NAMES = [
  "",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombros",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Piernas",
  glutes: "Gluteos",
  abs: "Abdomen",
  cardio: "Cardio",
  full_body: "Full body",
  other: "General",
};

const WEEKDAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastOfMonth.getDate();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/* ── ExerciseTrackingCard ── */
function ExerciseTrackingCard({
  exercise,
  weekNumber,
  log,
  isSaving,
  onSave,
  onRemove,
}: {
  exercise: Exercise;
  weekNumber: number;
  log: WorkoutLog | undefined;
  isSaving: boolean;
  onSave: (setsData: SetLogData[], observations: string) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLogged = !!log;

  // Build initial sets from log or empty
  const buildInitialSets = (): SetLogData[] => {
    if (log?.setsData && log.setsData.length > 0) {
      return log.setsData;
    }
    return Array.from({ length: exercise.sets }, (_, i) => ({
      set: i + 1,
      weight: null,
      reps: null,
      rest: null,
      completed: false,
    }));
  };

  const [sets, setSets] = useState<SetLogData[]>(buildInitialSets);
  const [obs, setObs] = useState(log?.observations ?? "");

  // Reset when week/exercise changes
  useEffect(() => {
    setSets(buildInitialSets());
    setObs(log?.observations ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekNumber, exercise.id, log?.id]);

  const updateSet = (
    index: number,
    field: "weight" | "reps" | "rest",
    value: string,
  ) => {
    setSets((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const parsed =
          value === ""
            ? null
            : field === "reps"
              ? parseInt(value, 10)
              : parseFloat(value);
        const updated = { ...s, [field]: parsed };
        updated.completed =
          updated.weight !== null || updated.reps !== null;
        return updated;
      }),
    );
  };

  const toggleSetComplete = (index: number) => {
    setSets((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, completed: !s.completed } : s,
      ),
    );
  };

  const handleSave = () => {
    // Mark sets with any data as completed
    const finalSets = sets.map((s) => ({
      ...s,
      completed: s.completed || s.weight !== null || s.reps !== null,
    }));
    onSave(finalSets, obs);
    setExpanded(false);
  };

  // const completedSets = sets.filter(
  //   (s) => s.completed || s.weight !== null || s.reps !== null,
  // );

  // Collapsed logged view — shows summary
  if (isLogged && !expanded) {
    return (
      <div
        className="group rounded-2xl bg-primary-500/10 border border-primary-500/20 px-4 py-4 transition-all hover:bg-primary-500/20 cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-500 text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-400">
              {exercise.name}
            </p>
            {log.setsData && log.setsData.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {log.setsData
                  .filter((s) => s.completed || s.weight || s.reps)
                  .map((s) => (
                    <span
                      key={s.set}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-300 border border-primary-500/10"
                    >
                      S{s.set}: {s.weight ?? "—"}kg × {s.reps ?? "—"}
                      {s.rest != null && (
                        <span className="text-primary-500"> · {formatRest(s.rest)}</span>
                      )}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-primary-500/70 dark:text-primary-400/50">
                {log.repsDone ?? "Completado"}
              </p>
            )}
          </div>
          <svg
            className="h-4 w-4 text-primary-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Expanded view — form to log sets
  if (expanded || !isLogged) {
    return (
      <div
        className={cn(
          "rounded-2xl transition-all overflow-hidden",
          expanded
            ? "border border-primary-500/30 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:bg-[#1a1c23] dark:shadow-[0_0_20px_rgba(234,88,12,0.1)]"
            : "border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
        )}
      >
        {/* Header - clickable to expand/collapse */}
        <div
          className="flex items-center gap-3 px-3 py-3 cursor-pointer"
          onClick={() => {
            if (!isLogged) setExpanded(!expanded);
            else setExpanded(!expanded);
          }}
        >
          <button
            type="button"
            disabled={isSaving}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              isLogged
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-neutral-300 dark:border-neutral-600",
            )}
          >
            {isSaving ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
            ) : isLogged ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : null}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {exercise.name}
            </p>
            <p className="text-xs text-neutral-400">
              {exercise.sets}×{exercise.reps} · {formatRest(exercise.restSeconds)} desc.
            </p>
          </div>
          {exercise.observations && (
            <span
              className="text-[10px] text-neutral-400 max-w-20 truncate"
              title={exercise.observations}
            >
              💡 {exercise.observations}
            </span>
          )}
          <svg
            className={cn(
              "h-4 w-4 text-neutral-400 shrink-0 transition-transform",
              expanded && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Expanded form */}
        {expanded && (
          <div className="px-3 pb-3 space-y-3">
            {/* Sets */}
            <div className="space-y-2">
              {sets.map((s, i) => (
                <div
                  key={s.set}
                  className={cn(
                    "rounded-xl p-2.5 space-y-2 transition-colors",
                    s.completed || s.weight !== null || s.reps !== null
                      ? "bg-primary-50 dark:bg-primary-900/15"
                      : "bg-neutral-50 dark:bg-neutral-800/40",
                  )}
                >
                  {/* Set number + check */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        s.completed || s.weight !== null || s.reps !== null
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-400",
                      )}
                    >
                      Serie {s.set}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSetComplete(i)}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                        s.completed
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-primary-400",
                      )}
                    >
                      {s.completed && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Inputs row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 text-center">
                        🏋️ Peso
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          placeholder="—"
                          value={s.weight ?? ""}
                          onChange={(e) =>
                            updateSet(i, "weight", e.target.value)
                          }
                          className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-center font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-neutral-400 pointer-events-none">
                          kg
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 text-center">
                        🔄 Reps
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="—"
                        value={s.reps ?? ""}
                        onChange={(e) => updateSet(i, "reps", e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-center font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 text-center">
                        ⏱️ Descanso
                      </label>
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={String(Math.floor(exercise.restSeconds / 60))}
                            value={s.rest != null && Math.floor(s.rest / 60) > 0 ? Math.floor(s.rest / 60) : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              if (raw === "") {
                                const currentSecs = s.rest != null ? s.rest % 60 : 0;
                                updateSet(i, "rest", String(currentSecs));
                                return;
                              }
                              const mins = parseInt(raw, 10);
                              const currentSecs = s.rest != null ? s.rest % 60 : 0;
                              updateSet(i, "rest", String(mins * 60 + currentSecs));
                            }}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-sm text-center font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-neutral-400 pointer-events-none">
                            m
                          </span>
                        </div>
                        <span className="text-neutral-400 text-xs font-bold">:</span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={String(exercise.restSeconds % 60)}
                            value={s.rest != null && s.rest % 60 > 0 ? s.rest % 60 : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              if (raw === "") {
                                const currentMins = s.rest != null ? Math.floor(s.rest / 60) : 0;
                                updateSet(i, "rest", String(currentMins * 60));
                                return;
                              }
                              const secs = Math.min(59, parseInt(raw, 10));
                              const currentMins = s.rest != null ? Math.floor(s.rest / 60) : 0;
                              updateSet(i, "rest", String(currentMins * 60 + secs));
                            }}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-sm text-center font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-neutral-400 pointer-events-none">
                            s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Observations */}
            <input
              type="text"
              placeholder="Notas (opcional)..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : isLogged ? "Actualizar" : "Guardar"}
              </button>
              {isLogged && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                    setExpanded(false);
                  }}
                  disabled={isSaving}
                  className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  Quitar
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function GuidedRoutineSession({
  routine,
  day,
  weekNumber,
  logs,
  isSaving,
  onBack,
  onSaveSet,
  isReadOnly = false,
}: {
  routine: Routine;
  day: RoutineDay;
  weekNumber: number;
  logs: WorkoutLog[];
  isSaving: boolean;
  onBack: () => void;
  onSaveSet: (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => Promise<void>;
  isReadOnly?: boolean;
}) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const exercise = day.exercises[exerciseIndex];
  const totalSets = exercise?.sets ?? 0;
  const totalSteps = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const getExerciseStatus = useCallback((
    exId: string,
    currentSavingExId?: string,
    currentSavingSetNum?: number
  ) => {
    const log = logs.find((l) => l.exerciseId === exId && l.weekNumber === weekNumber);
    const setsData = log?.setsData ?? [];
    const ex = day.exercises.find((e) => e.id === exId);
    if (!ex) return { completedCount: 0, isFinished: true, firstIncompleteSetIndex: 0 };

    let completedCount = 0;
    let firstIncompleteSetIndex = -1;

    for (let sIdx = 0; sIdx < ex.sets; sIdx++) {
      const setNum = sIdx + 1;
      let isCompleted = false;

      if (exId === currentSavingExId && setNum === currentSavingSetNum) {
        isCompleted = true;
      } else {
        const setLog = setsData.find((sd) => sd.set === setNum);
        isCompleted = !!setLog?.completed;
      }

      if (isCompleted) {
        completedCount++;
      } else if (firstIncompleteSetIndex === -1) {
        firstIncompleteSetIndex = sIdx;
      }
    }

    return {
      completedCount,
      isFinished: completedCount === ex.sets,
      firstIncompleteSetIndex: firstIncompleteSetIndex === -1 ? 0 : firstIncompleteSetIndex,
    };
  }, [day.exercises, logs, weekNumber]);

  const completedSteps = day.exercises.reduce((sum, ex) => {
    const status = getExerciseStatus(ex.id);
    return sum + status.completedCount;
  }, 0);

  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  useEffect(() => {
    if (restRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setRestRemaining((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restRemaining]);

  if (isReadOnly && exercise) {
    const exerciseLog = logs.find((l) => l.exerciseId === exercise.id && l.weekNumber === weekNumber);
    const setsData = exerciseLog?.setsData ?? [];

    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Horizontal exercises tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {day.exercises.map((ex, index) => {
            const isActive = index === exerciseIndex;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setExerciseIndex(index)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                  isActive
                    ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                )}
              >
                <span>✅</span>
                <span>{ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* Exercise Header Card */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-white via-slate-50 to-white shadow-lg dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500">Resumen de Entrenamiento (Lectura)</p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none text-slate-900 dark:text-white sm:text-5xl">
                {day.focusArea}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {routine.name} · Semana {weekNumber} · {DAY_NAMES[day.dayNumber]}
              </p>
            </div>
            <Button variant="ghost" onClick={onBack}>Salir</Button>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Ejercicio {exerciseIndex + 1}/{day.exercises.length}
            </p>
            <h3 className="mt-2 text-3xl font-black uppercase text-slate-900 dark:text-white sm:text-4xl">
              {exercise.name}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="info">{exercise.muscleGroup}</Badge>
              <Badge variant="default">{exercise.sets} series</Badge>
              <Badge variant="default">{exercise.reps} reps objetivo</Badge>
            </div>
          </div>
        </Card>

        {/* Sets Summary Card */}
        <Card>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Series Registradas</h4>
          <div className="space-y-3">
            {Array.from({ length: exercise.sets }).map((_, idx) => {
              const setNum = idx + 1;
              const setLog = setsData.find((s) => s.set === setNum);
              return (
                <div
                  key={setNum}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {setNum}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Serie {setNum}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {setLog?.completed ? (
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {setLog.weight ?? "--"} kg × {setLog.reps ?? "--"} reps
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">No registrada</span>
                    )}
                    <span className="text-emerald-500 font-bold ml-1">✓</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => setExerciseIndex((prev) => Math.max(0, prev - 1))}
              disabled={exerciseIndex === 0}
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (exerciseIndex + 1 < day.exercises.length) {
                  setExerciseIndex((prev) => prev + 1);
                } else {
                  onBack();
                }
              }}
              className="flex-1"
            >
              {exerciseIndex + 1 < day.exercises.length ? "Siguiente Ejercicio" : "Finalizar Lectura"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showSuccessScreen) {
    return (
      <Card className="text-center py-10 px-6 border-primary-500/30 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-primary-600 animate-pulse" />
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950/50 text-5xl animate-bounce">
          🏆
        </div>
        <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
          ¡Buen trabajo!
        </h2>
        <p className="mt-2 text-primary-500 dark:text-primary-400 font-medium uppercase tracking-wider text-xs">
          Sesión Completada Exitosamente
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Has completado todas las series de tu entrenamiento de hoy:{" "}
          <strong className="text-slate-900 dark:text-white">{day.focusArea}</strong>.
          ¡Sigue así para alcanzar tus objetivos!
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 border border-slate-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{day.exercises.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Ejercicios</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 border border-slate-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalSteps}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Series Totales</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            variant="primary"
            onClick={onBack}
            className="px-8"
          >
            Finalizar y Guardar
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowSuccessScreen(false)}
            className="px-8"
          >
            Revisar Entrenamiento
          </Button>
        </div>
      </Card>
    );
  }

  if (!exercise) {
    return (
      <Card className="text-center">
        <p className="text-lg font-bold text-slate-900 dark:text-white">No hay ejercicios para este día.</p>
        <Button className="mt-4" variant="secondary" onClick={onBack}>Volver</Button>
      </Card>
    );
  }

  const isLastSetOfThisExercise = setIndex + 1 >= totalSets;
  const hasIncompleteExercises = day.exercises.some((ex) => {
    if (ex.id === exercise.id) return false;
    const status = getExerciseStatus(ex.id);
    return !status.isFinished;
  });

  const nextLabel = isLastSetOfThisExercise
    ? hasIncompleteExercises
      ? "Siguiente ejercicio"
      : "Finalizar rutina"
    : "Guardar serie y descansar";

  const handleSave = async (weight: number | null, reps: number | null) => {
    await onSaveSet(
      exercise,
      setIndex + 1,
      weight,
      reps,
    );

    const futureStatus = getExerciseStatus(exercise.id, exercise.id, setIndex + 1);

    if (!futureStatus.isFinished) {
      setSetIndex(futureStatus.firstIncompleteSetIndex);
      setRestRemaining(exercise.restSeconds);
      return;
    }

    let foundNext = false;
    for (let i = 1; i <= day.exercises.length; i++) {
      const nextIdx = (exerciseIndex + i) % day.exercises.length;
      const nextEx = day.exercises[nextIdx];
      const status = getExerciseStatus(nextEx.id, exercise.id, setIndex + 1);
      if (!status.isFinished) {
        setExerciseIndex(nextIdx);
        setSetIndex(status.firstIncompleteSetIndex);
        setRestRemaining(exercise.restSeconds);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setShowSuccessScreen(true);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {day.exercises.map((ex, index) => {
          const status = getExerciseStatus(ex.id);
          const isActive = index === exerciseIndex;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setExerciseIndex(index);
                setSetIndex(status.firstIncompleteSetIndex);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                isActive
                  ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : status.isFinished
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              )}
            >
              <span>{status.isFinished ? "✅" : `${status.completedCount}/${ex.sets}`}</span>
              <span>{ex.name}</span>
            </button>
          );
        })}
      </div>

      <Card className="relative overflow-hidden border-primary-400/20 bg-gradient-to-br from-white via-slate-50 to-white shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/70 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">Sesión guiada</p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none text-slate-900 dark:text-white sm:text-5xl">
              {day.focusArea}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {routine.name} · Semana {weekNumber} · {DAY_NAMES[day.dayNumber]}
            </p>
          </div>
          <Button variant="ghost" onClick={onBack}>Salir</Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Ejercicio {exerciseIndex + 1}/{day.exercises.length}
              </p>
              <h3 className="mt-2 text-3xl font-black uppercase text-slate-900 dark:text-white sm:text-4xl">
                {exercise.name}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="info">{exercise.muscleGroup}</Badge>
                <Badge variant="default">{exercise.sets} series</Badge>
                <Badge variant="default">{exercise.reps} reps objetivo</Badge>
                <Badge variant="default">{formatRest(exercise.restSeconds)} descanso</Badge>
              </div>
            </div>
            {exercise.observations && (
              <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
                {exercise.observations}
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:shadow-none flex flex-col justify-center items-center">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Serie actual</p>
            <p className="mt-2 font-display text-7xl font-black text-slate-900 dark:text-white leading-none">{setIndex + 1}</p>
            <p className="text-xs text-slate-500 mt-1">de {totalSets}</p>

            {/* Burbujas visuales de series */}
            <div className="mt-4 flex justify-center gap-1.5">
              {Array.from({ length: totalSets }).map((_, idx) => {
                const isCompleted = idx < setIndex;
                const isCurrent = idx === setIndex;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300",
                      isCompleted
                        ? "bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        : isCurrent
                          ? "bg-amber-500 animate-pulse scale-125 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                          : "bg-slate-200 dark:bg-white/10"
                    )}
                  />
                );
              })}
            </div>

            {restRemaining > 0 && (
              <div className="mt-4 w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/10 p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Descanso</p>
                <p className="mt-1 text-3xl font-black text-cyan-500 font-mono tracking-wider">{formatRest(restRemaining)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{completedSteps}/{totalSteps} series registradas</p>
      </Card>

      <GuidedSetForm
        key={`${exercise.id}-${weekNumber}-${setIndex}`}
        exercise={exercise}
        initialSet={logs
          .find((l) => l.exerciseId === exercise.id && l.weekNumber === weekNumber)
          ?.setsData?.find((set) => set.set === setIndex + 1)}
        isSaving={isSaving}
        nextLabel={nextLabel}
        restRemaining={restRemaining}
        onSkipRest={() => setRestRemaining(0)}
        onSave={handleSave}
      />
    </div>
  );
}

function GuidedSetForm({
  exercise,
  initialSet,
  isSaving,
  nextLabel,
  restRemaining,
  onSkipRest,
  onSave,
}: {
  exercise: Exercise;
  initialSet?: SetLogData;
  isSaving: boolean;
  nextLabel: string;
  restRemaining: number;
  onSkipRest: () => void;
  onSave: (weight: number | null, reps: number | null) => void;
}) {
  const [weight, setWeight] = useState(initialSet?.weight != null ? String(initialSet.weight) : "");
  const [reps, setReps] = useState(initialSet?.reps != null ? String(initialSet.reps) : "");

  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-white/10 dark:bg-[#14161a] transition-all duration-300">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Peso registrado</span>
          <div className="relative mt-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-3xl font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white transition-all duration-300"
              placeholder="0"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kg</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Repeticiones logradas</span>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-3xl font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white transition-all duration-300"
            placeholder={exercise.reps}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          fullWidth
          onClick={() => onSave(weight === "" ? null : Number(weight), reps === "" ? null : Number(reps))}
          loading={isSaving}
          className="flex-1 bg-primary-500 hover:bg-primary-600 hover:scale-[1.01] active:scale-100 transition-all font-bold uppercase tracking-wider text-sm h-14"
        >
          {nextLabel}
        </Button>
        {restRemaining > 0 && (
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={onSkipRest}
            className="hover:scale-[1.01] active:scale-100 transition-all font-bold uppercase tracking-wider text-sm h-14"
          >
            Saltar descanso
          </Button>
        )}
      </div>
    </div>
  );
}

export function ClientRoutinesView() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail" | "tracking" | "session">(
    "list",
  );
  const [sessionDay, setSessionDay] = useState<RoutineDay | null>(null);
  const [isReadOnlySession, setIsReadOnlySession] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null);
  const [routineView, setRoutineView] = useState<"cards" | "calendar">("cards");
  const [showInfo, setShowInfo] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showRoutineDropdown, setShowRoutineDropdown] = useState(false);
  const [weekCompletedToast, setWeekCompletedToast] = useState<string | null>(null);


  const lastRoutineId = useRef<string | null>(null);

  // New history and flexibility state variables
  const [activeTab, setActiveTab] = useState<"routine" | "history">("routine");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyRoutineFilter, setHistoryRoutineFilter] = useState("all");
  const [historyWeekFilter, setHistoryWeekFilter] = useState("all");
  const [showPrsModal, setShowPrsModal] = useState(false);

  const refreshLogs = useCallback(async (currentRoutinesList: Routine[]) => {
    if (!user) return;
    setLogsLoading(true);
    try {
      const allLogsPromises = currentRoutinesList.map((r) =>
        routinesService.getWorkoutLogs(r.id, user.id).catch(() => ({ data: [] }))
      );
      const logsResponses = await Promise.all(allLogsPromises);
      const combinedLogs = logsResponses.flatMap((res) => res.data ?? []);
      setLogs(combinedLogs);
      return combinedLogs;
    } catch {
      /* ignore */
    } finally {
      setLogsLoading(false);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await routinesService.getByClient(user.id);
      const data = res.data ?? [];
      setRoutines(data);
      // Auto-select active routine
      const active = data.find((r) => r.isActive) ?? data[0];
      if (active) {
        setSelectedRoutine(active);
        setView("detail");
        await refreshLogs(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user, refreshLogs]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const handleSelectRoutine = async (routine: Routine) => {
    setSelectedRoutine(routine);
    setView("detail");
    setActiveTab("routine"); // Reset active tab
    if (user) {
      await refreshLogs(routines);
    }
  };

  const handleActivateRoutine = async (routineId: string) => {
    try {
      await routinesService.activate(routineId);
      if (user) {
        const res = await routinesService.getByClient(user.id);
        const data = res.data ?? [];
        setRoutines(data);
        const updated = data.find((r) => r.id === routineId);
        if (updated) {
          setSelectedRoutine(updated);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al activar la rutina");
    }
  };

  const findExerciseById = useCallback(
    (exerciseId: string) => {
      for (const r of routines) {
        for (const day of r.days) {
          const ex = day.exercises.find((e) => e.id === exerciseId);
          if (ex) return ex;
        }
      }
      return null;
    },
    [routines]
  );

  const personalRecords = useMemo(() => {
    const prMap: Record<
      string,
      {
        exerciseId: string;
        name: string;
        muscleGroup: string;
        maxWeight: number;
        reps: number;
        date: string;
      }
    > = {};

    logs.forEach((log) => {
      const ex = findExerciseById(log.exerciseId);
      if (!ex) return;

      let logMaxWeight = 0;
      let matchingReps = 0;

      if (log.setsData && log.setsData.length > 0) {
        log.setsData.forEach((s) => {
          if (s.completed && s.weight !== null) {
            if (s.weight > logMaxWeight) {
              logMaxWeight = s.weight;
              matchingReps = s.reps ?? 0;
            }
          }
        });
      } else if (log.weight !== null && log.weight !== undefined) {
        logMaxWeight = log.weight;
        const repsMatch = log.repsDone?.match(/(\d+)\s*reps/);
        if (repsMatch) {
          matchingReps = parseInt(repsMatch[1], 10);
        }
      }

      if (logMaxWeight > 0) {
        const existing = prMap[ex.name];
        if (!existing || logMaxWeight > existing.maxWeight) {
          prMap[ex.name] = {
            exerciseId: log.exerciseId,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            maxWeight: logMaxWeight,
            reps: matchingReps,
            date: log.completedAt || log.createdAt,
          };
        }
      }
    });

    return Object.values(prMap).sort((a, b) => b.maxWeight - a.maxWeight);
  }, [logs, findExerciseById]);

  const groupedSessions = useMemo(() => {
    let filtered = logs;

    if (historyRoutineFilter !== "all") {
      const targetRoutine = routines.find((r) => r.id === historyRoutineFilter);
      const exerciseIds = new Set<string>();
      targetRoutine?.days.forEach((day) =>
        day.exercises.forEach((ex) => exerciseIds.add(ex.id))
      );
      filtered = filtered.filter((l) => exerciseIds.has(l.exerciseId));
    }

    if (historyWeekFilter !== "all") {
      filtered = filtered.filter((l) => l.weekNumber === Number(historyWeekFilter));
    }

    if (historySearchQuery.trim() !== "") {
      const q = historySearchQuery.toLowerCase();
      filtered = filtered.filter((l) => {
        const ex = findExerciseById(l.exerciseId);
        return ex?.name.toLowerCase().includes(q);
      });
    }

    const groups: Record<
      string,
      {
        dateStr: string;
        date: Date;
        logs: WorkoutLog[];
        routineName: string;
      }
    > = {};

    filtered.forEach((log) => {
      const dateVal = log.completedAt || log.createdAt;
      if (!dateVal) return;
      const d = new Date(dateVal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

      const r = routines.find((routine) =>
        routine.days.some((day) => day.exercises.some((ex) => ex.id === log.exerciseId))
      );
      const routineName = r ? r.name : "Rutina";

      if (!groups[key]) {
        groups[key] = {
          dateStr: key,
          date: d,
          logs: [],
          routineName,
        };
      }
      groups[key].logs.push(log);
    });

    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [logs, historyRoutineFilter, historyWeekFilter, historySearchQuery, routines, findExerciseById]);

  const activeRoutineExerciseIds = useMemo(() => {
    if (!selectedRoutine) return new Set<string>();
    const ids = new Set<string>();
    selectedRoutine.days.forEach((d) => d.exercises.forEach((ex) => ids.add(ex.id)));
    return ids;
  }, [selectedRoutine]);

  const activeRoutineLogs = useMemo(() => {
    return logs.filter((l) => activeRoutineExerciseIds.has(l.exerciseId));
  }, [logs, activeRoutineExerciseIds]);
  useEffect(() => {
    if (!loading && !logsLoading && selectedRoutine && lastRoutineId.current !== selectedRoutine.id) {
      lastRoutineId.current = selectedRoutine.id;
      const totalExercises = selectedRoutine.days.reduce(
        (s, d) => s + d.exercises.length,
        0,
      );
      let suggested = 1;
      for (let w = 1; w <= selectedRoutine.weekCount; w++) {
        const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === w);
        if (wLogs.length < totalExercises) {
          suggested = w;
          break;
        }
        suggested = selectedRoutine.weekCount;
      }
      setCurrentWeek(suggested);
    }
  }, [loading, logsLoading, selectedRoutine, activeRoutineLogs]);

  const checkAndAdvanceWeek = useCallback((weekNumber: number, currentLogs: WorkoutLog[]) => {
    if (!selectedRoutine) return;
    const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
    const totalExercises = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
    if (totalExercises === 0) return;

    const activeExIds = new Set(selectedRoutine.days.flatMap((d) => d.exercises.map((e) => e.id)));
    const weekLogs = currentLogs.filter(
      (l) => l.weekNumber === weekNumber && activeExIds.has(l.exerciseId)
    );

    if (weekLogs.length >= totalExercises) {
      if (weekNumber === currentWeek && weekNumber < selectedRoutine.weekCount) {
        if (view === "session") return;

        setCurrentWeek(weekNumber + 1);
        setWeekCompletedToast(`¡Completaste la Semana ${weekNumber}! Avanzamos a la Semana ${weekNumber + 1} 🚀`);
        setTimeout(() => {
          setWeekCompletedToast(null);
        }, 4500);
      }
    }
  }, [selectedRoutine, currentWeek, view]);

  const handleToggleLogExercise = async (
    exerciseId: string,
    weekNumber: number,
    isLogged: boolean,
  ) => {
    if (!user || !selectedRoutine) return;
    setSavingLog(exerciseId);
    try {
      if (isLogged) {
        await routinesService.unlogWorkout(
          selectedRoutine.id,
          user.id,
          exerciseId,
          weekNumber,
        );
      } else {
        await routinesService.logWorkout(selectedRoutine.id, user.id, {
          exerciseId,
          weekNumber,
          repsDone: "done",
        });
      }
      const updatedLogs = await refreshLogs(routines);
      if (updatedLogs) {
        checkAndAdvanceWeek(weekNumber, updatedLogs);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al actualizar el registro",
      );
    } finally {
      setSavingLog(null);
    }
  };

  const handleSaveExerciseLog = async (
    exercise: Exercise,
    weekNumber: number,
    setsData: SetLogData[],
    observations: string,
  ) => {
    if (!user || !selectedRoutine) return;
    setSavingLog(exercise.id);
    try {
      const completedSets = setsData.filter((s) => s.completed);
      const avgWeight =
        completedSets.length > 0
          ? completedSets.reduce((sum, s) => sum + (s.weight ?? 0), 0) /
            completedSets.length
          : undefined;
      const totalReps = completedSets.reduce(
        (sum, s) => sum + (s.reps ?? 0),
        0,
      );

      await routinesService.logWorkout(selectedRoutine.id, user.id, {
        exerciseId: exercise.id,
        weekNumber,
        weight: avgWeight || undefined,
        repsDone: `${completedSets.length}/${setsData.length} series · ${totalReps} reps`,
        observations: observations || undefined,
        setsData,
      });
      const updatedLogs = await refreshLogs(routines);
      if (updatedLogs) {
        checkAndAdvanceWeek(weekNumber, updatedLogs);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al guardar el registro",
      );
    } finally {
      setSavingLog(null);
    }
  };

  const isExerciseLogged = (exerciseId: string, weekNumber: number) => {
    return logs.some(
      (l) => l.exerciseId === exerciseId && l.weekNumber === weekNumber,
    );
  };
  const getExerciseLog = (exerciseId: string, weekNumber: number) => {
    return logs.find(
      (l) => l.exerciseId === exerciseId && l.weekNumber === weekNumber,
    );
  };

  const startGuidedSession = (day: RoutineDay, weekNumber: number, readOnly = false) => {
    setSessionDay(day);
    setCurrentWeek(weekNumber);
    setIsReadOnlySession(readOnly);
    setView("session");
  };

  const handleSessionSaveSet = async (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => {
    const existing = getExerciseLog(exercise.id, currentWeek);
    const baseSets = existing?.setsData?.length
      ? existing.setsData
      : Array.from({ length: exercise.sets }, (_, i) => ({
          set: i + 1,
          weight: null,
          reps: null,
          rest: exercise.restSeconds,
          completed: false,
        }));
    const nextSets = baseSets.map((set) =>
      set.set === setNumber
        ? {
            ...set,
            weight,
            reps,
            rest: exercise.restSeconds,
            completed: true,
          }
        : set,
    );
    await handleSaveExerciseLog(
      exercise,
      currentWeek,
      nextSets,
      existing?.observations ?? "",
    );
  };

  // Day of week number (1=Mon, 7=Sun)
  const todayDayNumber = new Date().getDay() === 0 ? 7 : new Date().getDay();

  if (loading) {
    return (
      <>
        <Header title="Mi Rutina" subtitle="Cargando..." />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      </>
    );
  }

  if (routines.length === 0) {
    return (
      <>
        <Header title="Mi Rutina" subtitle="Tu plan de entrenamiento" />
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <span className="text-3xl">💪</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Sin rutina asignada
          </h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Tu entrenador aún no te ha creado una rutina. Cuando lo haga,
            aparecerá aquí automáticamente.
          </p>
        </div>
      </>
    );
  }

  /* ── Calendar view ── */


  /* ── Tracking view ── */
  if (view === "tracking" && selectedRoutine) {
    const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
    const weekLogs = activeRoutineLogs.filter((l) => l.weekNumber === currentWeek);
    const totalExThisWeek = trainingDays.reduce(
      (s, d) => s + d.exercises.length,
      0,
    );
    const completedThisWeek = weekLogs.length;
    const weekProgress =
      totalExThisWeek > 0
        ? Math.round((completedThisWeek / totalExThisWeek) * 100)
        : 0;

    return (
      <>
        <Header
          title="Seguimiento"
          subtitle={`${selectedRoutine.name} · Semana ${currentWeek} de ${selectedRoutine.weekCount}`}
          action={
            <Button variant="ghost" size="md" onClick={() => setView("detail")}>
              ← Volver
            </Button>
          }
        />

        {/* Week selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {Array.from(
            { length: selectedRoutine.weekCount },
            (_, i) => i + 1,
          ).map((w) => {
            const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === w);
            const wTotal = trainingDays.reduce(
              (s, d) => s + d.exercises.length,
              0,
            );
            const wDone = wLogs.length;
            return (
              <button
                key={w}
                onClick={() => setCurrentWeek(w)}
                className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  currentWeek === w
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                Sem. {w}
                {wDone > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] ${
                      currentWeek === w
                        ? "text-neutral-300 dark:text-neutral-600"
                        : "text-neutral-400"
                    }`}
                  >
                    {wDone}/{wTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Week progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Progreso semana {currentWeek}
            </span>
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              {weekProgress}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-400 transition-all duration-500"
              style={{ width: `${weekProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {trainingDays.map((day) => (
            <Card key={day.dayNumber} padding="sm">
              <div className="px-2 pt-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {DAY_NAMES[day.dayNumber]}
                  </span>
                  <Badge variant="info">{day.focusArea}</Badge>
                  <span className="ml-auto text-xs text-neutral-400">
                    {
                      day.exercises.filter((ex) =>
                        isExerciseLogged(ex.id, currentWeek),
                      ).length
                    }
                    /{day.exercises.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-1">
                {day.exercises.map((ex) => (
                  <ExerciseTrackingCard
                    key={ex.id}
                    exercise={ex}
                    weekNumber={currentWeek}
                    log={getExerciseLog(ex.id, currentWeek)}
                    isSaving={savingLog === ex.id}
                    onSave={(setsData, observations) =>
                      handleSaveExerciseLog(
                        ex,
                        currentWeek,
                        setsData,
                        observations,
                      )
                    }
                    onRemove={() =>
                      handleToggleLogExercise(ex.id, currentWeek, true)
                    }
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  /* ── Guided session view ── */
  if (view === "session" && selectedRoutine && sessionDay) {
    return (
      <>
        <Header
          title="Comenzar rutina"
          subtitle={`${sessionDay.focusArea} · Semana ${currentWeek}`}
        />
        <GuidedRoutineSession
          routine={selectedRoutine}
          day={sessionDay}
          weekNumber={currentWeek}
          logs={activeRoutineLogs}
          isSaving={savingLog !== null}
          onBack={async () => {
            setView("detail");
            const updatedLogs = await refreshLogs(routines);
            if (updatedLogs) {
              const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
              const totalExercises = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
              const activeExIds = new Set(selectedRoutine.days.flatMap((d) => d.exercises.map((e) => e.id)));
              const weekLogs = updatedLogs.filter(
                (l) => l.weekNumber === currentWeek && activeExIds.has(l.exerciseId)
              );
              if (weekLogs.length >= totalExercises && totalExercises > 0 && currentWeek < selectedRoutine.weekCount) {
                setCurrentWeek(currentWeek + 1);
                setWeekCompletedToast(`¡Completaste la Semana ${currentWeek}! Avanzamos a la Semana ${currentWeek + 1} 🚀`);
                setTimeout(() => {
                  setWeekCompletedToast(null);
                }, 4500);
              }
            }
          }}
          onSaveSet={handleSessionSaveSet}
          isReadOnly={isReadOnlySession}
        />      </>
    );
  }

  /* ── Detail view ── */
  if (view === "detail" && selectedRoutine) {
    const totalExercises = selectedRoutine.days.reduce(
      (s, d) => s + d.exercises.length,
      0,
    );
    const totalLogs = totalExercises * selectedRoutine.weekCount;
    const completedLogs = activeRoutineLogs.length;
    const progress =
      totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    // Today's workout info
    const todayDay = selectedRoutine.days.find(
      (d) => d.dayNumber === todayDayNumber,
    );
    const todayIsTraining = todayDay && !todayDay.isRestDay;

    // Today's exercises completion for current week
    const todayLogged = todayDay
      ? todayDay.exercises.filter((ex) =>
          activeRoutineLogs.some(
            (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek,
          ),
        ).length
      : 0;

    // Calendar variables
    const calDays = getCalendarDays(calYear, calMonth);
    const todayDate = new Date();

    const getRoutineDayForDate = (date: Date) => {
      const jsDay = date.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      return selectedRoutine.days.find((d) => d.dayNumber === dayOfWeek);
    };

    const selectedDayInfo = calSelectedDate
      ? getRoutineDayForDate(calSelectedDate)
      : null;

    const formatSessionDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const formatPrDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <>
        {/* Compact unified header block */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            {routines.length > 1 && (
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/70 text-slate-700 dark:text-slate-350 cursor-pointer transition-colors"
                title="Ver todas las rutinas"
              >
                ←
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
                  Mi Rutina
                </h1>
                {selectedRoutine.isActive ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Activa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleActivateRoutine(selectedRoutine.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 px-2 py-0.5 text-[9px] font-bold text-amber-650 dark:text-amber-400 cursor-pointer transition-colors uppercase tracking-wider animate-pulse"
                    title="Establecer como activa"
                  >
                    ⚠️ Activar
                  </button>
                )}
                {selectedRoutine.isFavorable !== undefined &&
                  selectedRoutine.isFavorable !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider",
                        selectedRoutine.isFavorable
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-450"
                      )}
                    >
                      {selectedRoutine.isFavorable ? "👍 Favorable" : "👎 Desfavor."}
                    </span>
                  )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400/80 mt-0.5">
                {selectedRoutine.name}
              </p>
            </div>
          </div>

          {/* Tab Selector Segmented Control */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl dark:bg-neutral-800 border border-slate-200/30 dark:border-neutral-750 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("routine")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                activeTab === "routine"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              📋 Rutina
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              📊 Historial
            </button>
          </div>
        </div>

        {activeTab === "routine" ? (
          <>
            {/* Control Bar — 2 rows */}
            <div className="mb-4 p-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 space-y-2">
              {/* Row 1: Selectors */}
              <div className="flex items-center gap-2">
                {/* Routine selector */}
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => { setShowRoutineDropdown(!showRoutineDropdown); setShowWeekDropdown(false); }}
                    className="flex items-center gap-2 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    <span className="text-sm shrink-0">💪</span>
                    <span className="truncate flex-1">{selectedRoutine.name}</span>
                    <svg className={cn("h-3 w-3 text-neutral-400 transition-transform shrink-0", showRoutineDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showRoutineDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowRoutineDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900 z-20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 mb-1">
                          Seleccionar Rutina
                        </div>
                        {routines.map((r) => {
                          const isSelected = selectedRoutine.id === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => { handleSelectRoutine(r); setShowRoutineDropdown(false); }}
                              className={cn(
                                "flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-[11px] font-bold transition-colors cursor-pointer text-left",
                                isSelected
                                  ? "bg-primary-500 text-white"
                                  : r.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                              )}
                            >
                              <span className="flex items-center gap-1 truncate">
                                {r.isActive && <span>⭐️</span>}
                                <span className="truncate">{r.name}</span>
                              </span>
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ml-2",
                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-neutral-800 text-slate-400"
                              )}>
                                {r.days.filter((d) => !d.isRestDay).length}d · {r.weekCount}s
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Week selector */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => { setShowWeekDropdown(!showWeekDropdown); setShowRoutineDropdown(false); }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    <span>Sem. {currentWeek}</span>
                    {(() => {
                      const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === currentWeek);
                      const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
                      const wTotal = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
                      return (
                        <span className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400">
                          {wLogs.length}/{wTotal}
                        </span>
                      );
                    })()}
                    <svg className={cn("h-3 w-3 text-neutral-400 transition-transform", showWeekDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showWeekDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowWeekDropdown(false)} />
                      <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900 z-20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {Array.from({ length: selectedRoutine.weekCount }, (_, i) => i + 1).map((w) => {
                          const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === w);
                          const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
                          const wTotal = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
                          const wDone = wLogs.length;
                          const isSelected = currentWeek === w;
                          const isCompleted = wDone > 0 && wDone === wTotal;
                          return (
                            <button
                              key={w}
                              type="button"
                              onClick={() => { setCurrentWeek(w); setShowWeekDropdown(false); }}
                              className={cn(
                                "flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-[11px] font-bold transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-primary-500 text-white"
                                  : isCompleted
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                              )}
                            >
                              <span className="flex items-center gap-1">
                                {isCompleted && <span>✅</span>}
                                <span>Semana {w}</span>
                              </span>
                              {wTotal > 0 && (
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded",
                                  isSelected ? "bg-white/20 text-white" : isCompleted ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                                )}>
                                  {wDone}/{wTotal}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2: View toggle + Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0 p-0.5 bg-neutral-100 rounded-xl dark:bg-neutral-800 border border-neutral-200/30 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setRoutineView("calendar")}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      routineView === "calendar"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                    )}
                  >
                    📅 Calendario
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutineView("cards")}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      routineView === "cards"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                    )}
                  >
                    📋 Tarjetas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className={cn(
                    "flex h-7 px-3 items-center gap-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    showInfo
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50 dark:bg-slate-950/70 dark:border-white/10 dark:text-slate-400"
                  )}
                >
                  {showInfo ? "✕ Ocultar" : "ℹ️ Guía"}
                </button>
              </div>
            </div>

            {showInfo && (
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                {selectedRoutine.description && (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {selectedRoutine.description}
                  </p>
                )}
                <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-white/5 pt-2.5">
                  <span className="text-sm shrink-0">💡</span>
                  <p>
                    <strong>¿Cómo usar tu rutina?</strong> Puedes cambiar de semana arriba para planificar o registrar. Para entrenar hoy, pulsa el botón &quot;Comenzar&quot; o inicia cualquier día de la rutina. Si ya completaste un día, pulsa &quot;Comenzar&quot; o el día para ver tus series registradas en modo lectura.
                  </p>
                </div>
              </div>
            )}

            {todayIsTraining && todayDay && (
              (() => {
                const isTodayCompleted = todayDay.exercises.length > 0 && todayDay.exercises.every(ex =>
                  activeRoutineLogs.some(l => l.exerciseId === ex.id && l.weekNumber === currentWeek)
                );

                if (isTodayCompleted) {
                  return (
                    <div className="mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                            Entrenamiento de hoy completado
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {DAY_NAMES[todayDay.dayNumber]} — {todayDay.focusArea}
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-500/80 mt-1">
                            ¡Buen trabajo! Has completado tu entrenamiento de hoy. 🏆
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                          <span className="text-2xl">🏆</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className="mb-5 rounded-2xl bg-linear-to-r from-primary-500 to-primary-600 p-5 text-white cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all"
                    onClick={() => {
                      startGuidedSession(todayDay, currentWeek);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary-100 uppercase tracking-wider">
                          Entrenamiento de hoy
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {DAY_NAMES[todayDay.dayNumber]} — {todayDay.focusArea}
                        </p>
                        <p className="text-sm text-primary-100 mt-1">
                          {todayDay.exercises.length} ejercicios · Semana{" "}
                          {currentWeek}
                          {todayLogged > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">
                              {todayLogged}/{todayDay.exercises.length} completados
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                        <span className="text-2xl">💪</span>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
            {todayDay?.isRestDay && (
              <div className="mb-5 rounded-2xl bg-primary-50 dark:bg-primary-900/10 p-5 border border-primary-100 dark:border-primary-900/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧘</span>
                  <div>
                    <p className="font-semibold text-primary-800 dark:text-primary-300">
                      Hoy es día de descanso
                    </p>
                    {todayDay.restDayNote && (
                      <p className="text-sm text-primary-600 dark:text-primary-400/70">
                        {todayDay.restDayNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Progress Stats ── */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {progress}%
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mt-1">
                  Progreso
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mx-auto max-w-20">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {completedLogs}
                  <span className="text-xs font-medium text-neutral-400">
                    /{totalLogs}
                  </span>
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mt-1">
                  Ejercicios
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (todayIsTraining && todayDay) {
                    const isTodayCompleted = todayDay.exercises.length > 0 && todayLogged === todayDay.exercises.length;
                    startGuidedSession(todayDay, currentWeek, isTodayCompleted);
                    return;
                  }
                  setView("tracking");
                }}
                className="rounded-2xl bg-neutral-900 dark:bg-white p-4 text-center hover:opacity-90 transition-opacity cursor-pointer"
              >
                <p className="text-2xl font-extrabold text-white dark:text-neutral-900">
                  ✅
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-300 dark:text-neutral-500 mt-1">
                  Comenzar
                </p>
              </button>
            </div>

            {routineView === "calendar" ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Calendar Card */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {MONTH_NAMES[calMonth]} {calYear}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setCalMonth(todayDate.getMonth());
                          setCalYear(todayDate.getFullYear());
                          setCalSelectedDate(todayDate);
                        }}
                        className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 cursor-pointer"
                      >
                        Hoy
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Mes anterior"
                        onClick={() => {
                          if (calMonth === 0) {
                            setCalMonth(11);
                            setCalYear((y) => y - 1);
                          } else {
                            setCalMonth((m) => m - 1);
                          }
                          setCalSelectedDate(null);
                        }}
                        className="rounded-xl p-2 text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Mes siguiente"
                        onClick={() => {
                          if (calMonth === 11) {
                            setCalMonth(0);
                            setCalYear((y) => y + 1);
                          } else {
                            setCalMonth((m) => m + 1);
                          }
                          setCalSelectedDate(null);
                        }}
                        className="rounded-xl p-2 text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {WEEKDAY_LABELS.map((l) => (
                      <div
                        key={l}
                        className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400"
                      >
                        {l}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calDays.map((date, idx) => {
                      if (!date) return <div key={`e-${idx}`} className="p-1" />;

                      const rd = getRoutineDayForDate(date);
                      const hasTraining = rd && !rd.isRestDay;
                      const hasRest = rd?.isRestDay;
                      const isSelected =
                        calSelectedDate && isSameDay(date, calSelectedDate);
                      const isTodayDate = isSameDay(date, todayDate);

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => setCalSelectedDate(date)}
                          className={cn(
                            "relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-xl text-sm transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20"
                              : isTodayDate
                                ? "ring-2 ring-primary-500 font-semibold text-neutral-900 dark:text-white"
                                : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                          )}
                        >
                          {date.getDate()}
                          {(hasTraining || hasRest) && (
                            <div className="absolute bottom-1 flex gap-0.5">
                              {hasTraining && (
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    isSelected ? "bg-white" : "bg-primary-500",
                                  )}
                                />
                              )}
                              {hasRest && !hasTraining && (
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    isSelected ? "bg-white" : "bg-amber-400",
                                  )}
                                />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="h-2 w-2 rounded-full bg-primary-500" />{" "}
                      Entrenamiento
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="h-2 w-2 rounded-full bg-amber-400" /> Descanso
                    </div>
                  </div>
                </Card>

                {/* Selected day detail */}
                {calSelectedDate && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white capitalize">
                      {calSelectedDate.toLocaleDateString("es", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h3>

                    {selectedDayInfo ? (
                      selectedDayInfo.isRestDay ? (
                        <Card className="bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🧘</span>
                            <div>
                              <p className="font-semibold text-primary-800 dark:text-primary-300">
                                Día de descanso
                              </p>
                              {selectedDayInfo.restDayNote && (
                                <p className="text-sm text-primary-600 dark:text-primary-400/70">
                                  {selectedDayInfo.restDayNote}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ) : (
                        (() => {
                          const isDayCompleted = !selectedDayInfo.isRestDay && selectedDayInfo.exercises.length > 0 && selectedDayInfo.exercises.every(ex =>
                            activeRoutineLogs.some(l => l.exerciseId === ex.id && l.weekNumber === currentWeek)
                          );

                          return (
                            <Card
                              padding="sm"
                              className={cn(
                                "cursor-pointer hover:shadow-md transition-shadow",
                                isDayCompleted && "border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]"
                              )}
                              onClick={() => {
                                startGuidedSession(selectedDayInfo, currentWeek, isDayCompleted);
                              }}
                            >
                              <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="info">{selectedDayInfo.focusArea}</Badge>
                                  <span className="text-xs text-neutral-400">
                                    {selectedDayInfo.exercises.length} ejercicios
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isDayCompleted ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      ✓ Completado
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 text-xs font-bold text-primary-600 dark:text-primary-400">
                                      ▶ Iniciar
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 space-y-1.5">
                                {selectedDayInfo.exercises.map((ex) => {
                                  const isExLoggedCurrentWeek = activeRoutineLogs.some(
                                    (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek
                                  );

                                  return (
                                    <div
                                      key={ex.id}
                                      className={cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors border",
                                        isExLoggedCurrentWeek
                                          ? "bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10"
                                          : "bg-neutral-50 dark:bg-neutral-800/50 border-transparent",
                                      )}
                                    >
                                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                          {ex.name}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                          {ex.sets}×{ex.reps} · {formatRest(ex.restSeconds)}
                                        </p>
                                      </div>
                                      {isExLoggedCurrentWeek && (
                                        <span className="text-emerald-500 font-bold text-xs shrink-0 mr-1">✓</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          );
                        })()
                      )
                    ) : (
                      <Card className="border-dashed">
                        <div className="text-center py-4">
                          <span className="text-2xl">🏖️</span>
                          <p className="mt-1 text-sm text-neutral-500">
                            Sin actividad programada
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Days Cards List View */
              <div className="space-y-3">
                {selectedRoutine.days.map((day) => {
                  const isToday = day.dayNumber === todayDayNumber;
                  // Per-day completion across all weeks
                  const dayTotalLogs = day.isRestDay
                    ? 0
                    : day.exercises.reduce(
                        (count, ex) =>
                          count + activeRoutineLogs.filter((l) => l.exerciseId === ex.id).length,
                        0,
                      );
                  const dayTotalPossible = day.isRestDay
                    ? 0
                    : day.exercises.length * selectedRoutine.weekCount;

                  const isDayCompleted = !day.isRestDay && day.exercises.length > 0 && day.exercises.every(ex =>
                    activeRoutineLogs.some(l => l.exerciseId === ex.id && l.weekNumber === currentWeek)
                  );

                  return (
                    <Card
                      key={day.dayNumber}
                      padding="sm"
                      className={cn(
                        isToday && "ring-2 ring-primary-500/50",
                        !day.isRestDay &&
                          "cursor-pointer hover:shadow-md transition-shadow",
                        isDayCompleted && "border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]"
                      )}
                      onClick={
                        !day.isRestDay
                          ? () => {
                              startGuidedSession(day, currentWeek, isDayCompleted);
                            }
                          : undefined
                      }
                    >
                      <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            {DAY_NAMES[day.dayNumber]}
                          </span>
                          {day.isRestDay ? (
                            <Badge variant="default">🧘 Descanso</Badge>
                          ) : (
                            <Badge variant="info">{day.focusArea}</Badge>
                          )}
                          {isToday && <Badge variant="success">Hoy</Badge>}
                        </div>
                        {!day.isRestDay && (
                          <div className="flex items-center gap-2">
                            {dayTotalLogs > 0 && (
                              <span className="text-[10px] font-semibold text-primary-500">
                                {dayTotalLogs}/{dayTotalPossible}
                              </span>
                            )}
                            <span className="text-xs text-neutral-400">
                              {day.exercises.length} ej.
                            </span>
                            {isDayCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Completado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                                ▶ Iniciar
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!day.isRestDay && (
                        <div className="mt-2 space-y-1.5">
                          {day.exercises.map((ex) => {
                            const exLogCount = activeRoutineLogs.filter(
                              (l) => l.exerciseId === ex.id,
                            ).length;
                            const exTotal = selectedRoutine.weekCount;
                            const exPct =
                              exTotal > 0
                                ? Math.round((exLogCount / exTotal) * 100)
                                : 0;

                            const isExLoggedCurrentWeek = activeRoutineLogs.some(
                              (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek
                            );

                            return (
                              <div
                                key={ex.id}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors border",
                                  isExLoggedCurrentWeek
                                    ? "bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10"
                                    : "bg-neutral-50 dark:bg-neutral-800/50 border-transparent",
                                )}
                              >
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                  {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                    {ex.name}
                                  </p>
                                  <p className="text-xs text-neutral-400">
                                    {ex.sets}×{ex.reps} · {formatRest(ex.restSeconds)}
                                  </p>
                                </div>
                                {isExLoggedCurrentWeek && (
                                  <span className="text-emerald-500 font-bold text-xs shrink-0 mr-1">✓</span>
                                )}
                                {exLogCount > 0 && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                                      <div
                                        className="h-full rounded-full bg-primary-500"
                                        style={{ width: `${exPct}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-medium text-primary-500">
                                      {exLogCount}/{exTotal}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Filters ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/* Search Query */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-primary-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                />
              </div>

              {/* Routine Filter */}
              <div>
                <select
                  value={historyRoutineFilter}
                  onChange={(e) => setHistoryRoutineFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-primary-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                >
                  <option value="all">Todas las rutinas</option>
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isActive ? "(Activa)" : "(Inactiva)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Filter */}
              <div>
                <select
                  value={historyWeekFilter}
                  onChange={(e) => setHistoryWeekFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-primary-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                >
                  <option value="all">Todas las semanas</option>
                  {Array.from(
                    { length: Math.max(...routines.map((r) => r.weekCount), 4) },
                    (_, i) => i + 1,
                  ).map((w) => (
                    <option key={w} value={w}>
                      Semana {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── KPI Stats ── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Total Sessions */}
              <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center hover:scale-[1.02] transition-all duration-300">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {groupedSessions.length}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">
                  Sesiones
                </p>
              </div>

              {/* PRs Badge Button */}
              <button
                onClick={() => setShowPrsModal(true)}
                className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center hover:scale-[1.02] transition-all duration-300 hover:border-amber-500/50 cursor-pointer"
              >
                <p className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                  🏆 <span className="text-[10px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400">{personalRecords.length}</span>
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">
                  Ver PRs
                </p>
              </button>

              {/* Total Logs count */}
              <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center hover:scale-[1.02] transition-all duration-300">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {logs.length}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">
                  Registros
                </p>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="space-y-4">
              {groupedSessions.map((session) => (
                <div key={session.dateStr} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-neutral-200 dark:border-neutral-800 ml-3">
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-primary-500 bg-white dark:bg-slate-950" />

                  {/* Session Card */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-slate-900/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3 dark:border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {formatSessionDate(session.dateStr)}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {session.routineName}
                        </p>
                      </div>
                      <Badge variant="success">
                        {session.logs.length} {session.logs.length === 1 ? "ejercicio" : "ejercicios"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {session.logs.map((log) => {
                        const ex = findExerciseById(log.exerciseId);
                        return (
                          <div key={log.id} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {ex?.name || "Ejercicio"}
                              </span>
                              {ex?.muscleGroup && (
                                <span className="rounded-full border border-white/5 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                  {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                </span>
                              )}
                            </div>

                            {/* Sets breakdown */}
                            <div className="flex flex-wrap gap-1.5">
                              {log.setsData && log.setsData.length > 0 ? (
                                log.setsData.map((set, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border",
                                      set.completed
                                        ? "bg-primary-50/50 border-primary-100 text-primary-700 dark:bg-primary-950/20 dark:border-primary-900/30 dark:text-primary-400"
                                        : "bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-950/30 dark:border-white/5 dark:text-slate-500"
                                    )}
                                  >
                                    {sIdx + 1}ª: {set.weight ?? 0} kg × {set.reps ?? 0}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-primary-50/50 border border-primary-100 text-primary-700 dark:bg-primary-950/20 dark:border-primary-900/30 dark:text-primary-400">
                                  {log.weight ?? 0} kg × {log.repsDone || "0 reps"}
                                </span>
                              )}
                            </div>

                            {/* Observations */}
                            {log.observations && (
                              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                <span className="text-slate-400">💬</span>
                                <p className="italic">{log.observations}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {groupedSessions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 dark:bg-slate-900/40 dark:border-white/5">
                  <span className="text-4xl">📊</span>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    No hay registros que coincidan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Prueba cambiando los filtros o comienza a registrar tus rutinas.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* PRs Modal */}
        {showPrsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowPrsModal(false)} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/5">
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  🏆 Récords Personales (PR)
                </h3>
                <button
                  onClick={() => setShowPrsModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {personalRecords.length === 0 ? (
                  <p className="text-sm text-center text-slate-500 py-6">
                    Aún no tienes récords registrados. ¡Completa ejercicios con peso para verlos aquí!
                  </p>
                ) : (
                  personalRecords.map((pr) => (
                    <div
                      key={pr.exerciseId}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 hover:border-amber-500/20 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {pr.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {MUSCLE_LABELS[pr.muscleGroup] || "General"} · {formatPrDate(pr.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-amber-500">
                          {pr.maxWeight} kg
                        </p>
                        <p className="text-xs text-slate-400">
                          {pr.reps} reps
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <Button variant="secondary" onClick={() => setShowPrsModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating toast notification for week completion */}
        {weekCompletedToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500/90 backdrop-blur-md px-4 py-3 shadow-lg border border-emerald-400/30 text-white animate-bounce text-sm font-semibold">
            <span>🎉</span>
            <span>{weekCompletedToast}</span>
          </div>
        )}
      </>
    );
  }

  /* ── List view (when multiple routines) ── */
  return (
    <>
      <Header
        title="Mis Rutinas"
        subtitle={`${routines.length} rutinas asignadas`}
      />
      <div className="space-y-3">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => handleSelectRoutine(routine)}
            className="w-full text-left"
          >
            <Card hover padding="sm">
              <div className="flex items-center justify-between px-2 py-1">
                <div>
                  <p className="text-base font-semibold text-neutral-900 dark:text-white">
                    {routine.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {routine.days.filter((d) => !d.isRestDay).length} días ·{" "}
                    {routine.weekCount} semanas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {routine.isFavorable !== undefined &&
                    routine.isFavorable !== null && (
                      <span
                        title={
                          routine.isFavorable
                            ? "Rutina Favorable"
                            : "Rutina Desfavorable"
                        }
                      >
                        {routine.isFavorable ? "👍" : "👎"}
                      </span>
                    )}
                  {routine.isActive ? (
                    <Badge variant="success">Activa</Badge>
                  ) : (
                    <Badge variant="default">Inactiva</Badge>
                  )}
                  <span className="text-neutral-400">→</span>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </>
  );
}
