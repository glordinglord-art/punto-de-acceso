"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Card, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/utils";
import { routinesService } from "@/features/routines/services/routines.service";
import type {
  Routine,
  WorkoutLog,
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

  const isExerciseLogged = (exerciseId: string, weekNumber: number) => {
    return logs.some(
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
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
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
                  calMonth === 0
                    ? (setCalMonth(11), setCalYear((y) => y - 1))
                    : setCalMonth((m) => m - 1);
                  setCalSelectedDate(null);
                }}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                  calMonth === 11
                    ? (setCalMonth(0), setCalYear((y) => y + 1))
                    : setCalMonth((m) => m + 1);
                  setCalSelectedDate(null);
                }}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
          <div className="grid grid-cols-7">
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
                            isSelected ? "bg-emerald-400" : "bg-emerald-500",
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
              <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
              Entrenamiento
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Descanso
            </div>
          </div>
        </Card>

        {/* Selected day detail */}
        {calSelectedDate && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {calSelectedDate.toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>

            {selectedDayInfo ? (
              selectedDayInfo.isRestDay ? (
                <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Día de descanso
                      </p>
                      {selectedDayInfo.restDayNote && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400/70">
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
                            {ex.sets} series × {ex.reps} · {ex.restSeconds}s
                            descanso
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
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {Array.from(
            { length: selectedRoutine.weekCount },
            (_, i) => i + 1,
          ).map((w) => (
            <button
              key={w}
              onClick={() => setCurrentWeek(w)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                currentWeek === w
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              Sem. {w}
            </button>
          ))}
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
                </div>
              </div>

              <div className="space-y-1.5 mt-1">
                {day.exercises.map((ex) => {
                  const logged = isExerciseLogged(ex.id, currentWeek);
                  const isSaving = savingLog === ex.id;

                  return (
                    <div
                      key={ex.id}
                      onClick={() =>
                        !isSaving &&
                        handleToggleLogExercise(ex.id, currentWeek, logged)
                      }
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all cursor-pointer ${
                        logged
                          ? "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                          : "bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isSaving}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          logged
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-neutral-300 dark:border-neutral-600 group-hover:border-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30"
                        }`}
                      >
                        {isSaving ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                        ) : logged ? (
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
                        <p
                          className={`text-sm font-medium ${logged ? "text-emerald-700 dark:text-emerald-300 line-through" : "text-neutral-900 dark:text-white"}`}
                        >
                          {ex.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {ex.sets}×{ex.reps} · {ex.muscleGroup}
                        </p>
                      </div>

                      {ex.observations && (
                        <span
                          className="text-[10px] text-neutral-400 max-w-25 truncate"
                          title={ex.observations}
                        >
                          💡 {ex.observations}
                        </span>
                      )}
                    </div>
                  );
                })}
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

        {/* Progress card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Progreso total
              </p>
              <p className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                {progress}%
              </p>
            </div>
            <Button size="md" onClick={() => setView("tracking")}>
              ✅ Registrar hoy
            </Button>
          </div>
          <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
            <span>
              {selectedRoutine.days.filter((d) => !d.isRestDay).length} días
              entrenamiento
            </span>
            <span>{selectedRoutine.weekCount} semanas</span>
            <span>{totalExercises} ejercicios</span>
            <span>
              {completedLogs}/{totalLogs} completados
            </span>
          </div>
        </Card>

        {selectedRoutine.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 -mt-2">
            {selectedRoutine.description}
          </p>
        )}

        {/* Days */}
        <div className="space-y-3">
          {selectedRoutine.days.map((day) => {
            const isToday = day.dayNumber === todayDayNumber;

            return (
              <Card
                key={day.dayNumber}
                padding="sm"
                className={isToday ? "ring-2 ring-emerald-500/50" : ""}
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
                    <span className="text-xs text-neutral-400">
                      {day.exercises.length} ejercicios
                    </span>
                  )}
                </div>

                {!day.isRestDay && (
                  <div className="mt-2 space-y-1.5">
                    {day.exercises.map((ex, i) => (
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
                            {ex.sets} series × {ex.reps} · {ex.restSeconds}s
                            descanso
                          </p>
                        </div>
                        {ex.observations && (
                          <span
                            className="text-[10px] text-neutral-400 truncate max-w-30"
                            title={ex.observations}
                          >
                            💡 {ex.observations}
                          </span>
                        )}
                      </div>
                    ))}
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
