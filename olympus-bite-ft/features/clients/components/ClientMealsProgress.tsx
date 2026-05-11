import { useState, useEffect } from "react";
import { mealsService } from "@/features/meals/services/meals.service";
import type { Meal } from "@/features/meals/types/meals.types";

import { cn, getLocalDateString, localDateToRange } from "@/shared/lib/utils";
import { Flame, Target, AlertTriangle } from "lucide-react";

interface ClientMealsProgressProps {
  clientId: string;
  targetCalories: number | null;
}

export function ClientMealsProgress({
  clientId,
  targetCalories,
}: ClientMealsProgressProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        // We fetch only today's meals for the progress bar
        const today = getLocalDateString();
        const { start, end } = localDateToRange(today);
        const res = await mealsService.getByDateRange(clientId, start, end);
        setMeals(res.data);
      } catch (error) {
        console.error("Error fetching client meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-neutral-50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 animate-pulse">
        <div className="h-10 bg-neutral-200 dark:bg-white/10 w-1/2 mx-auto rounded-xl mb-4"></div>
        <div className="h-6 bg-neutral-200 dark:bg-white/10 w-3/4 mx-auto rounded-xl"></div>
      </div>
    );
  }

  const currentCalories = meals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0,
  );
  const goal = targetCalories || 2200; // Fallback
  const progressPercentage = Math.min((currentCalories / goal) * 100, 100);
  const isOverGoal = currentCalories > goal;

  return (
    <div className="space-y-6">
      {/* Resumen de Calorías del Día */}
      <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
              Consumo de Hoy
            </h3>
            <p className="text-xs font-medium text-neutral-500">Monitor de progreso calórico</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-3">
          <div>
            <span className={cn("text-5xl font-condensed font-bold tracking-tight", isOverGoal ? "text-red-500" : "text-primary-600 dark:text-primary-400")}>
              {currentCalories.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-neutral-500 ml-2 uppercase tracking-wider font-condensed">
              kcal consumidas
            </span>
          </div>
          <div className="text-right">
            <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-black/30 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10">
              <Target className="w-4 h-4 text-neutral-500" />
              Meta: {goal.toLocaleString()} kcal
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-neutral-100 dark:bg-black/40 rounded-full h-4 mb-3 overflow-hidden shadow-inner border border-white/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]",
              isOverGoal ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-primary-600 to-primary-400"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {isOverGoal && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              El cliente ha superado su límite calórico en <strong className="font-bold">{currentCalories - goal} kcal</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Lista de Comidas del Día */}
      <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white mb-6">
          Comidas Registradas Hoy
        </h3>
        
        {meals.length === 0 ? (
          <div className="text-center p-10 bg-neutral-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10">
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-neutral-100 dark:border-white/5">
              <span className="text-2xl block">🍽️</span>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              No se han registrado comidas el día de hoy.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex flex-col p-4 bg-neutral-50 dark:bg-black/20 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {meal.name}
                  </h4>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-lg font-condensed font-bold tracking-tight text-primary-600 dark:text-primary-400">
                      {meal.calories}
                    </span>
                    <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-500 ml-1">kcal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-white dark:bg-white/10 px-2.5 py-1 rounded-md shadow-sm">
                    {meal.mealType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
