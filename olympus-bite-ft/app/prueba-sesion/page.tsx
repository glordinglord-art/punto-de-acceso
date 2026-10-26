"use client";

/* ─────────────────────────────────────────────────────────────
   PAGINA TEMPORAL DE PRUEBA — NO COMMITEAR, NO DESPLEGAR
   Reproduce el escenario que reporto el compa, sin backend:
     - Ejercicio #1: COMPLETO (antes esto bloqueaba la edicion)
     - Ejercicio #2: con la serie 2 SALTADA (1 y 3 registradas)
     - Ejercicio #3: sin tocar
   ───────────────────────────────────────────────────────────── */

import { useState } from "react";
import { GuidedSessionView } from "@/features/routines/components/GuidedSessionView";
import type {
  Exercise,
  Routine,
  RoutineDay,
  SetLogData,
  WorkoutLog,
} from "@/features/routines/types/routines.types";

const mkExercise = (
  id: string,
  name: string,
  muscleGroup: string,
  sets: number,
  targetWeight: number | null,
): Exercise => ({
  id,
  name,
  muscleGroup,
  sets,
  reps: "8-10",
  restSeconds: 45,
  observations: "[Diseñado por Equipo Vital Fit]",
  order: 1,
  targetWeight,
  intensity: "medium",
});

const day: RoutineDay = {
  id: "d1",
  dayNumber: 1,
  focusArea: "Espalda, hombros y brazos",
  isRestDay: false,
  restDayNote: null,
  exercises: [
    mkExercise("e1", "Jalón al pecho", "back", 3, 40),
    mkExercise("e2", "Remo en polea baja", "back", 3, null),
    mkExercise("e3", "Press militar", "shoulders", 3, 20),
  ],
};

const routine: Routine = {
  id: "r1",
  name: "Rutina de prueba",
  description: "",
  trainerId: "t1",
  clientId: "c1",
  weekCount: 4,
  isActive: true,
  days: [day],
  createdAt: new Date().toISOString(),
};

const mkLog = (exerciseId: string, setsData: SetLogData[]): WorkoutLog => ({
  id: `log-${exerciseId}`,
  exerciseId,
  userId: "c1",
  weekNumber: 1,
  weight: null,
  repsDone: null,
  observations: null,
  setsData,
  duration: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
});

const ESTADO_INICIAL: WorkoutLog[] = [
  mkLog("e1", [
    { set: 1, weight: 40, reps: 10, rest: null, completed: true },
    { set: 2, weight: 42.5, reps: 9, rest: null, completed: true },
    { set: 3, weight: 45, reps: 8, rest: null, completed: true },
  ]),
  mkLog("e2", [
    { set: 1, weight: 0, reps: 10, rest: null, completed: true },
    { set: 3, weight: 0, reps: 8, rest: null, completed: true },
  ]),
];

export default function PruebaSesionPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>(ESTADO_INICIAL);

  const handleSaveSet = async (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => {
    // Simula el guardado real: reemplaza esa serie y deja el resto intacto
    setLogs((prev) => {
      const existing = prev.find((l) => l.exerciseId === exercise.id);
      const prevSets = existing?.setsData ?? [];
      const updated = [
        ...prevSets.filter((s) => s.set !== setNumber),
        { set: setNumber, weight, reps, rest: null, completed: true },
      ].sort((a, b) => a.set - b.set);

      if (!existing) return [...prev, mkLog(exercise.id, updated)];
      return prev.map((l) =>
        l.exerciseId === exercise.id ? { ...l, setsData: updated } : l,
      );
    });
  };

  return (
    <GuidedSessionView
      routine={routine}
      day={day}
      weekNumber={1}
      logs={logs}
      isSaving={false}
      userWeightKg={70}
      onBack={() => setLogs(ESTADO_INICIAL)}
      onSaveSet={handleSaveSet}
    />
  );
}
