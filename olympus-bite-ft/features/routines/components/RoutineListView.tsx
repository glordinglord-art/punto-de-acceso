"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { cn, formatRest } from "@/shared/lib/utils";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import type {
  Exercise,
  Routine,
  RoutineDay,
  WorkoutLog,
  SetLogData,
} from "../types/routines.types";

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

interface RoutineListViewProps {
  routines: Routine[];
  selectedRoutine: Routine | null;
  logs: WorkoutLog[];
  logsLoading: boolean;
  currentWeek: number;
  savingLog: string | null;
  userId: string;
  onSelectRoutine: (routine: Routine) => void;
  onActivateRoutine: (routineId: string) => Promise<void>;
  onStartSession: (day: RoutineDay) => void;
  onWeekChange: (week: number) => void;
  onSaveLog: (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => Promise<void>;
  onRemoveLog: (exerciseId: string) => Promise<void>;
}

export function RoutineListView({
  routines,
  selectedRoutine,
  logs,
  currentWeek,
  savingLog,
  onSelectRoutine,
  onActivateRoutine,
  onStartSession,
  onWeekChange,
  onSaveLog,
  onRemoveLog,
}: RoutineListViewProps) {
  const [view, setView] = useState<"list" | "detail" | "tracking">("detail");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null);
  const [routineView, setRoutineView] = useState<"cards" | "calendar">("cards");
  const [showInfo, setShowInfo] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showRoutineDropdown, setShowRoutineDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"routine" | "history">("routine");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyRoutineFilter, setHistoryRoutineFilter] = useState("all");
  const [historyWeekFilter, setHistoryWeekFilter] = useState("all");
  const [showPrsModal, setShowPrsModal] = useState(false);

  const findExerciseById = (exerciseId: string) => {
    for (const r of routines) {
      for (const day of r.days) {
        const ex = day.exercises.find((e) => e.id === exerciseId);
        if (ex) return ex;
      }
    }
    return null;
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, routines]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, historyRoutineFilter, historyWeekFilter, historySearchQuery, routines]);

  const activeRoutineExerciseIds = useMemo(() => {
    if (!selectedRoutine) return new Set<string>();
    const ids = new Set<string>();
    selectedRoutine.days.forEach((d) => d.exercises.forEach((ex) => ids.add(ex.id)));
    return ids;
  }, [selectedRoutine]);

  const activeRoutineLogs = useMemo(() => {
    return logs.filter((l) => activeRoutineExerciseIds.has(l.exerciseId));
  }, [logs, activeRoutineExerciseIds]);

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

  // Adapt the batch tracking-card save to the per-set onSaveLog prop.
  // ponytail: parent owns the actual logWorkout; here we fan out completed
  // sets to onSaveLog. Observations are not in the prop contract so they are
  // dropped in the tracking view — upgrade the prop signature if notes matter.
  const handleTrackingSave = async (exercise: Exercise, setsData: SetLogData[]) => {
    for (const s of setsData) {
      if (s.completed || s.weight !== null || s.reps !== null) {
        await onSaveLog(exercise, s.set, s.weight, s.reps);
      }
    }
  };

  // Day of week number (1=Mon, 7=Sun)
  const todayDayNumber = new Date().getDay() === 0 ? 7 : new Date().getDay();

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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              Seguimiento
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400/80 mt-0.5">
              {selectedRoutine.name} · Semana {currentWeek} de {selectedRoutine.weekCount}
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={() => setView("detail")}>
            ← Volver
          </Button>
        </div>

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
                onClick={() => onWeekChange(w)}
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
                    onSave={(setsData) => handleTrackingSave(ex, setsData)}
                    onRemove={() => onRemoveLog(ex.id)}
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
        const formatted = date.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            {routines.length > 1 && (
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors"
                title="Ver todas las rutinas"
              >
                ←
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight text-white">
                  Mi Rutina
                </h1>
                {selectedRoutine.isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider shadow-sm shadow-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Activa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onActivateRoutine(selectedRoutine.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 px-2.5 py-0.5 text-[10px] font-black text-amber-400 cursor-pointer transition-colors uppercase tracking-wider animate-pulse"
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
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-450"
                      )}
                    >
                      {selectedRoutine.isFavorable ? "👍 Favorable" : "👎 Desfavor."}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Tab Selector Segmented Control */}
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 self-start md:self-auto backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveTab("routine")}
              className={cn(
                "rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                activeTab === "routine"
                  ? "bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white shadow-md shadow-primary-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              📋 Rutina
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                activeTab === "history"
                  ? "bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white shadow-md shadow-primary-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              📊 Historial
            </button>
          </div>
        </div>

        {activeTab === "routine" ? (
          <>
            {/* Control Bar — 2 rows (relative z-30 ensures dropdowns display above subsequent cards) */}
            <div className="relative z-30 mb-4 p-3 bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-xl space-y-2.5">
              {/* Row 1: Selectors */}
              <div className="flex items-center gap-2">
                {/* Routine selector */}
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => { setShowRoutineDropdown(!showRoutineDropdown); setShowWeekDropdown(false); }}
                    className="flex items-center gap-2 w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-2.5 text-xs font-black text-white cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    <span className="text-sm shrink-0">💪</span>
                    <span className="truncate flex-1">{selectedRoutine.name}</span>
                    <svg className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform shrink-0", showRoutineDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showRoutineDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setShowRoutineDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-2 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 rounded-2xl border border-white/20 bg-[#0c0e17] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 mb-1 flex items-center justify-between">
                          <span>Seleccionar Rutina</span>
                          <span className="text-[9px] font-bold text-slate-500">{routines.length} disponibles</span>
                        </div>
                        {routines.map((r) => {
                          const isSelected = selectedRoutine.id === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => { onSelectRoutine(r); setShowRoutineDropdown(false); setActiveTab("routine"); }}
                              className={cn(
                                "flex items-center justify-between w-full rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer text-left",
                                isSelected
                                  ? "bg-red-600 border border-red-500 text-white font-black shadow-lg shadow-red-600/30"
                                  : r.isActive
                                    ? "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <span className="flex items-center gap-2 truncate">
                                {r.isActive ? <span>⭐️</span> : <span>🏋️</span>}
                                <span className="truncate">{r.name}</span>
                              </span>
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ml-2 uppercase tracking-wider",
                                isSelected ? "bg-white/25 text-white" : "bg-white/10 text-slate-400"
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
                    className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-2.5 text-xs font-black text-white cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    <span>Sem. {currentWeek}</span>
                    {(() => {
                      const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === currentWeek);
                      const trainingDays = selectedRoutine.days.filter((d) => !d.isRestDay);
                      const wTotal = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
                      return (
                        <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-lg text-primary-400">
                          {wLogs.length}/{wTotal}
                        </span>
                      );
                    })()}
                    <svg className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform", showWeekDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showWeekDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setShowWeekDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-64 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 rounded-2xl border border-white/20 bg-[#0c0e17] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 mb-1">
                          Seleccionar Semana
                        </div>
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
                              onClick={() => { onWeekChange(w); setShowWeekDropdown(false); }}
                              className={cn(
                                "flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer",
                                isSelected
                                  ? "bg-red-600 border border-red-500 text-white font-black shadow-md shadow-red-600/25"
                                  : isCompleted
                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <span className="flex items-center gap-1.5">
                                {isCompleted && <span>✅</span>}
                                <span>Semana {w}</span>
                              </span>
                              {wTotal > 0 && (
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                  isSelected ? "bg-white/25 text-white" : isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-400"
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setRoutineView("cards")}
                    className={cn(
                      "rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                      routineView === "cards"
                        ? "bg-white/15 text-white border border-white/20 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    📋 Tarjetas
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutineView("calendar")}
                    className={cn(
                      "rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                      routineView === "calendar"
                        ? "bg-white/15 text-white border border-white/20 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    📅 Calendario
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className={cn(
                    "flex h-8 px-3.5 items-center gap-1.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                    showInfo
                      ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/30"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {showInfo ? "✕ Ocultar" : "ℹ️ Guía"}
                </button>
              </div>
            </div>

            {showInfo && (
              <div className="mb-5 p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3 animate-in slide-in-from-top-2 duration-300">
                {selectedRoutine.description && (
                  <p className="text-sm font-semibold text-slate-300">
                    {selectedRoutine.description}
                  </p>
                )}
                <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed border-t border-white/8 pt-2.5">
                  <span className="text-sm shrink-0">💡</span>
                  <p>
                    <strong>¿Cómo entrenar?</strong> Puedes alternar semanas arriba para revisar tus avances. Pulsa <strong>&quot;Entrenar Hoy&quot;</strong> para arrancar la sesión interactiva con el semáforo de intensidad y el peso fijo que te asignó tu coach.
                  </p>
                </div>
              </div>
            )}

            {/* ── Ultra-Premium Hero Workout Banner ── */}
            <div className="relative overflow-hidden rounded-3xl p-5 mb-5 border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-black/70 backdrop-blur-2xl shadow-2xl">
              {/* Radial ambient glow */}
              <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Left: SVG circular progress ring + stats */}
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center shrink-0 w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-white/10 fill-none"
                        strokeWidth="5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-primary-500 fill-none transition-all duration-700 ease-out"
                        strokeWidth="5"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 - (163.36 * progress) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-white tabular-nums">
                      {progress}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">
                      Semana {currentWeek} de {selectedRoutine.weekCount}
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      {completedLogs} de {totalLogs} ejercicios completados
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {progress === 100
                        ? "¡Objetivo semanal alcanzado al 100%! 🏆"
                        : todayIsTraining && todayDay
                          ? `Hoy: ${DAY_NAMES[todayDay.dayNumber]} (${todayLogged}/${todayDay.exercises.length} ejercicios)`
                          : todayDay?.isRestDay
                            ? "Hoy es día de descanso y recuperación activa"
                            : "Selecciona un día para entrenar"}
                    </p>
                  </div>
                </div>

                {/* Right: Primary Action CTA */}
                <div className="shrink-0 flex items-center gap-2">
                  {todayIsTraining && todayDay ? (
                    <button
                      type="button"
                      onClick={() => onStartSession(todayDay)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-primary-500 to-amber-500 text-white font-black uppercase tracking-wider text-xs shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <span className="text-base">⚡</span>
                      <span>Entrenar Hoy ({DAY_NAMES[todayDay.dayNumber]})</span>
                    </button>
                  ) : todayDay?.isRestDay ? (
                    <div className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <span>🧘</span>
                      <span>Día de Descanso</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const firstTraining = selectedRoutine.days.find(d => !d.isRestDay);
                        if (firstTraining) onStartSession(firstTraining);
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Ver Rutina
                    </button>
                  )}
                </div>
              </div>
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
                                onStartSession(selectedDayInfo);
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
                                       <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                         <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                           {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                         </span>
                                         {ex.intensity === "failure" && (
                                           <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-black uppercase px-2 py-0.5">
                                             🔴 Al Fallo
                                           </span>
                                         )}
                                         {ex.intensity === "relax" && (
                                           <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5">
                                             🟢 Relax
                                           </span>
                                         )}
                                         {ex.intensity === "medium" && (
                                           <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5">
                                             🟡 Media
                                           </span>
                                         )}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                         <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                           {ex.name}
                                         </p>
                                         <p className="text-xs text-neutral-400">
                                           {ex.sets}×{ex.reps}
                                           {ex.targetWeight && ex.targetWeight > 0 ? ` · 🔒 ${ex.targetWeight}kg` : " · 🔒 Corporal"} · {formatRest(ex.restSeconds)}
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
                  const isDayCompleted = !day.isRestDay && day.exercises.length > 0 && day.exercises.every(ex =>
                    activeRoutineLogs.some(l => l.exerciseId === ex.id && l.weekNumber === currentWeek)
                  );

                  return (
                    <div
                      key={day.dayNumber}
                      className={cn(
                        "rounded-3xl border transition-all duration-300 p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden",
                        isToday
                          ? "bg-gradient-to-b from-primary-500/[0.08] to-white/[0.02] border-primary-500/40 shadow-[0_0_30px_rgba(234,88,12,0.12)]"
                          : isDayCompleted
                            ? "bg-gradient-to-b from-emerald-500/[0.06] to-white/[0.02] border-emerald-500/30"
                            : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      )}
                    >
                      {/* Day Card Header */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/8">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className={cn(
                            "px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider",
                            isToday ? "bg-primary-500 text-slate-950 font-extrabold" : "bg-white/10 text-white"
                          )}>
                            {DAY_NAMES[day.dayNumber]}
                          </div>
                          {day.isRestDay ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
                              🧘 Descanso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary-500/15 text-primary-400 border border-primary-500/30 text-xs font-black uppercase tracking-wider">
                              {day.focusArea || "Entrenamiento"}
                            </span>
                          )}
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                              ● Hoy
                            </span>
                          )}
                        </div>

                        {!day.isRestDay && (
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400 tabular-nums">
                              {day.exercises.length} ej.
                            </span>
                            {isDayCompleted ? (
                              <button
                                type="button"
                                onClick={() => onStartSession(day)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all cursor-pointer"
                              >
                                ✓ Completado
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onStartSession(day)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                              >
                                ▶ Iniciar
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Day Card Exercises */}
                      {!day.isRestDay && (
                        <div className="mt-3 space-y-2">
                          {day.exercises.map((ex) => {
                            const isExLoggedCurrentWeek = activeRoutineLogs.some(
                              (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek
                            );
                            const muscleInfo = MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS];

                            return (
                              <div
                                key={ex.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200",
                                  isExLoggedCurrentWeek
                                    ? "bg-emerald-500/[0.07] border-emerald-500/30"
                                    : "bg-black/40 border-white/8 hover:bg-white/[0.04] hover:border-white/15"
                                )}
                              >
                                {/* Left: Icon and Name */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-base">
                                    {muscleInfo?.icon || "🏋️"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-white truncate">
                                      {ex.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                                      <span className="font-bold text-slate-300 tabular-nums">
                                        {ex.sets} × {ex.reps}
                                      </span>
                                      <span>·</span>
                                      <span className="font-bold text-amber-400/90 flex items-center gap-0.5">
                                        🔒 {ex.targetWeight && ex.targetWeight > 0 ? `${ex.targetWeight} kg` : "Corporal"}
                                      </span>
                                      <span>·</span>
                                      <span>⏱️ {formatRest(ex.restSeconds)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Intensity and Status Badges */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Semáforo badge */}
                                  {ex.intensity === "failure" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20">
                                      🔴 Al Fallo
                                    </span>
                                  )}
                                  {ex.intensity === "relax" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      🟢 Relax
                                    </span>
                                  )}
                                  {(!ex.intensity || ex.intensity === "medium") && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                      🟡 Media
                                    </span>
                                  )}

                                  {/* Logged check */}
                                  {isExLoggedCurrentWeek ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                                      ✓
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs">
                                      ○
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Filters Bar (High Contrast & Clear Visibility) ── */}
            <div className="p-4 rounded-3xl bg-[#0c0e17] border border-white/12 shadow-2xl mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="text-sm">🔍</span> Filtros de Historial
                </span>
                {(historySearchQuery || historyRoutineFilter !== "all" || historyWeekFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearchQuery("");
                      setHistoryRoutineFilter("all");
                      setHistoryWeekFilter("all");
                    }}
                    className="text-[11px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    ✕ Limpiar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Search Query */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    🔎
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar ejercicio..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-slate-400 text-xs font-bold outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                  />
                  {historySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Routine Filter */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    🏋️
                  </span>
                  <select
                    value={historyRoutineFilter}
                    onChange={(e) => setHistoryRoutineFilter(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-white/15 bg-[#121420] text-white text-xs font-bold outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#0c0e17] text-white py-2">Todas las rutinas</option>
                    {routines.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#0c0e17] text-white py-2">
                        {r.name} {r.isActive ? "⭐️" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    ▼
                  </span>
                </div>

                {/* Week Filter */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    📅
                  </span>
                  <select
                    value={historyWeekFilter}
                    onChange={(e) => setHistoryWeekFilter(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-white/15 bg-[#121420] text-white text-xs font-bold outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#0c0e17] text-white py-2">Todas las semanas</option>
                    {Array.from(
                      { length: Math.max(...routines.map((r) => r.weekCount), 4) },
                      (_, i) => i + 1,
                    ).map((w) => (
                      <option key={w} value={w} className="bg-[#0c0e17] text-white py-2">
                        Semana {w}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* ── KPI Stats Cards ── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Total Sessions */}
              <div className="rounded-3xl bg-white/[0.04] p-4 border border-white/10 text-center backdrop-blur-xl">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {groupedSessions.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Sesiones
                </p>
              </div>

              {/* PRs Badge Button */}
              <button
                onClick={() => setShowPrsModal(true)}
                className="rounded-3xl bg-gradient-to-b from-amber-500/15 to-white/[0.03] p-4 border border-amber-500/30 text-center backdrop-blur-xl hover:border-amber-500/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl">🏆</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                    {personalRecords.length}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mt-1">
                  Ver PRs
                </p>
              </button>

              {/* Total Logs count */}
              <div className="rounded-3xl bg-white/[0.04] p-4 border border-white/10 text-center backdrop-blur-xl">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {logs.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Registros
                </p>
              </div>
            </div>

            {/* ── Timeline (with bottom safe space) ── */}
            <div className="space-y-5 pb-32">
              {groupedSessions.map((session) => (
                <div key={session.dateStr} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-white/10 ml-3">
                  {/* Timeline Glowing Dot */}
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-primary-500 bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />

                  {/* Session Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#0c0e17]/90 backdrop-blur-2xl p-5 shadow-2xl hover:border-white/20 transition-all">
                    {/* Session Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3 mb-3.5">
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {formatSessionDate(session.dateStr)}
                        </h4>
                        <p className="text-xs font-bold text-primary-400 mt-0.5 flex items-center gap-1">
                          <span>🏋️</span>
                          <span>{session.routineName}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                        {session.logs.length} {session.logs.length === 1 ? "ejercicio" : "ejercicios"}
                      </span>
                    </div>

                    {/* Exercises In Session */}
                    <div className="space-y-4">
                      {session.logs.map((log) => {
                        const ex = findExerciseById(log.exerciseId);
                        const muscleInfo = ex?.muscleGroup ? MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS] : null;

                        return (
                          <div key={log.id} className="space-y-2 p-3 rounded-2xl bg-black/40 border border-white/6">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{muscleInfo?.icon || "🏋️"}</span>
                                <span className="text-sm font-black text-white">
                                  {ex?.name || "Ejercicio"}
                                </span>
                              </div>
                              {ex?.muscleGroup && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                </span>
                              )}
                            </div>

                            {/* Sets Breakdown: Clean pills without 0 kg x 0 */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {log.setsData && log.setsData.length > 0 ? (
                                log.setsData
                                  .filter((set) => set.completed || (set.reps && set.reps > 0))
                                  .map((set, sIdx) => {
                                    const isBodyweight = !set.weight || set.weight <= 0;
                                    return (
                                      <div
                                        key={sIdx}
                                        className={cn(
                                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all",
                                          set.completed
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                            : "bg-white/5 border-white/10 text-slate-300"
                                        )}
                                      >
                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                          Serie {sIdx + 1}:
                                        </span>
                                        <span className="text-white">
                                          {isBodyweight ? "Corporal" : `${set.weight} kg`}
                                        </span>
                                        <span className="text-slate-400">×</span>
                                        <span className="text-amber-400">
                                          {set.reps ?? 0} reps
                                        </span>
                                        {set.completed && (
                                          <span className="text-emerald-400 text-xs ml-0.5">✓</span>
                                        )}
                                      </div>
                                    );
                                  })
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white/5 border border-white/10 text-white">
                                  <span>{log.weight && log.weight > 0 ? `${log.weight} kg` : "Corporal"}</span>
                                  <span className="text-slate-400">×</span>
                                  <span className="text-amber-400">{log.repsDone || "0 reps"}</span>
                                </div>
                              )}
                            </div>

                            {/* Observations */}
                            {log.observations && (
                              <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5">
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
                <div className="text-center py-14 bg-[#0c0e17] rounded-3xl border border-white/10 p-6">
                  <span className="text-5xl">📊</span>
                  <h3 className="mt-3 text-base font-black text-white">
                    No hay registros que coincidan
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                    Prueba cambiando los filtros de búsqueda o completa tu primer entrenamiento hoy.
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
      </>
    );
  }

  /* ── List view (when multiple routines) ── */
  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
          Mis Rutinas
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400/80 mt-0.5">
          {routines.length} rutinas asignadas
        </p>
      </div>
      <div className="space-y-3">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => { onSelectRoutine(routine); setView("detail"); }}
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
