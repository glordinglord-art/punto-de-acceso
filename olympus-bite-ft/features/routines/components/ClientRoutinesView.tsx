"use client";

import { useState, useEffect, useCallback } from "react";
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

const MUSCLE_EMOJIS: Record<string, string> = {
  chest: "🫁",
  back: "🔙",
  shoulders: "💪",
  biceps: "💪",
  triceps: "💪",
  legs: "🦵",
  glutes: "🍑",
  abs: "🎯",
  cardio: "🏃",
  full_body: "🏋️",
  other: "⭐",
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
          expanded ? "bg-[#1a1c23] border border-primary-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]" : "bg-white/5 border border-white/10 hover:bg-white/10",
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

export function ClientRoutinesView() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "detail" | "tracking" | "calendar">(
    "list",
  );
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null);

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
        // Load logs
        const logsRes = await routinesService.getWorkoutLogs(
          active.id,
          user.id,
        );
        setLogs(logsRes.data ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectRoutine = async (routine: Routine) => {
    setSelectedRoutine(routine);
    setView("detail");
    if (user) {
      try {
        const res = await routinesService.getWorkoutLogs(routine.id, user.id);
        setLogs(res.data ?? []);
      } catch {
        setLogs([]);
      }
    }
  };

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
      const res = await routinesService.getWorkoutLogs(
        selectedRoutine.id,
        user.id,
      );
      setLogs(res.data ?? []);
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
      const res = await routinesService.getWorkoutLogs(
        selectedRoutine.id,
        user.id,
      );
      setLogs(res.data ?? []);
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
  if (view === "calendar" && selectedRoutine) {
    const calDays = getCalendarDays(calYear, calMonth);
    const today = new Date();

    // Get the routine day for a calendar date
    const getRoutineDayForDate = (date: Date) => {
      const jsDay = date.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      return selectedRoutine.days.find((d) => d.dayNumber === dayOfWeek);
    };

    const selectedDayInfo = calSelectedDate
      ? getRoutineDayForDate(calSelectedDate)
      : null;

    return (
      <>
        <Header
          title="Mi Rutina"
          subtitle={selectedRoutine.name}
          action={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setView("detail")}
              >
                📋 Detalle
              </Button>
            </div>
          }
        />

        {/* View toggle */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-neutral-100 rounded-xl w-fit dark:bg-neutral-800">
          <button
            onClick={() => setView("calendar")}
            className="rounded-lg px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            📅 Calendario
          </button>
          <button
            onClick={() => setView("detail")}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            📋 Tarjetas
          </button>
        </div>

        {/* Calendar */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                {MONTH_NAMES[calMonth]} {calYear}
              </h2>
              <button
                onClick={() => {
                  setCalMonth(today.getMonth());
                  setCalYear(today.getFullYear());
                  setCalSelectedDate(today);
                }}
                className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
              >
                Hoy
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
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
                className="rounded-xl p-2 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
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
                className="rounded-xl p-2 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
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
                className="py-2 text-center text-xs font-medium uppercase tracking-wider text-neutral-400"
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
              const isTodayDate = isSameDay(date, today);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setCalSelectedDate(date)}
                  className={cn(
                    "relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-xl text-sm transition-all",
                    isSelected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                      : isTodayDate
                        ? "ring-2 ring-neutral-900 dark:ring-white font-semibold text-neutral-900 dark:text-white"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  )}
                >
                  {date.getDate()}
                  {(hasTraining || hasRest) && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {hasTraining && (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-primary-400" : "bg-primary-500",
                          )}
                        />
                      )}
                      {hasRest && !hasTraining && (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-amber-400" : "bg-amber-400",
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
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
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
                <Card padding="sm">
                  <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{selectedDayInfo.focusArea}</Badge>
                      <span className="text-xs text-neutral-400">
                        {selectedDayInfo.exercises.length} ejercicios
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {selectedDayInfo.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50"
                      >
                        <span className="text-sm">
                          {MUSCLE_EMOJIS[ex.muscleGroup] || "⭐"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {ex.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {ex.sets} series × {ex.reps} · {formatRest(ex.restSeconds)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
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
      </>
    );
  }

  /* ── Tracking view ── */
  if (view === "tracking" && selectedRoutine) {
    const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
    const weekLogs = logs.filter((l) => l.weekNumber === currentWeek);
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
            const wLogs = logs.filter((l) => l.weekNumber === w);
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

  /* ── Detail view ── */
  if (view === "detail" && selectedRoutine) {
    const totalExercises = selectedRoutine.days.reduce(
      (s, d) => s + d.exercises.length,
      0,
    );
    const totalLogs = totalExercises * selectedRoutine.weekCount;
    const completedLogs = logs.length;
    const progress =
      totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    // Today's workout info
    const todayDay = selectedRoutine.days.find(
      (d) => d.dayNumber === todayDayNumber,
    );
    const todayIsTraining = todayDay && !todayDay.isRestDay;

    // Find which week has exercises still to do (latest incomplete)
    const findCurrentWeek = () => {
      for (let w = 1; w <= selectedRoutine.weekCount; w++) {
        const wLogs = logs.filter((l) => l.weekNumber === w);
        if (wLogs.length < totalExercises) return w;
      }
      return selectedRoutine.weekCount;
    };
    const suggestedWeek = findCurrentWeek();

    // Today's exercises completion for suggested week
    const todayLogged = todayDay
      ? todayDay.exercises.filter((ex) =>
          logs.some(
            (l) => l.exerciseId === ex.id && l.weekNumber === suggestedWeek,
          ),
        ).length
      : 0;

    return (
      <>
        <Header
          title="Mi Rutina"
          subtitle={selectedRoutine.name}
          action={
            routines.length > 1 ? (
              <Button variant="ghost" size="md" onClick={() => setView("list")}>
                Ver todas
              </Button>
            ) : undefined
          }
        />

        {selectedRoutine.isFavorable !== undefined &&
          selectedRoutine.isFavorable !== null && (
            <div className="mb-4">
              <Badge
                variant={selectedRoutine.isFavorable ? "success" : "danger"}
              >
                {selectedRoutine.isFavorable
                  ? "👍 Rutina Favorable"
                  : "👎 Rutina Desfavorable"}
              </Badge>
            </div>
          )}

        {/* View toggle */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-neutral-100 rounded-xl w-fit dark:bg-neutral-800">
          <button
            onClick={() => setView("calendar")}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            📅 Calendario
          </button>
          <button className="rounded-lg px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            📋 Tarjetas
          </button>
        </div>

        {/* ── Today's Workout CTA ── */}
        {todayIsTraining && todayDay && (
          <div
            className="mb-5 rounded-2xl bg-linear-to-r from-primary-500 to-primary-600 p-5 text-white cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all"
            onClick={() => {
              setCurrentWeek(suggestedWeek);
              setView("tracking");
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
                  {suggestedWeek}
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
            onClick={() => {
              setCurrentWeek(suggestedWeek);
              setView("tracking");
            }}
            className="rounded-2xl bg-neutral-900 dark:bg-white p-4 text-center hover:opacity-90 transition-opacity"
          >
            <p className="text-2xl font-extrabold text-white dark:text-neutral-900">
              ✅
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-300 dark:text-neutral-500 mt-1">
              Registrar
            </p>
          </button>
        </div>

        {selectedRoutine.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {selectedRoutine.description}
          </p>
        )}

        {/* Days */}
        <div className="space-y-3">
          {selectedRoutine.days.map((day) => {
            const isToday = day.dayNumber === todayDayNumber;
            // Per-day completion across all weeks
            const dayTotalLogs = day.isRestDay
              ? 0
              : day.exercises.reduce(
                  (count, ex) =>
                    count + logs.filter((l) => l.exerciseId === ex.id).length,
                  0,
                );
            const dayTotalPossible = day.isRestDay
              ? 0
              : day.exercises.length * selectedRoutine.weekCount;

            return (
              <Card
                key={day.dayNumber}
                padding="sm"
                className={cn(
                  isToday && "ring-2 ring-primary-500/50",
                  isToday &&
                    !day.isRestDay &&
                    "cursor-pointer hover:shadow-md transition-shadow",
                )}
                onClick={
                  isToday && !day.isRestDay
                    ? () => {
                        setCurrentWeek(suggestedWeek);
                        setView("tracking");
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
                    </div>
                  )}
                </div>

                {!day.isRestDay && (
                  <div className="mt-2 space-y-1.5">
                    {day.exercises.map((ex) => {
                      const exLogCount = logs.filter(
                        (l) => l.exerciseId === ex.id,
                      ).length;
                      const exTotal = selectedRoutine.weekCount;
                      const exPct =
                        exTotal > 0
                          ? Math.round((exLogCount / exTotal) * 100)
                          : 0;

                      return (
                        <div
                          key={ex.id}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5",
                            exLogCount > 0
                              ? "bg-primary-50/50 dark:bg-primary-900/10"
                              : "bg-neutral-50 dark:bg-neutral-800/50",
                          )}
                        >
                          <span className="text-sm">
                            {MUSCLE_EMOJIS[ex.muscleGroup] || "⭐"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {ex.name}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {ex.sets}×{ex.reps} · {formatRest(ex.restSeconds)}
                            </p>
                          </div>
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
