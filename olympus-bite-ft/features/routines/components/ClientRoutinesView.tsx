"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { routinesService } from "@/features/routines/services/routines.service";
import { GuidedSessionView } from "./GuidedSessionView";
import { RoutineListView } from "./RoutineListView";
import { EvolutionLayersView } from "./EvolutionLayersView";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";
import { Dumbbell, Flame, TrendingUp, CalendarCheck, Layers } from "lucide-react";

interface ClientRoutinesViewProps {
  /** Rutina a abrir de entrada en vez de la activa (coach entrenando su propia rutina). */
  initialRoutineId?: string;
  /** Si se pasa, el encabezado muestra un boton para volver. */
  onBack?: () => void;
}

export function ClientRoutinesView({ initialRoutineId, onBack }: ClientRoutinesViewProps = {}) {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "session" | "evolution">("list");
  const [sessionDay, setSessionDay] = useState<RoutineDay | null>(null);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(
    (user?.weightUnitPreference as "kg" | "lbs") || "kg",
  );

  const lastRoutineId = useRef<string | null>(null);

  const refreshLogs = useCallback(
    async (currentRoutinesList: Routine[]) => {
      if (!user) return;
      setLogsLoading(true);
      try {
        const responses = await Promise.all(
          currentRoutinesList.map((r) =>
            routinesService.getWorkoutLogs(r.id, user.id).catch(() => ({ data: [] })),
          ),
        );
        const combined = responses.flatMap((res) => res.data ?? []);
        setLogs(combined);
        return combined;
      } finally {
        setLogsLoading(false);
      }
    },
    [user],
  );

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await routinesService.getByClient(user.id);
      const data = res.data ?? [];
      setRoutines(data);
      const active =
        data.find((r) => r.id === initialRoutineId) ??
        data.find((r) => r.isActive) ??
        data[0];
      if (active) {
        setSelectedRoutine(active);
        await refreshLogs(data);
      }
    } finally {
      setLoading(false);
    }
  }, [user, refreshLogs, initialRoutineId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedRoutine || selectedRoutine.id === lastRoutineId.current) return;
    lastRoutineId.current = selectedRoutine.id;
    refreshLogs(routines);
  }, [selectedRoutine, routines, refreshLogs]);

  const handleSaveSet = useCallback(
    async (
      exercise: Exercise,
      setNumber: number,
      weight: number | null,
      reps: number | null,
    ) => {
      if (!user || !selectedRoutine) return;
      const key = `${exercise.id}-${setNumber}`;
      setSavingLog(key);
      try {
        const existingLog = logs.find(
          (l) => l.exerciseId === exercise.id && l.weekNumber === currentWeek,
        );
        const prevSets = existingLog?.setsData ?? [];
        const updatedSets = [
          ...prevSets.filter((s) => s.set !== setNumber),
          { set: setNumber, weight, reps, rest: null, completed: true },
        ].sort((a, b) => a.set - b.set);

        await routinesService.logWorkout(selectedRoutine.id, user.id, {
          exerciseId: exercise.id,
          weekNumber: currentWeek,
          weight: weight ?? undefined,
          repsDone: reps?.toString(),
          setsData: updatedSets,
        });
        await refreshLogs(routines);
      } finally {
        setSavingLog(null);
      }
    },
    [user, selectedRoutine, logs, currentWeek, routines, refreshLogs],
  );

  const handleRemoveLog = useCallback(
    async (exerciseId: string) => {
      if (!user || !selectedRoutine) return;
      await routinesService.unlogWorkout(
        selectedRoutine.id,
        user.id,
        exerciseId,
        currentWeek,
      );
      await refreshLogs(routines);
    },
    [user, selectedRoutine, currentWeek, routines, refreshLogs],
  );

  const handleActivateRoutine = useCallback(
    async (routineId: string) => {
      try {
        await routinesService.activate(routineId);
        if (user) {
          const res = await routinesService.getByClient(user.id);
          const data = res.data ?? [];
          setRoutines(data);
          setSelectedRoutine(data.find((r) => r.id === routineId) ?? null);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al activar la rutina");
      }
    },
    [user],
  );

  // Métricas limpias de Avance (Hoy, Esta Semana, Este Mes) y El Porqué del Ciclo
  const trainingSummary = useMemo(() => {
    const heroPact = user?.anamnesisData?.heroPact;
    const strengthGoal = heroPact?.objectives?.strength;
    const masteryGoal = heroPact?.objectives?.bodyMastery;

    const todayIso = new Date().toISOString().slice(0, 10);
    let setsToday = 0;
    let setsThisWeek = 0;
    let totalSetsMonth = 0;
    let totalVolumeKgMonth = 0;

    logs.forEach((log) => {
      const dateStr = (log.completedAt || log.createdAt || "").slice(0, 10);
      const completedSets =
        log.setsData?.filter((s) => s.completed || s.weight || s.reps) ?? [];
      const count = completedSets.length || 1;

      if (dateStr === todayIso) {
        setsToday += count;
      }
      if (log.weekNumber === currentWeek) {
        setsThisWeek += count;
      }
      totalSetsMonth += count;
      completedSets.forEach((s) => {
        if (s.weight && s.reps) {
          totalVolumeKgMonth += Number(s.weight) * Number(s.reps);
        }
      });
    });

    // Total de series programadas en la semana de la rutina activa
    const plannedSetsWeek = selectedRoutine
      ? selectedRoutine.days
          .filter((d) => !d.isRestDay)
          .reduce(
            (acc, d) =>
              acc + d.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0),
            0,
          )
      : 0;

    const weekPct =
      plannedSetsWeek > 0
        ? Math.min(100, Math.round((setsThisWeek / plannedSetsWeek) * 100))
        : 0;

    const displayVolume =
      weightUnit === "lbs"
        ? Math.round(totalVolumeKgMonth * 2.20462)
        : Math.round(totalVolumeKgMonth);

    return {
      strengthTitle: strengthGoal?.exerciseName || "Fuerza Máxima",
      strengthTarget: strengthGoal?.targetWeight
        ? `${strengthGoal.targetWeight} ${strengthGoal.unit || weightUnit}`
        : "",
      masteryTitle: masteryGoal?.skillName || "Dominio Corporal",
      setsToday,
      setsThisWeek,
      plannedSetsWeek,
      weekPct,
      totalSetsMonth,
      displayVolume,
    };
  }, [user, logs, currentWeek, selectedRoutine, weightUnit]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (view === "session" && sessionDay && selectedRoutine) {
    return (
      <GuidedSessionView
        routine={selectedRoutine}
        day={sessionDay}
        weekNumber={currentWeek}
        logs={logs}
        isSaving={savingLog !== null}
        userWeightKg={user?.weight ?? 70}
        onBack={() => setView("list")}
        onSaveSet={handleSaveSet}
      />
    );
  }

  if (view === "evolution" && user) {
    return (
      <div className="space-y-4">
        <EvolutionLayersView
          user={user}
          routine={selectedRoutine}
          workoutLogs={logs}
          weightUnit={weightUnit}
          onClose={() => setView("list")}
        />
      </div>
    );
  }

  return (
    <>
      <Header
        title={onBack ? "Rutina" : "Mi Rutina"}
        subtitle="Cada sesión tiene un propósito conectado a tus metas de 4 meses"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="md" onClick={onBack}>
                ← Volver
              </Button>
            )}
            <button
              type="button"
              onClick={() => setView("evolution")}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/40 hover:to-amber-600/40 border border-red-500/40 text-amber-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Mi Progreso</span>
            </button>
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    weightUnit === u
                      ? "bg-red-600 text-white shadow"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* RESUMEN DE AVANCE (DIARIO • SEMANAL • MENSUAL) Y EL PORQUÉ DEL CICLO */}
      <div className="mb-5 rounded-3xl bg-gradient-to-br from-[#141720] via-[#0e1017] to-[#1a0b0e] border border-white/10 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
              💡 ¿Por qué entrenas este ciclo?
            </span>
            <p className="text-xs sm:text-sm text-neutral-200 mt-0.5 leading-relaxed">
              Esta rutina está diseñada para llevarte a{" "}
              <strong className="text-amber-300">
                {trainingSummary.strengthTitle}{" "}
                {trainingSummary.strengthTarget
                  ? `(${trainingSummary.strengthTarget})`
                  : ""}
              </strong>{" "}
              y lograr{" "}
              <strong className="text-sky-300">
                {trainingSummary.masteryTitle}
              </strong>
              .
            </p>
          </div>
        </div>

        {/* 3 Tarjetas de Avance: Hoy | Semana | Acumulado del Mes */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-400">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Hoy</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {trainingSummary.setsToday}{" "}
              <span className="text-xs font-normal text-neutral-400">
                series
              </span>
            </p>
            <span className="text-[10px] text-neutral-400 block">
              Completadas hoy
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Semana {currentWeek}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {trainingSummary.weekPct}%
            </p>
            <span className="text-[10px] text-neutral-400 block">
              {trainingSummary.setsThisWeek}/{trainingSummary.plannedSetsWeek || "—"}{" "}
              series hechas
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-sky-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Este Mes</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {trainingSummary.totalSetsMonth}{" "}
              <span className="text-xs font-normal text-neutral-400">
                series
              </span>
            </p>
            <span className="text-[10px] text-neutral-400 block truncate">
              {trainingSummary.displayVolume.toLocaleString("es")} {weightUnit}{" "}
              movidos
            </span>
          </div>
        </div>
      </div>
      <RoutineListView
        routines={routines}
        selectedRoutine={selectedRoutine}
        logs={logs}
        logsLoading={logsLoading}
        currentWeek={currentWeek}
        savingLog={savingLog}
        userId={user?.id ?? ""}
        weightUnit={weightUnit}
        onSelectRoutine={setSelectedRoutine}
        onActivateRoutine={handleActivateRoutine}
        onStartSession={(day) => {
          setSessionDay(day);
          setView("session");
        }}
        onWeekChange={setCurrentWeek}
        onSaveLog={handleSaveSet}
        onRemoveLog={handleRemoveLog}
      />
    </>
  );
}
