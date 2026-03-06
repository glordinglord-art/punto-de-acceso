'use client';

import { useState, useMemo } from 'react';
import { cn, formatRest } from '@/shared/lib/utils';
import type { RoutineDay, WorkoutLog } from '../types/routines.types';

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface WeeklyTrackerProps {
  days: RoutineDay[];
  weekCount: number;
  logs: WorkoutLog[];
  onLogSave?: (exerciseId: string, weekNumber: number, weight: number | null, repsDone: string | null) => void;
}

export function WeeklyTracker({ days, weekCount, logs }: WeeklyTrackerProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const trainingDays = useMemo(() => days.filter((d) => !d.isRestDay), [days]);
  const totalExercises = useMemo(
    () => trainingDays.reduce((s, d) => s + d.exercises.length, 0),
    [trainingDays],
  );

  const weekStats = useMemo(() => {
    return Array.from({ length: weekCount }, (_, i) => {
      const w = i + 1;
      const wLogs = logs.filter((l) => l.weekNumber === w);
      const completed = wLogs.length;
      const pct = totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0;
      return { week: w, completed, total: totalExercises, pct, logs: wLogs };
    });
  }, [logs, weekCount, totalExercises]);

  const currentStats = weekStats[currentWeek - 1];

  const overallStats = useMemo(() => {
    const totalPossible = totalExercises * weekCount;
    const totalDone = logs.length;
    const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
    const sorted = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastLog = sorted[0] as WorkoutLog | undefined;
    const weeksActive = weekStats.filter((w) => w.pct > 0).length;
    return { totalDone, totalPossible, pct, lastLog, weeksActive };
  }, [logs, totalExercises, weekCount, weekStats]);

  const getLog = (exerciseId: string, week: number) =>
    logs.find((l) => l.exerciseId === exerciseId && l.weekNumber === week);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const d = Math.floor(hours / 24);
    return `Hace ${d} día${d > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Progreso Total</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">{overallStats.pct}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-400 transition-all duration-500"
              style={{ width: `${overallStats.pct}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Completados</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {overallStats.totalDone}<span className="text-sm font-medium text-neutral-400">/{overallStats.totalPossible}</span>
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">ejercicios registrados</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Semanas Activas</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {overallStats.weeksActive}<span className="text-sm font-medium text-neutral-400">/{weekCount}</span>
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">con actividad</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Última Actividad</p>
          {overallStats.lastLog ? (
            <>
              <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1.5">
                {formatTimeAgo(overallStats.lastLog.createdAt)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                S{overallStats.lastLog.weekNumber} · {overallStats.lastLog.repsDone ?? 'Registrado'}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-neutral-400 mt-1.5">Sin actividad</p>
          )}
        </div>
      </div>

      {/* ── Week Selector ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {weekStats.map((ws) => (
          <button
            key={ws.week}
            onClick={() => setCurrentWeek(ws.week)}
            className={cn(
              'relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              currentWeek === ws.week
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
            )}
          >
            <span>Semana {ws.week}</span>
            {ws.completed > 0 && (
              <span className={cn(
                'ml-2 text-xs',
                currentWeek === ws.week ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-400',
              )}>
                {ws.pct}%
              </span>
            )}
            <div className={cn(
              'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
              currentWeek === ws.week ? 'bg-neutral-700 dark:bg-neutral-300' : 'bg-neutral-200 dark:bg-neutral-700',
            )}>
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  ws.pct === 100 ? 'bg-green-500' : ws.pct > 0 ? 'bg-primary-500' : 'bg-transparent',
                )}
                style={{ width: `${ws.pct}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* ── Week Progress Header ── */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Semana {currentWeek}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {currentStats.completed} de {currentStats.total} ejercicios completados
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
            currentStats.pct === 100
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : currentStats.pct > 0
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
          )}>
            {currentStats.pct === 100 ? '✅ Completada' : currentStats.pct > 0 ? `${currentStats.pct}% avance` : 'Sin iniciar'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              currentStats.pct === 100 ? 'bg-green-500' : 'bg-linear-to-r from-primary-500 to-primary-400',
            )}
            style={{ width: `${currentStats.pct}%` }}
          />
        </div>
      </div>

      {/* ── Per-Day Progress Cards ── */}
      <div className="space-y-4">
        {trainingDays.map((day) => {
          const dayLogs = day.exercises.map((ex) => ({
            exercise: ex,
            log: getLog(ex.id, currentWeek),
          }));
          const dayCompleted = dayLogs.filter((d) => !!d.log).length;
          const dayPct = day.exercises.length > 0 ? Math.round((dayCompleted / day.exercises.length) * 100) : 0;

          return (
            <div
              key={day.dayNumber}
              className="rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden"
            >
              {/* Day header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-50 dark:border-neutral-800">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                  dayPct === 100
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : dayPct > 0
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                )}>
                  {dayPct === 100 ? '✓' : `D${day.dayNumber}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{DAY_NAMES[day.dayNumber]}</h4>
                    <span className="text-xs text-neutral-400">{day.focusArea}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 max-w-40">
                      <div
                        className={cn('h-full rounded-full transition-all', dayPct === 100 ? 'bg-green-500' : 'bg-primary-500')}
                        style={{ width: `${dayPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400">{dayCompleted}/{day.exercises.length}</span>
                  </div>
                </div>
              </div>

              {/* Exercises list */}
              <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {dayLogs.map(({ exercise, log }) => {
                  const isExpanded = expandedExercise === `${exercise.id}-${currentWeek}`;
                  const hasSets = log?.setsData && log.setsData.length > 0;
                  const completedSets = hasSets ? log!.setsData!.filter((s) => s.completed || s.weight || s.reps) : [];

                  return (
                    <div key={exercise.id}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-5 py-3 transition-colors',
                          log ? 'cursor-pointer hover:bg-primary-50/30 dark:hover:bg-primary-900/5' : '',
                        )}
                        onClick={() => log && setExpandedExercise(isExpanded ? null : `${exercise.id}-${currentWeek}`)}
                      >
                        <div className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                          log ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-200 dark:border-neutral-700',
                        )}>
                          {log && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            log ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-300',
                          )}>
                            {exercise.name}
                          </p>
                          <p className="text-[10px] text-neutral-400">{exercise.sets}×{exercise.reps} · {formatRest(exercise.restSeconds)}</p>
                        </div>
                        {log && (
                          <div className="text-right shrink-0">
                            {hasSets ? (
                              <div className="flex flex-wrap gap-1 justify-end max-w-48">
                                {completedSets.slice(0, 4).map((s) => (
                                  <span
                                    key={s.set}
                                    className="text-[10px] font-medium bg-primary-100 text-primary-600 rounded-md px-1.5 py-0.5 dark:bg-primary-900/30 dark:text-primary-400"
                                  >
                                    {s.weight ?? '—'}kg×{s.reps ?? '—'}
                                    {s.rest != null && <span className="text-primary-400"> {formatRest(s.rest)}</span>}
                                  </span>
                                ))}
                                {completedSets.length > 4 && (
                                  <span className="text-[10px] text-neutral-400">+{completedSets.length - 4}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                {log.weight ? `${log.weight}kg` : ''} {log.repsDone ?? ''}
                              </span>
                            )}
                          </div>
                        )}
                        {log && (
                          <svg
                            className={cn('h-4 w-4 shrink-0 text-neutral-300 transition-transform', isExpanded && 'rotate-180')}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && log && (
                        <div className="px-5 pb-4 pt-1 bg-neutral-50/50 dark:bg-neutral-800/20">
                          {hasSets ? (
                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                Registro por serie
                              </p>
                              <div className="grid gap-1.5">
                                {log.setsData!.map((s) => (
                                  <div
                                    key={s.set}
                                    className={cn(
                                      'flex items-center gap-3 rounded-lg px-3 py-2',
                                      s.completed || s.weight || s.reps
                                        ? 'bg-white dark:bg-neutral-800'
                                        : 'bg-neutral-100/50 dark:bg-neutral-800/50 opacity-50',
                                    )}
                                  >
                                    <span className={cn(
                                      'w-7 text-center text-xs font-bold rounded-md py-0.5',
                                      s.completed ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-neutral-400',
                                    )}>
                                      S{s.set}
                                    </span>
                                    <div className="flex items-center gap-4 flex-1">
                                      <div>
                                        <span className="text-xs text-neutral-400">Peso</span>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                          {s.weight !== null ? `${s.weight} kg` : '—'}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-neutral-400">Reps</span>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                          {s.reps !== null ? s.reps : '—'}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-neutral-400">Descanso</span>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                          {s.rest !== null && s.rest !== undefined ? formatRest(s.rest) : '—'}
                                        </p>
                                      </div>
                                    </div>
                                    {(s.completed || s.weight || s.reps) && (
                                      <span className="text-primary-500">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">
                              {log.weight && <span className="font-medium">{log.weight}kg</span>}
                              {log.repsDone && <span className="ml-2">{log.repsDone}</span>}
                            </div>
                          )}
                          {log.observations && (
                            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/10">
                              <p className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 mb-0.5">Notas del cliente</p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">{log.observations}</p>
                            </div>
                          )}
                          {log.completedAt && (
                            <p className="text-[10px] text-neutral-400 mt-2">
                              Registrado: {new Date(log.completedAt).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
