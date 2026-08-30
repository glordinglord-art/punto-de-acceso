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
import { Calendar, ChevronLeft, ChevronRight, Activity, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";
import { MEAL_TYPES } from "@/shared/lib/constants";

export default function MealsPage() {
  const { user, isTrainer, activeMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (activeMode === 'superadmin') {
      router.push('/admin');
    }
  }, [activeMode, router]);

  const [tab, setTab] = useState<"mine" | "clients">("mine");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerDefaultType, setScannerDefaultType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const loadMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { start, end } = localDateToRange(selectedDate);
      const res = await mealsService.getByDateRange(user.id, start, end);
      setMeals(res.data ?? []);
    } catch {
      // Fallback
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
    if (activeMode === 'client') {
      loadMeals();
    }
  }, [loadMeals, activeMode]);

  const handleMealSaved = () => {
    setShowScanner(false);
    loadMeals();
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("¿Eliminar esta comida?")) return;
    try {
      await mealsService.remove(id);
      setSelectedMeal(null);
      loadMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackgroundAnalysis = async (imagesBase64: string[], description: string, mealType: string) => {
    setShowScanner(false);
    const toastId = toast.loading("Analizando comida con IA...");
    try {
      // 1. Analyze
      const res = await mealsService.analyzePhoto(imagesBase64, {
        goal: user?.dietaryGoal || "No especificado",
        description,
        weight: user?.weight ?? undefined,
        height: user?.height ?? undefined,
        experienceLevel: user?.experienceLevel || undefined,
        medicalConditions: user?.medicalConditions || undefined,
        dietaryPreferences: user?.dietaryPreferences || undefined,
      });
      const analysis = res.data;
      
      // 2. Create directly
      await mealsService.create(user!.id, {
        name: analysis.description ? analysis.foods.slice(0, 2).join(" + ") : analysis.foods.slice(0, 2).join(" + "),
        description: analysis.description,
        mealType,
        imagesBase64: imagesBase64.length > 0 ? imagesBase64 : undefined,
        foods: analysis.foods,
        calories: analysis.nutritionalInfo.calories,
        protein: analysis.nutritionalInfo.protein,
        carbs: analysis.nutritionalInfo.carbs,
        fat: analysis.nutritionalInfo.fat,
        fiber: analysis.nutritionalInfo.fiber,
        sugar: analysis.nutritionalInfo.sugar,
        recommendation: analysis.recommendation,
        goalRating: analysis.goalRating,
        date: new Date().toISOString(), // Use current time for the meal
      });

      toast.success("¡Comida registrada exitosamente!", { id: toastId });
      loadMeals();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error analizando comida", { id: toastId });
    }
  };

  const MEAL_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    breakfast: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    lunch: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    dinner: { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
    snack: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
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

      {/* Clients view (Trainer Mode) */}
      {activeMode === 'trainer' && user ? (
        <ClientMealsView trainerId={user.id} />
      ) : (
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

          {/* Quick Log Grids */}
          {isToday && (
            <div className="bg-[#18181A] rounded-[32px] p-6 shadow-sm border border-white/5">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Diario de Comidas</h3>
                  <p className="text-sm text-white/50 mt-1">Registra lo que has comido hoy para alcanzar tu meta.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                  const hasRecorded = meals.some(m => m.mealType === type);
                  const mealColor = MEAL_TYPE_COLORS[type];
                  
                  return (
                    <div 
                      key={type}
                      onClick={() => {
                        setScannerDefaultType(type);
                        setShowScanner(true);
                      }}
                      className="group flex h-full flex-col justify-between rounded-[24px] bg-white/5 border border-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={cn(
                          'inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                          mealColor?.bg ?? 'bg-white/5',
                          mealColor?.text ?? 'text-white',
                        )}>
                          {MEAL_TYPES[type as keyof typeof MEAL_TYPES]?.label || type}
                        </span>
                        {hasRecorded ? (
                          <div className="h-6 w-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center">
                            <Activity className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-white/5 text-white/40 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {hasRecorded ? (
                          <p className="text-sm font-bold text-white">Registrado</p>
                        ) : (
                          <p className="text-sm font-bold text-white/40">Sin registrar</p>
                        )}
                        <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mt-1">Toca para añadir</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meals List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-[28px] bg-white/40 border border-slate-200/40 dark:bg-white/[0.04] dark:border-white/6"
                />
              ))}
            </div>
          ) : mealsByType.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-slate-200/80 bg-white/30 p-12 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/15">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide font-condensed">
                Sin comidas registradas
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
        {user && showScanner && (
          <FoodScanner
            userId={user.id}
            onMealSaved={handleMealSaved}
            defaultMealType={scannerDefaultType}
            onAnalyzeBackground={handleBackgroundAnalysis}
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
