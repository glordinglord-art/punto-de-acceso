'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import { MEAL_TYPES } from '@/shared/lib/constants';
import { formatCalories, formatDate, formatTime } from '@/shared/lib/utils';
import { GOAL_RATING_CONFIG } from '../types/meals.types';
import type { Meal, GoalRating } from '../types/meals.types';

interface MealDetailProps {
  meal: Meal;
  onClose: () => void;
  onDelete?: (mealId: string) => void;
}

export function MealDetail({ meal, onClose, onDelete }: MealDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mealTypeInfo = MEAL_TYPES[meal.mealType];

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    onDelete?.(meal.id);
  };

  // Macros data for the grid
  const macros = [
    { label: 'Calorías', value: formatCalories(meal.calories), unit: '', color: 'text-neutral-900 dark:text-white', icon: '🔥' },
    { label: 'Proteína', value: `${meal.protein}`, unit: 'g', color: 'text-blue-600', icon: '🥩' },
    { label: 'Carbohidratos', value: `${meal.carbs}`, unit: 'g', color: 'text-amber-600', icon: '🌾' },
    { label: 'Grasas', value: `${meal.fat}`, unit: 'g', color: 'text-rose-600', icon: '🫒' },
    { label: 'Fibra', value: `${meal.fiber}`, unit: 'g', color: 'text-green-600', icon: '🥦' },
    { label: 'Azúcar', value: `${meal.sugar ?? 0}`, unit: 'g', color: 'text-purple-600', icon: '🍯' },
  ];

  // Try to detect AI recommendation stored in description
  // In the future we could have a dedicated field
  const hasImage = meal.imageUrl && meal.imageUrl !== 'uploaded';

  return (
    <div className="space-y-5 -mt-2">
      {/* Image */}
      {hasImage && (
        <div className="relative -mx-6 -mt-6 overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meal.imageUrl!}
            alt={meal.name}
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">{meal.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{mealTypeInfo.icon} {mealTypeInfo.label}</Badge>
              {meal.isRecommendation && <Badge variant="info">Recomendada</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* Title (when no image) */}
      {!hasImage && (
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-3xl dark:bg-neutral-800">
            {mealTypeInfo.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{meal.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge>{mealTypeInfo.label}</Badge>
              {meal.isRecommendation && <Badge variant="info">Recomendada</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {meal.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {meal.description}
        </p>
      )}

      {/* Date & Time */}
      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <span>📅 {formatDate(meal.date)}</span>
        <span>🕐 {formatTime(meal.date)}</span>
      </div>

      {/* Nutritional Info Grid */}
      <Card className="p-0! overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            📊 Información Nutricional
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-0">
          {macros.map((macro, i) => (
            <div
              key={macro.label}
              className={`flex flex-col items-center justify-center p-4 ${
                i < 3 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
              } ${(i % 3 !== 2) ? 'border-r border-neutral-100 dark:border-neutral-800' : ''}`}
            >
              <span className="text-lg mb-1">{macro.icon}</span>
              <p className={`text-xl font-bold ${macro.color}`}>
                {macro.value}<span className="text-xs font-normal text-neutral-400">{macro.unit}</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{macro.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Alimentos */}
      {meal.foods.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
            🍽️ Alimentos detectados
          </h3>
          <div className="flex flex-wrap gap-2">
            {meal.foods.map((food, i) => (
              <span
                key={i}
                className="rounded-xl bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation - show saved recommendation from analysis */}
      {meal.recommendation && (
        <Card className={`${GOAL_RATING_CONFIG[meal.goalRating || 'buena'].bgColor} border-transparent`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{GOAL_RATING_CONFIG[meal.goalRating || 'buena'].icon}</span>
            <h3 className={`text-sm font-semibold ${GOAL_RATING_CONFIG[meal.goalRating || 'buena'].color}`}>
              Valoración: {GOAL_RATING_CONFIG[meal.goalRating || 'buena'].label}
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {meal.recommendation}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
            <span>🤖 Recomendación generada por IA</span>
          </div>
        </Card>
      )}

      {/* Fallback heuristic when no saved recommendation */}
      {!meal.recommendation && meal.description && meal.description.length > 20 && hasImage && (
        <AIRecommendationCard
          description={meal.description}
          calories={meal.calories}
          protein={meal.protein}
        />
      )}
    </div>
  );
}

/* ─── Sub-component: AI Recommendation Card ─── */

function AIRecommendationCard({
  description,
  calories,
  protein,
}: {
  description: string;
  calories: number;
  protein: number;
}) {
  // Quick heuristic rating based on macros
  const proteinRatio = protein * 4 / Math.max(calories, 1);
  let quickRating: GoalRating = 'buena';
  if (proteinRatio > 0.3) quickRating = 'excelente';
  else if (proteinRatio < 0.15) quickRating = 'regular';

  const ratingInfo = GOAL_RATING_CONFIG[quickRating];

  return (
    <Card className={`${ratingInfo.bgColor} border-transparent`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{ratingInfo.icon}</span>
        <h3 className={`text-sm font-semibold ${ratingInfo.color}`}>
          Valoración: {ratingInfo.label}
        </h3>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
        {description}
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
        <span>🤖 Análisis de IA</span>
        <span>•</span>
        <span>Ratio P/Cal: {Math.round(proteinRatio * 100)}%</span>
      </div>
    </Card>
  );
}
