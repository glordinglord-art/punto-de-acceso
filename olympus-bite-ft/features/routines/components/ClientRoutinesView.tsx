"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routinesService } from "@/features/routines/services/routines.service";
import { GuidedSessionView } from "./GuidedSessionView";
import { RoutineListView } from "./RoutineListView";
import { EvolutionLayersView } from "./EvolutionLayersView";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

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
      // Auto-cálculo de la semana activa según el pacto de 120 días
      const heroPact = user?.anamnesisData?.heroPact;
      const startStr =
        heroPact?.startDate ||
        user?.anamnesisData?.discoveryCompletedAt?.slice(0, 10) ||
        (user as unknown as { createdAt?: string })?.createdAt?.slice(0, 10);
      let calculatedWeek = 1;
      if (startStr) {
        const diffDays = Math.max(
          1,
          Math.floor((Date.now() - new Date(startStr).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        );
        calculatedWeek = Math.max(1, Math.ceil(diffDays / 7));
      }
      const active =
        data.find((r) => r.id === initialRoutineId) ??
        data.find((r) => r.isActive) ??
        data[0];
      if (active) {
        setSelectedRoutine(active);
        const boundedWeek = Math.min(active.weekCount || 4, calculatedWeek);
        setCurrentWeek(boundedWeek);
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

  const autoCurrentWeek = useMemo(() => {
    const heroPact = user?.anamnesisData?.heroPact;
    const startStr =
      heroPact?.startDate ||
      user?.anamnesisData?.discoveryCompletedAt?.slice(0, 10) ||
      (user as unknown as { createdAt?: string })?.createdAt?.slice(0, 10);
    if (!startStr) return 1;
    const diffDays = Math.max(
      1,
      Math.floor((Date.now() - new Date(startStr).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    return Math.min(selectedRoutine?.weekCount || 4, Math.max(1, Math.ceil(diffDays / 7)));
  }, [user, selectedRoutine]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080b]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
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
      <div className="min-h-screen bg-[#07080b] text-white pb-28 pt-3 px-4 max-w-3xl mx-auto">
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
    <RoutineListView
      routines={routines}
      selectedRoutine={selectedRoutine}
      logs={logs}
      logsLoading={logsLoading}
      currentWeek={currentWeek}
      autoCurrentWeek={autoCurrentWeek}
      savingLog={savingLog}
      userId={user?.id ?? ""}
      weightUnit={weightUnit}
      onWeightUnitChange={setWeightUnit}
      onOpenEvolution={() => setView("evolution")}
      onBack={onBack}
      trainingSummary={trainingSummary}
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
  );
}
