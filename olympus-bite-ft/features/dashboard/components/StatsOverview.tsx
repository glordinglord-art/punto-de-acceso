'use client';

import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Users, Utensils, Dumbbell, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/shared/lib/utils';

// ─────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.3,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display.toLocaleString('es')}{suffix}</>;
}

// ─────────────────────────────────────────────────────────
// Single stat card
// ─────────────────────────────────────────────────────────
interface StatCardProps {
  index: number;
  title: string;
  value: number;
  suffix?: string;
  extra?: string | null;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  trend?: number | null;
}

function StatCard({
  index,
  title,
  value,
  suffix,
  extra,
  icon: Icon,
  iconColor,
  gradientFrom,
  gradientTo,
  trend,
}: StatCardProps) {
  const isPositive = trend != null && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.07] backdrop-blur-md transition-all hover:border-white/18 hover:bg-white/10"
    >
      {/* Gradient top border */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
      />

      {/* Ambient glow orb */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full opacity-15 blur-3xl transition-opacity duration-300 group-hover:opacity-25"
        style={{ background: `radial-gradient(circle, ${gradientFrom}, ${gradientTo})` }}
      />

      <div className="relative p-5">
        {/* Icon + Trend */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${iconColor}22`,
              boxShadow: `0 0 18px ${iconColor}28`,
              color: iconColor,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>

          {trend != null && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest',
                isPositive ? 'bg-emerald-500/12 text-emerald-400' : 'bg-rose-500/12 text-rose-400',
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-4">
          <p className="font-display text-4xl font-bold tracking-tight text-white">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-300/70">{title}</p>
          {extra && (
            <p className="mt-0.5 truncate text-[10px] text-slate-400/60">{extra}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────
interface StatsOverviewProps {
  totalClients: number;
  activeMealsToday: number;
  totalRoutines: number;
  activeRoutines: number;
  avgCaloriesToday: number;
  mealsThisWeek: number;
  mealsLastWeek: number;
}

export function StatsOverview(props: StatsOverviewProps) {
  const weekDiff =
    props.mealsLastWeek > 0
      ? Math.round(((props.mealsThisWeek - props.mealsLastWeek) / props.mealsLastWeek) * 100)
      : props.mealsThisWeek > 0
        ? 100
        : 0;

  const cards: Omit<StatCardProps, 'index'>[] = [
    {
      title: 'Clientes activos',
      value: props.totalClients,
      icon: Users,
      iconColor: '#3b82f6',
      gradientFrom: '#3b82f6',
      gradientTo: '#60a5fa',
      extra: props.totalClients === 1 ? '1 cliente en total' : `${props.totalClients} en total`,
    },
    {
      title: 'Comidas hoy',
      value: props.activeMealsToday,
      icon: Utensils,
      iconColor: '#10b981',
      gradientFrom: '#10b981',
      gradientTo: '#34d399',
      trend: weekDiff,
      extra: weekDiff !== 0
        ? `${weekDiff > 0 ? '+' : ''}${weekDiff}% vs semana pasada`
        : 'igual que la semana pasada',
    },
    {
      title: 'Rutinas activas',
      value: props.activeRoutines,
      icon: Dumbbell,
      iconColor: '#a855f7',
      gradientFrom: '#a855f7',
      gradientTo: '#c084fc',
      extra: props.totalRoutines > 0 ? `${props.totalRoutines} creadas en total` : null,
    },
    {
      title: 'Promedio kcal',
      value: props.avgCaloriesToday,
      icon: Flame,
      iconColor: '#f59e0b',
      gradientFrom: '#f59e0b',
      gradientTo: '#fbbf24',
      extra: props.activeMealsToday > 0 ? 'promedio entre clientes hoy' : 'sin datos hoy',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} index={i} {...card} />
      ))}
    </div>
  );
}
