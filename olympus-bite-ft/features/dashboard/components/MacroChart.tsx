'use client';

import { motion } from 'framer-motion';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import type { MacroAverages, MealTypeCount } from '../types/dashboard.types';
import { MEAL_TYPE_COLORS } from '../types/dashboard.types';
import { cn } from '@/shared/lib/utils';

interface MacroChartProps {
  macros: MacroAverages;
  mealTypes: MealTypeCount[];
}

const MACRO_CONFIG = [
  { key: 'protein' as const, label: 'Proteína', color: '#f87171', glow: '#f8717140' },
  { key: 'carbs'   as const, label: 'Carbos',   color: '#60a5fa', glow: '#60a5fa40' },
  { key: 'fat'     as const, label: 'Grasas',   color: '#fbbf24', glow: '#fbbf2440' },
  { key: 'fiber'   as const, label: 'Fibra',    color: '#34d399', glow: '#34d39940' },
  { key: 'sugar'   as const, label: 'Azúcar',   color: '#e879f9', glow: '#e879f940' },
];

export function MacroChart({ macros, mealTypes }: MacroChartProps) {
  const values = MACRO_CONFIG.map((m) => macros[m.key]);
  const maxVal = Math.max(...values, 1);
  const totalMealTypes = mealTypes.reduce((s, m) => s + m.count, 0) || 1;

  return (
    <Card className="h-full">
      <CardTitle>Nutrición promedio hoy</CardTitle>

      {/* Macro bars */}
      <div className="mt-5 space-y-3.5">
        {MACRO_CONFIG.map((m, i) => {
          const value = macros[m.key];
          const pct = Math.max((value / maxVal) * 100, 2);

          return (
            <div key={m.key} className="group">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: m.color, boxShadow: `0 0 6px ${m.glow}` }}
                  />
                  <span className="text-sm font-medium text-slate-300">{m.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{value}g</span>
              </div>

              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.1, delay: 0.05 + i * 0.1, ease: 'easeOut' }}
                />
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-y-0 w-8 rounded-full bg-white/20 blur-sm"
                  initial={{ left: '-10%' }}
                  animate={{ left: `${pct}%` }}
                  transition={{ duration: 1.1, delay: 0.05 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal type distribution */}
      {mealTypes.length > 0 && (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="mb-3 text-sm font-semibold text-slate-300">Distribución por tipo</p>

          {/* Stacked bar */}
          <div className="flex h-4 overflow-hidden rounded-full">
            {mealTypes.map((mt, i) => {
              const pct = (mt.count / totalMealTypes) * 100;
              const color = MEAL_TYPE_COLORS[mt.type]?.ring || '#9ca3af';
              return (
                <motion.div
                  key={mt.type}
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.08 }}
                />
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {mealTypes.map((mt) => {
              const cfg = MEAL_TYPE_COLORS[mt.type];
              return (
                <div
                  key={mt.type}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold',
                    cfg?.bg ?? 'bg-white/8',
                    cfg?.text ?? 'text-white',
                  )}
                >
                  {mt.type}
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold"
                  >
                    {mt.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
