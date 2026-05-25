'use client';

import { useEffect, useState, useId, type ReactNode } from 'react';
import { motion, animate } from 'framer-motion';
import { Users, Flame, Dumbbell, TrendingUp, TrendingDown, Utensils } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { cn, formatCalories } from '@/shared/lib/utils';
import type { DashboardStats } from '../types/dashboard.types';

// ─────────────────────────────────────────────────────────
// Animated counter
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
// Single SVG ring
// ─────────────────────────────────────────────────────────
interface RingCfg {
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
  cfg: RingCfg;
  size: number;
  strokeWidth: number;
  index: number;
  uid: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((cfg.current / Math.max(cfg.goal, 1)) * 100, 100);
  const targetOffset = circumference * (1 - pct / 100);
  const gId = `trg-${uid}-${index}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.color} />
            <stop offset="100%" stopColor={cfg.gradientEnd} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
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
// Ring legend item
// ─────────────────────────────────────────────────────────
function RingLabel({ cfg, index }: { cfg: RingCfg; index: number }) {
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
        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{cfg.label}</p>
        <p className="font-display text-xl leading-none text-slate-900 mt-1 dark:text-white">
          <AnimatedCounter value={cfg.current} />
          <span className="text-[10px] font-sans text-slate-500 ml-0.5">/{cfg.goal}</span>
        </p>
        <p className="text-[9px] text-slate-500 mt-0.5">{cfg.unit}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────
interface TrainerHeroCardProps {
  stats: DashboardStats;
}

const KCAL_TARGET = 2200;

export function TrainerHeroCard({ stats }: TrainerHeroCardProps) {
  const uid = useId().replace(/:/g, '');

  const clientsActiveToday = stats.clientsOverview.filter((c) => c.mealsToday > 0).length;
  const weekDiff =
    stats.mealsLastWeek > 0
      ? Math.round(((stats.mealsThisWeek - stats.mealsLastWeek) / stats.mealsLastWeek) * 100)
      : stats.mealsThisWeek > 0 ? 100 : 0;
  const weekIsPositive = weekDiff >= 0;

  const rings: RingCfg[] = [
    {
      label: 'Clientes activos',
      current: clientsActiveToday,
      goal: Math.max(stats.totalClients, 1),
      unit: 'con actividad hoy',
      color: '#38bdf8',
      gradientEnd: '#3b82f6',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Kcal prom.',
      current: Math.round(stats.avgCaloriesToday),
      goal: KCAL_TARGET,
      unit: `de ${KCAL_TARGET} kcal meta`,
      color: '#fbbf24',
      gradientEnd: '#f59e0b',
      icon: <Flame className="h-4 w-4" />,
    },
    {
      label: 'Rutinas activas',
      current: stats.activeRoutines,
      goal: Math.max(stats.totalRoutines, 1),
      unit: 'de rutinas totales',
      color: '#34d399',
      gradientEnd: '#10b981',
      icon: <Dumbbell className="h-4 w-4" />,
    },
  ];

  const RING_SIZES = [240, 188, 136];
  const STROKE = 16;

  const engagementPct =
    stats.totalClients > 0 ? Math.round((clientsActiveToday / stats.totalClients) * 100) : 0;

  return (
    <Card className="relative overflow-hidden border-primary-400/20 bg-linear-to-br from-white via-slate-50 to-white shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:border-primary-400/12 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary-400/50 to-transparent" />

      <div className="grid gap-6 sm:grid-cols-[0.9fr_1.1fr]">
        {/* ── Rings ── */}
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="w-full">
            <p className="font-display text-xs uppercase tracking-[0.28em] text-primary-300/80">Panel del entrenador</p>
          </div>

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

            {/* Center */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Actividad</p>
                <p className="font-display text-4xl leading-none text-slate-900 dark:text-white">
                  {engagementPct}%
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400/60">de clientes</p>
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

        {/* ── Stats column ── */}
        <div className="flex flex-col justify-between gap-3">
          {/* Weekly comparison */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/5 dark:shadow-none">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Actividad semanal</p>
                <p className="mt-1.5 font-display text-4xl leading-none text-slate-900 dark:text-white">
                  <AnimatedCounter value={stats.mealsThisWeek} />
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400/60">comidas registradas</p>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                  weekIsPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400',
                )}
              >
                {weekIsPositive
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
                {weekDiff > 0 ? '+' : ''}{weekDiff}%
              </div>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
              vs {stats.mealsLastWeek} la semana pasada
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  weekIsPositive
                    ? 'bg-linear-to-r from-emerald-600 to-emerald-400'
                    : 'bg-linear-to-r from-rose-600 to-rose-400',
                )}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    stats.mealsLastWeek > 0
                      ? (stats.mealsThisWeek / Math.max(stats.mealsLastWeek, 1)) * 100
                      : 100,
                    100,
                  )}%`,
                }}
                transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Mini stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: 'Clientes',
                value: stats.totalClients,
                display: `${stats.totalClients}`,
                sub: 'en total',
                tone: 'from-blue-500/20 to-blue-500/5',
                color: 'text-blue-300'
              },
              {
                label: 'Comidas hoy',
                value: stats.activeMealsToday,
                display: `${stats.activeMealsToday}`,
                sub: 'registros',
                tone: 'from-amber-500/20 to-amber-500/5',
                color: 'text-amber-300'
              },
              {
                label: 'Prom. proteína',
                value: stats.macroAverages.protein,
                display: `${Math.round(stats.macroAverages.protein)}g`,
                sub: 'promedio clientes',
                tone: 'from-rose-500/20 to-rose-500/5',
                color: 'text-rose-300'
              },
              {
                label: 'Prom. carbos',
                value: stats.macroAverages.carbs,
                display: `${Math.round(stats.macroAverages.carbs)}g`,
                sub: 'promedio clientes',
                tone: 'from-sky-500/20 to-sky-500/5',
                color: 'text-sky-300'
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={cn("rounded-[24px] border border-slate-200 bg-linear-to-br p-3 shadow-sm dark:border-white/8 dark:shadow-none", item.tone)}
              >
                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className={cn("mt-1 text-xl font-bold", item.color)}>
                  {item.display}
                </p>
                <p className="text-[9px] text-slate-600 dark:text-slate-300/64">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Avg calories highlight */}
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-amber-400" />
                <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">Promedio kcal clientes</p>
              </div>
              <span className="text-xl font-display font-bold text-amber-600 dark:text-amber-300">
                {formatCalories(Math.round(stats.avgCaloriesToday))}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.avgCaloriesToday / KCAL_TARGET) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Meta de referencia: {formatCalories(KCAL_TARGET)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
