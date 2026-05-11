'use client';

import { useEffect, useState, useCallback, useId, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, animate } from 'framer-motion';
import {
  Flame, Droplets, Beef, Dumbbell, Calendar, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { MEAL_TYPE_COLORS } from '@/features/dashboard/types/dashboard.types';
import type { ClientDashboard } from '@/features/dashboard/types/dashboard.types';
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Header } from '@/shared/components/layout/Header';
import { cn, formatCalories } from '@/shared/lib/utils';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const WATER_GOAL = 8;
const PROTEIN_GOAL = 120;

// ─────────────────────────────────────────────────────────
// Animated number counter (no hooks-in-map violation)
// ─────────────────────────────────────────────────────────
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display.toLocaleString('es')}</>;
}

// ─────────────────────────────────────────────────────────
// Single SVG activity ring (extracted to avoid hooks-in-map)
// ─────────────────────────────────────────────────────────
interface RingConfig {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  gradientEnd: string;
  icon: ReactNode;
}

function ActivityRing({
  cfg,
  size,
  strokeWidth,
  index,
  uid,
}: {
  cfg: RingConfig;
  size: number;
  strokeWidth: number;
  index: number;
  uid: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((cfg.current / Math.max(cfg.goal, 1)) * 100, 100);
  const targetOffset = circumference * (1 - pct / 100);
  const gId = `rg-${uid}-${index}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.color} />
            <stop offset="100%" stopColor={cfg.gradientEnd} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.8, delay: index * 0.28, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${cfg.color}55)` }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Ring legend label (extracted to avoid hooks-in-map)
// ─────────────────────────────────────────────────────────
function RingLabel({ cfg, index }: { cfg: RingConfig; index: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 + index * 0.12 }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
      >
        {cfg.icon}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{cfg.label}</p>
        <p className="text-sm font-bold text-white">
          <AnimatedCounter value={cfg.current} />
          <span className="text-[10px] font-normal text-slate-500">/{cfg.goal}</span>
        </p>
        <p className="text-[9px] text-slate-600">{cfg.unit}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Empty state panel
// ─────────────────────────────────────────────────────────
function EmptyPanel({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mt-4 flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/10 bg-white/3 px-6 text-center">
      {icon}
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export function ClientDashboardView({
  trainerSwitchAction,
}: {
  trainerSwitchAction?: ReactNode;
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const uid = useId().replace(/:/g, '');

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

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <>
        <Header title="Preparando tu día" subtitle="Cargando tu progreso..." />
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-[28px] bg-white/6" />
          ))}
        </div>
      </>
    );
  }

  if (!stats) return null;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
  const calorieGoal = stats.targetCalories ?? 2200;
  const caloriePct = Math.min(Math.round((stats.caloriesToday / Math.max(calorieGoal, 1)) * 100), 100);
  const caloriesLeft = Math.max(calorieGoal - stats.caloriesToday, 0);
  const routineProgress =
    stats.activeRoutine && stats.activeRoutine.totalLogs > 0
      ? Math.round((stats.activeRoutine.completedLogs / stats.activeRoutine.totalLogs) * 100)
      : 0;

  const todayNum = now.getDay() === 0 ? 7 : now.getDay();
  const todayDay = stats.activeRoutine?.days.find((d) => d.dayNumber === todayNum);
  const waterGlasses = stats.waterGlasses ?? 0;

  const handleWaterClick = async (index: number) => {
    if (!user) return;
    const newAmount = index + 1 === waterGlasses ? index : index + 1;
    // Optimistic update
    setStats((prev) => prev ? { ...prev, waterGlasses: newAmount } : prev);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await dashboardService.updateWater(user.id, todayStr, newAmount);
    } catch {
      // Revert on error
      setStats((prev) => prev ? { ...prev, waterGlasses: waterGlasses } : prev);
    }
  };

  const rings: RingConfig[] = [
    {
      label: 'Calorías',
      current: stats.caloriesToday,
      goal: calorieGoal,
      unit: 'kcal',
      color: '#FF6B35',
      gradientEnd: '#FF2D55',
      icon: <Flame className="h-4 w-4" />,
    },
    {
      label: 'Agua',
      current: waterGlasses,
      goal: WATER_GOAL,
      unit: 'vasos',
      color: '#00D9FF',
      gradientEnd: '#0891B2',
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      label: 'Proteína',
      current: stats.proteinToday,
      goal: PROTEIN_GOAL,
      unit: 'gramos',
      color: '#A3F900',
      gradientEnd: '#84CC16',
      icon: <Beef className="h-4 w-4" />,
    },
  ];

  const RING_SIZES = [240, 188, 136];
  const STROKE = 16;

  const macros = [
    { label: 'Proteína', value: stats.proteinToday, color: '#f87171' },
    { label: 'Carbos', value: stats.carbsToday, color: '#60a5fa' },
    { label: 'Grasas', value: stats.fatToday, color: '#fbbf24' },
    { label: 'Fibra', value: stats.fiberToday, color: '#34d399' },
    { label: 'Azúcar', value: stats.sugarToday, color: '#e879f9' },
  ];
  const maxMacro = Math.max(...macros.map((m) => m.value), 1);

  return (
    <>
      <Header
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Atleta'}`}
        subtitle={
          stats.trainerName
            ? `Entrenador: ${stats.trainerName} · ${new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}`
            : new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
        }
        action={
          <div className="flex items-center gap-3">
            {trainerSwitchAction}
          </div>
        }
      />

      <div className="space-y-5">
        {/* ── Hero Row ── */}
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">

          {/* Activity Rings card */}
          <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Rings */}
              <div className="flex flex-col items-center gap-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Resumen del día</p>

                <div className="relative" style={{ width: RING_SIZES[0], height: RING_SIZES[0] }}>
                  {rings.map((cfg, i) => (
                    <ActivityRing
                      key={cfg.label}
                      cfg={cfg}
                      size={RING_SIZES[i]}
                      strokeWidth={STROKE}
                      index={i}
                      uid={uid}
                    />
                  ))}

                  {/* Center overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Calorías</p>
                      <p className="font-display text-4xl font-bold leading-none text-white">
                        {caloriePct}%
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{formatCalories(stats.caloriesToday)}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Ring labels */}
                <div className="grid w-full grid-cols-3 gap-1">
                  {rings.map((cfg, i) => (
                    <RingLabel key={cfg.label} cfg={cfg} index={i} />
                  ))}
                </div>
              </div>

              {/* Stats column */}
              <div className="flex flex-col justify-between gap-3">
                {/* Calorie goal */}
                <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Meta diaria</p>
                      <p className="mt-1.5 text-xl font-bold text-white">{formatCalories(calorieGoal)}</p>
                    </div>
                    <Badge variant={caloriePct >= 100 ? 'success' : 'info'}>
                      {caloriePct}% completado
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {caloriesLeft > 0 ? `Faltan ${formatCalories(caloriesLeft)}` : '¡Objetivo cumplido hoy!'}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${caloriePct}%` }}
                      transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Comidas', value: `${stats.mealsToday}`, sub: 'hoy', color: '#34d399' },
                    { label: 'Proteína', value: `${stats.proteinToday}g`, sub: 'consumida', color: '#f87171' },
                    { label: 'Esta sem.', value: `${stats.mealsThisWeek}`, sub: 'registros', color: '#60a5fa' },
                    { label: 'Carbos', value: `${stats.carbsToday}g`, sub: 'ingeridos', color: '#fbbf24' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="rounded-[18px] border border-white/8 bg-white/4 p-3"
                    >
                      <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                      <p className="mt-1 text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-[9px] text-slate-600">{item.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Water tracker */}
                <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-400" />
                      <p className="text-sm font-semibold text-slate-300">Hidratación</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-300">{waterGlasses}/{WATER_GOAL} vasos</span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: WATER_GOAL }).map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleWaterClick(i)}
                        className={cn(
                          'h-7 flex-1 rounded-full border cursor-pointer transition-all hover:brightness-110 active:scale-95',
                          i < waterGlasses
                            ? 'border-cyan-400/30 bg-gradient-to-t from-cyan-600 to-cyan-300'
                            : 'border-white/8 bg-white/4',
                        )}
                        initial={{ scaleY: 0.2, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ duration: 0.35, delay: 0.6 + i * 0.07 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Routine card */}
          <Card className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Rutina de hoy</CardTitle>
                <CardDescription>
                  {stats.activeRoutine
                    ? `${stats.activeRoutine.trainingDays} días · ${stats.activeRoutine.weekCount} semanas`
                    : 'Sin rutina asignada aún'}
                </CardDescription>
              </div>
              {stats.activeRoutine && (
                <Link href="/routines" className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary-300 hover:text-primary-200">
                  Ver <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {!stats.activeRoutine ? (
              <EmptyPanel
                icon={<Dumbbell className="h-8 w-8 text-slate-600" />}
                title="Sin rutina asignada"
                description="Tu entrenador aún no te ha asignado una rutina."
              />
            ) : todayDay?.isRestDay ? (
              <EmptyPanel
                icon={<span className="text-3xl">🛌</span>}
                title="Hoy toca descanso"
                description="Recuperar bien también es parte de progresar."
              />
            ) : todayDay ? (
              <div className="mt-4 flex flex-1 flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-[20px] border border-primary-400/20 bg-primary-500/8 px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-primary-400/80">Enfoque</p>
                    <p className="mt-0.5 text-base font-bold text-white">{todayDay.focusArea}</p>
                  </div>
                  <Badge variant="info">{todayDay.exercises.length} ejercicios</Badge>
                </div>

                <div className="max-h-56 flex-1 space-y-1.5 overflow-y-auto">
                  {todayDay.exercises.map((ex, i) => (
                    <motion.div
                      key={ex.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-slate-950/50 px-4 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8 text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{ex.name}</p>
                        <p className="text-xs text-slate-400">{ex.sets} × {ex.reps}</p>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-slate-500">{ex.muscleGroup}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyPanel
                icon={<Calendar className="h-8 w-8 text-slate-600" />}
                title={stats.activeRoutine.name}
                description="Rutina activa sin día asignado para hoy."
              />
            )}

            {stats.activeRoutine && (
              <div className="mt-4 rounded-[20px] border border-white/8 bg-white/4 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Progreso total</span>
                  <span className="font-bold text-white">{routineProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${routineProgress}%` }}
                    transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* ── Macros + Weekly Chart ── */}
        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardTitle>Macros de hoy</CardTitle>
            <CardDescription>Distribución nutricional del día.</CardDescription>

            <div className="mt-5 space-y-3.5">
              {macros.map((m, i) => {
                const pct = Math.max((m.value / maxMacro) * 100, 3);
                return (
                  <div key={m.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-300/80">{m.label}</span>
                      <span className="font-bold text-white">{m.value}g</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.mealTypeDistribution.length > 0 && (
              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Distribución de comidas</p>
                <div className="flex h-3 overflow-hidden rounded-full">
                  {stats.mealTypeDistribution.map((mt) => {
                    const total = stats.mealTypeDistribution.reduce((s, m) => s + m.count, 0) || 1;
                    const color = MEAL_TYPE_COLORS[mt.type]?.ring || '#9ca3af';
                    return (
                      <motion.div
                        key={mt.type}
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(mt.count / total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats.mealTypeDistribution.map((mt) => {
                    const cfg = MEAL_TYPE_COLORS[mt.type];
                    return (
                      <span
                        key={mt.type}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border border-white/8 px-3 py-1 text-xs font-semibold',
                          cfg?.bg ?? 'bg-white/8',
                          cfg?.text ?? 'text-white',
                        )}
                      >
                        {mt.type} <span className="font-bold">{mt.count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <WeeklyChart data={stats.weeklyTrend} />
        </section>

        {/* ── Recent Meals ── */}
        {stats.recentMeals.length > 0 && (
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Últimas comidas</CardTitle>
                <CardDescription>Tu registro más reciente para mantener la constancia.</CardDescription>
              </div>
              <Link href="/meals" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-300 hover:text-primary-200">
                Ver todas <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stats.recentMeals.slice(0, 6).map((meal, i) => {
                const spanishType = MEAL_LABELS[meal.mealType] ?? meal.mealType;
                const mealColor = MEAL_TYPE_COLORS[spanishType];
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-white/4 p-4 transition-all hover:border-white/14 hover:bg-white/6"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                            mealColor?.bg ?? 'bg-white/8',
                            mealColor?.text ?? 'text-white',
                          )}
                        >
                          {spanishType}
                        </span>
                        <p className="mt-2 truncate text-sm font-bold text-white">{meal.mealName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-orange-300">{formatCalories(meal.calories)}</p>
                        <p className="text-[10px] text-slate-500">{meal.protein}g prot.</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(meal.time).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
