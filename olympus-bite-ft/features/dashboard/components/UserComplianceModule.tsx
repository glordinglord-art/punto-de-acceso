"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { tasksService } from "@/features/tasks/services/tasks.service";
import { WeeklyCheckinModal } from "./WeeklyCheckinModal";
import {
  Activity,
  Utensils,
  Dumbbell,
  Calendar,
  Brain,
} from "lucide-react";
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
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);

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

  useEffect(() => {
    loadCompliance();
  }, [loadCompliance]);

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

  // Auto-prompt once per session if check-in is pending for athlete
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  useEffect(() => {
    if (!isTrainer && data && !hasCheckedInThisWeek && !hasAutoOpened) {
      setShowCheckinModal(true);
      setHasAutoOpened(true);
    }
  }, [isTrainer, data, hasCheckedInThisWeek, hasAutoOpened]);

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

  // Select metric based on active tab
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
            Monitoreo inteligente de 4 comidas al día, rutinas de entrenamiento y hábitos de bienestar
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
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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

            {/* Centered Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
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

        {/* Right: Detailed Metric Cards (Nutrition, Workouts, Habits) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Nutrition (4 Meals Target) */}
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

          {/* Card 2: Training / Routine Workouts */}
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

          {/* Card 3: Habits / Tasks (Sleep & Stress Form) */}
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

      {/* Coach View: Athlete's Weekly Checkin Feedback Answers */}
      {isTrainer && week.latestCheckin && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-red-500/30 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-condensed text-white">
                Feedback del Check-In Semanal de {userName || "Atleta"}
              </h4>
            </div>
            <span className="text-xs font-display font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-md">
              Disciplina y Sensaciones: {week.latestCheckin.stressRating} / 10
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-bold uppercase tracking-wider font-condensed text-neutral-400 text-[11px] block">
                ✨ 1. Lo mejor que le salió esta semana:
              </span>
              <p className="text-neutral-200 font-medium leading-relaxed">
                {(week.latestCheckin.rawAnswers as Record<string, unknown>)?.question2_bestMoment as string ||
                 week.latestCheckin.dietPerception ||
                 "Registrado satisfactoriamente"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-bold uppercase tracking-wider font-condensed text-red-400 text-[11px] block">
                ⚠️ 2. Mayor obstáculo y ayuda necesaria:
              </span>
              <p className="text-neutral-200 font-medium leading-relaxed">
                {(week.latestCheckin.rawAnswers as Record<string, unknown>)?.question3_biggestObstacle as string ||
                 week.latestCheckin.notes ||
                 "Sin observaciones reportadas"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monday Check-in Callout Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold uppercase tracking-wider font-condensed text-neutral-900 dark:text-white">
                Check-In Semanal de Rendimiento (Cada 7 Días - Lunes)
              </h4>
              {hasCheckedInThisWeek ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold font-condensed uppercase text-emerald-400">
                  ✓ Respondido
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] font-bold font-condensed uppercase text-red-400 animate-pulse">
                  Requerido
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {hasCheckedInThisWeek
                ? `Disciplina y Sensaciones: ${week.latestCheckin?.stressRating}/10 • Respuestas sincronizadas con tu entrenador.`
                : "Responde las 3 preguntas clave sobre tu disciplina, mayor logro y obstáculo para desbloquear tus métricas de la semana."}
            </p>
          </div>
        </div>

        {!isTrainer && (
          <Button
            size="sm"
            variant={hasCheckedInThisWeek ? "secondary" : "primary"}
            onClick={() => setShowCheckinModal(true)}
            className="font-condensed uppercase tracking-wider font-bold shrink-0 shadow-sm text-xs"
          >
            {hasCheckedInThisWeek ? "Ver / Actualizar Respuestas" : "Responder Check-In Ahora"}
          </Button>
        )}
      </div>

      {/* Checkin Modal */}
      <WeeklyCheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        userId={userId}
        weekDate={currentMonday}
        onSuccess={loadCompliance}
        isMandatory={!hasCheckedInThisWeek}
      />
    </Card>
  );
}
