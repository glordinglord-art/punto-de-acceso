"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { routinesService } from "@/features/routines/services/routines.service";
import { GuidedSessionView } from "./GuidedSessionView";
import { RoutineListView } from "./RoutineListView";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

export function ClientRoutinesView() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "session">("list");
  const [sessionDay, setSessionDay] = useState<RoutineDay | null>(null);

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
      const active = data.find((r) => r.isActive) ?? data[0];
      if (active) {
        setSelectedRoutine(active);
        await refreshLogs(data);
      }
    } finally {
      setLoading(false);
    }
  }, [user, refreshLogs]);

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

  return (
    <>
      <Header title="Rutinas" />
      <RoutineListView
        routines={routines}
        selectedRoutine={selectedRoutine}
        logs={logs}
        logsLoading={logsLoading}
        currentWeek={currentWeek}
        savingLog={savingLog}
        userId={user?.id ?? ""}
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
