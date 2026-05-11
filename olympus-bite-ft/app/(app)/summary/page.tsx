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
import { Users, Search, Target, Dumbbell, Activity, CalendarDays, Zap, Utensils, Award, CheckCircle2, ChevronRight, ShieldAlert, Apple } from 'lucide-react';

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
        subtitle={loading ? 'Sincronizando...' : `Monitoreando ${clients.length} atletas`}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-md max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 mb-4 text-neutral-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white mb-2">Sin clientes aún</h3>
          <p className="text-neutral-400">
            Cuando tus clientes se registren y comiencen su progreso, podrás ver su resumen diario aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Client List (left) ─── */}
          <div className="lg:w-80 shrink-0">
            <div className="space-y-2 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              {clients.map((client) => {
                const isActive = client.id === selectedId;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={cn(
                      'w-full flex items-center gap-4 rounded-2xl p-3 text-left transition-all border relative overflow-hidden group',
                      isActive
                        ? 'bg-primary-500/10 border-primary-500/30'
                        : 'bg-[#1a1a1a] border-white/5 hover:bg-[#222] hover:border-white/10'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                    )}
                    <Avatar
                      name={client.name}
                      size="md"
                      className={isActive ? 'ring-2 ring-primary-500 shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)]' : ''}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-base font-condensed font-bold uppercase tracking-wide truncate', isActive ? 'text-primary-400' : 'text-white group-hover:text-primary-400 transition-colors')}>
                        {client.name}
                      </p>
                      <p className={cn('text-xs truncate font-medium', isActive ? 'text-primary-200' : 'text-neutral-500')}>
                        {client.email}
                      </p>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 transition-all', isActive ? 'text-primary-500 translate-x-0' : 'text-neutral-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0')} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Client Detail (right) ─── */}
          <div className="flex-1 min-w-0">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20 h-full rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-md">
                <Spinner size="lg" />
              </div>
            ) : detail && selectedClient ? (
              <ClientDetailView client={selectedClient} detail={detail} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400 h-full rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-md">
                <Search className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-condensed uppercase tracking-wider font-bold">Selecciona un cliente para ver su resumen</p>
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

  const logsByExercise = useMemo(() => {
    const map: Record<string, typeof workoutLogs> = {};
    for (const log of workoutLogs) {
      (map[log.exerciseId] ??= []).push(log);
    }
    return map;
  }, [workoutLogs]);

  const targetCal = client.targetCalories ?? 0;
  const calPct = targetCal > 0 ? Math.min(Math.round((dashboard.caloriesToday / targetCal) * 100), 999) : 0;

  return (
    <div className="space-y-6">
      {/* ══════════ Header ══════════ */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#1a1a1a] to-black border border-white/5 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar name={client.name} src={client.avatarUrl} size="xl" className="h-20 w-20 ring-2 ring-white/10" />
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h2 className="text-3xl font-condensed font-bold uppercase tracking-wide text-white truncate drop-shadow-md">{client.name}</h2>
            <p className="text-primary-400 font-medium text-sm mb-2">{client.email}</p>
            {goalInfo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider font-condensed mt-2">
                <span className="text-base">{goalInfo.icon}</span> {goalInfo.label}
              </span>
            )}
          </div>
          
          <div className="text-center md:text-right flex flex-col items-center md:items-end justify-center">
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-condensed font-bold text-white drop-shadow-lg leading-none">{dashboard.caloriesToday.toLocaleString()}</p>
              <span className="text-sm font-bold text-neutral-500 font-condensed tracking-widest uppercase">Kcal</span>
            </div>
            <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mt-1">
              {targetCal > 0 ? `De ${targetCal.toLocaleString()} META (${calPct}%)` : 'Consumidas Hoy'}
            </p>
          </div>
        </div>

        {(client.weight || client.height || client.experienceLevel) && (
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4 text-xs">
            {client.weight && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                <span className="text-neutral-400">⚖️</span>
                <span className="text-white font-bold">{client.weight} kg</span>
              </div>
            )}
            {client.height && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                <span className="text-neutral-400">📏</span>
                <span className="text-white font-bold">{client.height} cm</span>
              </div>
            )}
            {client.experienceLevel && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                <Target className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-white font-bold">{client.experienceLevel}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ Stat Cards ══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Comidas" value={dashboard.mealsToday} icon={<Utensils className="w-5 h-5" />} />
        <StatCard
          label="Calorías"
          value={dashboard.caloriesToday > 0 ? dashboard.caloriesToday.toLocaleString() : '0'}
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          sub={targetCal > 0 ? `Meta: ${targetCal.toLocaleString()}` : undefined}
        />
        <StatCard
          label="Proteína"
          value={dashboard.proteinToday > 0 ? `${dashboard.proteinToday}g` : '0g'}
          icon={<Activity className="w-5 h-5 text-red-500" />}
        />
        <StatCard
          label="Tareas"
          value={tasksTotal > 0 ? `${tasksDone}/${tasksTotal}` : 'N/A'}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          active={tasksPct === 100}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* ══════════ Macros ══════════ */}
          {dashboard.caloriesToday > 0 && (
            <Card className="bg-[#111] border-white/5">
              <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white mb-4">Macro Balance</h3>
              <div className="grid grid-cols-5 gap-3">
                <MacroBar label="PROT" value={dashboard.proteinToday} unit="g" color="bg-red-500" />
                <MacroBar label="CARB" value={dashboard.carbsToday} unit="g" color="bg-amber-500" />
                <MacroBar label="FAT" value={dashboard.fatToday} unit="g" color="bg-blue-500" />
                <MacroBar label="FIBRA" value={dashboard.fiberToday} unit="g" color="bg-green-500" />
                <MacroBar label="AZÚCAR" value={dashboard.sugarToday} unit="g" color="bg-pink-500" />
              </div>
            </Card>
          )}

          {/* ══════════ Tareas del día ══════════ */}
          {tasksTotal > 0 && (
            <Card className="bg-[#111] border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white">Objetivos Diarios</h3>
                <span className={cn(
                  'text-xs font-bold px-3 py-1 rounded-full font-condensed tracking-widest',
                  tasksPct === 100
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : tasksPct > 0
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-white/5 text-neutral-400 border border-white/10'
                )}>
                  {tasksPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 mb-5 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    tasksPct === 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : tasksPct > 0 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
                  )}
                  style={{ width: `${tasksPct}%` }}
                />
              </div>
              <div className="space-y-2">
                {tasks.map((task) => {
                  const done = todayLogs.some((l) => l.taskId === task.id);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all border',
                        done
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-[#1a1a1a] border-white/5'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] transition-all',
                          done
                            ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                            : 'border-2 border-white/10 text-transparent'
                        )}
                      >
                        {done ? '✓' : ''}
                      </div>
                      <span className="text-lg drop-shadow-sm">{task.icon}</span>
                      <span className={cn(
                        'flex-1 font-medium',
                        done
                          ? 'text-neutral-500 line-through'
                          : 'text-neutral-200'
                      )}>
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ══════════ Rutina activa ══════════ */}
          {activeRoutine ? (
            <Card className="bg-[#111] border-white/5 p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary-500" /> {activeRoutine.name}
                  </h3>
                  <Badge variant="success" className="font-condensed tracking-widest text-[10px]">ACTIVA</Badge>
                </div>
                {activeRoutine.description && (
                  <p className="text-sm text-neutral-400">{activeRoutine.description}</p>
                )}
                
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3 text-center">
                    <p className="text-2xl font-condensed font-bold text-white leading-none">
                      {activeRoutine.days.filter((d) => !d.isRestDay).length}
                    </p>
                    <p className="text-[10px] font-condensed font-bold tracking-widest uppercase text-neutral-500 mt-1">Días</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3 text-center">
                    <p className="text-2xl font-condensed font-bold text-white leading-none">
                      {activeRoutine.days.reduce((sum, d) => sum + d.exercises.length, 0)}
                    </p>
                    <p className="text-[10px] font-condensed font-bold tracking-widest uppercase text-neutral-500 mt-1">Ejer.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3 text-center">
                    <p className="text-2xl font-condensed font-bold text-white leading-none">{activeRoutine.weekCount}</p>
                    <p className="text-[10px] font-condensed font-bold tracking-widest uppercase text-neutral-500 mt-1">Sem.</p>
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-[#161616]">
                {activeRoutine.days.map((day) => (
                  <div key={day.id} className="border-b border-white/5 last:border-0">
                    <div className={cn(
                      'px-5 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md',
                      day.isRestDay ? 'bg-black/80' : 'bg-[#1a1a1a]/90'
                    )}>
                      <span className="text-sm font-condensed font-bold uppercase tracking-wider text-white">
                        Día {day.dayNumber}
                        {!day.isRestDay && (
                          <span className="ml-2 text-primary-400">/ {day.focusArea}</span>
                        )}
                      </span>
                      {day.isRestDay ? (
                        <span className="text-xs font-bold text-neutral-500 font-condensed uppercase tracking-widest flex items-center gap-1">
                          😴 Descanso
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-500 font-condensed uppercase tracking-widest">
                          {day.exercises.length} Ejercicios
                        </span>
                      )}
                    </div>

                    {!day.isRestDay && day.exercises.length > 0 && (
                      <div className="divide-y divide-white/5 px-2 pb-2">
                        {day.exercises.map((ex) => {
                          const exLogs = logsByExercise[ex.id] ?? [];
                          const muscleKey = ex.muscleGroup.toLowerCase();
                          const emoji = MUSCLE_EMOJI[muscleKey] ?? '🏋️';
                          const latestLog = exLogs.length > 0
                            ? exLogs.reduce((a, b) => a.weekNumber > b.weekNumber ? a : b)
                            : null;

                          return (
                            <div key={ex.id} className="p-3 rounded-xl hover:bg-white/5 transition-colors my-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-xl drop-shadow-sm">{emoji}</span>
                                  <span className="text-sm font-bold text-white truncate">{ex.name}</span>
                                </div>
                                <span className="text-xs font-condensed font-bold tracking-widest text-neutral-400 bg-[#222] px-2 py-1 rounded-md shrink-0 border border-white/5">
                                  {ex.sets}×{ex.reps}
                                </span>
                              </div>

                              {latestLog && latestLog.setsData && latestLog.setsData.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-8">
                                  {latestLog.setsData.map((s) => (
                                    <span
                                      key={s.set}
                                      className={cn(
                                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold font-condensed tracking-wider',
                                        s.completed
                                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                          : 'bg-white/5 text-neutral-400 border border-white/5'
                                      )}
                                    >
                                      S{s.set}: {s.weight ?? 0}kg × {s.reps ?? 0}
                                      {s.completed && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {ex.observations && (
                                <p className="text-xs text-primary-200 mt-2 pl-8 border-l-2 border-primary-500/30 ml-1 py-0.5">
                                  {ex.observations}
                                </p>
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
            <Card className="bg-[#111] border-dashed border-2 border-white/10 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-neutral-500">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white mb-2">Sin rutina activa</h3>
              <p className="text-sm text-neutral-400">Este cliente no tiene una rutina asignada actualmente.</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* ══════════ Comidas de hoy detalladas ══════════ */}
          {todayMeals.length > 0 && (
            <Card className="bg-[#111] border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white">
                  Dieta de Hoy
                </h3>
                  <Badge variant="default" className="font-condensed font-bold">{todayMeals.length} REGISTROS</Badge>
              </div>
              <div className="space-y-3">
                {todayMeals.map((meal) => {
                  const ratingConf = meal.goalRating ? GOAL_RATING_CONFIG[meal.goalRating] : null;
                  return (
                    <div key={meal.id} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden group hover:border-white/10 transition-all">
                      <div className="flex gap-4 p-4">
                        {meal.imageUrl ? (
                          <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-white/10">
                            <img src={meal.imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 text-3xl shrink-0 border border-white/5 shadow-inner">
                            {MEAL_EMOJI[meal.mealType] ?? '🍽️'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest font-condensed bg-primary-500/10 px-2 py-0.5 rounded-md">
                              {MEAL_LABEL[meal.mealType] ?? meal.mealType}
                            </span>
                            {ratingConf && (
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-widest font-condensed', ratingConf.bgColor.replace('bg-', 'bg-opacity-20 bg-'), ratingConf.color)}>
                                {ratingConf.icon} {ratingConf.label}
                              </span>
                            )}
                          </div>
                          <p className="text-base font-bold text-white truncate">{meal.name}</p>
                          {meal.foods.length > 0 && (
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                              {meal.foods.join(', ')}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                            <span className="text-sm font-bold text-amber-500 font-condensed tracking-wider">
                              {formatCalories(meal.calories)} <span className="text-[10px] text-amber-500/50">KCAL</span>
                            </span>
                            <div className="flex gap-2 text-xs font-medium text-neutral-400">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {meal.protein}g</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {meal.carbs}g</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {meal.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {meal.recommendation && (
                        <div className="px-4 pb-4">
                          <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 px-4 py-3 text-sm text-primary-200">
                            <span className="font-bold text-primary-400 font-condensed uppercase tracking-wider block mb-1">IA Insight</span>
                            {meal.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ══════════ Tendencia semanal ══════════ */}
          {dashboard.weeklyTrend.length > 0 && (
            <Card className="bg-[#111] border-white/5">
              <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white mb-6">Actividad Semanal</h3>
              <div className="flex items-end justify-between gap-2 h-32 px-2">
                {dashboard.weeklyTrend.map((d) => {
                  const maxCal = Math.max(...dashboard.weeklyTrend.map((t) => t.calories), 1);
                  const height = (d.calories / maxCal) * 100;
                  const isActive = d.calories > 0;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] text-neutral-400 font-bold font-condensed tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive ? d.calories : ''}
                      </span>
                      <div className="w-full flex items-end justify-center h-full relative">
                        <div
                          className={cn(
                            'w-full max-w-10 rounded-xl transition-all duration-500 relative overflow-hidden',
                            isActive ? 'bg-primary-500/20 border border-primary-500/30 shadow-[0_0_15px_rgba(var(--color-primary-500),0.1)]' : 'bg-white/5'
                          )}
                          style={{ height: `${Math.max(height, 8)}%` }}
                        >
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary-500" style={{ height: '30%' }} />
                          )}
                        </div>
                      </div>
                      <span className={cn('text-xs font-condensed font-bold uppercase tracking-widest', isActive ? 'text-primary-400' : 'text-neutral-600')}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ══════════ Info adicional del cliente ══════════ */}
          {(client.medicalConditions || client.dietaryPreferences) && (
            <Card className="bg-[#111] border-white/5">
              <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-white mb-4">Avisos Importantes</h3>
              <div className="space-y-3">
                {client.medicalConditions && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-xs font-bold text-red-500 font-condensed uppercase tracking-widest flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4" /> Condiciones médicas
                    </p>
                    <p className="text-sm text-red-200">{client.medicalConditions}</p>
                  </div>
                )}
                {client.dietaryPreferences && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-xs font-bold text-blue-400 font-condensed uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Apple className="w-4 h-4" /> Preferencias alimentarias
                    </p>
                    <p className="text-sm text-blue-200">{client.dietaryPreferences}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable stat card ── */
function StatCard({ label, value, icon, sub, active }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border bg-[#1a1a1a] p-4 relative overflow-hidden transition-all",
      active ? "border-primary-500/30 shadow-[0_0_15px_rgba(var(--color-primary-500),0.1)]" : "border-white/5"
    )}>
      {active && <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-condensed font-bold text-white tracking-wide leading-none mb-1">
          {value}
        </p>
        <p className="text-[11px] font-bold text-neutral-500 font-condensed tracking-widest uppercase">{label}</p>
        {sub && <p className="text-[10px] text-primary-400/70 font-medium mt-1 uppercase tracking-wider">{sub}</p>}
      </div>
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
    <div className="text-center bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
      <p className="text-xl font-condensed font-bold text-white leading-none mb-0.5">{value > 0 ? value : '0'}</p>
      <p className="text-[10px] text-neutral-500 font-condensed font-bold uppercase tracking-widest">{unit}</p>
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000', color, value > 0 ? 'opacity-100' : 'opacity-0')} style={{ width: value > 0 ? '100%' : '0%' }} />
      </div>
      <p className="text-[10px] font-condensed font-bold tracking-widest text-neutral-400 mt-2">{label}</p>
    </div>
  );
}