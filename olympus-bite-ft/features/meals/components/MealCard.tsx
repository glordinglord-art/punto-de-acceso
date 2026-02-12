import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { MEAL_TYPES } from '@/shared/lib/constants';
import { formatCalories, formatTime } from '@/shared/lib/utils';
import type { Meal } from '../types/meals.types';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  const mealTypeInfo = MEAL_TYPES[meal.mealType];

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Icon/Image */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-2xl dark:bg-neutral-800 overflow-hidden">
          {meal.imageUrl && meal.imageUrl !== 'uploaded' ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={meal.imageUrl} alt={meal.name} className="h-full w-full object-cover" />
          ) : (
            <span>{mealTypeInfo.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {meal.name}
            </h3>
            {meal.isRecommendation && (
              <Badge variant="info">Recomendada</Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {meal.description}
          </p>

          {/* Macros */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatCalories(meal.calories)}
            </span>
            <span className="text-blue-600">P: {meal.protein}g</span>
            <span className="text-amber-600">C: {meal.carbs}g</span>
            <span className="text-rose-600">G: {meal.fat}g</span>
          </div>

          {/* Foods tags */}
          {meal.foods.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meal.foods.slice(0, 3).map((food, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {food}
                </span>
              ))}
              {meal.foods.length > 3 && (
                <span className="text-[11px] text-neutral-400">
                  +{meal.foods.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time */}
        <div className="text-right shrink-0">
          <Badge>{mealTypeInfo.label}</Badge>
          <p className="text-[11px] text-neutral-400 mt-1">
            {formatTime(meal.date)}
          </p>
        </div>
      </div>
    </Card>
  );
}
