/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';
import { clientsService } from '@/features/clients/services/clients.service';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { tasksService } from '@/features/tasks/services/tasks.service';
import { mealsService } from '@/features/meals/services/meals.service';
import { routinesService } from '@/features/routines/services/routines.service';
import { formatCalories, cn, getLocalDateString, localDateToRange } from '@/shared/lib/utils';
import { FITNESS_GOALS, GOAL_RATING_CONFIG } from '@/features/meals/types/meals.types';
import type { Meal } from '@/features/meals/types/meals.types';
import type { User } from '@/shared/types/common.types';
import type { ClientDashboard } from '@/features/dashboard/types/dashboard.types';
import type { DailyTask, TaskLog } from '@/features/tasks/types/tasks.types';
import type { Routine, WorkoutLog } from '@/features/routines/types/routines.types';

/* ─── Types ──────────────────────────── */

interface ClientDetail {
  dashboard: ClientDashboard;
  tasks: DailyTask[];
  todayLogs: TaskLog[];
  todayMeals: Meal[];
  routines: Routine[];
  workoutLogs: WorkoutLog[];
}

/* ─── Helpers ────────────────────────── */

const MEAL_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_LABEL: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '🫁', pecho: '🫁',
  back: '🔙', espalda: '🔙',
  legs: '🦵', piernas: '🦵',
  shoulders: '🏔️', hombros: '🏔️',
  arms: '💪', brazos: '💪',
  biceps: '💪', triceps: '💪',
  core: '🧱', abdominales: '🧱',
  glutes: '🍑', glúteos: '🍑',
  cardio: '❤️',
  fullbody: '🏋️', 'full body': '🏋️',
};

/* ════════════════════════════════════════════ */
/*  Page                                        */
/* ════════════════════════════════════════════ */

