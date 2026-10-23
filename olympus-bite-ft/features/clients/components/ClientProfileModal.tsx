"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import type { User } from "@/shared/types/common.types";
import { cn } from "@/shared/lib/utils";
import { clientsService } from "@/features/clients/services/clients.service";
import { ClientMealsProgress } from "./ClientMealsProgress";
import { ClientAiChat } from "./ClientAiChat";
import { ClientAssessmentsTab } from "@/features/assessments/components/ClientAssessmentsTab";
import { toast } from "react-hot-toast";
import {
  Target,
  Dumbbell,
  Droplets,
  Moon,
  FileText,
  RefreshCw,
  Sparkles,
  Scale,
  Ruler,
  Flame,
  Send,
  Trash2,
  Key,
  CheckCircle2,
} from "lucide-react";

interface ClientProfileModalProps {
  client: User | null;
  initialTab?: "profile" | "assessments" | "progress" | "compliance" | "ai";
  onClose: () => void;
  onSave: (
    clientId: string,
    data: {
      dietaryGoal?: string;
      targetCalories?: number | null;
      password?: string;
    },
  ) => Promise<void>;
  onDelete?: (clientId: string) => Promise<void>;
}

export function ClientProfileModal({
  client,
  initialTab = "profile",
  onClose,
  onSave,
  onDelete,
}: ClientProfileModalProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "compliance" | "assessments" | "progress" | "ai"
  >(initialTab);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [isSaving, setIsSaving] = useState(false);
  const [resettingDiscovery, setResettingDiscovery] = useState(false);

  // Campos del Pacto de 120 Días (4 Objetivos + 3 Pilares)
  const [startDate, setStartDate] = useState<string>("");
  const [biometricMode, setBiometricMode] = useState<
    "surplus" | "deficit" | "recomp"
  >("surplus");
  const [currentWeight, setCurrentWeight] = useState<string>("72");
  const [targetWeight, setTargetWeight] = useState<string>("76");
  const [weeklyRateKg, setWeeklyRateKg] = useState<string>("0.25");
  const [bodyFatPct, setBodyFatPct] = useState<string>("16");
  const [targetBodyFatPct, setTargetBodyFatPct] = useState<string>("13");

  const [strengthExercise, setStrengthExercise] = useState<string>(
    "Press Banca con Mancuernas",
  );
  const [strengthCurrent, setStrengthCurrent] = useState<string>("25");
  const [strengthTarget, setStrengthTarget] = useState<string>("40");
  const [strengthWeeklyProg, setStrengthWeeklyProg] = useState<string>("1.25");

  const [masterySkill, setMasterySkill] = useState<string>(
    "Parada de Manos (Handstand)",
  );
  const [masteryCurrent, setMasteryCurrent] = useState<string>(
    "Pino en pared 20s",
  );
  const [masteryTarget, setMasteryTarget] = useState<string>(
    "15s libre controlado",
  );

  const [aerobicEnabled, setAerobicEnabled] = useState<boolean>(true);
  const [aerobicMetric, setAerobicMetric] = useState<string>("Carrera 5K");
  const [aerobicTarget, setAerobicTarget] = useState<string>("Sub 23 min");

  // 3 Pilares
  const [calories, setCalories] = useState<string>("2500");
  const [protein, setProtein] = useState<string>("160");
  const [carbs, setCarbs] = useState<string>("290");
  const [fats, setFats] = useState<string>("75");
  const [waterLiters, setWaterLiters] = useState<string>("3.2");
  const [nutritionWhy, setNutritionWhy] = useState<string>("");

  const [targetBedtime, setTargetBedtime] = useState<string>("22:30");
  const [targetWakeTime, setTargetWakeTime] = useState<string>("06:00");
  const [password, setPassword] = useState<string>("");

  // Cierre Semanal del Entrenador (Reporte a 1 Clic)
  const [reportWeekNumber, setReportWeekNumber] = useState<number>(1);
  const [trainingScore, setTrainingScore] = useState<number>(95);
  const [nutritionScore, setNutritionScore] = useState<number>(90);
  const [recoveryScore, setRecoveryScore] = useState<number>(85);
  const [trainerNotes, setTrainerNotes] = useState<string>("");
  const [nextWeekFocus, setNextWeekFocus] = useState<string>("");
  const [isDeloadWeek, setIsDeloadWeek] = useState<boolean>(false);
  const [publishingReport, setPublishingReport] = useState<boolean>(false);

  const anamnesis = useMemo(
    () =>
      client?.anamnesisData && typeof client.anamnesisData === "object"
        ? client.anamnesisData
        : {},
    [client?.anamnesisData],
  );

  useEffect(() => {
    if (!client) return;
    if (initialTab) setActiveTab(initialTab);

    const pact = anamnesis.heroPact || {};
    const prefUnit =
      (pact.weightUnit || client.weightUnitPreference || "kg") === "lbs"
        ? "lbs"
        : "kg";
    setUnit(prefUnit);

    setStartDate(
      pact.startDate ||
        client.createdAt?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10),
    );

    const bio = pact.objectives?.biometric || {};
    const mode =
      bio.mode ||
      (client.dietaryGoal === "weight_loss"
        ? "deficit"
        : client.dietaryGoal === "recomposition"
          ? "recomp"
          : "surplus");
    setBiometricMode(mode);

    const wKg = Number(bio.currentWeightKg || client.weight || 72);
    const tKg = Number(
      bio.targetWeightKg || (mode === "deficit" ? wKg - 6 : wKg + 4),
    );
    const factor = prefUnit === "lbs" ? 2.20462 : 1;
    setCurrentWeight((Math.round(wKg * factor * 2) / 2).toString());
    setTargetWeight((Math.round(tKg * factor * 2) / 2).toString());
    setWeeklyRateKg(
      String(
        bio.weeklyDeltaTargetKg !== undefined
          ? bio.weeklyDeltaTargetKg
          : mode === "deficit"
            ? -0.5
            : 0.25,
      ),
    );
    setBodyFatPct(String(bio.currentBodyFatPct || bio.startBodyFatPct || 16));
    setTargetBodyFatPct(String(bio.targetBodyFatPct || 13));

    const str = pact.objectives?.strength || {};
    setStrengthExercise(str.exerciseName || "Press Banca con Mancuernas");
    setStrengthCurrent(String(str.currentWeight || str.startWeight || 25));
    setStrengthTarget(String(str.targetWeight || 40));
    setStrengthWeeklyProg(String(str.weeklyProgression || 1.25));

    const mas = pact.objectives?.bodyMastery || {};
    setMasterySkill(mas.skillName || "Parada de Manos (Handstand)");
    setMasteryCurrent(mas.currentMark || mas.startMark || "Pino en pared 20s");
    setMasteryTarget(mas.targetMark || "15s libre controlado");

    const aer = pact.objectives?.aerobic || {};
    setAerobicEnabled(aer.enabled !== undefined ? Boolean(aer.enabled) : true);
    setAerobicMetric(aer.metricName || "Carrera 5K");
    setAerobicTarget(aer.targetMark || "Sub 23 min");

    const nut = pact.pillars?.nutrition || {};
    setCalories(String(nut.calories || client.targetCalories || 2400));
    setProtein(String(nut.protein || client.targetProtein || 160));
    setCarbs(String(nut.carbs || client.targetCarbs || 260));
    setFats(String(nut.fats || client.targetFats || 70));
    setWaterLiters(
      String(
        nut.waterLitersTarget ||
          Number(((wKg * 35 + 500) / 1000).toFixed(1)),
      ),
    );
    setNutritionWhy(
      nut.nutritionWhy ||
        "Sustento energético calibrado para tu objetivo biométrico y recuperación del SNC.",
    );

    const rec = pact.pillars?.recovery || {};
    setTargetBedtime(rec.targetBedtime || "22:30");
    setTargetWakeTime(rec.targetWakeTime || "06:00");
    setPassword("");

    const existingReports = Array.isArray(anamnesis.weeklyReports)
      ? anamnesis.weeklyReports
      : [];
    setReportWeekNumber(existingReports.length + 1);
  }, [client, initialTab, anamnesis]);

  if (!client) return null;

  const toggleUnit = (nextUnit: "kg" | "lbs") => {
    if (nextUnit === unit) return;
    const factor = nextUnit === "lbs" ? 2.20462 : 1 / 2.20462;
    const conv = (v: string) => {
      const n = parseFloat(v);
      if (isNaN(n)) return v;
      return (Math.round(n * factor * 2) / 2).toString();
    };
    setCurrentWeight(conv(currentWeight));
    setTargetWeight(conv(targetWeight));
    setStrengthCurrent(conv(strengthCurrent));
    setStrengthTarget(conv(strengthTarget));
    setUnit(nextUnit);
  };

  // Botón para solicitar nueva Radiografía del Atleta
  const handleResetDiscovery = async () => {
    setResettingDiscovery(true);
    try {
      await clientsService.resetDiscovery(client.id);
      toast.success(
        `✅ Radiografía habilitada para ${client.name}. Le aparecerá al abrir la app.`,
      );
    } catch {
      toast.error("No se pudo habilitar el formulario");
    } finally {
      setResettingDiscovery(false);
    }
  };

  // Guardar Ficha Técnica completa y Activar Pacto de 120 Días
  const handleSaveHeroPact = async () => {
    setIsSaving(true);
    try {
      const factorToKg = unit === "lbs" ? 1 / 2.20462 : 1;
      const curWeightKg = Number(
        ((parseFloat(currentWeight) || 70) * factorToKg).toFixed(1),
      );
      const tarWeightKg = Number(
        ((parseFloat(targetWeight) || 74) * factorToKg).toFixed(1),
      );

      await clientsService.updateHeroPact(client.id, {
        status: "ACTIVE",
        cycleDays: 120,
        startDate,
        weightUnit: unit,
        objectives: {
          biometric: {
            mode: biometricMode,
            title:
              biometricMode === "surplus"
                ? "Volumen Limpio"
                : biometricMode === "deficit"
                  ? "Definición Atlética"
                  : "Recomposición Corporal",
            startWeightKg:
              anamnesis.heroPact?.objectives?.biometric?.startWeightKg ||
              curWeightKg,
            currentWeightKg: curWeightKg,
            targetWeightKg: tarWeightKg,
            weeklyDeltaTargetKg: parseFloat(weeklyRateKg) || 0.25,
            currentBodyFatPct: parseFloat(bodyFatPct) || 16,
            targetBodyFatPct: parseFloat(targetBodyFatPct) || 13,
          },
          strength: {
            exerciseName: strengthExercise,
            currentWeight: parseFloat(strengthCurrent) || 25,
            targetWeight: parseFloat(strengthTarget) || 40,
            unit,
            weeklyProgression: parseFloat(strengthWeeklyProg) || 1.25,
          },
          bodyMastery: {
            skillName: masterySkill,
            currentMark: masteryCurrent,
            targetMark: masteryTarget,
          },
          aerobic: {
            enabled: aerobicEnabled,
            metricName: aerobicMetric,
            targetMark: aerobicTarget,
          },
        },
        pillars: {
          nutrition: {
            calories: Number(calories) || 2400,
            protein: Number(protein) || 160,
            carbs: Number(carbs) || 260,
            fats: Number(fats) || 70,
            waterLitersTarget: parseFloat(waterLiters) || 3.2,
            nutritionWhy,
          },
          recovery: {
            targetBedtime,
            targetWakeTime,
            sleepHoursTarget: 7.5,
            toleranceMinutes: 60,
          },
        },
      });

      await onSave(client.id, {
        dietaryGoal:
          biometricMode === "surplus"
            ? "muscle_gain"
            : biometricMode === "deficit"
              ? "weight_loss"
              : "recomposition",
        targetCalories: Number(calories) || null,
        password: password.trim() ? password.trim() : undefined,
      });

      toast.success("🎯 Pacto de 120 Días y Ficha Técnica actualizados");
    } catch {
      toast.error("Error al guardar la Ficha Técnica");
    } finally {
      setIsSaving(false);
    }
  };

  // Publicar Reporte Semanal a 1 Botón
  const handlePublishWeeklyReport = async () => {
    if (!trainerNotes.trim()) {
      toast.error("Escribe tus anotaciones de la semana para el atleta");
      return;
    }
    setPublishingReport(true);
    try {
      await clientsService.publishWeeklyReport(client.id, {
        weekNumber: reportWeekNumber,
        trainingScore,
        nutritionScore,
        recoveryScore,
        trainerNotes: trainerNotes.trim(),
        nextWeekFocus: nextWeekFocus.trim(),
        isDeloadWeek,
      });
      toast.success(
        `🚀 Reporte de Semana ${reportWeekNumber} publicado en el celular de ${client.name}`,
      );
      setTrainerNotes("");
      setNextWeekFocus("");
      setReportWeekNumber((w) => w + 1);
    } catch {
      toast.error("No se pudo publicar el reporte semanal");
    } finally {
      setPublishingReport(false);
    }
  };

  const sleepLogs: any[] = Array.isArray(anamnesis.sleepLogs)
    ? anamnesis.sleepLogs
    : [];
  const fastedWeighIns: any[] = Array.isArray(anamnesis.fastedWeighIns)
    ? anamnesis.fastedWeighIns
    : [];
  const weeklyReports: any[] = Array.isArray(anamnesis.weeklyReports)
    ? anamnesis.weeklyReports
    : [];

  return (
    <Modal
      isOpen={!!client}
      onClose={onClose}
      title=""
      size="xl"
      noPadding={true}
      className="overflow-hidden max-w-5xl"
    >
      <div className="bg-[#0b0d12] text-white min-h-[75vh] flex flex-col">
        {/* ─── CABECERA DE LA FICHA TÉCNICA DEL ATLETA ─── */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#180508] via-[#10131c] to-[#0b0d12] border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar
                name={client.name}
                size="lg"
                className="w-14 h-14 text-xl ring-2 ring-red-500/40"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    FICHA DEL ATLETA
                  </span>
                  <Badge variant={client.isActive ? "success" : "danger"}>
                    {anamnesis.cycleStatus === "ACTIVE_CYCLE"
                      ? "PLAN 120 DÍAS ACTIVO"
                      : "POR DEFINIR METAS"}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-condensed font-black uppercase tracking-wide text-white">
                  {client.name}
                </h2>
                <p className="text-xs text-neutral-400">
                  {client.email} {client.age ? `• ${client.age} años` : ""}{" "}
                  {client.height ? `• ${client.height} cm` : ""}
                </p>
              </div>
            </div>

            {/* Acciones Superiores: Unidad kg/lbs + Solicitar Radiografía */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl bg-white/5 p-0.5 border border-white/10">
                {(["kg", "lbs"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => toggleUnit(u)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold uppercase transition",
                      unit === u
                        ? "bg-red-600 text-white"
                        : "text-neutral-400 hover:text-white",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={resettingDiscovery}
                onClick={handleResetDiscovery}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition"
                title="Hace que al atleta le aparezca el formulario de Punto de Partida al abrir la app"
              >
                <RefreshCw
                  className={cn(
                    "w-3.5 h-3.5 text-red-400",
                    resettingDiscovery && "animate-spin",
                  )}
                />
                <span>Pedir Formulario Inicial</span>
              </button>
            </div>
          </div>

          {/* Barra de Navegación de la Ficha Técnica */}
          <div className="flex gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-white/10 no-scrollbar">
            {[
              { id: "profile", label: "🎯 4 Metas y Plan" },
              { id: "compliance", label: "📞 Resumen Semanal" },
              { id: "assessments", label: "📐 Medidas y % Grasa" },
              { id: "progress", label: "🍽️ Comidas" },
              { id: "ai", label: "🔒 Memoria Clínica IA (Privado)" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-condensed font-bold uppercase tracking-wider whitespace-nowrap transition",
                  activeTab === t.id
                    ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                    : "bg-white/[0.04] text-neutral-400 hover:text-white border border-white/5",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── CONTENIDO DE LA FICHA TÉCNICA ─── */}
        <div className="p-4 sm:p-6 flex-1 space-y-5 overflow-y-auto">
          {/* PESTAÑA 1: PACTO DE 120 DÍAS (LOS 4 OBJETIVOS + LOS 3 PILARES) */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Respuestas de la Radiografía si existen */}
              {anamnesis.discoveryAnswers && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
                    Resumen de Radiografía Enviada por el Atleta
                  </span>
                  <p>
                    • <strong>Disponibilidad:</strong>{" "}
                    {anamnesis.discoveryAnswers.trainingDaysPerWeek || 4}{" "}
                    días/sem ×{" "}
                    {anamnesis.discoveryAnswers.minutesPerSession || 60} min |{" "}
                    <strong>Lesiones:</strong>{" "}
                    {client.medicalConditions || "Ninguna"}
                  </p>
                  <p>
                    • <strong>Obstáculo previo:</strong>{" "}
                    {anamnesis.discoveryAnswers.pastObstacle ||
                      "No especificado"}{" "}
                    | <strong>Compromiso:</strong>{" "}
                    {anamnesis.discoveryAnswers.commitmentScore || 10}/10
                  </p>
                </div>
              )}

              {/* Grid de los 4 Objetivos Cardinales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Objetivo Biométrico */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" />
                      1. Objetivo Biométrico ({unit})
                    </span>
                    <select
                      value={biometricMode}
                      onChange={(e) => {
                        const m = e.target.value as any;
                        setBiometricMode(m);
                        setWeeklyRateKg(
                          m === "surplus"
                            ? "0.25"
                            : m === "deficit"
                              ? "-0.50"
                              : "0",
                        );
                      }}
                      className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="surplus">Volumen (+0.25 kg/sem)</option>
                      <option value="deficit">Definición (-0.50 kg/sem)</option>
                      <option value="recomp">Recomposición</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Peso Actual ({unit})
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/40">
                      <span className="block text-[9px] text-emerald-400 uppercase font-bold">
                        Peso Meta ({unit})
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Cuota kg/sem
                      </span>
                      <input
                        type="number"
                        step="0.05"
                        value={weeklyRateKg}
                        onChange={(e) => setWeeklyRateKg(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-emerald-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        % Grasa Actual
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={bodyFatPct}
                        onChange={(e) => setBodyFatPct(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        % Grasa Meta (Mes 4)
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={targetBodyFatPct}
                        onChange={(e) => setTargetBodyFatPct(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Objetivo de Fuerza */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 space-y-3">
                  <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    2. Objetivo de Fuerza ({unit})
                  </span>
                  <input
                    type="text"
                    value={strengthExercise}
                    onChange={(e) => setStrengthExercise(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm font-bold text-white focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Actual ({unit})
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={strengthCurrent}
                        onChange={(e) => setStrengthCurrent(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-amber-500/40">
                      <span className="block text-[9px] text-amber-400 uppercase font-bold">
                        Meta Mes 4 ({unit})
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={strengthTarget}
                        onChange={(e) => setStrengthTarget(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Subida/Sem
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        value={strengthWeeklyProg}
                        onChange={(e) => setStrengthWeeklyProg(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-amber-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Dominio Corporal */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-sky-500/30 space-y-2.5">
                  <span className="text-xs font-bold uppercase text-sky-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    3. Objetivo de Dominio Corporal
                  </span>
                  <input
                    type="text"
                    value={masterySkill}
                    onChange={(e) => setMasterySkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm font-bold text-white focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Nivel Actual
                      </span>
                      <input
                        type="text"
                        value={masteryCurrent}
                        onChange={(e) => setMasteryCurrent(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-sky-500/40">
                      <span className="block text-[9px] text-sky-400 uppercase font-bold">
                        Meta Mes 4
                      </span>
                      <input
                        type="text"
                        value={masteryTarget}
                        onChange={(e) => setMasteryTarget(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Objetivo Aeróbico + Inicio del Reloj */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-purple-400">
                      4. Objetivo Aeróbico y Reloj 120D
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <span className="block text-[9px] text-neutral-400 uppercase">
                        Prueba Aeróbica
                      </span>
                      <input
                        type="text"
                        value={aerobicMetric}
                        onChange={(e) => setAerobicMetric(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-purple-500/40">
                      <span className="block text-[9px] text-purple-400 uppercase font-bold">
                        Marca Meta
                      </span>
                      <input
                        type="text"
                        value={aerobicTarget}
                        onChange={(e) => setAerobicTarget(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calibración de Nutrición, Agua Prioritaria y Sueño (±1h) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  Prescripción de Pilares: Nutrición, Agua Prioritaria y Ancla
                  de Sueño (±1h)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[9px] text-amber-400 uppercase font-bold">
                      Kcal / Día
                    </span>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[9px] text-sky-400 uppercase font-bold">
                      Proteína (g)
                    </span>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[9px] text-amber-300 uppercase font-bold">
                      Carbos (g)
                    </span>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[9px] text-rose-400 uppercase font-bold">
                      Grasas (g)
                    </span>
                    <input
                      type="number"
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-sky-500/40">
                    <span className="block text-[9px] text-sky-300 uppercase font-bold">
                      Agua (L/Día)
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={waterLiters}
                      onChange={(e) => setWaterLiters(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-indigo-500/40">
                    <span className="block text-[9px] text-indigo-300 uppercase font-bold">
                      Dormir (±1h)
                    </span>
                    <input
                      type="time"
                      value={targetBedtime}
                      onChange={(e) => setTargetBedtime(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-indigo-500/40">
                    <span className="block text-[9px] text-indigo-300 uppercase font-bold">
                      Despertar (±1h)
                    </span>
                    <input
                      type="time"
                      value={targetWakeTime}
                      onChange={(e) => setTargetWakeTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase mb-1">
                    El Porqué Nutricional (Lo que lee el Atleta en su celular):
                  </span>
                  <input
                    type="text"
                    value={nutritionWhy}
                    onChange={(e) => setNutritionWhy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Cambio de contraseña o baja */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nueva clave opcional..."
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                  />
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(client.id)}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveHeroPact}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-condensed font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-600/25 transition"
                >
                  {isSaving
                    ? "Guardando..."
                    : "💾 Guardar Pacto y Ficha Técnica"}
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: CIERRE SEMANAL DE VIDEOLLAMADA Y REPORTE A 1 BOTÓN */}
          {activeTab === "compliance" && (
            <div className="space-y-4">
              {/* Resumen de Telemetría de Sueño y Pesaje en Ayunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 block">
                    ⚖️ Últimos Pesajes en Ayunas
                  </span>
                  {fastedWeighIns.length > 0 ? (
                    <div className="space-y-1">
                      {fastedWeighIns
                        .slice(-4)
                        .reverse()
                        .map((w: any) => (
                          <div
                            key={w.id}
                            className="flex justify-between text-xs bg-black/30 px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="text-neutral-400">{w.date}</span>
                            <span className="font-bold text-white">
                              {w.weightKg} kg
                            </span>
                            <span className="text-sky-300">
                              Tendencia: {w.trendWeightKg} kg
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Sin pesajes registrados aún.
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase text-indigo-400 block">
                    😴 Últimos Registros de Sueño (±1h)
                  </span>
                  {sleepLogs.length > 0 ? (
                    <div className="space-y-1">
                      {sleepLogs
                        .slice(-4)
                        .reverse()
                        .map((s: any) => (
                          <div
                            key={s.id}
                            className="flex justify-between text-xs bg-black/30 px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="text-neutral-400">{s.date}</span>
                            <span className="font-bold text-white">
                              {s.hoursSlept}h ({s.bedtime}-{s.wakeTime})
                            </span>
                            <span
                              className={
                                s.withinOneHourWindow
                                  ? "text-emerald-400 font-bold"
                                  : "text-amber-400"
                              }
                            >
                              {s.withinOneHourWindow ? "🟢 ±1h OK" : "🟡 >1h"}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Sin registros de sueño aún.
                    </p>
                  )}
                </div>
              </div>

              {/* Formulario de Cierre Semanal (A 1 Botón) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-red-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
                      Bitácora de Videollamada Semanal
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Emitir Reporte Oficial de la Semana
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-sky-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDeloadWeek}
                        onChange={(e) => setIsDeloadWeek(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                      <span>Semana de Descarga</span>
                    </label>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                      <span className="text-xs text-neutral-400">Semana #</span>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={reportWeekNumber}
                        onChange={(e) =>
                          setReportWeekNumber(Number(e.target.value))
                        }
                        className="w-10 bg-transparent text-xs font-bold text-white text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Calificación Puntual de los 3 Pilares */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[10px] text-emerald-400 uppercase font-bold">
                      1. Score Entreno (%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={trainingScore}
                      onChange={(e) => setTrainingScore(Number(e.target.value))}
                      className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[10px] text-sky-400 uppercase font-bold">
                      2. Score Nutrición/Agua (%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={nutritionScore}
                      onChange={(e) =>
                        setNutritionScore(Number(e.target.value))
                      }
                      className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="block text-[10px] text-indigo-400 uppercase font-bold">
                      3. Score Sueño ±1h (%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={recoveryScore}
                      onChange={(e) => setRecoveryScore(Number(e.target.value))}
                      className="w-full bg-transparent text-base font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Anotaciones del Entrenador (Lo que avanzó y lo que debe
                    ajustar):
                  </label>
                  <textarea
                    rows={3}
                    value={trainerNotes}
                    onChange={(e) => setTrainerNotes(e.target.value)}
                    placeholder="Ej: Excelente semana subiendo +0.25kg limpios y dominando 32.5kg en press. Esta semana priorizaremos no fallar en la hora de dormir..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    🎯 Misión Puntual para la Siguiente Semana:
                  </label>
                  <input
                    type="text"
                    value={nextWeekFocus}
                    onChange={(e) => setNextWeekFocus(e.target.value)}
                    placeholder="Ej: Consolidar 4x8 con 35kg en banca y cumplir 7/7 días de agua (3.2L)."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-sm text-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={publishingReport}
                  onClick={handlePublishWeeklyReport}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-condensed font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-[0.99] transition"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {publishingReport
                      ? "Publicando..."
                      : `🚀 Publicar Reporte de Semana ${reportWeekNumber} al Atleta`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: VALORACIONES Y MEDIDAS */}
          {activeTab === "assessments" && (
            <ClientAssessmentsTab clientId={client.id} />
          )}

          {/* PESTAÑA 4: PROGRESO DE COMIDAS */}
          {activeTab === "progress" && (
            <ClientMealsProgress
              clientId={client.id}
              targetCalories={Number(calories) || client.targetCalories || null}
            />
          )}

          {/* PESTAÑA 5: CO-PILOTO CIENTÍFICO IA */}
          {activeTab === "ai" && (
            <ClientAiChat client={client} />
          )}
        </div>
      </div>
    </Modal>
  );
}
