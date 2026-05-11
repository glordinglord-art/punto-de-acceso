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
  
  // Use first available image
  const displayImage = meal.imageUrls?.length > 0 ? meal.imageUrls[0] : (meal.imageUrl !== 'uploaded' ? meal.imageUrl : null);

  return (
    <Card 
      hover 
      className="cursor-pointer group border border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md overflow-hidden relative" 
      onClick={onClick}
    >
      {/* Background Subtle Gradient depending on meal type (optional touch of color) */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4 relative z-10 p-1">
        {/* Icon/Image */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-3xl dark:from-neutral-800 dark:to-neutral-900 border border-white/10 shadow-inner overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
          {displayImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayImage} alt={meal.name} className="h-full w-full object-cover" />
              {meal.imageUrls?.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-bold border border-white/20">
                  +{meal.imageUrls.length - 1}
                </div>
              )}
            </>
          ) : (
            <span className="drop-shadow-md">{mealTypeInfo.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-20 py-0.5">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate font-condensed tracking-wide uppercase">
              {meal.name}
            </h3>
            {meal.isRecommendation && (
              <Badge variant="info" className="scale-90 origin-left border-primary-500/30 bg-primary-500/10 text-primary-400">Recomendada</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge variant="outline" className="scale-90 origin-left border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-600 dark:text-neutral-400 font-medium">
              {mealTypeInfo.label}
            </Badge>
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(meal.date)}
            </span>
          </div>

          {/* Macros */}
          <div className="flex items-center gap-3 text-xs font-semibold tracking-wider font-condensed uppercase">
            <span className="text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="text-sm">🔥</span> {formatCalories(meal.calories)}
            </span>
            <span className="text-blue-600 dark:text-blue-400">P <span className="text-neutral-700 dark:text-neutral-300 font-bold">{meal.protein}g</span></span>
            <span className="text-amber-600 dark:text-amber-400">C <span className="text-neutral-700 dark:text-neutral-300 font-bold">{meal.carbs}g</span></span>
            <span className="text-rose-600 dark:text-rose-400">G <span className="text-neutral-700 dark:text-neutral-300 font-bold">{meal.fat}g</span></span>
          </div>
        </div>
      </div>
    </Card>
  );
}