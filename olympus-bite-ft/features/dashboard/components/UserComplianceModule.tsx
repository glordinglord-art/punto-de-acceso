"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { tasksService } from "@/features/tasks/services/tasks.service";
import {
  Activity,
  Utensils,
  Dumbbell,
  Calendar,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

interface ComplianceData {
  today: {
    date: string;
    mealsCount: number;
    mealsTarget: number;
    nutritionPct: number;
    tasksCompleted: number;
    tasksTotal: number;
    habitsPct: number;
    workoutsLogged: number;
    overallPct: number;
  };
  week: {
    totalMeals: number;
    targetMeals: number;
    nutritionPct: number;
    totalWorkouts: number;
    habitsCompleted: number;
    habitsPct: number;
    overallPct: number;
    latestCheckin: {
      weekDate: string;
      stressRating: number;
      energyRating: number;
      recoveryRating: string | null;
      dietPerception: string | null;
      notes: string | null;
      rawAnswers?: Record<string, unknown> | null;
    } | null;
  };
}

interface WeeklyCheckinRecord {
  id: string;
  userId: string;
  weekDate: string;
  stressRating: number;
  energyRating: number;
  recoveryRating?: string | null;
  dietPerception?: string | null;
  notes?: string | null;
  rawAnswers?: {
    submittedAt?: string;
    question1_disciplineRating?: number;
    question2_bestMoment?: string;
    question3_biggestObstacle?: string;
  } | null;
  createdAt: string;
}

interface UserComplianceModuleProps {
  userId: string;
  userName?: string;
  isTrainer?: boolean;
  className?: string;
}

export function UserComplianceModule({
  userId,
  userName,
  isTrainer = false,
  className,
}: UserComplianceModuleProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inline check-in form states (Athlete view)
  const [isAnsweringInline, setIsAnsweringInline] = useState(false);
  const [disciplineRating, setDisciplineRating] = useState<number>(8);
  const [bestMoment, setBestMoment] = useState<string>("");
  const [biggestObstacle, setBiggestObstacle] = useState<string>("");
  const [submittingCheckin, setSubmittingCheckin] = useState<boolean>(false);

  // Trainer history states
  const [checkinHistory, setCheckinHistory] = useState<WeeklyCheckinRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const loadCompliance = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await tasksService.getCompliance(userId);
      if (res?.data) {
        setData(res.data as unknown as ComplianceData);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadHistory = useCallback(async () => {
    if (!userId || !isTrainer) return;
    setLoadingHistory(true);
    try {
      const res = await tasksService.getWeeklyCheckins(userId);
      if (res?.data) {
        setCheckinHistory(res.data as unknown as WeeklyCheckinRecord[]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingHistory(false);
    }
  }, [userId, isTrainer]);

  useEffect(() => {
    loadCompliance();
    if (isTrainer) {
      loadHistory();
    }
  }, [loadCompliance, loadHistory, isTrainer]);

  // Determine current Monday's date string
  const getMondayDateStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  const currentMonday = getMondayDateStr();
  const hasCheckedInThisWeek = Boolean(
    data?.week?.latestCheckin && data.week.latestCheckin.weekDate >= currentMonday
  );

  const getRatingDescriptor = (val: number) => {
    if (val <= 3) return { text: "Semana difícil / Baja disciplina", color: "text-red-400" };
    if (val <= 6) return { text: "Moderada / Cumplimiento regular", color: "text-amber-400" };
    if (val <= 8) return { text: "Buena / Constante y enfocado", color: "text-emerald-400" };
    return { text: "Impecable / Máximo rendimiento", color: "text-red-500 font-black" };
  };

  const descriptor = getRatingDescriptor(disciplineRating);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bestMoment.trim()) {
      toast.error("Por favor responde qué fue lo mejor que te salió esta semana");
      return;
    }

    if (!biggestObstacle.trim()) {
      toast.error("Por favor describe tu mayor obstáculo y qué ayuda necesitas");
      return;
    }

    setSubmittingCheckin(true);
    try {
      await tasksService.saveWeeklyCheckin(userId, {
        weekDate: currentMonday,
        stressRating: disciplineRating,
        energyRating: disciplineRating,
        recoveryRating: disciplineRating >= 7 ? "buena" : "regular",
        dietPerception: bestMoment.trim(),
        notes: `Obstáculo y ayuda: ${biggestObstacle.trim()} | Lo mejor: ${bestMoment.trim()}`,
        rawAnswers: {
          submittedAt: new Date().toISOString(),
          question1_disciplineRating: disciplineRating,
          question2_bestMoment: bestMoment.trim(),
          question3_biggestObstacle: biggestObstacle.trim(),
        },
      });

      toast.success("¡Check-In Semanal enviado a tu entrenador!", {
        duration: 4500,
        icon: "🔥",
      });

      setIsAnsweringInline(false);
      loadCompliance();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el check-in";
      toast.error(msg);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const today = data?.today || {
    mealsCount: 0,
    mealsTarget: 4,
    nutritionPct: 0,
    tasksCompleted: 0,
    tasksTotal: 2,
    habitsPct: 0,
    workoutsLogged: 0,
    overallPct: 0,
  };

  const week = data?.week || {
    totalMeals: 0,
    targetMeals: 28,
    nutritionPct: 0,
    totalWorkouts: 0,
    habitsCompleted: 0,
    habitsPct: 0,
    overallPct: 0,
    latestCheckin: null,
  };

  const activeOverall =
    period === "day"
      ? today.overallPct
      : period === "week"
      ? week.overallPct
      : Math.round((today.overallPct * 0.3 + week.overallPct * 0.7));

  const getScoreColor = (score: number) => {
    if (score >= 85) return { stroke: "#ef4444", text: "text-red-500", label: "Excelente" };
    if (score >= 60) return { stroke: "#f97316", text: "text-orange-500", label: "Bueno" };
    if (score >= 40) return { stroke: "#eab308", text: "text-amber-500", label: "En Progreso" };
    return { stroke: "#64748b", text: "text-slate-400", label: "Iniciando" };
  };

  const scoreInfo = getScoreColor(activeOverall);

  return (
    <Card className={cn("overflow-hidden border-neutral-200 dark:border-white/10 relative", className)}>
      {/* Background Ambient Red Bloom */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
              {isTrainer ? `Rendimiento de ${userName || "Atleta"}` : "Porcentaje del Usuario / Rendimiento"}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Monitoreo de comidas al día, rutinas de entrenamiento y hábitos de bienestar
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-black/40 rounded-xl border border-neutral-200 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod("day")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all",
              period === "day"
                ? "bg-red-500 text-white shadow-sm"
                : "text-neutral-500 hover:text-white"
            )}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all",
              period === "week"
                ? "bg-red-500 text-white shadow-sm"
                : "text-neutral-500 hover:text-white"
            )}
          >
            Semana (7D)
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all",
              period === "month"
                ? "bg-red-500 text-white shadow-sm"
                : "text-neutral-500 hover:text-white"
            )}
          >
            Mes (30D)
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6 items-center">
        {/* Left: Circular Overall Adherence Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/5">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={scoreInfo.stroke}
                strokeWidth="9"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * activeOverall) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-display font-black text-neutral-900 dark:text-white leading-none">
                {loading ? "..." : `${activeOverall}%`}
              </span>
              <span className={cn("text-[10px] font-condensed font-bold uppercase tracking-widest mt-1", scoreInfo.text)}>
                {scoreInfo.label}
              </span>
            </div>
          </div>

          <p className="text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-400 mt-3 text-center">
            Adherencia General {period === "day" ? "de Hoy" : period === "week" ? "Semanal" : "Mensual"}
          </p>
        </div>

        {/* Right: Detailed Metric Cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Nutrition */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 truncate">
                  Nutrición
                </span>
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center text-sm shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-display font-black text-neutral-900 dark:text-white leading-none">
                  {period === "day"
                    ? `${today.mealsCount} / ${today.mealsTarget}`
                    : `${week.totalMeals} / ${week.targetMeals}`}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {period === "day" ? "Comidas hoy (Meta: 4)" : "Comidas registradas (7D)"}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-white/5">
              <div className="flex justify-between items-center text-[11px] font-bold font-mono mb-1 gap-2">
                <span className="text-neutral-400">Progreso</span>
                <span className="text-orange-500 shrink-0">{period === "day" ? today.nutritionPct : week.nutritionPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${period === "day" ? today.nutritionPct : week.nutritionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Training */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 truncate">
                  Entrenamiento
                </span>
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center text-sm shrink-0">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-display font-black text-neutral-900 dark:text-white leading-none">
                  {period === "day"
                    ? today.workoutsLogged > 0
                      ? "1 Sesión"
                      : "Pendiente"
                    : `${week.totalWorkouts} Sesiones`}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {period === "day" ? "Rutina completada hoy" : "Entrenamientos semana"}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-white/5">
              <div className="flex justify-between items-center text-[11px] font-bold font-mono mb-1 gap-2">
                <span className="text-neutral-400">Estado</span>
                <span className={cn("shrink-0", today.workoutsLogged > 0 ? "text-emerald-500" : "text-red-500")}>
                  {today.workoutsLogged > 0 ? "Completado" : "Por Realizar"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-700"
                  style={{ width: today.workoutsLogged > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Habits / Tasks */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 truncate">
                  Hábitos & Estrés
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm shrink-0">
                  <Brain className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xl sm:text-2xl font-display font-black text-neutral-900 dark:text-white leading-none">
                  {period === "day"
                    ? `${today.tasksCompleted} / ${today.tasksTotal}`
                    : `${week.habitsCompleted} Tareas`}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {period === "day" ? "Hábitos de bienestar hoy" : "Registros totales semana"}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-white/5">
              <div className="flex justify-between items-center text-[11px] font-bold font-mono mb-1 gap-2">
                <span className="text-neutral-400">Cumplimiento</span>
                <span className="text-emerald-500 shrink-0">{period === "day" ? today.habitsPct : week.habitsPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${period === "day" ? today.habitsPct : week.habitsPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ATHLETE SECTION: INLINE CHECK-IN FORM (NO MODAL, NO SCROLL LOCK!) ─── */}
      {!isTrainer && (
        <div className="mt-6 rounded-2xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/10 overflow-hidden transition-all">
          {/* Collapsed Header / Summary Bar */}
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold uppercase tracking-wider font-condensed text-neutral-900 dark:text-white">
                    Check-In Semanal de Rendimiento (Cada 7 Días - Lunes)
                  </h4>
                  {hasCheckedInThisWeek ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold font-condensed uppercase text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Respondido ({week.latestCheckin?.stressRating}/10)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] font-bold font-condensed uppercase text-red-400">
                      Pendiente
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {hasCheckedInThisWeek
                    ? "¡Excelente! Has sincronizado tu semana con tu coach. Puedes revisar o actualizar tus respuestas."
                    : "Responde 3 preguntas breves sobre tu semana para que tu entrenador calibre tus comidas y rutinas."}
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant={hasCheckedInThisWeek ? "secondary" : "primary"}
              onClick={() => setIsAnsweringInline(!isAnsweringInline)}
              className="font-condensed uppercase tracking-wider font-bold shrink-0 shadow-sm text-xs w-full sm:w-auto"
            >
              {isAnsweringInline
                ? "Ocultar Formulario"
                : hasCheckedInThisWeek
                ? "Ver / Actualizar Respuestas"
                : "Responder Check-In Ahora"}
            </Button>
          </div>

          {/* Expanded Inline Form (Flows directly in DOM, Zero Popups!) */}
          {isAnsweringInline && (
            <form onSubmit={handleInlineSubmit} className="p-4 sm:p-6 border-t border-neutral-200 dark:border-white/10 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
              {/* Question 1: Rating */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <label className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                    1. ¿Cómo evalúas tu semana del 1 al 10 en términos de disciplina y sensaciones?{" "}
                    <span className="text-red-500 font-black">*</span>
                  </label>
                  <span className="text-sm font-bold text-red-500 font-mono shrink-0">
                    {disciplineRating} / 10
                  </span>
                </div>

                <p className={cn("text-xs font-condensed font-bold uppercase tracking-wider", descriptor.color)}>
                  {descriptor.text}
                </p>

                {/* 1-10 Buttons */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = disciplineRating === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDisciplineRating(num)}
                        className={cn(
                          "h-10 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center border",
                          isSelected
                            ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-500/30 scale-105"
                            : "bg-neutral-100 dark:bg-neutral-950 border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-400 hover:border-red-500/50 hover:text-red-500"
                        )}
                      >
                        <span>{num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Short text */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/10 space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  2. ¿Qué fue lo mejor que te salió esta semana?{" "}
                  <span className="text-red-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bestMoment}
                  onChange={(e) => setBestMoment(e.target.value)}
                  placeholder="Ej: Cumplí mis 4 comidas al 100% y logré récord en sentadilla..."
                  className="w-full py-2.5 px-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 outline-none focus:border-red-500 transition-all font-medium"
                />
              </div>

              {/* Question 3: Long text */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/10 space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  3. ¿Cuál fue tu mayor obstáculo y en qué necesitas ayuda para la próxima semana?{" "}
                  <span className="text-red-500 font-black">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={biggestObstacle}
                  onChange={(e) => setBiggestObstacle(e.target.value)}
                  placeholder="Ej: Se me dificultó preparar snacks por viajes de trabajo y sentí fatiga muscular. Necesito ajustar los tiempos..."
                  className="w-full py-2.5 px-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 outline-none focus:border-red-500 transition-all font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAnsweringInline(false)}
                  className="w-full sm:w-auto text-xs font-condensed uppercase font-bold text-neutral-400 hover:text-white"
                >
                  Ocultar por ahora
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingCheckin}
                  className="w-full sm:w-auto font-condensed uppercase tracking-wider font-bold shadow-lg shadow-red-500/30 text-xs py-2.5 px-5"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Enviar Check-In a mi Entrenador
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ─── COACH VIEW: HISTORIAL CRONOLÓGICO DE CHECK-INS SEMANALES ─── */}
      {isTrainer && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center font-bold">
                <History className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider font-condensed text-neutral-900 dark:text-white">
                Historial de Check-Ins Semanales de {userName || "Atleta"}
              </h4>
            </div>
            <span className="text-xs font-bold font-mono text-neutral-400 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2.5 py-0.5 rounded-full">
              {checkinHistory.length} {checkinHistory.length === 1 ? "Registro" : "Registros"}
            </span>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-neutral-400 animate-pulse">
              Cargando historial de check-ins...
            </div>
          ) : checkinHistory.length === 0 ? (
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-dashed border-neutral-300 dark:border-white/10 text-center space-y-2">
              <Calendar className="w-8 h-8 text-neutral-400 mx-auto opacity-50" />
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Sin registros semanales aún
              </p>
              <p className="text-[11px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Este alumno aún no ha enviado su primer reporte de 7 días. Cuando lo responda, aquí verás su evolución semana por semana.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkinHistory.map((item) => {
                const isExpanded = expandedHistoryId === item.id;
                const descriptor = getRatingDescriptor(item.stressRating);
                const answers = item.rawAnswers as Record<string, unknown> | null;
                const best = (answers?.question2_bestMoment as string) || item.dietPerception || "Sin detalles";
                const obstacle = (answers?.question3_biggestObstacle as string) || item.notes || "Sin observaciones";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10 overflow-hidden transition-all"
                  >
                    {/* Item Header */}
                    <div
                      onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.stressRating}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white font-condensed uppercase tracking-wider text-xs">
                              Semana: {item.weekDate}
                            </span>
                            <span className={cn("text-[10px] font-condensed font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-white/5", descriptor.color)}>
                              {descriptor.text}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {best}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                          {new Date(item.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-neutral-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
                        <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-neutral-200 dark:border-white/5 space-y-1">
                          <span className="font-bold uppercase tracking-wider font-condensed text-emerald-500 text-[10px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> 1. Lo mejor que le salió:
                          </span>
                          <p className="text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed">
                            {best}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-neutral-200 dark:border-white/5 space-y-1">
                          <span className="font-bold uppercase tracking-wider font-condensed text-red-500 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> 2. Mayor obstáculo y ayuda:
                          </span>
                          <p className="text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed">
                            {obstacle}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
