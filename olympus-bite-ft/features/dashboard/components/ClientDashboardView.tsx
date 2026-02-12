'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart';
import { MEAL_TYPE_COLORS } from '@/features/dashboard/types/dashboard.types';
import type { ClientDashboard } from '@/features/dashboard/types/dashboard.types';
import { formatCalories } from '@/shared/lib/utils';
import Link from 'next/link';

const MEAL_TYPE_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export function ClientDashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await dashboardService.getClientDashboard(user.id);
      if (res?.data) setStats(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <>
        <Header title="Cargando..." subtitle="Un momento..." />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </>
    );
  }

  if (!stats) return null;

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  const routineProgress =
    stats.activeRoutine && stats.activeRoutine.totalLogs > 0
      ? Math.round((stats.activeRoutine.completedLogs / stats.activeRoutine.totalLogs) * 100)
      : 0;

  // Día actual de la semana (1=Lun, 7=Dom)
  const todayDayNumber = now.getDay() === 0 ? 7 : now.getDay();
  const todayRoutineDay = stats.activeRoutine?.days.find((d) => d.dayNumber === todayDayNumber);

  const macros = [
    { label: 'Proteína', value: stats.proteinToday, unit: 'g', color: 'text-red-500', bg: 'bg-red-500' },
    { label: 'Carbos', value: stats.carbsToday, unit: 'g', color: 'text-blue-500', bg: 'bg-blue-500' },
    { label: 'Grasas', value: stats.fatToday, unit: 'g', color: 'text-yellow-500', bg: 'bg-yellow-500' },
    { label: 'Fibra', value: stats.fiberToday, unit: 'g', color: 'text-green-500', bg: 'bg-green-500' },
    { label: 'Azúcar', value: stats.sugarToday, unit: 'g', color: 'text-pink-500', bg: 'bg-pink-500' },
  ];

  return (
    <>
      <Header
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Campeón'} 💪`}
        subtitle={
          stats.trainerName
            ? `Entrenador: ${stats.trainerName} · ${new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}`
            : new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
        }
      />

      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Row 1: Quick Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-neutral-100 dark:border-neutral-800 p-5 min-w-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-600 to-emerald-400" />
            <span className="text-2xl">🍽️</span>
            <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">{stats.mealsToday}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Comidas hoy</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-neutral-100 dark:border-neutral-800 p-5 min-w-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 to-orange-400" />
            <span className="text-2xl">🔥</span>
            <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">{formatCalories(stats.caloriesToday)}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Calorías hoy</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-red-50 dark:bg-red-950/40 border border-neutral-100 dark:border-neutral-800 p-5 min-w-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 to-red-400" />
            <span className="text-2xl">🥩</span>
            <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">{stats.proteinToday}g</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Proteína hoy</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-neutral-100 dark:border-neutral-800 p-5 min-w-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-600 to-purple-400" />
            <span className="text-2xl">📊</span>
            <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">{stats.mealsThisWeek}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta semana</p>
          </div>
        </div>

        {/* Row 2: Rutina del día + Macros */}
        <div className="grid gap-4 lg:grid-cols-2 items-stretch">
          {/* Rutina del día */}
          <div className="min-w-0">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>🏋️ Rutina de hoy</CardTitle>
                {stats.activeRoutine && (
                  <Link
                    href="/routines"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver completa →
                  </Link>
                )}
              </div>

              {!stats.activeRoutine ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">😴</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Tu entrenador aún no te ha asignado una rutina
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cuando lo haga, aparecerá aquí automáticamente
                  </p>
                </div>
              ) : todayRoutineDay?.isRestDay ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">🧘</span>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">Día de descanso</p>
                  <p className="text-sm text-neutral-400 mt-1">Relájate y recupérate 💤</p>
                </div>
              ) : todayRoutineDay ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info">{todayRoutineDay.focusArea}</Badge>
                    <span className="text-xs text-neutral-400">{todayRoutineDay.exercises.length} ejercicios</span>
                  </div>
                  <div className="space-y-2">
                    {todayRoutineDay.exercises.map((ex, i) => (
                      <div
                        key={ex.id}
                        className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{ex.name}</p>
                          <p className="text-xs text-neutral-400">{ex.sets} series × {ex.reps} reps</p>
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0">{ex.muscleGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">📋</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {stats.activeRoutine.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {stats.activeRoutine.trainingDays} días de entrenamiento · {stats.activeRoutine.weekCount} semanas
                  </p>
                  {/* Progress bar */}
                  <div className="mt-4 mx-auto max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Progreso</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{routineProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${routineProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Routine progress bar (when routine exists and we showed today's exercises) */}
              {stats.activeRoutine && todayRoutineDay && !todayRoutineDay.isRestDay && (
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400">{stats.activeRoutine.name} · progreso total</span>
                    <span className="font-bold text-neutral-600 dark:text-neutral-300">{routineProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${routineProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Macros */}
          <div className="min-w-0">
            <Card className="h-full">
              <CardTitle>Nutrición de hoy</CardTitle>
              <div className="space-y-3 mt-4">
                {macros.map((m) => {
                  const maxVal = Math.max(...macros.map((x) => x.value), 1);
                  const pct = (m.value / maxVal) * 100;
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{m.label}</span>
                        <span className={`text-sm font-bold ${m.color}`}>
                          {m.value}{m.unit}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.bg} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meal type distribution */}
              {stats.mealTypeDistribution.length > 0 && (
                <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex flex-wrap gap-2">
                    {stats.mealTypeDistribution.map((mt) => {
                      const config = MEAL_TYPE_COLORS[mt.type];
                      return (
                        <div
                          key={mt.type}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${config?.bg || 'bg-neutral-100'} ${config?.text || 'text-neutral-600'}`}
                        >
                          {mt.type} <span className="font-bold">{mt.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Row 3: Weekly Chart */}
        <WeeklyChart data={stats.weeklyTrend} />

        {/* Row 4: Recent Meals */}
        {stats.recentMeals.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Últimas comidas</CardTitle>
              <Link
                href="/meals"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-1">
              {stats.recentMeals.slice(0, 6).map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800/50"
                >
                  <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.mealName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{MEAL_TYPE_EMOJI[meal.mealType] || '🍽️'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{meal.mealName}</p>
                    <p className="text-xs text-neutral-400">{meal.protein}g proteína</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCalories(meal.calories)}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(meal.time).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Refresh */}
        <div className="flex justify-center pb-4">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200 transition-colors dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>
    </>
  );
}
