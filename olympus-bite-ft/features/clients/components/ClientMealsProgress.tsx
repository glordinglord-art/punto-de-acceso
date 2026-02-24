import { useState, useEffect } from "react";
import { mealsService } from "@/features/meals/services/meals.service";
import type { Meal } from "@/features/meals/types/meals.types";
import { Card } from "@/shared/components/ui/Card";

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
        const today = new Date().toISOString().split("T")[0];
        const res = await mealsService.getByDateRange(clientId, today, today);
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
      <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 w-1/2 mx-auto rounded mb-4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 w-3/4 mx-auto rounded"></div>
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
      <Card padding="md">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          Consumo de Hoy
        </h3>
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {currentCalories.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500 ml-1">
              kcal consumidas
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              Meta: {goal.toLocaleString()} kcal
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isOverGoal ? "bg-red-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {isOverGoal && (
          <p className="text-xs text-red-500 mt-1">
            ⚠️ El cliente ha superado su límite calórico por{" "}
            {currentCalories - goal} kcal.
          </p>
        )}
      </Card>

      {/* Lista de Comidas del Día */}
      <div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
          Comidas Registradas Hoy
        </h3>
        {meals.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
            <span className="text-2xl mb-2 block">🍽️</span>
            <p className="text-sm text-neutral-500">
              No se han registrado comidas hoy.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800"
              >
                <div>
                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {meal.name}
                  </h4>
                  <p className="text-xs text-neutral-500 capitalize">
                    {meal.mealType}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {meal.calories}
                  </span>
                  <span className="text-xs text-neutral-500 ml-1">kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
