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
import { mealsService } from "@/features/meals/services/meals.service";
import type { Meal } from "@/features/meals/types/meals.types";
import type { User } from "@/shared/types/common.types";
import { cn, getLocalDateString, localDateToRange } from "@/shared/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function MealsPage() {
  const { user, isTrainer } = useAuth();
  const [tab, setTab] = useState<"mine" | "clients">("mine");
  const [showScanner, setShowScanner] = useState(false);
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
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
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
          <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-white/5 w-fit mx-auto shadow-sm">
            <button
              onClick={() => changeDate(-1)}
              className="rounded-xl p-2.5 text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
              aria-label="Día anterior"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setSelectedDate(today)}
              className={cn(
                "rounded-xl px-5 py-2 text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer",
                isToday
                  ? "bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/20"
                  : "bg-slate-100/80 hover:bg-slate-200 dark:bg-white/5 text-slate-700 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white border border-slate-200/40 dark:border-white/5",
              )}
            >
              {formatDateLabel(selectedDate)}
            </button>
            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className="rounded-xl p-2.5 text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
              aria-label="Día siguiente"
            >
              <ChevronRight className="h-4.5 w-4.5" />
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
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3 mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <h2 className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-widest">
                    Registro de {formatDateLabel(selectedDate).toLowerCase()}
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary-500/10 text-primary-500 border border-primary-500/10 shadow-sm">
                  {mealsByType.length} {mealsByType.length === 1 ? "comida" : "comidas"}
                </span>
              </div>
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
