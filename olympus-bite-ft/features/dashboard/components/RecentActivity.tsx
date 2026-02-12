import { Card, CardTitle } from '@/shared/components/ui/Card';
import { formatCalories, formatTime } from '@/shared/lib/utils';
import type { RecentMeal } from '../types/dashboard.types';

interface RecentActivityProps {
  meals: RecentMeal[];
}

const MEAL_TYPE_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export function RecentActivity({ meals }: RecentActivityProps) {
  if (meals.length === 0) {
    return (
      <Card>
        <CardTitle>Actividad reciente</CardTitle>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sin actividad reciente
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Las comidas de tus clientes aparecerán aquí
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className="px-2 pt-2 pb-1 flex items-center justify-between">
        <CardTitle>Actividad reciente</CardTitle>
        <span className="text-xs text-neutral-400 font-medium shrink-0">{meals.length} registros</span>
      </div>

      <div className="mt-2 space-y-1 max-h-[400px] overflow-y-auto">
        {meals.map((meal, i) => (
          <div
            key={meal.id || i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800/50"
          >
            {/* Image or emoji */}
            <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt={meal.mealName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {MEAL_TYPE_EMOJI[meal.mealType] || '🍽️'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {meal.mealName}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {meal.userName}
              </p>
            </div>

            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                {formatCalories(meal.calories)}
              </span>
              <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                {formatTime(meal.time)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
