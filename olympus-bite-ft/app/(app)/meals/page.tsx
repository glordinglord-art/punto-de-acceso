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
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { Meal } from "@/features/meals/types/meals.types";
import type { User } from "@/shared/types/common.types";
import { cn, getLocalDateString, localDateToRange } from "@/shared/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Activity, Plus, Droplets, Minus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useBackgroundAnalysis } from "@/features/meals/contexts/BackgroundAnalysisContext";
import { useConfirm } from "@/shared/contexts/ConfirmContext";

import { useRouter } from "next/navigation";
import { MEAL_TYPES } from "@/shared/lib/constants";
import { calculateNutritionTargets } from "@/features/meals/utils/nutrition-calculator";

export default function MealsPage() {
  const { user, isTrainer, activeMode } = useAuth();
  const router = useRouter();

  const targets = useMemo(() => calculateNutritionTargets(user), [user]);

  useEffect(() => {
    if (activeMode === 'superadmin') {
      router.push('/admin');
    }
  }, [activeMode, router]);

  const [tab, setTab] = useState<"mine" | "clients">("mine");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerDefaultType, setScannerDefaultType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const { pendingMeals, startAnalysis } = useBackgroundAnalysis();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [updatingWater, setUpdatingWater] = useState(false);

  const heroPact = user?.anamnesisData?.heroPact;
  const weightKg = user?.weight || 72;
  const targetWaterLiters =
    Number(heroPact?.pillars?.nutrition?.waterLitersTarget) ||
    Number(((weightKg * 35 + 500) / 1000).toFixed(1));
  const currentWaterLiters = Number(((waterGlasses * 250) / 1000).toFixed(2));
  const waterPct = Math.min(
    100,
    Math.round((currentWaterLiters / Math.max(targetWaterLiters, 1)) * 100),
  );

  const handleWaterDelta = async (delta: number) => {
    if (!user || updatingWater) return;
    const next = Math.max(0, Math.min(24, waterGlasses + delta));
    setWaterGlasses(next);
    setUpdatingWater(true);
    try {
      await dashboardService.updateWater(user.id, getLocalDateString(), next);
    } catch {
      toast.error("No se pudo actualizar el agua");
    } finally {
      setUpdatingWater(false);
    }
  };

  const loadMeals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { start, end } = localDateToRange(selectedDate);
      const [res, dashRes] = await Promise.all([
        mealsService.getByDateRange(user.id, start, end),
        dashboardService.getClientDashboard(user.id).catch(() => null),
      ]);
      setMeals(res.data ?? []);
      if (dashRes?.data) {
        setWaterGlasses(dashRes.data.waterGlasses || 0);
      }
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
    loadMeals();
  }, [loadMeals, activeMode]);

  const { confirm } = useConfirm();

  const handleMealSaved = () => {
    setShowScanner(false);
    loadMeals();
  };

  const handleDeleteMeal = async (id: string) => {
    const ok = await confirm({
      title: '¿Eliminar comida?',
      description: 'Esta comida será eliminada permanentemente de tu registro.',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await mealsService.remove(id);
      setSelectedMeal(null);
      loadMeals();
      toast.success('Comida eliminada');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar comida');
    }
  };

  const handleBackgroundAnalysis = (imagesBase64: string[], description: string, mealType: string) => {
    setShowScanner(false);
    startAnalysis({
      imagesBase64,
      description,
      mealType,
      userId: user!.id,
      userContext: {
        dietaryGoal: user?.dietaryGoal || "No especificado",
        weight: user?.weight ?? undefined,
        height: user?.height ?? undefined,
        experienceLevel: user?.experienceLevel || undefined,
        medicalConditions: user?.medicalConditions || undefined,
        dietaryPreferences: user?.dietaryPreferences || undefined,
      },
      onComplete: loadMeals,
    });
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
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
        fiber: acc.fiber + (m.fiber || 0),
        sugar: acc.sugar + (m.sugar || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
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
        title="Agua y Comidas · Vital Fit Labs"
        subtitle={
          activeMode === "trainer" && tab === "clients"
            ? "Supervisa la hidratación prioritaria y adherencia nutricional de tus Atletas"
            : "Cada litro de agua y cada comida sostienen tus 4 Metas de 120 Días"
        }
        action={
          activeMode !== "trainer" || tab === "mine" ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
                size="md"
              >
                ✨ Pedir a Vital Fit Labs
              </Button>
              <Button onClick={() => setShowScanner(true)} size="md">
                + Anotar comida
              </Button>
            </div>
          ) : undefined
        }
      />

      {activeMode === "trainer" && (
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setTab("clients")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              tab === "clients"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
            )}
          >
            👥 Supervisión de Atletas
          </button>
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              tab === "mine"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
            )}
          >
            💧 Mi Agua y Comidas (Entrenador)
          </button>
        </div>
      )}

      {/* Clients view (Trainer Mode) */}
      {activeMode === 'trainer' && tab === 'clients' && user ? (
        <ClientMealsView trainerId={user.id} />
      ) : (
        <div className="space-y-6">
          {/* PRIORIDAD 1: CONTROL DE AGUA EN LITROS + PORQUÉ DE TU ALIMENTACIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-sky-500/10 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 block">
                      Prioridad Diaria • Tu Agua de Hoy
                    </span>
                    <p className="text-lg font-black text-white">
                      {currentWaterLiters} L{" "}
                      <span className="text-xs font-normal text-neutral-300">
                        de {targetWaterLiters} Litros
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleWaterDelta(-1)}
                    className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-neutral-300 active:scale-95"
                    aria-label="Restar vaso"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWaterDelta(1)}
                    className="px-3 h-9 rounded-xl bg-sky-500 text-black font-bold text-xs flex items-center gap-1 active:scale-95 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1 Vaso (250ml)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWaterDelta(2)}
                    className="px-2.5 h-9 rounded-xl bg-sky-400/20 border border-sky-400/40 text-sky-200 font-bold text-xs active:scale-95"
                  >
                    +500ml
                  </button>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <p className="text-xs text-sky-100/90">
                💧 Sin suficiente agua tu músculo pierde fuerza y te cansas antes.
              </p>
            </div>

            <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                  💡 ¿Por qué comes lo que comes hoy?
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 mt-1 leading-relaxed">
                  {heroPact?.pillars?.nutrition?.nutritionWhy ||
                    (user?.dietaryGoal === "weight_loss"
                      ? "Tus calorías y proteínas están calculadas para bajar 0.50 kg de grasa por semana sin perder tu músculo ni tu fuerza."
                      : "Tus calorías y proteínas están calculadas para subir 0.25 kg de músculo limpio por semana y tener energía en cada entreno.")}
                </p>
              </div>
              <p className="text-[11px] text-neutral-400">
                🤖 <strong>Tip:</strong> Puedes tocar <em>&quot;✨ Pedir a la IA&quot;</em> y decirle por voz o texto qué comiste para que lo registre o edite por ti.
              </p>
            </div>
          </div>
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
            fiber={totals.fiber}
            sugar={totals.sugar}
            calorieGoal={targets.calories}
            proteinGoal={targets.protein}
            carbsGoal={targets.carbs}
            fatGoal={targets.fat}
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
          ) : (mealsByType.length > 0 || pendingMeals.length > 0) ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3 mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <h2 className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-widest">
                    Registro de {formatDateLabel(selectedDate).toLowerCase()}
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary-500/10 text-primary-500 border border-primary-500/10 shadow-sm">
                  {mealsByType.length + pendingMeals.length} {mealsByType.length + pendingMeals.length === 1 ? "comida" : "comidas"}
                </span>
              </div>
              <div className="space-y-3">
                {pendingMeals.map((pending) => (
                  <div key={pending.id} className="flex items-center gap-4 p-4 rounded-[28px] bg-white/5 border border-white/5 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    <div className="w-16 h-16 rounded-2xl bg-white/10 shrink-0 overflow-hidden relative border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pending.imageBase64} alt="Analizando" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl animate-spin">✨</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-condensed mb-1">
                        Analizando {MEAL_TYPES[pending.mealType as keyof typeof MEAL_TYPES]?.label || "comida"}...
                      </h3>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full w-2/3 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2 font-bold">
                        Calculando macronutrientes
                      </p>
                    </div>
                  </div>
                ))}
                {mealsByType.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onClick={() => setSelectedMeal(meal)}
                  />
                ))}
              </div>
            </div>
          ) : null}
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
