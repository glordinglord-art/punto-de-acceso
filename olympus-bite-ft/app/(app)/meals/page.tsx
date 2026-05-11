"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { MealCard } from "@/features/meals/components/MealCard";
import { MealDetail } from "@/features/meals/components/MealDetail";
import { NutritionSummary } from "@/features/meals/components/NutritionSummary";
import { FoodScanner } from "@/features/meals/components/FoodScanner";
import { ClientMealsView } from "@/features/meals/components/ClientMealsView";
import { Modal } from "@/shared/components/ui/Modal";
import { ClientAiChat } from "@/features/clients/components/ClientAiChat";
import { mealsService } from "@/features/meals/services/meals.service";
import type { Meal } from "@/features/meals/types/meals.types";
import type { User } from "@/shared/types/common.types";
import { cn, getLocalDateString, localDateToRange } from "@/shared/lib/utils";

export default function MealsPage() {
  const { user, isTrainer } = useAuth();
  const [tab, setTab] = useState<"mine" | "clients">("mine");
  const [showScanner, setShowScanner] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const loadMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load meals for the selected date
      const { start, end } = localDateToRange(selectedDate);
      const res = await mealsService.getByDateRange(user.id, start, end);
      setMeals(res.data ?? []);
    } catch {
      // Fallback: load all meals and filter client-side
      try {
        const res = await mealsService.getByUser(user.id);
        const all = res.data ?? [];
        const filtered = all.filter((m) => m.date.startsWith(selectedDate));
        setMeals(filtered);
      } catch {
        setMeals([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleMealSaved = () => {
    setShowScanner(false);
    loadMeals();
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await mealsService.remove(mealId);
      setSelectedMeal(null);
      loadMeals();
    } catch {
      // Error silencioso — podría mejorarse con un toast
    }
  };

  /* ─── Totals ────────────────────────────── */
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [meals]);

  /* ─── Date navigation ──────────────────── */
  const today = getLocalDateString();
  const isToday = selectedDate === today;

  const changeDate = (offset: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + offset);
    setSelectedDate(getLocalDateString(dt));
  };

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === today) return "Hoy";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === getLocalDateString(yesterday)) return "Ayer";
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  /* ─── Group meals by type ──────────────── */
  const mealsByType = useMemo(() => {
    const order = ["breakfast", "lunch", "dinner", "snack"];
    return [...meals].sort(
      (a, b) => order.indexOf(a.mealType) - order.indexOf(b.mealType),
    );
  }, [meals]);

  return (
    <>
      <Header
        title={tab === "clients" ? "Comidas de Clientes" : "Mis Comidas"}
        subtitle={
          tab === "clients"
            ? "Monitorea la alimentación de tus clientes"
            : "Registra y controla tu alimentación"
        }
        action={
          tab === "mine" ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAiChat(true)}
                size="md"
              >
                ✨ Consultar IA
              </Button>
              <Button onClick={() => setShowScanner(true)} size="md">
                + Registrar comida
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Tabs for trainer */}
      {isTrainer && (
        <div className="flex items-center gap-1 mb-5 p-1 bg-neutral-100 rounded-xl w-fit dark:bg-neutral-800">
          <button
            onClick={() => setTab("mine")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              tab === "mine"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700",
            )}
          >
            🍽️ Mis comidas
          </button>
          <button
            onClick={() => setTab("clients")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              tab === "clients"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700",
            )}
          >
            👥 Clientes
          </button>
        </div>
      )}

      {/* Clients view */}
      {tab === "clients" && user && <ClientMealsView trainerId={user.id} />}

      {/* My meals view */}
      {tab === "mine" && (
        <div className="space-y-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => changeDate(-1)}
              className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg
                className="h-5 w-5 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setSelectedDate(today)}
              className={cn(
                "rounded-xl px-4 py-1.5 text-sm font-semibold transition-all",
                isToday
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
              )}
            >
              {formatDateLabel(selectedDate)}
            </button>
            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
            >
              <svg
                className="h-5 w-5 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Nutrition Summary */}
          <NutritionSummary
            calories={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            calorieGoal={user?.targetCalories || 2200}
          />

          {/* Meals List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : mealsByType.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Sin comidas registradas
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                {isToday
                  ? "Registra tu primera comida del día con una foto o manualmente."
                  : "No hay registros para este día."}
              </p>
              {isToday && (
                <Button onClick={() => setShowScanner(true)} className="mt-6">
                  + Registrar comida
                </Button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
                Registro de {formatDateLabel(selectedDate).toLowerCase()}
                <span className="ml-2 text-neutral-400 font-normal normal-case">
                  ({mealsByType.length}{" "}
                  {mealsByType.length === 1 ? "comida" : "comidas"})
                </span>
              </h2>
              <div className="space-y-3">
                {mealsByType.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onClick={() => setSelectedMeal(meal)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scanner Modal */}
      <Modal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        title="Registrar comida"
        size="lg"
      >
        {user && (
          <FoodScanner
            userId={user.id}
            onMealSaved={handleMealSaved}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
        title="Recomendador Smart AI 10X"
        size="md"
      >
        {user && <ClientAiChat client={user as User} />}
      </Modal>

      {/* Meal Detail Modal */}
      <Modal
        isOpen={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        title={selectedMeal?.name || "Detalle de comida"}
        size="lg"
      >
        {selectedMeal && (
          <MealDetail
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
            onDelete={handleDeleteMeal}
          />
        )}
      </Modal>
    </>
  );
}