export default function ClientSummaryPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ─── Load clients ─── */
  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await clientsService.getByTrainer(user.id);
      setClients(res.data ?? []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  /* ─── Load detail when client selected ─── */
  const loadDetail = useCallback(async (clientId: string) => {
    setDetailLoading(true);
    setDetail(null);
    const today = getLocalDateString();
    const { start, end } = localDateToRange(today);
    try {
      const [dashRes, tasksRes, logsRes, mealsRes, routinesRes] = await Promise.all([
        dashboardService.getClientDashboard(clientId),
        tasksService.getTasks(clientId).catch(() => null),
        tasksService.getLogsByDate(clientId, today).catch(() => null),
        mealsService.getByDateRange(clientId, start, end).catch(() => null),
        routinesService.getByClient(clientId).catch(() => null),
      ]);

      // Cargar workout logs de la rutina activa
      const routines = routinesRes?.data ?? [];
      const activeRoutine = routines.find((r) => r.isActive);
      let workoutLogs: WorkoutLog[] = [];
      if (activeRoutine) {
        try {
          const logsData = await routinesService.getWorkoutLogs(activeRoutine.id, clientId);
          workoutLogs = logsData.data ?? [];
        } catch { /* ignore */ }
      }

      setDetail({
        dashboard: dashRes.data,
        tasks: tasksRes?.data ?? [],
        todayLogs: logsRes?.data ?? [],
        todayMeals: mealsRes?.data ?? [],
        routines,
        workoutLogs,
      });
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  // Auto-select first client
  useEffect(() => {
    if (clients.length > 0 && !selectedId) {
      setSelectedId(clients[0].id);
    }
  }, [clients, selectedId]);

  const selectedClient = clients.find((c) => c.id === selectedId);

  /* ════════════════════════════ RENDER ════════════════════════════ */

  return (
    <>
      <Header
        title="Resumen de Clientes"
        subtitle={loading ? 'Cargando...' : `${clients.length} clientes`}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
          <span className="text-4xl mb-3 block">👥</span>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Sin clientes aún</h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Cuando tus clientes se registren, aquí verás su resumen diario.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ─── Client List (left) ─── */}
          <div className="lg:w-72 shrink-0">
            <div className="space-y-1.5 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-1">
              {clients.map((client) => {
                const isActive = client.id === selectedId;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-800',
                    )}
                  >
                    <Avatar
                      name={client.name}
                      size="sm"
                      className={isActive ? 'ring-2 ring-white/30' : ''}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-semibold truncate', isActive ? '' : 'text-neutral-900 dark:text-white')}>
                        {client.name}
                      </p>
                      <p className={cn('text-[11px] truncate', isActive ? 'opacity-70' : 'text-neutral-400')}>
                        {client.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Client Detail (right) ─── */}
          <div className="flex-1 min-w-0">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : detail && selectedClient ? (
              <ClientDetailView client={selectedClient} detail={detail} />
            ) : (
              <div className="flex items-center justify-center py-20 text-neutral-400">
                <p className="text-sm">Selecciona un cliente para ver su resumen</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════ */
/*  Client Detail View                          */
/* ════════════════════════════════════════════ */

function ClientDetailView({ client, detail }: { client: User; detail: ClientDetail }) {
  const { dashboard, tasks, todayLogs, todayMeals, routines, workoutLogs } = detail;

  const tasksDone = todayLogs.length;
  const tasksTotal = tasks.length;
  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const activeRoutine = routines.find((r) => r.isActive);
  const goalInfo = client.dietaryGoal ? FITNESS_GOALS[client.dietaryGoal as keyof typeof FITNESS_GOALS] : null;

  // Build a lookup: exerciseId → WorkoutLog[]
  const logsByExercise = useMemo(() => {
    const map: Record<string, typeof workoutLogs> = {};
    for (const log of workoutLogs) {
      (map[log.exerciseId] ??= []).push(log);
    }
    return map;
  }, [workoutLogs]);

  // Calories vs target
  const targetCal = client.targetCalories ?? 0;
  const calPct = targetCal > 0 ? Math.min(Math.round((dashboard.caloriesToday / targetCal) * 100), 999) : 0;

  return (
    <div className="space-y-4">
      {/* ══════════ Header ══════════ */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 p-5 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} src={client.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{client.name}</h2>
            <p className="text-sm opacity-60">{client.email}</p>
            {goalInfo && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs">
                {goalInfo.icon} {goalInfo.label}
              </span>
            )}
          </div>
          <div className="text-right hidden sm:block space-y-0.5">
            <p className="text-2xl font-bold">{dashboard.caloriesToday.toLocaleString()}</p>
            <p className="text-xs opacity-60">
              {targetCal > 0 ? `de ${targetCal.toLocaleString()} kcal (${calPct}%)` : 'kcal hoy'}
            </p>
          </div>
        </div>

        {/* Physical stats row */}
        {(client.weight || client.height || client.experienceLevel) && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-70">
            {client.weight && <span>⚖️ {client.weight} kg</span>}
            {client.height && <span>📏 {client.height} cm</span>}
            {client.experienceLevel && <span>🎯 {client.experienceLevel}</span>}
            {client.equipmentAccess && <span>🏠 {client.equipmentAccess}</span>}
          </div>
        )}
      </div>

      {/* ══════════ Stat Cards ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Comidas hoy" value={dashboard.mealsToday} icon="🍽️" />
        <StatCard
          label="Calorías"
          value={dashboard.caloriesToday > 0 ? dashboard.caloriesToday.toLocaleString() : '—'}
          icon="🔥"
          sub={targetCal > 0 ? `Meta: ${targetCal.toLocaleString()}` : undefined}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Proteína"
          value={dashboard.proteinToday > 0 ? `${dashboard.proteinToday}g` : '—'}
          icon="🥩"
          color="text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Tareas"
          value={tasksTotal > 0 ? `${tasksDone}/${tasksTotal}` : 'N/A'}
          icon="✅"
          color={tasksPct === 100 ? 'text-green-600 dark:text-green-400' : ''}
        />
      </div>

      {/* ══════════ Macros ══════════ */}
      {dashboard.caloriesToday > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Macronutrientes de hoy</h3>
          <div className="grid grid-cols-5 gap-2">
            <MacroBar label="Proteína" value={dashboard.proteinToday} unit="g" color="bg-red-500" />
            <MacroBar label="Carbos" value={dashboard.carbsToday} unit="g" color="bg-amber-500" />
            <MacroBar label="Grasa" value={dashboard.fatToday} unit="g" color="bg-blue-500" />
            <MacroBar label="Fibra" value={dashboard.fiberToday} unit="g" color="bg-green-500" />
            <MacroBar label="Azúcar" value={dashboard.sugarToday} unit="g" color="bg-pink-500" />
          </div>
        </Card>
      )}

      {/* ══════════ Comidas de hoy detalladas ══════════ */}
      {todayMeals.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            🍽️ Comidas de hoy ({todayMeals.length})
          </h3>
          <div className="space-y-3">
            {todayMeals.map((meal) => {
              const ratingConf = meal.goalRating ? GOAL_RATING_CONFIG[meal.goalRating] : null;
              return (
                <div key={meal.id} className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-2xl shrink-0">
                        {MEAL_EMOJI[meal.mealType] ?? '🍽️'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-400 uppercase">
                          {MEAL_LABEL[meal.mealType] ?? meal.mealType}
                        </span>
                        {ratingConf && (
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ratingConf.bgColor, ratingConf.color)}>
                            {ratingConf.icon} {ratingConf.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{meal.name}</p>
                      {meal.foods.length > 0 && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                          {meal.foods.join(', ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCalories(meal.calories)}</span>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>G: {meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                  {meal.recommendation && (
                    <div className="px-3 pb-3">
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                        💡 {meal.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ══════════ Tareas del día ══════════ */}
      {tasksTotal > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Tareas del día</h3>
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              tasksPct === 100
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : tasksPct > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
            )}>
              {tasksPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-3">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                tasksPct === 100 ? 'bg-green-500' : tasksPct > 0 ? 'bg-amber-400' : '',
              )}
              style={{ width: `${tasksPct}%` }}
            />
          </div>
          <div className="space-y-1.5">
            {tasks.map((task) => {
              const done = todayLogs.some((l) => l.taskId === task.id);
              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm',
                    done
                      ? 'bg-green-50/60 dark:bg-green-900/10'
                      : 'bg-neutral-50 dark:bg-neutral-800/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                      done
                        ? 'bg-green-500 text-white'
                        : 'border border-neutral-300 dark:border-neutral-600',
                    )}
                  >
                    {done ? '✓' : ''}
                  </span>
                  <span className="text-sm">{task.icon}</span>
                  <span className={cn(
                    'flex-1',
                    done
                      ? 'text-neutral-500 line-through dark:text-neutral-400'
                      : 'text-neutral-900 dark:text-white',
                  )}>
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ══════════ Rutina activa completa ══════════ */}
      {activeRoutine ? (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              💪 {activeRoutine.name}
            </h3>
            <Badge variant="success">Activa</Badge>
          </div>
          {activeRoutine.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{activeRoutine.description}</p>
          )}

          {/* Routine overview */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {activeRoutine.days.filter((d) => !d.isRestDay).length}
              </p>
              <p className="text-[10px] text-neutral-400 uppercase">Días entr.</p>
            </div>
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {activeRoutine.days.reduce((sum, d) => sum + d.exercises.length, 0)}
              </p>
              <p className="text-[10px] text-neutral-400 uppercase">Ejercicios</p>
            </div>
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{activeRoutine.weekCount}</p>
              <p className="text-[10px] text-neutral-400 uppercase">Semanas</p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div className="space-y-3">
            {activeRoutine.days.map((day) => (
              <div key={day.id} className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className={cn(
                  'px-3 py-2 flex items-center justify-between',
                  day.isRestDay
                    ? 'bg-neutral-50 dark:bg-neutral-800/30'
                    : 'bg-neutral-50 dark:bg-neutral-800',
                )}>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Día {day.dayNumber}
                    {!day.isRestDay && (
                      <span className="ml-2 font-normal text-neutral-400">— {day.focusArea}</span>
                    )}
                  </span>
                  {day.isRestDay ? (
                    <span className="text-xs text-neutral-400">😴 Descanso</span>
                  ) : (
                    <span className="text-xs text-neutral-400">{day.exercises.length} ejercicios</span>
                  )}
                </div>

                {!day.isRestDay && day.exercises.length > 0 && (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {day.exercises.map((ex) => {
                      const exLogs = logsByExercise[ex.id] ?? [];
                      const muscleKey = ex.muscleGroup.toLowerCase();
                      const emoji = MUSCLE_EMOJI[muscleKey] ?? '🏋️';
                      const latestLog = exLogs.length > 0
                        ? exLogs.reduce((a, b) => a.weekNumber > b.weekNumber ? a : b)
                        : null;

                      return (
                        <div key={ex.id} className="px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm">{emoji}</span>
                              <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {ex.name}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400 shrink-0 ml-2">
                              {ex.sets}×{ex.reps}
                            </span>
                          </div>

                          {/* Latest log data */}
                          {latestLog && latestLog.setsData && latestLog.setsData.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {latestLog.setsData.map((s) => (
                                <span
                                  key={s.set}
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                                    s.completed
                                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500',
                                  )}
                                >
                                  S{s.set}: {s.weight ?? 0}kg × {s.reps ?? 0}
                                  {s.completed && <span>✓</span>}
                                </span>
                              ))}
                              {latestLog.weekNumber > 0 && (
                                <span className="text-[10px] text-neutral-400 self-center ml-1">
                                  (Sem {latestLog.weekNumber})
                                </span>
                              )}
                            </div>
                          )}

                          {exLogs.length === 0 && (
                            <p className="text-[10px] text-neutral-400 mt-0.5 italic">Sin registros aún</p>
                          )}

                          {ex.observations && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">📝 {ex.observations}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3 py-2">
            <span className="text-2xl">🏋️</span>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Sin rutina activa</p>
              <p className="text-xs text-neutral-400">Este cliente no tiene una rutina asignada aún</p>
            </div>
          </div>
        </Card>
      )}

      {/* ══════════ Comidas recientes (últimos días) ══════════ */}
      {dashboard.recentMeals.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Comidas recientes</h3>
          <div className="space-y-2">
            {dashboard.recentMeals.slice(0, 8).map((meal) => (
              <div key={meal.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5">
                {meal.imageUrl ? (
                  <img src={meal.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-700 text-lg">
                    {MEAL_EMOJI[meal.mealType] ?? '🍽️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{meal.mealName}</p>
                  <p className="text-xs text-neutral-400">
                    {MEAL_LABEL[meal.mealType] ?? meal.mealType} · {formatCalories(meal.calories)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  {meal.protein}g prot
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══════════ Tendencia semanal ══════════ */}
      {dashboard.weeklyTrend.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Tendencia semanal</h3>
          <div className="flex items-end justify-between gap-1 h-24">
            {dashboard.weeklyTrend.map((d) => {
              const maxCal = Math.max(...dashboard.weeklyTrend.map((t) => t.calories), 1);
              const height = (d.calories / maxCal) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-neutral-400 font-medium">
                    {d.calories > 0 ? d.calories : ''}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                    <div
                      className={cn(
                        'w-full max-w-8 rounded-t-md transition-all',
                        d.calories > 0 ? 'bg-primary-400 dark:bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700',
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ══════════ Info adicional del cliente ══════════ */}
      {(client.medicalConditions || client.dietaryPreferences) && (
        <Card>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">📋 Notas del cliente</h3>
          <div className="space-y-2">
            {client.medicalConditions && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/10 px-3 py-2">
                <p className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase mb-0.5">Condiciones médicas</p>
                <p className="text-xs text-red-600 dark:text-red-300">{client.medicalConditions}</p>
              </div>
            )}
            {client.dietaryPreferences && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 px-3 py-2">
                <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase mb-0.5">Preferencias alimentarias</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">{client.dietaryPreferences}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── Reusable stat card ── */
function StatCard({ label, value, icon, color, sub }: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <p className={cn('text-2xl font-extrabold tracking-tight', color || 'text-neutral-900 dark:text-white')}>
        {value}
      </p>
      <p className="text-[11px] font-medium text-neutral-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Macro bar ── */
function MacroBar({ label, value, unit, color }: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-neutral-900 dark:text-white">{value > 0 ? value : '—'}</p>
      <p className="text-[10px] text-neutral-400">{unit}</p>
      <div className="mt-1.5 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div className={cn('h-full rounded-full', color)} style={{ width: value > 0 ? '100%' : '0%' }} />
      </div>
      <p className="text-[10px] text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
