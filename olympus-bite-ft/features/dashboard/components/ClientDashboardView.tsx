"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Droplets,
  Dumbbell,
  Target,
  Moon,
  Scale,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Ruler,
  FileText,
  Plus,
  Minus,
  Layers,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { clientsService } from "@/features/clients/services/clients.service";
import { routinesService } from "@/features/routines/services/routines.service";
import { EvolutionLayersView } from "@/features/routines/components/EvolutionLayersView";
import { Modal } from "@/shared/components/ui/Modal";
import type { Routine, WorkoutLog } from "@/features/routines/types/routines.types";
import type { ClientDashboard } from "@/features/dashboard/types/dashboard.types";
import { cn, getLocalDateString } from "@/shared/lib/utils";
import { calculateNutritionTargets } from "@/features/meals/utils/nutrition-calculator";
import { toast } from "react-hot-toast";

type HorizonTab = "today" | "week" | "month";
type QuickModal = "objectives" | "progress" | null;

export function ClientDashboardView() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<HorizonTab>("today");
  const [quickModal, setQuickModal] = useState<QuickModal>(null);

  const [unit, setUnit] = useState<"kg" | "lbs">(
    (user?.weightUnitPreference as "kg" | "lbs") || "kg",
  );

  // Estado de Hidratación (en vasos de 250ml sincronizados con backend)
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [updatingWater, setUpdatingWater] = useState(false);

  // Estado de Check-in de Sueño (±1h)
  const anamnesis = useMemo(
    () =>
      user?.anamnesisData && typeof user.anamnesisData === "object"
        ? user.anamnesisData
        : {},
    [user?.anamnesisData],
  );
  const heroPact = useMemo(() => anamnesis.heroPact || {}, [anamnesis]);

  const defaultBedtime =
    heroPact?.pillars?.recovery?.targetBedtime || "22:30";
  const defaultWakeTime =
    heroPact?.pillars?.recovery?.targetWakeTime || "06:00";

  const [bedtimeInput, setBedtimeInput] = useState<string>(defaultBedtime);
  const [wakeTimeInput, setWakeTimeInput] = useState<string>(defaultWakeTime);
  const [savingSleep, setSavingSleep] = useState(false);

  // Estado de Pesaje Semanal en Ayunas (+0.25 / -0.50)
  const [fastedWeightInput, setFastedWeightInput] = useState<string>(
    user?.weight ? String(user.weight) : "",
  );
  const [savingWeight, setSavingWeight] = useState(false);

  // Estado de Medición Mensual % Grasa (US Navy y Manual)
  const [neckInput, setNeckInput] = useState<string>("38");
  const [waistInput, setWaistInput] = useState<string>("82");
  const [hipInput, setHipInput] = useState<string>("96");
  const [directFatInput, setDirectFatInput] = useState<string>("");
  const [savingNavy, setSavingNavy] = useState(false);

  // Modal de Evolución por Capas
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [allWorkoutLogs, setAllWorkoutLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    if (!user) return;
    routinesService
      .getByClient(user.id)
      .then(async (res) => {
        const list = res.data || [];
        const act = list.find((r) => r.isActive) || list[0] || null;
        setActiveRoutine(act);
        if (act) {
          const lRes = await routinesService.getWorkoutLogs(act.id, user.id);
          setAllWorkoutLogs(lRes.data || []);
        }
      })
      .catch(() => null);
  }, [user]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await dashboardService.getClientDashboard(user.id);
      if (res?.data) {
        setData(res.data);
        setWaterGlasses(res.data.waterGlasses || 0);
      }
    } catch {
      // Silencioso en carga inicial
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Cálculos del Reloj de Cuenta Regresiva (120 Días)
  const clockStats = useMemo(() => {
    const totalDays = Number(heroPact?.cycleDays) || 120;
    const startStr =
      heroPact?.startDate ||
      anamnesis?.discoveryCompletedAt?.slice(0, 10) ||
      (user as any)?.createdAt?.slice(0, 10);
    if (!startStr) {
      return {
        dayNumber: 1,
        daysRemaining: 119,
        totalDays: 120,
        weekNumber: 1,
        totalWeeks: 16,
        pct: 1,
        phaseName: "Bloque 1: Acumulación y Base Adaptativa",
      };
    }
    const start = new Date(startStr);
    const now = new Date();
    const diffDays = Math.max(
      1,
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    const clampedDay = Math.min(totalDays, diffDays);
    const daysRemaining = Math.max(0, totalDays - clampedDay);
    const weekNumber = Math.min(16, Math.ceil(clampedDay / 7));
    const pct = Math.min(100, Math.round((clampedDay / totalDays) * 100));

    let phaseName = "Mes 1: Creando la Base";
    if (weekNumber >= 5 && weekNumber <= 8)
      phaseName = "Mes 2: Subiendo tu Fuerza";
    else if (weekNumber >= 9 && weekNumber <= 12)
      phaseName = "Mes 3: Dominando tu Cuerpo";
    else if (weekNumber >= 13)
      phaseName = "Mes 4: Logrando tus Récords";

    return {
      dayNumber: clampedDay,
      daysRemaining,
      totalDays,
      weekNumber,
      totalWeeks: 16,
      pct,
      phaseName,
    };
  }, [heroPact, anamnesis?.discoveryCompletedAt, user]);

  // Fecha legible en español y cálculo de los 4 mesociclos
  const formattedToday = useMemo(() => {
    try {
      const d = new Date();
      const str = d.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch {
      return "Hoy";
    }
  }, []);

  const mesocycles = useMemo(() => {
    const day = clockStats.dayNumber;
    return [
      {
        num: 1,
        title: "Base",
        phase: "Semanas 1-4",
        pct: Math.min(100, Math.max(0, Math.round((Math.min(day, 30) / 30) * 100))),
        isCurrent: day >= 1 && day <= 30,
        isCompleted: day > 30,
      },
      {
        num: 2,
        title: "Fuerza",
        phase: "Semanas 5-8",
        pct: Math.min(100, Math.max(0, Math.round(((Math.min(Math.max(day, 30), 60) - 30) / 30) * 100))),
        isCurrent: day > 30 && day <= 60,
        isCompleted: day > 60,
      },
      {
        num: 3,
        title: "Dominio",
        phase: "Semanas 9-12",
        pct: Math.min(100, Math.max(0, Math.round(((Math.min(Math.max(day, 60), 90) - 60) / 30) * 100))),
        isCurrent: day > 60 && day <= 90,
        isCompleted: day > 90,
      },
      {
        num: 4,
        title: "Récords",
        phase: "Semanas 13-16",
        pct: Math.min(100, Math.max(0, Math.round(((Math.min(Math.max(day, 90), 120) - 90) / 30) * 100))),
        isCurrent: day > 90,
        isCompleted: day >= 120,
      },
    ];
  }, [clockStats.dayNumber]);

  // Conversión limpia kg <-> lbs
  const formatWeight = useCallback(
    (kgVal: number | null | undefined) => {
      if (kgVal === null || kgVal === undefined || isNaN(Number(kgVal)))
        return "—";
      const n = Number(kgVal);
      if (unit === "lbs") {
        return `${(Math.round(n * 2.20462 * 2) / 2).toFixed(1)} lbs`;
      }
      return `${n.toFixed(1)} kg`;
    },
    [unit],
  );

  // Metas Nutricionales e Hidratación Dinámica
  const targets = useMemo(() => calculateNutritionTargets(user), [user]);
  const weightKg = user?.weight || 72;
  const targetWaterLiters =
    Number(heroPact?.pillars?.nutrition?.waterLitersTarget) ||
    Number(((weightKg * 35 + 500) / 1000).toFixed(1));
  const currentWaterLiters = Number(((waterGlasses * 250) / 1000).toFixed(2));
  const waterPct = Math.min(
    100,
    Math.round((currentWaterLiters / Math.max(targetWaterLiters, 1)) * 100),
  );

  const handleWaterDelta = async (deltaGlasses: number) => {
    if (!user || updatingWater) return;
    const next = Math.max(0, Math.min(24, waterGlasses + deltaGlasses));
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

  // Registro de Sueño y Regularidad Circadiana (±1h)
  const sleepLogs: any[] = useMemo(
    () => (Array.isArray(anamnesis.sleepLogs) ? anamnesis.sleepLogs : []),
    [anamnesis.sleepLogs],
  );
  const todayStr = getLocalDateString();
  const todaySleepLog = useMemo(
    () => sleepLogs.find((s) => s.date === todayStr),
    [sleepLogs, todayStr],
  );

  // 7-day strip calculation for current week (Lun a Dom)
  const weekDaysSleep = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek);

    const dayLabels = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
    return dayLabels.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().slice(0, 10);
      const log = sleepLogs.find((s) => s.date === dateStr);
      const isPastOrToday = dateStr <= todayStr;
      const isToday = dateStr === todayStr;
      return {
        label,
        dateStr,
        log,
        isPastOrToday,
        isToday,
        complied: log?.withinOneHourWindow === true,
      };
    });
  }, [sleepLogs, todayStr]);

  const compliedDaysCount = useMemo(() => {
    return weekDaysSleep.filter((d) => d.complied).length;
  }, [weekDaysSleep]);

  const handleSaveSleep = async (customBed?: string, customWake?: string) => {
    if (!user || savingSleep) return;
    const bTime = customBed || bedtimeInput;
    const wTime = customWake || wakeTimeInput;
    setSavingSleep(true);
    try {
      const res = await clientsService.logSleepRegularity(user.id, {
        date: todayStr,
        bedtime: bTime,
        wakeTime: wTime,
      });
      if (res?.data?.user) {
        updateUser(res.data.user);
      }
      const log = res?.data?.log;
      if (log?.withinOneHourWindow) {
        toast.success(
          `🟢 Regularidad ±1h cumplida (${log.hoursSlept}h dormidas)`,
        );
      } else {
        toast(
          `⚠️ Registrado (${log?.hoursSlept}h), pero varió más de 1h de tu horario ancla`,
          { icon: "🕒" },
        );
      }
    } catch {
      toast.error("Error al registrar tu descanso");
    } finally {
      setSavingSleep(false);
    }
  };

  // Preview dinámico del % Grasa US Navy
  const previewNavy = useMemo(() => {
    const neck = parseFloat(neckInput);
    const waist = parseFloat(waistInput);
    const h = user?.height || 172;
    if (neck > 0 && waist > neck) {
      const navy =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waist - neck) +
            0.15456 * Math.log10(h)) -
        450;
      return Number(Math.max(4, Math.min(45, navy)).toFixed(1));
    }
    return null;
  }, [neckInput, waistInput, user?.height]);

  // Registro Mensual de % Grasa Corporal (US Navy y Directo)
  const handleSaveMonthlyNavy = async () => {
    if (!user || savingNavy) return;
    const directVal = parseFloat(directFatInput);
    const neck = parseFloat(neckInput);
    const waist = parseFloat(waistInput);
    const hip = parseFloat(hipInput);

    let finalBodyFat: number | undefined = undefined;

    if (!isNaN(directVal) && directVal >= 3 && directVal <= 50) {
      finalBodyFat = directVal;
    } else if (previewNavy !== null) {
      finalBodyFat = previewNavy;
    } else {
      toast.error(
        "Ingresa medidas de cuello y cintura (en cm) o ingresa tu % de grasa directo",
      );
      return;
    }

    setSavingNavy(true);
    try {
      const res = await clientsService.logWeeklyWeighIn(user.id, {
        weight: user.weight || 72,
        unit: "kg",
        date: todayStr,
        bodyFatPct: finalBodyFat,
        neckCm: !isNaN(neck) ? neck : undefined,
        waistCm: !isNaN(waist) ? waist : undefined,
        hipCm: !isNaN(hip) ? hip : undefined,
        notes: "Control mensual de % grasa",
      });
      if (res?.data?.user) {
        updateUser(res.data.user);
      }
      toast.success(`🎯 % Grasa registrado: ${finalBodyFat}%`);
    } catch {
      toast.error("Error al registrar el % de grasa");
    } finally {
      setSavingNavy(false);
    }
  };

  // Registro de Pesaje Semanal en Ayunas
  const fastedWeighIns: any[] = useMemo(
    () =>
      Array.isArray(anamnesis.fastedWeighIns) ? anamnesis.fastedWeighIns : [],
    [anamnesis.fastedWeighIns],
  );
  const lastWeighIn =
    fastedWeighIns.length > 0
      ? fastedWeighIns[fastedWeighIns.length - 1]
      : null;

  const handleSaveWeeklyWeight = async () => {
    if (!user || !fastedWeightInput || savingWeight) return;
    const val = parseFloat(fastedWeightInput);
    if (isNaN(val) || val <= 20) {
      toast.error("Ingresa un peso válido");
      return;
    }
    setSavingWeight(true);
    try {
      const res = await clientsService.logWeeklyWeighIn(user.id, {
        weight: val,
        unit,
        date: todayStr,
      });
      if (res?.data?.user) {
        updateUser(res.data.user);
      }
      toast.success("⚖️ Peso en ayunas registrado y tendencia actualizada");
    } catch {
      toast.error("No se pudo guardar el pesaje");
    } finally {
      setSavingWeight(false);
    }
  };

  // Los 4 Objetivos del Atleta
  const objectives = useMemo(() => {
    const bio = heroPact?.objectives?.biometric || {};
    const str = heroPact?.objectives?.strength || {};
    const mas = heroPact?.objectives?.bodyMastery || {};
    const aer = heroPact?.objectives?.aerobic || {};

    const weeklyRateKg =
      bio.weeklyDeltaTargetKg !== undefined
        ? Number(bio.weeklyDeltaTargetKg)
        : user?.dietaryGoal === "weight_loss"
          ? -0.5
          : 0.25;

    return {
      biometric: {
        title:
          bio.title ||
          (weeklyRateKg >= 0 ? "Subir Músculo Limpio" : "Bajar Grasa"),
        startKg: Number(bio.startWeightKg) || user?.weight || 70,
        currentKg: Number(bio.currentWeightKg) || user?.weight || 70,
        targetKg:
          Number(bio.targetWeightKg) ||
          Number(((user?.weight || 70) + weeklyRateKg * 16).toFixed(1)),
        weeklyRateKg,
        bodyFatPct:
          bio.currentBodyFatPct ||
          lastWeighIn?.bodyFatPct ||
          bio.startBodyFatPct ||
          null,
        targetBodyFatPct: bio.targetBodyFatPct || null,
        why:
          bio.why ||
          (weeklyRateKg >= 0
            ? "Tu meta es subir 0.25 kg por semana en ayunas para ganar músculo limpio sin acumular grasa."
            : "Tu meta es bajar 0.50 kg por semana en ayunas para quemar grasa cuidando tu músculo y tu fuerza."),
      },
      strength: {
        exerciseName: str.exerciseName || "Press Banca con Mancuernas",
        startWeight: Number(str.startWeight) || 25,
        currentWeight: Number(str.currentWeight) || 25,
        targetWeight: Number(str.targetWeight) || 40,
        unit: str.unit || unit,
        weeklyProgression: Number(str.weeklyProgression) || 1.25,
        why:
          str.why ||
          "Avanzar un poco cada semana te llevará directo a tu meta en estos 4 meses.",
      },
      bodyMastery: {
        skillName: mas.skillName || "Parada de Manos (Handstand)",
        startMark: mas.startMark || "Pino asistido en pared",
        currentMark: mas.currentMark || "En práctica semanal",
        targetMark: mas.targetMark || "15s libre controlado",
        weeklyPracticeTarget:
          mas.weeklyPracticeTarget || "3 prácticas cortas por semana",
        why:
          mas.why ||
          "La práctica constante enseña a tu cuerpo a dominar su propio peso sin lesionarte.",
      },
      aerobic: {
        enabled: aer.enabled !== undefined ? Boolean(aer.enabled) : true,
        metricName: aer.metricName || "Resistencia 5K",
        currentMark: aer.currentMark || "Marca actual",
        targetMark: aer.targetMark || "Menos de 24 min",
        why:
          aer.why ||
          "Tener mejor aire te ayuda a cansarte menos y recuperarte más rápido entre series.",
      },
    };
  }, [heroPact, user?.weight, user?.dietaryGoal, lastWeighIn, unit]);

  // Reportes Semanales del Entrenador
  const weeklyReports: any[] = useMemo(
    () =>
      Array.isArray(anamnesis.weeklyReports) ? anamnesis.weeklyReports : [],
    [anamnesis.weeklyReports],
  );
  const latestReport = weeklyReports.length > 0 ? weeklyReports[0] : null;

  const caloriesToday = data?.caloriesToday || 0;
  const proteinToday = data?.proteinToday || 0;
  const carbsToday = data?.carbsToday || 0;
  const fatToday = data?.fatToday || 0;

  // Score del Día (Los 3 Pilares Diarios) + Racha de Días Cumpliendo
  const dailyVictory = useMemo(() => {
    const waterDone = currentWaterLiters >= targetWaterLiters * 0.8;
    const nutritionDone = caloriesToday > 0;
    const sleepDone = Boolean(todaySleepLog?.withinOneHourWindow);
    const completedCount =
      (waterDone ? 1 : 0) + (nutritionDone ? 1 : 0) + (sleepDone ? 1 : 0);
    const scorePct = Math.round((completedCount / 3) * 100);

    // Racha basada en registros consistentes de sueño/agua/pesaje
    const streakDays = Math.max(
      1,
      sleepLogs.filter((s: any) => s.withinOneHourWindow).length +
        (waterDone ? 1 : 0),
    );

    return {
      waterDone,
      nutritionDone,
      sleepDone,
      completedCount,
      scorePct,
      streakDays,
    };
  }, [
    currentWaterLiters,
    targetWaterLiters,
    caloriesToday,
    todaySleepLog,
    sleepLogs,
  ]);

  if (loading && !data) {
    return (
      <div className="max-w-lg lg:max-w-6xl mx-auto space-y-4 py-2">
        <div className="h-44 rounded-3xl bg-[#0e1017] border border-white/[0.06] animate-pulse" />
        <div className="h-12 rounded-2xl bg-[#0e1017] border border-white/[0.06] animate-pulse" />
        <div className="h-64 rounded-3xl bg-[#0e1017] border border-white/[0.06] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg lg:max-w-6xl mx-auto lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-4 lg:space-y-0 pb-20">
      {/* ═════════════════════════════════════════════════════════
          COLUMNA IZQUIERDA (EN PC) / CABECERA PRINCIPAL (EN CELULAR):
          RELOJ DE 120 DÍAS + CONTROL HORIZONTE + CO-PILOTO IA
         ═════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. EL RELOJ DE 120 DÍAS (HORIZONTE DE TRANSFORMACIÓN) */}
        <section className="rounded-3xl bg-[#0b0e14] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Sutil halo ambiental cyan/sky */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-sky-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Barra superior de la tarjeta: Fecha + Co-Piloto IA */}
          <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10 border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {formattedToday}
              </span>
            </div>

            {/* Acceso directo al Co-Piloto IA integrado en la cabecera del atleta */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
              title="Consultar al Co-Piloto Clínico & Nutricional IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Co-Piloto IA</span>
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <p className="text-xs text-neutral-400 font-medium">
                Hola, <span className="text-white font-semibold">{user?.name?.split(' ')[0] || "Atleta"}</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white mt-0.5">
                Día {clockStats.dayNumber}{" "}
                <span className="text-neutral-400 text-lg font-normal">/ {clockStats.totalDays}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-neutral-400">
                  Semana {clockStats.weekNumber} de {clockStats.totalWeeks}
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-neutral-600" />
                <span className="text-xs text-cyan-400 font-medium">
                  {clockStats.phaseName}
                </span>
              </div>
            </div>

            {/* Selector Rápido kg | lbs & Días restantes */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-200 text-xs font-semibold tabular-nums">
                {clockStats.daysRemaining} días restantes
              </span>

              <div className="flex rounded-xl bg-white/[0.04] p-0.5 border border-white/[0.08]">
                {(['kg', 'lbs'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition active:scale-95 cursor-pointer",
                      unit === u
                        ? "bg-white text-black font-bold shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── BARRA SEGMENTADA DE LOS 4 MESOCICLOS (ROADMAP) ── */}
          <div className="mt-4 space-y-2 relative z-10">
            <div className="grid grid-cols-4 gap-1.5">
              {mesocycles.map((m) => (
                <div key={m.num} className="space-y-1">
                  <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        m.isCompleted
                          ? "bg-emerald-400"
                          : m.isCurrent
                            ? "bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                            : "bg-transparent"
                      )}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span
                      className={cn(
                        "truncate",
                        m.isCurrent
                          ? "text-cyan-300 font-bold"
                          : m.isCompleted
                            ? "text-emerald-400 font-medium"
                            : "text-neutral-500"
                      )}
                    >
                      M{m.num}: {m.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[11px] font-mono text-neutral-400 tabular-nums pt-0.5">
              <span className="text-cyan-300 font-medium">{clockStats.phaseName}</span>
              <span className="text-neutral-300 font-medium">{clockStats.pct}% completado</span>
            </div>
          </div>

          {/* ── LOOP DIARIO: LOS 3 PILARES + RACHA ── */}
          <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Racha: {dailyVictory.streakDays} día{dailyVictory.streakDays === 1 ? '' : 's'}</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-neutral-300">
                {dailyVictory.completedCount} de 3 Pilares Hoy
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div
                className={cn(
                  "rounded-xl px-3 py-2.5 border flex items-center gap-2 font-medium transition",
                  dailyVictory.waterDone
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/[0.03] border-white/[0.06] text-neutral-400"
                )}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Agua</span>
              </div>

              <div
                className={cn(
                  "rounded-xl px-3 py-2.5 border flex items-center gap-2 font-medium transition",
                  dailyVictory.nutritionDone
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/[0.03] border-white/[0.06] text-neutral-400"
                )}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Comidas</span>
              </div>

              <div
                className={cn(
                  "rounded-xl px-3 py-2.5 border flex items-center gap-2 font-medium transition",
                  dailyVictory.sleepDone
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/[0.03] border-white/[0.06] text-neutral-400"
                )}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Sueño ±1h</span>
              </div>
            </div>
          </div>

          {/* BOTÓN PROMINENTE: EVOLUCIÓN POR CAPAS (SEMANA 1 A 16) */}
          <button
            type="button"
            onClick={() => setShowEvolutionModal(true)}
            className="w-full mt-4 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white transition-all group cursor-pointer active:scale-[0.98] shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-semibold text-white">
                  Mi Progreso (Semana a Semana)
                </span>
                <span className="block text-xs text-neutral-400">
                  Cartas del Coach · Récords · Fotos y Medidas
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </section>

        {/* TARJETA EXCLUSIVA PARA PC: VISTA RÁPIDA DE TUS 4 METAS */}
        <section className="hidden lg:block rounded-3xl bg-[#0b0e14] border border-white/[0.08] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Tus 4 Metas del Programa
            </span>
            <button
              type="button"
              onClick={() => setHorizon('month')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              Ver detalle →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                1. Peso y Físico
              </span>
              <p className="text-sm font-bold text-white mt-1 tabular-nums">
                {formatWeight(objectives.biometric.currentKg)} →{' '}
                {formatWeight(objectives.biometric.targetKg)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">
                2. Fuerza
              </span>
              <p className="text-sm font-bold text-white truncate mt-1">
                {objectives.strength.exerciseName}
              </p>
              <span className="text-xs text-neutral-400 tabular-nums">
                Meta: {objectives.strength.targetWeight} {objectives.strength.unit}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-sky-400 block">
                3. Dominio Corporal
              </span>
              <p className="text-sm font-bold text-white truncate mt-1">
                {objectives.bodyMastery.skillName}
              </p>
              <span className="text-xs text-neutral-400">
                {objectives.bodyMastery.targetMark}
              </span>
            </div>

            {objectives.aerobic.enabled && (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase text-purple-400 block">
                  4. Cardio / Aire
                </span>
                <p className="text-sm font-bold text-white truncate mt-1">
                  {objectives.aerobic.metricName}
                </p>
                <span className="text-xs text-neutral-400">
                  {objectives.aerobic.targetMark}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ═════════════════════════════════════════════════════════
          COLUMNA DERECHA (EN PC) / CUERPO PRINCIPAL (EN CELULAR)
         ═════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-7 space-y-4">
        {/* BARRA ÚNICA DE NAVEGACIÓN SEGMENTADA */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#0b0e14] border border-white/[0.08] shadow-lg">
          {[
            { id: 'today', label: 'Hoy' },
            { id: 'week', label: 'Mi Semana' },
            { id: 'month', label: 'Mis 4 Metas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setHorizon(tab.id as HorizonTab)}
              className={cn(
                "py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition active:scale-95 cursor-pointer",
                horizon === tab.id
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════
            VISTA 1: HOY (LOS 3 HÁBITOS DEL DÍA + ENTRENAMIENTO)
           ═════════════════════════════════════════════════════════ */}
        {horizon === 'today' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. TU ENTRENAMIENTO DE HOY (HERO CARD) */}
            <div className="rounded-3xl bg-[#0b0e14] border border-cyan-500/25 p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/[0.04] rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                      Entrenamiento de Hoy
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {data?.activeRoutine?.name || "Mi Rutina Activa"}
                    </h2>
                  </div>
                </div>
              </div>

              {/* El Porqué en 1 frase clara */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-300 leading-relaxed">
                <span className="font-semibold text-white">Objetivo de la sesión: </span>
                Cada serie de hoy te acerca a levantar{' '}
                <strong className="text-amber-300 font-semibold">
                  {objectives.strength.targetWeight} {objectives.strength.unit} en{' '}
                  {objectives.strength.exerciseName}
                </strong>{' '}
                y dominar{' '}
                <strong className="text-cyan-300 font-semibold">
                  {objectives.bodyMastery.skillName}
                </strong>
                .
              </div>

              {/* Gran Botón Primario para Mobile (52px de altura ergonómica) */}
              <Link
                href="/routines"
                className="w-full h-13 rounded-2xl bg-white hover:bg-neutral-100 text-black text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Empezar Sesión de Hoy</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* 2. AGUA (HIDRATACIÓN DIARIA) */}
            <div className="rounded-3xl bg-[#091018] border border-sky-500/20 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                      Hidratación Diaria
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                      {currentWaterLiters} L{' '}
                      <span className="text-xs font-normal text-neutral-400">
                        de {targetWaterLiters} Litros
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold tabular-nums border",
                    waterPct >= 100
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-sky-500/15 border-sky-500/30 text-sky-300"
                  )}
                >
                  {waterPct}% meta
                </span>
              </div>

              {/* Barra de progreso de hidratación */}
              <div className="h-2.5 w-full rounded-full bg-black/50 overflow-hidden p-0.5 border border-sky-500/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, waterPct)}%` }}
                />
              </div>

              {/* Botones de acción táctiles para celular (48px de alto) */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleWaterDelta(-1)}
                  disabled={waterGlasses <= 0 || updatingWater}
                  className="col-span-3 h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-neutral-300 active:scale-95 transition disabled:opacity-30 cursor-pointer"
                  aria-label="Restar 250ml"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">250ml</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWaterDelta(1)}
                  disabled={updatingWater}
                  className="col-span-5 h-12 rounded-2xl bg-sky-400 hover:bg-sky-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+250 ml</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWaterDelta(2)}
                  disabled={updatingWater}
                  className="col-span-4 h-12 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                >
                  <span>+500 ml</span>
                </button>
              </div>

              <p className="text-xs text-sky-200/80 leading-relaxed pt-1">
                💧 La hidratación adecuada preserva hasta un 15% de tu capacidad de fuerza y retrasa la fatiga del sistema nervioso central.
              </p>
            </div>

            {/* 3. ALIMENTACIÓN Y MACROS */}
            <div className="rounded-3xl bg-[#0b0e14] border border-white/[0.08] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    Nutrición y Macros
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {caloriesToday.toLocaleString('es')}{' '}
                    <span className="text-xs font-normal text-neutral-400">
                      / {targets.calories.toLocaleString('es')} kcal
                    </span>
                  </h3>
                </div>

                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-neutral-300 tabular-nums">
                  {Math.max(0, targets.calories - caloriesToday).toLocaleString('es')} kcal restantes
                </span>
              </div>

              {/* Barras de Macros con números tabulares */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    label: 'Proteína',
                    val: proteinToday,
                    goal: targets.protein,
                    role: 'Músculo',
                    color: 'bg-sky-400',
                  },
                  {
                    label: 'Carbos',
                    val: carbsToday,
                    goal: targets.carbs,
                    role: 'Energía',
                    color: 'bg-amber-400',
                  },
                  {
                    label: 'Grasas',
                    val: fatToday,
                    goal: targets.fat,
                    role: 'Hormonas',
                    color: 'bg-emerald-400',
                  },
                ].map((m) => {
                  const pct = Math.min(100, Math.round((m.val / Math.max(m.goal, 1)) * 100));
                  return (
                    <div
                      key={m.label}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-200">
                          {m.label}
                        </span>
                        <span className="font-mono text-xs text-neutral-400 tabular-nums">
                          {Math.round(m.val)}/{m.goal}g
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', m.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="block text-[10px] text-neutral-400 truncate">
                        {m.role} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/meals"
                className="w-full h-11 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Registrar Comida en Nutrición</span>
              </Link>

              <p className="text-xs text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
                <strong className="text-white">Fundamento: </strong>{' '}
                {heroPact?.pillars?.nutrition?.nutritionWhy ||
                  objectives.biometric.why}
              </p>
            </div>

            {/* 4. DESCANSO (REGULARIDAD CIRCADIANA ±1h) */}
            <div className="rounded-3xl bg-[#0b0e14] border border-indigo-500/25 p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                        Descanso Circadiano (±1h)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold font-mono tabular-nums">
                        {compliedDaysCount} de 7 días
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-white mt-0.5">
                      Horario Ancla: {defaultBedtime} → {defaultWakeTime}
                    </h2>
                  </div>
                </div>

                {todaySleepLog && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold shrink-0 border",
                      todaySleepLog.withinOneHourWindow
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    )}
                  >
                    {todaySleepLog.withinOneHourWindow
                      ? `🟢 Cumplido (${todaySleepLog.hoursSlept}h)`
                      : `🟡 Varió >1h (${todaySleepLog.hoursSlept}h)`}
                  </span>
                )}
              </div>

              {/* Tira Visual de los 7 Días */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] text-neutral-400 font-medium px-1">
                  <span>Consistencia semanal:</span>
                  <span className={compliedDaysCount >= 5 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {compliedDaysCount >= 5 ? '🔥 Racha Óptima (SNC recuperado)' : 'Horario irregular'}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekDaysSleep.map((d) => (
                    <div
                      key={d.dateStr}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs transition-all",
                        d.log
                          ? d.complied
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : d.isToday
                            ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200 ring-1 ring-indigo-500/40"
                            : "bg-white/[0.02] border-white/[0.06] text-neutral-500",
                      )}
                    >
                      <span className="block text-[10px] font-bold uppercase">
                        {d.label}
                      </span>
                      <span className="block text-xs font-bold mt-1">
                        {d.log ? (d.complied ? '✓' : '!') : d.isToday ? 'Hoy' : '—'}
                      </span>
                      {d.log && (
                        <span className="block text-[9px] opacity-80 font-mono mt-0.5 tabular-nums">
                          {d.log.hoursSlept}h
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Rápido de 1 Clic si no ha registrado hoy */}
              {!todaySleepLog && (
                <button
                  type="button"
                  disabled={savingSleep}
                  onClick={() => handleSaveSleep(defaultBedtime, defaultWakeTime)}
                  className="w-full py-3 px-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Dormí a mi hora habitual ({defaultBedtime} a {defaultWakeTime})</span>
                </button>
              )}

              {/* Formulario manual por si varió el horario */}
              <div className="pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] text-neutral-400 block mb-1.5">
                  O anota tus horas exactas si variaste:
                </span>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-0.5">
                      Me dormí
                    </label>
                    <input
                      type="time"
                      value={bedtimeInput}
                      onChange={(e) => setBedtimeInput(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-0.5">
                      Me levanté
                    </label>
                    <input
                      type="time"
                      value={wakeTimeInput}
                      onChange={(e) => setWakeTimeInput(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={savingSleep}
                    onClick={() => handleSaveSleep()}
                    className="h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold uppercase tracking-wider active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingSleep ? '...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            VISTA 2: MI SEMANA (PESO EN AYUNAS + REPORTE COACH)
           ═════════════════════════════════════════════════════════ */}
        {horizon === 'week' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. PESAJE SEMANAL EN AYUNAS */}
            <div className="rounded-3xl bg-[#0e1017] border border-emerald-500/20 p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Control Semanal en Ayunas
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Anotar Mi Peso de la Semana
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0 tabular-nums">
                  Meta:{' '}
                  {objectives.biometric.weeklyRateKg >= 0
                    ? `+${objectives.biometric.weeklyRateKg} kg/sem`
                    : `${objectives.biometric.weeklyRateKg} kg/sem`}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {objectives.biometric.why}
              </p>

              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="block text-[10px] font-bold uppercase text-neutral-400">
                    Tu peso hoy en ayunas ({unit})
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={fastedWeightInput}
                    onChange={(e) => setFastedWeightInput(e.target.value)}
                    placeholder={`Ej: ${unit === 'lbs' ? '160.5' : '73.2'}`}
                    className="w-full bg-transparent text-base font-bold text-white focus:outline-none mt-0.5"
                  />
                </div>
                <button
                  type="button"
                  disabled={savingWeight}
                  onClick={handleSaveWeeklyWeight}
                  className="px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider text-xs active:scale-95 transition"
                >
                  {savingWeight ? 'Guardando...' : 'Guardar Peso'}
                </button>
              </div>

              {/* Historial reciente de pesajes */}
              {fastedWeighIns.length > 0 && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <span className="text-xs font-semibold text-neutral-400 block">
                    Últimos registros y promedio real:
                  </span>
                  <div className="space-y-1.5">
                    {fastedWeighIns
                      .slice(-4)
                      .reverse()
                      .map((w: any) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                          <span className="text-neutral-400 font-mono">
                            {w.date}
                          </span>
                          <span className="font-bold text-white tabular-nums">
                            {formatWeight(w.weightKg)}
                          </span>
                          <span className="text-[11px] text-sky-300 tabular-nums">
                            Tendencia: {formatWeight(w.trendWeightKg)}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-xs font-bold tabular-nums",
                              w.deltaKg > 0
                                ? "text-emerald-400"
                                : w.deltaKg < 0
                                  ? "text-amber-400"
                                  : "text-neutral-400",
                            )}
                          >
                            {w.deltaKg > 0 ? `+${w.deltaKg}kg` : `${w.deltaKg}kg`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. REPORTE SEMANAL DEL COACH */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                      Feedback Semanal
                    </span>
                    <h2 className="text-base font-bold text-white">
                      {latestReport
                        ? `Resumen de tu Semana ${latestReport.weekNumber}`
                        : 'Resumen de tu Entrenador'}
                    </h2>
                  </div>
                </div>
                {latestReport?.isDeloadWeek && (
                  <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-semibold uppercase">
                    Semana de Descarga
                  </span>
                )}
              </div>

              {latestReport ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                        Entreno
                      </span>
                      <span className="text-lg font-bold text-emerald-400 tabular-nums">
                        {latestReport.trainingScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                        Nutrición
                      </span>
                      <span className="text-lg font-bold text-sky-400 tabular-nums">
                        {latestReport.nutritionScore}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                        Sueño
                      </span>
                      <span className="text-lg font-bold text-indigo-400 tabular-nums">
                        {latestReport.recoveryScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-sky-400 block">
                      Notas de tu Entrenador:
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                      {latestReport.trainerNotes}
                    </p>
                  </div>

                  {latestReport.nextWeekFocus && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[11px] font-bold uppercase text-amber-300 block">
                        🎯 Enfoque para tu próxima semana:
                      </span>
                      <p className="text-xs font-semibold text-white">
                        {latestReport.nextWeekFocus}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tu entrenador dejará aquí sus notas y el foco principal para tu próxima semana tras cada revisión.
                </p>
              )}
            </div>

            {/* BOTÓN EXPLORAR LÍNEA DE TIEMPO */}
            <button
              type="button"
              onClick={() => setShowEvolutionModal(true)}
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-neutral-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/[0.06] transition cursor-pointer active:scale-[0.98]"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Ver Evolución por Capas</span>
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            VISTA 3: MIS 4 METAS (Y MEDICIÓN MENSUAL)
           ═════════════════════════════════════════════════════════ */}
        {horizon === 'month' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
                Tus 4 Metas del Ciclo de 120 Días
              </h2>

              {/* 1. Peso y Físico */}
              <div className="p-5 rounded-3xl bg-[#0e1017] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    1. Peso y Físico • {objectives.biometric.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {formatWeight(objectives.biometric.currentKg)} →{' '}
                    {formatWeight(objectives.biometric.targetKg)}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  {objectives.biometric.why}
                </p>
                {objectives.biometric.bodyFatPct && (
                  <div className="text-xs text-emerald-300 font-medium tabular-nums">
                    % de Grasa Actual: {objectives.biometric.bodyFatPct}%{' '}
                    {objectives.biometric.targetBodyFatPct
                      ? `→ Meta: ${objectives.biometric.targetBodyFatPct}%`
                      : ''}
                  </div>
                )}
              </div>

              {/* 2. Fuerza */}
              <div className="p-5 rounded-3xl bg-[#0e1017] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-400">
                    2. Meta de Fuerza
                  </span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {objectives.strength.currentWeight} →{' '}
                    {objectives.strength.targetWeight} {objectives.strength.unit}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {objectives.strength.exerciseName}
                </p>
                <p className="text-xs text-neutral-300">
                  Progresión: subir +{objectives.strength.weeklyProgression}{' '}
                  {objectives.strength.unit} o repeticiones cada semana.
                </p>
              </div>

              {/* 3. Dominio Corporal */}
              <div className="p-5 rounded-3xl bg-[#0e1017] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-sky-400">
                    3. Dominio Corporal
                  </span>
                  <span className="text-xs font-bold text-sky-200">
                    Meta: {objectives.bodyMastery.targetMark}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {objectives.bodyMastery.skillName}
                </p>
                <p className="text-xs text-neutral-300">
                  Nivel actual: {objectives.bodyMastery.currentMark} •{' '}
                  {objectives.bodyMastery.weeklyPracticeTarget}
                </p>
              </div>

              {/* 4. Resistencia / Cardio */}
              {objectives.aerobic.enabled && (
                <div className="p-5 rounded-3xl bg-[#0e1017] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-purple-400">
                      4. Resistencia Aeróbica
                    </span>
                    <span className="text-xs font-bold text-purple-200">
                      Meta: {objectives.aerobic.targetMark}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {objectives.aerobic.metricName}
                  </p>
                  <p className="text-xs text-neutral-300">
                    {objectives.aerobic.why}
                  </p>
                </div>
              )}
            </div>

            {/* MEDICIÓN MENSUAL DE % DE GRASA (US NAVY O DIRECTO) */}
            <div className="rounded-3xl bg-[#0e1017] border border-amber-500/20 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                      Control Mensual
                    </span>
                    <h3 className="text-base font-bold text-white">
                      % de Grasa Corporal
                    </h3>
                  </div>
                </div>

                {objectives.biometric.bodyFatPct && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tabular-nums">
                    Actual: {objectives.biometric.bodyFatPct}%
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Mide con cinta métrica tu <strong>cuello</strong> y <strong>cintura</strong> (a la altura del ombligo) para calcularlo con el método US Navy, o ingresa el valor directo de tu báscula:
              </p>

              {/* Inputs Cuello y Cintura */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                    Cuello (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={neckInput}
                    onChange={(e) => setNeckInput(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    placeholder="38"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    placeholder="82"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-amber-400 mb-0.5">
                    O % Directo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={directFatInput}
                    onChange={(e) => setDirectFatInput(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-amber-300 focus:outline-none"
                    placeholder="Ej: 14.5"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-xs text-neutral-400">
                  {previewNavy !== null ? (
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      📐 Estimación US Navy: {previewNavy}%
                    </span>
                  ) : directFatInput ? (
                    <span className="text-amber-300 font-semibold tabular-nums">
                      ⚖️ Valor directo: {directFatInput}%
                    </span>
                  ) : (
                    'Ingresa medidas o porcentaje directo'
                  )}
                </span>

                <button
                  type="button"
                  disabled={savingNavy}
                  onClick={handleSaveMonthlyNavy}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {savingNavy
                    ? 'Guardando...'
                    : previewNavy
                      ? `Guardar ${previewNavy}%`
                      : directFatInput
                        ? `Guardar ${directFatInput}%`
                        : 'Guardar % de Grasa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Evolución por Capas ── */}
      {showEvolutionModal && user && (
        <Modal
          isOpen={showEvolutionModal}
          onClose={() => setShowEvolutionModal(false)}
          title=""
          size="xl"
          noPadding={true}
          className="max-w-5xl overflow-hidden"
        >
          <EvolutionLayersView
            user={user}
            routine={activeRoutine || (data?.activeRoutine as any) || null}
            workoutLogs={allWorkoutLogs}
            weightUnit={unit}
            onClose={() => setShowEvolutionModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
