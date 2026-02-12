'use client';

import { Card } from '@/shared/components/ui/Card';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieGoal?: number;
}

export function NutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  calorieGoal = 2200,
}: NutritionSummaryProps) {
  const progress = Math.min((calories / calorieGoal) * 100, 100);
  const totalMacros = protein + carbs + fat;

  const macros = [
    { label: 'Proteínas', value: protein, color: 'bg-blue-500', pct: totalMacros > 0 ? (protein / totalMacros) * 100 : 0 },
    { label: 'Carbos', value: carbs, color: 'bg-amber-500', pct: totalMacros > 0 ? (carbs / totalMacros) * 100 : 0 },
    { label: 'Grasas', value: fat, color: 'bg-rose-500', pct: totalMacros > 0 ? (fat / totalMacros) * 100 : 0 },
  ];

  return (
    <Card>
      {/* Calorie Ring */}
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-neutral-100 dark:text-neutral-800"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.64} 264`}
              className="text-neutral-900 dark:text-white transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              {calories}
            </span>
            <span className="text-[10px] text-neutral-400">kcal</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {calories} / {calorieGoal} kcal hoy
          </p>

          {macros.map((macro) => (
            <div key={macro.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">{macro.label}</span>
                <span className="font-medium text-neutral-900 dark:text-white">{macro.value}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                {/* eslint-disable-next-line no-inline-styles -- dynamic width requires inline style */}
                <div
                  className={`h-1.5 rounded-full ${macro.color} transition-all duration-500`}
                  style={{ width: `${macro.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
