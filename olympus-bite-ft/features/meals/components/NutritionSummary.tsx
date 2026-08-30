'use client';

import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/lib/utils';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
}

export function NutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  calorieGoal = 2000,
  proteinGoal,
  carbsGoal,
  fatGoal,
}: NutritionSummaryProps) {
  // Smart macro targets if not explicitly given
  const targetP = proteinGoal || Math.round((calorieGoal * 0.30) / 4); // 30% protein
  const targetC = carbsGoal || Math.round((calorieGoal * 0.45) / 4);   // 45% carbs
  const targetF = fatGoal || Math.round((calorieGoal * 0.25) / 9);     // 25% fat

  const remainingCalories = Math.max(calorieGoal - calories, 0);
  const remainingProtein = Math.max(targetP - protein, 0);
  const remainingCarbs = Math.max(targetC - carbs, 0);
  const remainingFat = Math.max(targetF - fat, 0);

  return (
    <div className="w-full bg-[#18181A] dark:bg-[#18181A] rounded-[32px] p-6 text-white shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 opacity-60">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-medium">kcal restantes</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </div>

      {/* Main Calories */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold tracking-tight">{remainingCalories.toLocaleString()}</h2>
        
        {/* Progress Slider (Decorative/Visual representation) */}
        <div className="mt-4 px-4 relative">
          <div className="h-1 bg-white/10 rounded-full w-full relative">
            {/* Range markers */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-0.5 h-3 bg-white/20" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-0.5 h-3 bg-white/20" />
            
            {/* Active progress (example, centered) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ left: `${Math.min(Math.max((calories / calorieGoal) * 100, 5), 95)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/40 mt-2 px-8 font-medium">
            <span>{Math.round(calorieGoal * 0.9).toLocaleString()}</span>
            <span>{Math.round(calorieGoal * 1.1).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex flex-col items-center">
          <span className="text-sm text-white/60 mb-1">Proteínas</span>
          <div className="font-semibold text-[15px] border-b-2 border-white/20 pb-1 px-1">
            {remainingProtein} g resta...
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-white/60 mb-1">Carbs</span>
          <div className="font-semibold text-[15px] border-b-2 border-white/20 pb-1 px-1">
            {remainingCarbs} g resta...
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-white/60 mb-1">Grasas</span>
          <div className="font-semibold text-[15px] border-b-2 border-white/20 pb-1 px-1">
            {remainingFat} g resta...
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="w-full bg-[#2C2C2E] hover:bg-[#3A3A3C] transition-colors rounded-full py-4 text-center font-semibold text-white/40 tracking-wide">
        Terminar Día
      </button>
    </div>
  );
}