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
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
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

  // Combine imageUrls and imageUrl into a single robust list
  const images: string[] = [];
  if (meal.imageUrls && meal.imageUrls.length > 0) {
    images.push(...meal.imageUrls);
  } else if (meal.imageUrl && meal.imageUrl !== 'uploaded') {
    images.push(meal.imageUrl);
  }

  const hasImage = images.length > 0;

  return (
    <div className="space-y-6">
      {/* Images Carousel */}
      {hasImage && (
        <div className="relative -mx-6 -mt-6 overflow-hidden rounded-t-2xl group bg-neutral-900">
          <div className="relative h-64 w-full flex transition-transform duration-300" style={{ transform: `translateX(-${currentImageIdx * 100}%)` }}>
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full shrink-0 flex-none relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${meal.name} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(p => Math.max(0, p - 1)); }}
                disabled={currentImageIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm disabled:opacity-30 hover:bg-black/70 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(p => Math.min(images.length - 1, p + 1)); }}
                disabled={currentImageIdx === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm disabled:opacity-30 hover:bg-black/70 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-primary-500 w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg font-condensed tracking-wide uppercase">{meal.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-white/20 bg-black/40 backdrop-blur-md text-white">{mealTypeInfo.icon} {mealTypeInfo.label}</Badge>
              {meal.isRecommendation && <Badge variant="info" className="bg-primary-500/20 text-primary-300 border-primary-500/30">Recomendada</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* Title (when no image) */}
      {!hasImage && (
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 shadow-inner text-3xl">
            {mealTypeInfo.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-condensed tracking-wide uppercase">{meal.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-neutral-700">{mealTypeInfo.label}</Badge>
              {meal.isRecommendation && <Badge variant="info">Recomendada</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {meal.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-white/5 rounded-xl p-4 border border-neutral-100 dark:border-white/5 font-medium italic">
          &quot;{meal.description}&quot;
        </p>
      )}

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {formatDate(meal.date)}</span>
        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {formatTime(meal.date)}</span>
      </div>

      {/* Nutritional Info Grid */}
      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-neutral-100 to-white dark:from-neutral-800/80 dark:to-neutral-900/80 border-b border-neutral-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 uppercase tracking-widest font-condensed">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Información Nutricional
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-px bg-neutral-200 dark:bg-white/5">
          {macros.map((macro) => (
            <div
              key={macro.label}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-900/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <span className="text-2xl mb-2 drop-shadow-md">{macro.icon}</span>
              <p className={`text-2xl font-black font-condensed tracking-tight ${macro.color}`}>
                {macro.value}<span className="text-sm font-semibold opacity-60 ml-0.5">{macro.unit}</span>
              </p>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">{macro.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alimentos */}
      {meal.foods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 uppercase tracking-widest font-condensed">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Alimentos detectados
          </h3>
          <div className="flex flex-wrap gap-2">
            {meal.foods.map((food, i) => (
              <span
                key={i}
                className="rounded-full bg-neutral-100 border border-neutral-200 px-4 py-1.5 text-sm font-semibold text-neutral-700 dark:bg-white/5 dark:border-white/10 dark:text-neutral-300 shadow-sm"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation - show saved recommendation from analysis */}
      {meal.recommendation && (
        <Card className={`relative overflow-hidden ${GOAL_RATING_CONFIG[meal.goalRating || 'buena'].bgColor} border border-white/10 shadow-xl`}>
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 text-8xl">
             {GOAL_RATING_CONFIG[meal.goalRating || 'buena'].icon}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl drop-shadow-md">{GOAL_RATING_CONFIG[meal.goalRating || 'buena'].icon}</span>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${GOAL_RATING_CONFIG[meal.goalRating || 'buena'].color}`}>
                Valoración: {GOAL_RATING_CONFIG[meal.goalRating || 'buena'].label}
              </h3>
            </div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {meal.recommendation}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 opacity-80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Recomendación por IA</span>
            </div>
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

      <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 dark:border-white/5">
        <Button variant="ghost" onClick={onClose} className="font-semibold uppercase tracking-wider text-xs">
          Cerrar
        </Button>
        {onDelete && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            loading={deleting}
            className="font-semibold uppercase tracking-wider text-xs shadow-lg shadow-red-500/20"
          >
            {confirmDelete ? '¿Seguro?' : 'Eliminar'}
          </Button>
        )}
      </div>
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
    <Card className={`relative overflow-hidden ${ratingInfo.bgColor} border border-white/10 shadow-xl`}>
      <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 text-8xl">
         {ratingInfo.icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl drop-shadow-md">{ratingInfo.icon}</span>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${ratingInfo.color}`}>
            Valoración: {ratingInfo.label}
          </h3>
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 opacity-80">
          <span className="flex items-center gap-1"><svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Análisis IA</span>
          <span>•</span>
          <span>Ratio P/Cal: <span className="text-neutral-800 dark:text-white font-bold">{Math.round(proteinRatio * 100)}%</span></span>
        </div>
      </div>
    </Card>
  );
}
