'use client';

import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/lib/utils';

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
  const isOverGoal = calories > calorieGoal;
  const totalMacros = protein + carbs + fat;

  const macros = [
    { label: 'Proteínas', value: protein, color: 'bg-blue-500', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', textStyle: 'text-blue-500', pct: totalMacros > 0 ? (protein / totalMacros) * 100 : 0 },
    { label: 'Carbos', value: carbs, color: 'bg-amber-500', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]', textStyle: 'text-amber-500', pct: totalMacros > 0 ? (carbs / totalMacros) * 100 : 0 },
    { label: 'Grasas', value: fat, color: 'bg-rose-500', glow: 'shadow-[0_0_10px_rgba(244,63,94,0.5)]', textStyle: 'text-rose-500', pct: totalMacros > 0 ? (fat / totalMacros) * 100 : 0 },
  ];

  return (
    <Card className="relative overflow-hidden border border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-xl group">
      {/* Cinematic background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 p-2">
        {/* Animated Calorie Ring */}
        <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
          {/* Subtle Outer Glow based on progress */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-20 transition-all duration-1000",
            isOverGoal ? "bg-red-500" : "bg-primary-500"
          )} />
          
          <svg className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-neutral-100 dark:text-neutral-800/80"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.51} 251`}
              className={cn(
                "transition-all duration-1000 ease-out",
                isOverGoal ? "text-red-500" : "text-primary-500"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className={cn(
              "text-3xl font-black font-condensed tracking-tighter drop-shadow-md",
              isOverGoal ? "text-red-500" : "text-neutral-900 dark:text-white"
            )}>
              {calories}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 -mt-1">kcal</span>
          </div>
        </div>

        {/* Info / Macros */}
        <div className="flex-1 w-full space-y-5">
          <div className="flex items-end justify-between border-b border-neutral-100 dark:border-white/5 pb-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest font-condensed mb-0.5">
                Resumen Diario
              </h3>
              <p className="text-xs font-semibold text-neutral-500">
                {calorieGoal - calories > 0 
                  ? <span className="text-primary-500 font-bold">{calorieGoal - calories} kcal restantes</span> 
                  : <span className="text-red-500 font-bold">Límite excedido por {calories - calorieGoal} kcal</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Objetivo</p>
              <p className="text-base font-bold text-neutral-800 dark:text-white font-condensed tracking-wide">{calorieGoal} kcal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {macros.map((macro) => (
              <div key={macro.label} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold tracking-wider uppercase text-neutral-500">{macro.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-base font-black font-condensed tracking-tight", macro.textStyle)}>{macro.value}g</span>
                    <span className="font-semibold text-[10px] text-neutral-400">{Math.round(macro.pct)}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800/80 overflow-hidden shadow-inner border border-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out relative",
                      macro.color,
                      macro.glow
                    )}
                    style={{ width: `${macro.pct}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}