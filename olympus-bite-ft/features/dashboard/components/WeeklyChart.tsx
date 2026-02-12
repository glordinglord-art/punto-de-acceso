import { Card, CardTitle } from '@/shared/components/ui/Card';
import type { WeeklyTrendDay } from '../types/dashboard.types';

interface WeeklyChartProps {
  data: WeeklyTrendDay[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxMeals = Math.max(...data.map((d) => d.meals), 1);
  const maxCalories = Math.max(...data.map((d) => d.calories), 1);
  const totalMeals = data.reduce((s, d) => s + d.meals, 0);
  const totalCalories = data.reduce((s, d) => s + d.calories, 0);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <CardTitle>Actividad semanal</CardTitle>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Comidas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Calorías
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-6 mb-6 mt-2">
        <div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalMeals}</p>
          <p className="text-xs text-neutral-400">comidas totales</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {totalCalories.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400">kcal totales</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2 flex-1 min-h-0">
        {data.map((d) => {
          const mealsHeight = (d.meals / maxMeals) * 100;
          const calHeight = (d.calories / maxCalories) * 100;
          const isToday = d.date === today;

          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              {/* Bars */}
              <div className="flex items-end gap-1 w-full flex-1 min-h-[120px]">
                <div className="flex-1 flex flex-col justify-end h-full">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isToday ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700'
                    }`}
                    style={{ height: `${Math.max(mealsHeight, 4)}%` }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end h-full">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isToday ? 'bg-amber-400' : 'bg-amber-200 dark:bg-amber-700'
                    }`}
                    style={{ height: `${Math.max(calHeight, 4)}%` }}
                  />
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-neutral-400'
                }`}
              >
                {d.day}
              </span>

              {/* Value */}
              {d.meals > 0 && (
                <span className="text-[10px] text-neutral-400">{d.meals}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
