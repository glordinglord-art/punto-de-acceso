"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Moon,
  Droplets,
  Scale,
  Sparkles,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Routine, WorkoutLog } from "@/features/routines/types/routines.types";
import type { User } from "@/shared/types/common.types";
import {
  analyzeExerciseProgression,
  type ExerciseAutoregulationInsight,
} from "@/features/routines/utils/vital-fit-labs-engine";

interface EvolutionLayersViewProps {
  user: any;
  routine: Routine | null;
  workoutLogs: WorkoutLog[];
  weightUnit?: "kg" | "lbs";
  isTrainer?: boolean;
  onApplyAdjustment?: (insight: ExerciseAutoregulationInsight) => Promise<void>;
  applyingActionId?: string | null;
  onClose?: () => void;
}

export function EvolutionLayersView({
  user,
  routine,
  workoutLogs,
  weightUnit = "kg",
  isTrainer = false,
  onApplyAdjustment,
  applyingActionId,
  onClose,
}: EvolutionLayersViewProps) {
  const anamnesis = useMemo(
    () =>
      user?.anamnesisData && typeof user.anamnesisData === "object"
        ? (user.anamnesisData as any)
        : {},
    [user?.anamnesisData],
  );
  const heroPact = anamnesis.heroPact || {};
  const weeklyReports: any[] = Array.isArray(anamnesis.weeklyReports)
    ? anamnesis.weeklyReports
    : [];
  const sleepLogs: any[] = Array.isArray(anamnesis.sleepLogs)
    ? anamnesis.sleepLogs
    : [];
  const fastedWeighIns: any[] = Array.isArray(anamnesis.fastedWeighIns)
    ? anamnesis.fastedWeighIns
    : [];

  const totalWeeks = routine?.weekCount || 16;
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    if (workoutLogs.length > 0) {
      const maxLogged = Math.max(...workoutLogs.map((l) => l.weekNumber || 1));
      return Math.min(totalWeeks, maxLogged);
    }
    return 1;
  });

  const [activeLayer, setActiveLayer] = useState<"layer1" | "layer2" | "layer3">(
    "layer2",
  );

  // Group workout logs by exercise and week
  const logsByExerciseAndWeek = useMemo(() => {
    const map = new Map<string, Map<number, WorkoutLog>>();
    workoutLogs.forEach((log) => {
      const exId = log.exerciseId;
      if (!map.has(exId)) map.set(exId, new Map());
      map.get(exId)!.set(log.weekNumber, log);
    });
    return map;
  }, [workoutLogs]);

  // Weeks that have at least one logged exercise
  const loggedWeeks = useMemo(() => {
    const set = new Set<number>();
    workoutLogs.forEach((l) => {
      if (l.weekNumber) set.add(l.weekNumber);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [workoutLogs]);

  // Selected week's report
  const selectedReport = useMemo(() => {
    return weeklyReports.find((r) => Number(r.weekNumber) === selectedWeek);
  }, [weeklyReports, selectedWeek]);

  // Compute Volume for a log (sum of weight * reps)
  const computeLogVolume = (log?: WorkoutLog) => {
    if (!log || !Array.isArray(log.setsData)) return 0;
    return (log.setsData as any[]).reduce((acc, s) => {
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      return acc + w * r;
    }, 0);
  };

  // Compute total volume for a week across all exercises
  const computeWeekTotalVolume = (week: number) => {
    const weekLogs = workoutLogs.filter((l) => l.weekNumber === week);
    return weekLogs.reduce((acc, l) => acc + computeLogVolume(l), 0);
  };

  const currentWeekVolume = computeWeekTotalVolume(selectedWeek);
  const prevWeekVolume =
    selectedWeek > 1 ? computeWeekTotalVolume(selectedWeek - 1) : 0;
  const volumeDeltaKg = currentWeekVolume - prevWeekVolume;
  const volumeDeltaPct =
    prevWeekVolume > 0
      ? Math.round((volumeDeltaKg / prevWeekVolume) * 100)
      : 0;

  // Radar de Autorregulación Vital Fit Labs para la semana actual
  const exerciseInsights = useMemo(() => {
    const map = new Map<string, ExerciseAutoregulationInsight>();
    if (!routine) return map;
    routine.days.forEach((d) => {
      d.exercises.forEach((ex) => {
        const ins = analyzeExerciseProgression(ex, workoutLogs, selectedWeek, {
          sleepRegularityOk: true,
          waterOk: true,
        });
        map.set(ex.id, ins);
      });
    });
    return map;
  }, [routine, workoutLogs, selectedWeek]);

  // Sleep stats for selected week
  const sleepStats = useMemo(() => {
    const targetBed = heroPact?.pillars?.recovery?.targetBedtime || "22:30";
    const targetWake = heroPact?.pillars?.recovery?.targetWakeTime || "06:00";
    const recent = sleepLogs.slice(-7);
    const compliedCount = recent.filter((s) => s.withinOneHourWindow).length;
    return {
      compliedCount,
      totalCount: recent.length || 7,
      targetBed,
      targetWake,
    };
  }, [sleepLogs, heroPact]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090b10] text-white p-5 sm:p-7 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* ── Header: El Museo del Progreso ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-primary-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
            <div className="w-full h-full bg-[#090b10] rounded-2xl flex items-center justify-center text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                Línea de Tiempo · 120 Días
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                Semana {selectedWeek} de {totalWeeks}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              Mi Progreso
              <span className="text-xs text-neutral-400 font-normal lowercase tracking-normal">
                • semana a semana
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              De la Semana 1 a tu meta final: revisa tus cargas, la carta de tu coach y tu transformación.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 uppercase tracking-wider transition cursor-pointer"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* ── Timeline Navigator (Semanas 1 a 16) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-300">
            Capítulos Semanales (Toca para inspeccionar):
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            {loggedWeeks.length} semanas con registros
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((wk) => {
            const isSelected = selectedWeek === wk;
            const hasData = loggedWeeks.includes(wk);
            const hasRep = weeklyReports.some((r) => Number(r.weekNumber) === wk);
            const mesocycleNum = Math.ceil(wk / 4);

            return (
              <button
                key={wk}
                type="button"
                onClick={() => setSelectedWeek(wk)}
                className={cn(
                  "shrink-0 min-w-[76px] rounded-2xl p-2.5 text-center border transition-all cursor-pointer relative",
                  isSelected
                    ? "bg-gradient-to-b from-red-600 via-primary-600 to-amber-600 text-white border-red-500 shadow-lg shadow-red-600/30 font-black scale-105"
                    : hasData
                      ? "bg-white/[0.05] hover:bg-white/[0.08] border-emerald-500/40 text-neutral-200"
                      : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-neutral-500",
                )}
              >
                <span className="block text-[9px] font-bold uppercase tracking-wider opacity-80">
                  Meso {mesocycleNum}
                </span>
                <span className="block text-sm font-black mt-0.5">Sem {wk}</span>
                <div className="flex justify-center items-center gap-1 mt-1">
                  {hasData && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      title="Entrenamientos registrados"
                    />
                  )}
                  {hasRep && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      title="Reporte del Entrenador publicado"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selector de las 3 Secciones ── */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/50 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveLayer("layer1")}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeLayer === "layer1"
              ? "bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-neutral-400 hover:text-white",
          )}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>1. Carta de mi Coach</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("layer2")}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeLayer === "layer2"
              ? "bg-gradient-to-r from-red-600/30 to-amber-600/20 text-white border border-red-500/50 shadow-sm font-black"
              : "text-neutral-400 hover:text-white",
          )}
        >
          <Dumbbell className="w-4 h-4 shrink-0 text-red-400" />
          <span>2. Mis Cargas y Récords</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("layer3")}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeLayer === "layer3"
              ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-neutral-400 hover:text-white",
          )}
        >
          <Scale className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>3. Mi Cuerpo y Peso</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CAPA 1: BITÁCORA DEL HÉROE (REPORTE SEMANAL DEL ENTRENADOR)
         ══════════════════════════════════════════════════════════ */}
      {activeLayer === "layer1" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {selectedReport ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/[0.08] via-white/[0.02] to-black border border-amber-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-sm">
                    S{selectedReport.weekNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                      Veredicto Oficial del Mentor
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Reporte de la Semana {selectedReport.weekNumber}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedReport.publishedAt}
                  </span>
                  {selectedReport.isDeloadWeek && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase">
                      Descarga Inteligente
                    </span>
                  )}
                </div>
              </div>

              {/* Los 3 Scores de la Semana */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <span className="block text-[10px] font-bold uppercase text-neutral-400">
                    1. Entreno
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {selectedReport.trainingScore || 95}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <span className="block text-[10px] font-bold uppercase text-neutral-400">
                    2. Nutrición / Agua
                  </span>
                  <span className="text-xl font-black text-sky-400">
                    {selectedReport.nutritionScore || 90}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <span className="block text-[10px] font-bold uppercase text-neutral-400">
                    3. Sueño (±1h)
                  </span>
                  <span className="text-xl font-black text-indigo-400">
                    {selectedReport.recoveryScore || 85}%
                  </span>
                </div>
              </div>

              {/* Traducción y Notas del Entrenador */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  La Traducción de tu Entrenador:
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                  {selectedReport.trainerNotes || selectedReport.summary}
                </p>
              </div>

              {/* Misión Sagrada para la siguiente semana */}
              {selectedReport.nextWeekFocus && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-amber-600/20 border border-red-500/40 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-300 block flex items-center gap-1.5">
                    🎯 Tu Misión Sagrada para la Semana Siguiente:
                  </span>
                  <p className="text-sm font-bold text-white">
                    {selectedReport.nextWeekFocus}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-3xl border border-dashed border-white/10 text-center bg-white/[0.02] space-y-2">
              <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Sin Reporte Oficial para la Semana {selectedWeek}
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Al finalizar tus sesiones de esta semana, tu entrenador y Vital Fit Labs revisarán tus series y emitirán tu reporte coleccionable aquí.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CAPA 2: EVOLUCIÓN DE FUERZA Y CARGAS (SEMANA A SEMANA)
         ══════════════════════════════════════════════════════════ */}
      {activeLayer === "layer2" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Tarjeta de Volumen Total Acumulado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Carga Acumulada Sem {selectedWeek}
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {currentWeekVolume > 0
                  ? `${currentWeekVolume.toLocaleString()} ${weightUnit}`
                  : "0 kg"}
              </p>
              <p className="text-[11px] text-neutral-400">
                Volumen total efectivo movido
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Delta vs Semana Anterior
              </span>
              <p
                className={cn(
                  "text-2xl font-black font-mono flex items-center gap-1",
                  volumeDeltaKg > 0
                    ? "text-emerald-400"
                    : volumeDeltaKg < 0
                      ? "text-amber-400"
                      : "text-neutral-400",
                )}
              >
                {volumeDeltaKg > 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    +{volumeDeltaKg} {weightUnit} (+{volumeDeltaPct}%)
                  </>
                ) : volumeDeltaKg < 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-amber-400 rotate-180" />
                    {volumeDeltaKg} {weightUnit} ({volumeDeltaPct}%)
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className="text-[11px] text-neutral-400">
                {volumeDeltaKg > 0
                  ? "Sobrecarga progresiva lograda 🚀"
                  : selectedWeek === 1
                    ? "Semana base de referencia"
                    : "Consolidación de volumen"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-300 block">
                Estado de Autorregulación
              </span>
              <p className="text-base font-bold text-white flex items-center gap-1.5 mt-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {volumeDeltaKg > 0
                  ? "Doble Progresión Activa"
                  : "Zona de Adaptación MAV"}
              </p>
              <p className="text-[11px] text-neutral-300">
                Leyes de Mike Israetel & Schoenfeld aplicadas
              </p>
            </div>
          </div>

          {/* Desglose de Ejercicios: Semana Seleccionada vs Semanas Previas */}
          {routine ? (
            <div className="space-y-4">
              {routine.days
                .filter((d) => !d.isRestDay)
                .map((d) => (
                  <div
                    key={d.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                          {d.dayNumber}
                        </span>
                        <h4 className="text-sm font-bold uppercase text-white">
                          Día {d.dayNumber}: {d.focusArea}
                        </h4>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">
                        {d.exercises.length} ejercicios
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {d.exercises.map((ex) => {
                        const currentLog = logsByExerciseAndWeek
                          .get(ex.id)
                          ?.get(selectedWeek);
                        const prevLog =
                          selectedWeek > 1
                            ? logsByExerciseAndWeek
                                .get(ex.id)
                                ?.get(selectedWeek - 1)
                            : undefined;

                        const curVol = computeLogVolume(currentLog);
                        const prevVol = computeLogVolume(prevLog);
                        const exDeltaKg = curVol - prevVol;

                        return (
                          <div
                            key={ex.id}
                            className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 hover:border-white/20 transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-xs sm:text-sm font-bold text-white block">
                                  {ex.name}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Meta programada: {ex.sets} series × {ex.reps}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {currentLog && prevLog && exDeltaKg > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                    🚀 +{exDeltaKg} kg volumen
                                  </span>
                                )}
                                {currentLog && (
                                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-mono font-bold">
                                    {curVol.toLocaleString()} kg total
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Comparativa Lado a Lado: Sem Anterior vs Sem Actual */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {/* Semana Anterior */}
                              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">
                                  {selectedWeek > 1
                                    ? `Semana ${selectedWeek - 1} (Anterior)`
                                    : "Semana Base"}
                                </span>
                                {prevLog &&
                                Array.isArray(prevLog.setsData) &&
                                prevLog.setsData.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 font-mono">
                                    {prevLog.setsData.map((s: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[11px] text-neutral-300"
                                      >
                                        S{s.set}: {s.weight ?? "—"}kg × {s.reps ?? "—"}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-neutral-500 italic">
                                    Sin registro previo
                                  </p>
                                )}
                              </div>

                              {/* Semana Actual */}
                              <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30 space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 block">
                                  Semana {selectedWeek} (Seleccionada)
                                </span>
                                {currentLog &&
                                Array.isArray(currentLog.setsData) &&
                                currentLog.setsData.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 font-mono">
                                    {currentLog.setsData.map(
                                      (s: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className={cn(
                                            "px-2 py-0.5 rounded border text-[11px] font-bold",
                                            s.completed
                                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                              : "bg-black/50 border-white/10 text-white",
                                          )}
                                        >
                                          S{s.set}: {s.weight ?? "—"}kg × {s.reps ?? "—"}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-neutral-500 italic">
                                    Pendiente por registrar en Semana {selectedWeek}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* ── Sugerencia de Autorregulación Vital Fit Labs ── */}
                            {(() => {
                              const ins = exerciseInsights.get(ex.id);
                              if (
                                !ins ||
                                (ins.state !== "double_progression" &&
                                  ins.state !== "fatigue_shield_2w")
                              )
                                return null;

                              return (
                                <div
                                  className={cn(
                                    "mt-2 p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5",
                                    ins.state === "fatigue_shield_2w"
                                      ? "bg-cyan-500/10 border-cyan-500/35"
                                      : "bg-emerald-500/10 border-emerald-500/35",
                                  )}
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="text-xs font-black uppercase tracking-wider text-white">
                                        {ins.badgeLabel}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-300 font-medium">
                                      {ins.historyChainText}
                                    </p>
                                    <p className="text-[11px] text-neutral-400">
                                      {ins.whyText}
                                    </p>
                                  </div>

                                  {/* Si es el Entrenador: Botón de Aprobación 1-Clic */}
                                  {isTrainer && onApplyAdjustment && (
                                    <button
                                      type="button"
                                      disabled={applyingActionId === ex.id}
                                      onClick={() => onApplyAdjustment(ins)}
                                      className={cn(
                                        "px-3.5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition cursor-pointer shrink-0 shadow-md flex items-center justify-center gap-1.5",
                                        ins.state === "fatigue_shield_2w"
                                          ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
                                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20",
                                      )}
                                    >
                                      {applyingActionId === ex.id
                                        ? "Aplicando en rutina..."
                                        : ins.trainerActionLabel || "⚡ Aprobar y Aplicar"}
                                    </button>
                                  )}

                                  {/* Si es el Atleta: Píldora motivadora sin botones de edición */}
                                  {!isTrainer && ins.state === "double_progression" && (
                                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-300 font-bold flex items-center gap-1.5 shrink-0">
                                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Récord Conquistado 🚀 Tu coach evaluará subir la carga</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-6">
              Sin rutina activa asignada.
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CAPA 3: TRANSFORMACIÓN CORPORAL (% GRASA + PESAJE + SUEÑO)
         ══════════════════════════════════════════════════════════ */}
      {activeLayer === "layer3" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Registro de Pesaje en Ayunas y Tendencia */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                      Pilar Biométrico Semanal
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Pesaje en Ayunas & Tendencia
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Meta: {heroPact?.objectives?.biometric?.targetWeightKg || "—"} kg
                </span>
              </div>

              {fastedWeighIns.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {fastedWeighIns
                    .slice(-6)
                    .reverse()
                    .map((w: any) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-black/40 border border-white/5"
                      >
                        <span className="text-neutral-400 font-mono">
                          {w.date}
                        </span>
                        <span className="font-bold text-white">
                          {w.weightKg} kg
                        </span>
                        <span className="text-sky-300 text-[11px]">
                          Promedio real: {w.trendWeightKg || w.weightKg} kg
                        </span>
                        {w.deltaKg !== undefined && (
                          <span
                            className={cn(
                              "font-mono font-bold text-[11px]",
                              w.deltaKg > 0 ? "text-emerald-400" : "text-amber-400",
                            )}
                          >
                            {w.deltaKg > 0 ? `+${w.deltaKg}kg` : `${w.deltaKg}kg`}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Aún no hay pesajes en ayunas registrados.
                </p>
              )}
            </div>

            {/* Pilar Circadiano: Regularidad de Sueño (X/7 Días) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
                      Pilar Circadiano (SNC)
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Ancla de Sueño: {sleepStats.targetBed} → {sleepStats.targetWake}
                    </h4>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs font-mono">
                  {sleepStats.compliedCount} / 7 días
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Racha de regularidad ±1h:</span>
                  <span className="font-bold text-white">
                    {Math.round((sleepStats.compliedCount / 7) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((sleepStats.compliedCount / 7) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {sleepStats.compliedCount >= 5 ? (
                  <span className="text-emerald-400 font-medium">
                    🟢 Excelente recuperación: tu sistema nervioso central está al 100% para sobrecarga progresiva.
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    🟡 Deuda circadiana detectada: cuida tu horario de dormir para no frenar tu ganancia muscular.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
