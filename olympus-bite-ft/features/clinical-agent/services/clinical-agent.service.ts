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
  routineId?: string;
  routineName?: string;
  previousRoutineName?: string;
  rationale?: string;
  purgeAllInactive?: boolean;
}

export interface SustituirEjercicioAction extends RoutineActionBase {
  action: 'sustituir_ejercicio';
  dayNumber?: number;
  dayFocus?: string;
  currentExercise: { name: string; setsReps?: string };
  proposedExercise: { name: string; setsReps?: string } & Partial<ExerciseSpec>;
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
  action: 'eliminar_rutina' | 'delete_routine';
  purgeAllInactive?: boolean;
}

export interface ModificarRutinaAction extends RoutineActionBase {
  action: 'modificar_rutina' | 'update_routine';
  changes?: {
    name?: string;
    description?: string;
    weekCount?: number;
    days?: CrearRutinaAction['days'];
    [key: string]: unknown;
  };
}

export interface ActualizarMetasAction extends RoutineActionBase {
  action: 'actualizar_metas_nutricionales';
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  dietaryGoal?: string;
}

export type RoutineAction =
  | SustituirEjercicioAction
  | ReemplazarDiaAction
  | AgregarEjercicioAction
  | EliminarEjercicioAction
  | CrearRutinaAction
  | EliminarRutinaAction
  | ModificarRutinaAction
  | ActualizarMetasAction;

/** Estado de un bloque de accion dentro de un mensaje del Director Clinico. */
export type ActionStatus = 'pending' | 'applied' | 'invalid';

export interface ParsedAction {
  /** Posicion del bloque en el mensaje; el backend la usa para marcarlo como aplicado. */
  index: number;
  status: ActionStatus;
  data: RoutineAction;
}

export const clinicalAgentService = {
  sendMessage: (trainerId: string, message: string) =>
    api.post<ApiResponse<{ reply: string; messageId: string | null }>>(
      `/clinical-agent/chat/${trainerId}`,
      { message },
    ),

  getHistory: (trainerId: string) =>
    api.get<ApiResponse<ChatMessage[]>>(`/clinical-agent/history/${trainerId}`),

  clearHistory: (trainerId: string) =>
    api.delete<ApiResponse<null>>(`/clinical-agent/history/${trainerId}`),

  /**
   * Aplica una accion. Con messageId/actionIndex el backend marca el bloque como
   * aplicado en el historial, asi al recargar no se puede aplicar dos veces.
   */
  executeAction: (
    trainerId: string,
    action: RoutineAction,
    source?: { messageId?: string; actionIndex?: number },
  ) =>
    api.post<
      ApiResponse<{
        success: boolean;
        action: string;
        message: string;
        clientName: string;
        routineName?: string;
        followUpMessage?: string;
        [key: string]: unknown;
      }>
    >(`/clinical-agent/execute-action/${trainerId}`, { ...action, ...source }),
};

// ─── Parser de bloques de accion ──────────────────────────────────────────
// Mismo formato que routine-action-markers.ts en el backend.

const MARKERS: Record<string, ActionStatus> = {
  ACCION_RUTINA: 'pending',
  ACCION_APLICADA: 'applied',
  ACCION_INVALIDA: 'invalid',
  PROPUESTA_RUTINA: 'pending',
  COMANDO_RUTINA: 'pending',
};

const ACTION_ALIASES: Record<string, RoutineAction['action']> = {
  delete_routine: 'eliminar_rutina',
  update_routine: 'modificar_rutina',
};

function findJsonEnd(content: string, from: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = from; i < content.length; i++) {
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
    if (inString) continue;
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Separa el texto para el coach de los bloques [ACCION_*: {...}]. Un mensaje
 * puede traer varias acciones (por ejemplo, una rutina por atleta).
 */
export function parseRoutineActions(content: string): {
  actions: ParsedAction[];
  cleanText: string;
} {
  const actions: ParsedAction[] = [];
  const regex = new RegExp(`\\[(${Object.keys(MARKERS).join('|')}):`, 'g');
  let text = '';
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const marker = match[1];
    const jsonStart = content.indexOf('{', match.index + match[0].length);
    const jsonEnd = jsonStart === -1 ? -1 : findJsonEnd(content, jsonStart);
    text += content.slice(cursor, match.index);

    if (jsonEnd === -1) {
      // Bloque cortado: se oculta el resto para no ensenar JSON al coach
      cursor = content.length;
      break;
    }
    const closing = content.indexOf(']', jsonEnd);
    cursor = closing === -1 ? jsonEnd + 1 : closing + 1;
    regex.lastIndex = cursor;

    try {
      const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
      if (marker === 'PROPUESTA_RUTINA' && !parsed.action) {
        parsed.action = 'sustituir_ejercicio';
      }
      parsed.action = ACTION_ALIASES[parsed.action] ?? parsed.action;
      actions.push({ index, status: MARKERS[marker], data: parsed });
    } catch (err) {
      console.error('Bloque de accion con JSON invalido:', err);
    }
    index++;
  }
  text += content.slice(cursor);

  // Mensajes antiguos con la accion en un bloque ```json```
  if (actions.length === 0) {
    const codeBlock = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlock) {
      try {
        const parsed = JSON.parse(codeBlock[1]);
        if (parsed.clientName && (parsed.action || parsed.currentExercise)) {
          parsed.action ??= 'sustituir_ejercicio';
          actions.push({ index: -1, status: 'pending', data: parsed });
          text = text.replace(codeBlock[0], '');
        }
      } catch {
        // no era una accion
      }
    }
  }

  const cleanText = text
    .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { actions, cleanText };
}
