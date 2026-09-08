import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types/common.types";

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// ROUTINE ACTION TYPES — 6 Actions for Full Control
// ═══════════════════════════════════════════════════════════

export interface ExerciseSpec {
  name: string;
  sets?: number;
  reps?: string;
  muscleGroup?: string;
  restSeconds?: number;
}

export interface RoutineActionBase {
  action: string;
  clientName: string;
  routineName?: string;
  rationale?: string;
}

export interface SustituirEjercicioAction extends RoutineActionBase {
  action: 'sustituir_ejercicio';
  dayFocus?: string;
  currentExercise: { name: string; setsReps?: string };
  proposedExercise: { name: string; setsReps?: string };
}

export interface ReemplazarDiaAction extends RoutineActionBase {
  action: 'reemplazar_dia';
  dayNumber?: number;
  dayFocus?: string;
  currentExercises?: string[];
  newExercises: ExerciseSpec[];
}

export interface AgregarEjercicioAction extends RoutineActionBase {
  action: 'agregar_ejercicio';
  dayNumber?: number;
  dayFocus?: string;
  exercises: ExerciseSpec[];
}

export interface EliminarEjercicioAction extends RoutineActionBase {
  action: 'eliminar_ejercicio';
  dayFocus?: string;
  exercisesToRemove: string[];
}

export interface CrearRutinaAction extends RoutineActionBase {
  action: 'crear_rutina';
  description?: string;
  weekCount?: number;
  days: Array<{
    dayNumber: number;
    focusArea: string;
    isRestDay?: boolean;
    restDayNote?: string;
    exercises?: ExerciseSpec[];
  }>;
}

export interface EliminarRutinaAction extends RoutineActionBase {
  action: 'eliminar_rutina';
}

export type RoutineAction =
  | SustituirEjercicioAction
  | ReemplazarDiaAction
  | AgregarEjercicioAction
  | EliminarEjercicioAction
  | CrearRutinaAction
  | EliminarRutinaAction;

// Legacy type kept for backward compat
export interface RoutineProposal {
  clientName: string;
  routineName?: string;
  dayFocus?: string;
  currentExercise: {
    name: string;
    setsReps?: string;
  };
  proposedExercise: {
    name: string;
    setsReps?: string;
  };
  rationale?: string;
}

export const clinicalAgentService = {
  sendMessage: (trainerId: string, message: string) =>
    api.post<ApiResponse<{ reply: string }>>(`/clinical-agent/chat/${trainerId}`, {
      message,
    }),

  getHistory: (trainerId: string) =>
    api.get<ApiResponse<ChatMessage[]>>(`/clinical-agent/history/${trainerId}`),

  clearHistory: (trainerId: string) =>
    api.delete<ApiResponse<null>>(`/clinical-agent/history/${trainerId}`),

  // Legacy: single exercise swap
  applyAdjustment: (
    trainerId: string,
    payload: {
      clientName: string;
      oldExercise: string;
      newExercise: string;
      rationale?: string;
      routineName?: string;
    },
  ) =>
    api.post<
      ApiResponse<{
        success: boolean;
        message: string;
        clientName: string;
        oldExercise: string;
        newExercise: string;
        dayFocus: string;
      }>
    >(`/clinical-agent/apply-adjustment/${trainerId}`, payload),

  // NEW: Full 6-action routine control
  executeAction: (trainerId: string, action: RoutineAction) =>
    api.post<
      ApiResponse<{
        success: boolean;
        action: string;
        message: string;
        clientName: string;
        routineName?: string;
        [key: string]: unknown;
      }>
    >(`/clinical-agent/execute-action/${trainerId}`, action),
};
