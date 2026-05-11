'use client';

import { motion } from 'framer-motion';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import type { TopFood } from '../types/dashboard.types';

interface TopFoodsProps {
  foods: TopFood[];
}

const MEDALS = ['🥇', '🥈', '🥉'];
const BAR_COLORS = [
  'from-amber-500 to-yellow-300',
  'from-slate-400 to-slate-300',
  'from-orange-700 to-orange-500',
];

export function TopFoods({ foods }: TopFoodsProps) {
  if (foods.length === 0) return null;

  const maxCount = Math.max(...foods.map((f) => f.count), 1);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle>Alimentos más comunes</CardTitle>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Últimos 30 días</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
          Top {foods.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {foods.map((food, i) => {
          const pct = (food.count / maxCount) * 100;
          const isTop3 = i < 3;

          return (
            <motion.div
              key={food.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3"
            >
              {/* Rank */}
              <div className="flex w-8 shrink-0 items-center justify-center">
                {isTop3 ? (
                  <span className="text-lg leading-none">{MEDALS[i]}</span>
                ) : (
                  <span className="text-sm font-bold text-slate-600">{i + 1}</span>
                )}
              </div>

              {/* Bar + name */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="truncate text-sm font-semibold capitalize text-white">{food.name}</span>
                  <span className="ml-2 shrink-0 rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-xs font-bold text-slate-300">
                    {food.count}×
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className={`h-full rounded-full bg-linear-to-r ${isTop3 ? BAR_COLORS[i] : 'from-primary-500 to-primary-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
