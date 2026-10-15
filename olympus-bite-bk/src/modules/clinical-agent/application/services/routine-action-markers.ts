/**
 * Bloques de accion que el Director Clinico incrusta en sus respuestas.
 *
 *   [ACCION_RUTINA: {...}]    propuesta pendiente de aprobar por el coach
 *   [ACCION_APLICADA: {...}]  ya aplicada (se reescribe al aplicarla, para que
 *                             al recargar el chat no se pueda aplicar dos veces)
 *   [ACCION_INVALIDA: {...}]  no supero la validacion contra la base de datos
 *
 * PROPUESTA_RUTINA y COMANDO_RUTINA son formatos antiguos que se siguen leyendo.
 * El indice de un bloque es su posicion entre todos los bloques del mensaje.
 */

export const PENDING_MARKER = 'ACCION_RUTINA';
export const APPLIED_MARKER = 'ACCION_APLICADA';
export const INVALID_MARKER = 'ACCION_INVALIDA';

const ALL_MARKERS = [
  PENDING_MARKER,
  APPLIED_MARKER,
  INVALID_MARKER,
  'PROPUESTA_RUTINA',
  'COMANDO_RUTINA',
];

export type ActionBlockStatus = 'pending' | 'applied' | 'invalid';

export interface ActionBlock {
  index: number;
  marker: string;
  status: ActionBlockStatus;
  /** Posicion del '[' que abre el bloque. */
  start: number;
  /** Posicion siguiente al ']' que cierra el bloque. */
  end: number;
  data: Record<string, unknown> | null;
  parseError?: string;
}

const MARKER_REGEX = new RegExp(`\\[(${ALL_MARKERS.join('|')}):`, 'g');

/** Devuelve el indice del '}' que cierra el objeto que empieza en `from`. */
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

function statusOf(marker: string): ActionBlockStatus {
  if (marker === APPLIED_MARKER) return 'applied';
  if (marker === INVALID_MARKER) return 'invalid';
  return 'pending';
}

export function extractActionBlocks(content: string): ActionBlock[] {
  const blocks: ActionBlock[] = [];
  MARKER_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKER_REGEX.exec(content)) !== null) {
    const marker = match[1];
    const start = match.index;
    const jsonStart = content.indexOf('{', start + match[0].length);
    const block: ActionBlock = {
      index: blocks.length,
      marker,
      status: statusOf(marker),
      start,
      end: content.length,
      data: null,
    };

    const jsonEnd = jsonStart === -1 ? -1 : findJsonEnd(content, jsonStart);
    if (jsonEnd === -1) {
      block.parseError =
        'El bloque de accion quedo incompleto (JSON sin cerrar).';
      blocks.push(block);
      break;
    }

    const closing = content.indexOf(']', jsonEnd);
    block.end = closing === -1 ? jsonEnd + 1 : closing + 1;

    try {
      const parsed: unknown = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        block.data = parsed as Record<string, unknown>;
        if (marker === 'PROPUESTA_RUTINA' && !block.data.action) {
          block.data.action = 'sustituir_ejercicio';
        }
      } else {
        block.parseError = 'El bloque de accion no contiene un objeto JSON.';
      }
    } catch (err) {
      block.parseError = `JSON invalido en el bloque de accion: ${
        err instanceof Error ? err.message : String(err)
      }`;
    }

    blocks.push(block);
    MARKER_REGEX.lastIndex = block.end;
  }

  return blocks;
}

/** Cambia el marcador del bloque `index` (p. ej. a ACCION_APLICADA). */
export function setBlockMarker(
  content: string,
  index: number,
  marker: string,
): string {
  const block = extractActionBlocks(content).find((b) => b.index === index);
  if (!block) return content;
  const openLen = `[${block.marker}:`.length;
  return `${content.slice(0, block.start)}[${marker}:${content.slice(
    block.start + openLen,
  )}`;
}

/**
 * Los modelos a veces ignoran la instruccion y devuelven la accion dentro de
 * un bloque ```json```. Se convierte al formato con marcador antes de guardar
 * para que el chat, la validacion y el marcado de "aplicada" funcionen igual.
 */
export function normalizeActionFormat(content: string): string {
  let text = content
    .replace(/\[COMANDO_RUTINA:\s*/gi, `[${PENDING_MARKER}: `)
    .replace(
      /\[PROPUESTA_RUTINA:\s*\{/gi,
      `[${PENDING_MARKER}: {"action": "sustituir_ejercicio", `,
    );

  if (!text.includes(`[${PENDING_MARKER}:`)) {
    text = text.replace(
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g,
      (whole, json: string) => {
        try {
          const parsed = JSON.parse(json) as Record<string, unknown>;
          if (parsed && parsed.action && parsed.clientName) {
            return `[${PENDING_MARKER}: ${JSON.stringify(parsed)}]`;
          }
        } catch {
          // No es una accion: se deja el bloque tal cual
        }
        return whole;
      },
    );
  }

  return text.trim();
}

// ─── Normalizacion de texto y valores numericos ───────────────────────────

/** Minusculas, sin tildes ni signos, espacios colapsados. */
export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'de',
  'del',
  'la',
  'el',
  'las',
  'los',
  'en',
  'con',
  'al',
  'a',
  'y',
  'o',
  'por',
  'para',
  'un',
  'una',
]);

/** Palabras significativas de un nombre (sin tildes ni articulos). */
export function tokens(value: unknown): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/** Reps como texto: 12 -> "12", " 8-10 " -> "8-10". */
export function toReps(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
}

/** Primer entero que aparezca: 4, "4", "3-4", "4 series" -> 4. */
export function toInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const m = value.match(/\d+/);
    if (m) return parseInt(m[0], 10);
  }
  return undefined;
}

export function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const m = value.replace(',', '.').match(/\d+(\.\d+)?/);
    if (m) return parseFloat(m[0]);
  }
  return undefined;
}

/** 90, "90", "90s", "90 seg", "2 min", "1.5 min", "2'" -> segundos. */
export function toRestSeconds(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value !== 'string') return undefined;
  const n = toNumber(value);
  if (n === undefined) return undefined;
  const isMinutes = /min|'(?!')/i.test(value) && !/seg|sec|s\b|''/i.test(value);
  return Math.round(isMinutes ? n * 60 : n);
}

/** "4 x 10-12", "4x10", "3 series de 12" -> { sets, reps }. */
export function parseSetsReps(value: unknown): {
  sets?: number;
  reps?: string;
} {
  if (typeof value !== 'string') return {};
  const m = value.match(/(\d+)\s*(?:x|×|series?\s*(?:de|x)?)\s*(.+)/i);
  if (!m) return {};
  const reps = m[2].replace(/\s*(reps?|repeticiones)\s*$/i, '').trim();
  return { sets: parseInt(m[1], 10), reps: reps || undefined };
}
