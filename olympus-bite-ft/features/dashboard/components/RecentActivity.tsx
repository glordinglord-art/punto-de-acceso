'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import { formatCalories, formatTime } from '@/shared/lib/utils';
import type { RecentMeal } from '../types/dashboard.types';
import { MEAL_TYPE_COLORS } from '../types/dashboard.types';
import { cn } from '@/shared/lib/utils';

interface RecentActivityProps {
  meals: RecentMeal[];
}

const MEAL_LABEL: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

export function RecentActivity({ meals }: RecentActivityProps) {
  if (meals.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardTitle>Actividad reciente</CardTitle>
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="font-display text-2xl uppercase text-white/40">Sin actividad</p>
          <p className="mt-2 text-xs text-slate-500">Las comidas de tus clientes aparecerán aquí</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-4">
        <CardTitle>Actividad reciente</CardTitle>
        <span className="shrink-0 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {meals.length}
        </span>
      </div>

      <div className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-2">
        {meals.map((meal, i) => {
          const spanishType = MEAL_LABEL[meal.mealType] ?? meal.mealType;
          const cfg = MEAL_TYPE_COLORS[spanishType];

          return (
              <motion.div
                key={meal.id || i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-[20px] border border-white/4 bg-white/4 px-3 py-3 transition-colors hover:bg-white/8"
              >
              {/* Avatar / meal icon */}
              <div
                className={cn(
                  'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-[9px] font-bold uppercase tracking-[0.1em]',
                  cfg?.bg ?? 'bg-white/8',
                  cfg?.text ?? 'text-white',
                )}
              >
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.mealName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  spanishType.slice(0, 2)
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">{meal.mealName}</p>
                <p className="truncate text-xs text-slate-400">{meal.userName}</p>
              </div>

              {/* Stats */}
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-amber-300">{formatCalories(meal.calories)}</span>
                <span className="text-[10px] text-slate-500">{formatTime(meal.time)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
