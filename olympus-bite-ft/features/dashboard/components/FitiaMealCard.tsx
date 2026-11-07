'use client';

import { useState } from 'react';
import { Plus, Flame, Trash2, Utensils, Pill, ChevronRight, Sparkles } from 'lucide-react';
import type { Meal } from '@/features/meals/types/meals.types';
import { VitalFitLogo } from '@/shared/components/ui/VitalFitLogo';
import { cn } from '@/shared/lib/utils';

interface FitiaMealCardProps {
  title: string;
  mealType: string;
  icon?: React.ReactNode;
  meals?: Meal[];
  onAdd: (mealType: string) => void;
  onDeleteMeal?: (mealId: string) => void;
  onViewMeal?: (meal: Meal) => void;
  customSummary?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function FitiaMealCard({
  title,
  mealType,
  icon,
  meals = [],
  onAdd,
  onDeleteMeal,
  onViewMeal,
  customSummary,
}: FitiaMealCardProps) {
  // Aggregate calories & macros
  const totals = customSummary || meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const isMeds = mealType === 'supplement' || mealType === 'meds';

  return (
    <div className="w-full rounded-[26px] bg-[#12141a] border border-white/[0.08] p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-white/15">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon ? (
            icon
          ) : isMeds ? (
            <span className="text-xl">💊</span>
          ) : null}
          <h3 className="font-display font-bold text-lg sm:text-xl text-white">
            {title}
          </h3>
        </div>

        {/* Brand mark small badge */}
        <div className="flex items-center gap-1 opacity-70">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
            VitalFit
          </span>
        </div>
      </div>

      {/* Subtitle: Calories and P | C | G */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 font-mono">
        <span className="flex items-center gap-1 font-semibold text-neutral-300">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
          {totals.calories} kcal
        </span>
        <span className="text-neutral-500">·</span>
        <span>
          {Math.round(totals.protein)} P | {Math.round(totals.carbs)} C | {Math.round(totals.fat)} G
        </span>
      </div>

      {/* Logged Foods List (Detailed View when food exists) */}
      {meals.length > 0 && (
        <div className="space-y-2 mb-3">
          {meals.map((m) => (
            <div
              key={m.id}
              onClick={() => onViewMeal?.(m)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Food Image Thumbnail or Category Icon */}
                {m.imageUrl || (m as { photoUrl?: string }).photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl || (m as { photoUrl?: string }).photoUrl || ''}
                    alt={m.name}
                    className="w-10 h-10 rounded-lg object-cover bg-black/40 shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                    <Utensils className="w-4 h-4" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-white truncate group-hover:text-cyan-300 transition">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    <span className="text-amber-400 font-bold">{m.calories} kcal</span> · {m.protein}g P · {m.carbs}g C · {m.fat}g G
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onDeleteMeal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMeal(m.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Eliminar alimento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Big tactile "+" full-width button (Exactly like Fitia screenshot) */}
      <button
        type="button"
        onClick={() => onAdd(mealType)}
        className="w-full h-12 rounded-2xl bg-[#21242d] hover:bg-[#282d38] border border-white/[0.05] text-white hover:text-cyan-300 flex items-center justify-center font-bold text-xl transition-all duration-200 active:scale-98 shadow-sm cursor-pointer group"
        title={`Registrar ${title.toLowerCase()}`}
      >
        <Plus className="w-5 h-5 transition-transform duration-200 group-hover:scale-125" />
      </button>
    </div>
  );
}
