import { Card, CardTitle } from '@/shared/components/ui/Card';
import type { TopFood } from '../types/dashboard.types';

interface TopFoodsProps {
  foods: TopFood[];
}

export function TopFoods({ foods }: TopFoodsProps) {
  if (foods.length === 0) {
    return null;
  }

  const maxCount = Math.max(...foods.map((f) => f.count), 1);

  return (
    <Card>
      <CardTitle>Alimentos más comunes</CardTitle>
      <p className="text-xs text-neutral-400 mb-4">Últimos 30 días</p>

      <div className="space-y-2.5">
        {foods.map((food, i) => {
          const pct = (food.count / maxCount) * 100;
          return (
            <div key={food.name} className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-400 w-5 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize truncate">
                    {food.name}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0 ml-2">
                    {food.count}×
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
