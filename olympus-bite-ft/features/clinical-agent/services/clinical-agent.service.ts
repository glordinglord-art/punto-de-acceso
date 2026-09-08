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
  previousRoutineName?: string;
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
        previousRoutineName?: string;
        followUpMessage?: string;
        [key: string]: unknown;
      }>
    >(`/clinical-agent/execute-action/${trainerId}`, action),
};

/**
 * Robust balanced-bracket parser for clinical routine actions.
 * Safely handles nested arrays and objects within JSON (e.g. days, exercises).
 */
export function parseRoutineAction(content: string): {
  actionData: RoutineAction | null;
  cleanText: string;
} {
  const markers = ['[ACCION_RUTINA:', '[PROPUESTA_RUTINA:'];
  let markerFound = '';
  let markerIdx = -1;

  for (const m of markers) {
    const idx = content.indexOf(m);
    if (idx !== -1 && (markerIdx === -1 || idx < markerIdx)) {
      markerIdx = idx;
      markerFound = m;
    }
  }

  // 1. Tag-based parsing with bracket/brace depth balancing
  if (markerIdx !== -1) {
    const jsonStart = content.indexOf('{', markerIdx + markerFound.length);
    if (jsonStart !== -1) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let jsonEnd = -1;

      for (let i = jsonStart; i < content.length; i++) {
        const char = content[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') {
            depth--;
            if (depth === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
      }

      if (jsonEnd !== -1) {
        const jsonStr = content.slice(jsonStart, jsonEnd + 1);
        let actionData: RoutineAction | null = null;
        try {
          const parsed = JSON.parse(jsonStr);
          if (markerFound === '[PROPUESTA_RUTINA:' && !parsed.action) {
            parsed.action = 'sustituir_ejercicio';
          }
          actionData = parsed as RoutineAction;
        } catch (err) {
          console.error('Error al parsear JSON de acción de rutina:', err);
        }

        let tagEnd = content.indexOf(']', jsonEnd);
        if (tagEnd === -1) tagEnd = jsonEnd;

        const beforeTag = content.slice(0, markerIdx);
        const afterTag = content.slice(tagEnd + 1);
        const cleanText = (beforeTag + afterTag)
          .replace(/\[COMANDO_RUTINA:[^\]]*\]/g, '')
          .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
          .trim();

        return { actionData, cleanText };
      }
    }
  }

  // 2. Fallback: markdown code blocks ```json { ... } ```
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      if (parsed.action && parsed.clientName) {
        return {
          actionData: parsed as RoutineAction,
          cleanText: content.replace(codeBlockMatch[0], '').trim(),
        };
      }
      if (parsed.clientName && parsed.currentExercise && parsed.proposedExercise) {
        return {
          actionData: { ...parsed, action: 'sustituir_ejercicio' } as RoutineAction,
          cleanText: content.replace(codeBlockMatch[0], '').trim(),
        };
      }
    } catch {}
  }

  const cleanText = content
    .replace(/\[COMANDO_RUTINA:[^\]]*\]/g, '')
    .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
    .trim();

  return { actionData: null, cleanText };
}

