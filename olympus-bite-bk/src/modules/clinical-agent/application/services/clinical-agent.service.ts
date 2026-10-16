import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  FinishReason,
  GoogleGenerativeAI,
  type Content,
} from '@google/generative-ai';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TrainerScopeService } from '../../../../shared/application/trainer-scope/trainer-scope.service';
import { ClinicalActionService } from './clinical-action.service';
import {
  INVALID_MARKER,
  extractActionBlocks,
  normalizeActionFormat,
  setBlockMarker,
} from './routine-action-markers';

export interface SendClinicalAgentMessageDto {
  message: string;
}

interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

interface ModelReply {
  text: string;
  provider: string;
  /** Proveedor que respondio, para pedirle a el mismo la correccion. */
  attempt: Attempt;
}

interface Attempt {
  kind: 'gemini' | 'mimo';
  key?: string;
  label: string;
  model: string;
}

export interface GeneratedReply {
  reply: string;
  provider: string | null;
  /** Acciones que no superaron la validacion contra la base de datos. */
  invalidActions: string[];
  repaired: boolean;
}

/**
 * Modelos por orden de preferencia. Primero los "flash" estables: el coach
 * pide rutinas completas y ajustes finos, y los "lite" eran los que mas
 * errores de formato y de criterio cometian. 3.7 y 3.8 van detras porque en
 * horas pico Google los satura (503) y llegaron a tardar 35-70 s en fallar,
 * dejando al coach sin respuesta. Los lite quedan de ultimo respaldo.
 */
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];

const MIMO_MODELS = ['mimo-v2.5-pro', 'mimo-v2.5'];

/**
 * Tiempo total para responder. Antes cada intento tenia 6 s: una rutina
 * completa tarda bastante mas en generarse, asi que se cortaba, se pasaba al
 * siguiente modelo (que tambien se cortaba) y el coach veia "sobrecarga" o
 * nada, y tenia que escribir "hola, vuelve".
 */
const TOTAL_BUDGET_MS = 90_000;
/** Una rutina completa tarda 20-30 s; un intento colgado no puede comerse todo. */
const MAX_ATTEMPT_MS = 45_000;
/** Si un intento falla rapido (cuota, modelo no disponible) se prueba el siguiente. */
const MIN_ATTEMPT_MS = 8_000;
const HISTORY_MESSAGES = 14;
const HISTORY_MESSAGE_MAX_CHARS = 8_000;

@Injectable()
export class ClinicalAgentService implements OnModuleInit {
  private readonly logger = new Logger(ClinicalAgentService.name);
  private geminiKeys: string[] = [];
  private mimoApiKey: string | null = null;
  private mimoBaseUrl = 'https://api.xiaomimimo.com/v1';
  /** Modelo o modelo+clave -> instante hasta el que no se reintenta. */
  private readonly cooldowns = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly trainerScope: TrainerScopeService,
    private readonly actions: ClinicalActionService,
  ) {}

  onModuleInit() {
    const clean = (v?: string) => (v ?? '').trim().replace(/^["']|["']$/g, '');
    // Primero la clave con mas cuota diaria
    this.geminiKeys = [
      clean(process.env.GEMINI_BACKUP_API_KEY),
      clean(process.env.GEMINI_API_KEY),
    ].filter(Boolean);
    this.mimoApiKey = clean(process.env.MIMO_API_KEY) || null;
    if (process.env.MIMO_BASE_URL) {
      this.mimoBaseUrl = clean(process.env.MIMO_BASE_URL);
    }
    this.logger.log(
      `🚀 Director Clínico: ${this.geminiKeys.length} clave(s) Gemini${this.mimoApiKey ? ' + MiMo de respaldo' : ''}`,
    );
  }

  // ─── Chat ───────────────────────────────────────────────────────────────

  async processTrainerMessage(
    trainerId: string,
    userMessage: string,
  ): Promise<{ reply: string; messageId: string | null }> {
    const generated = await this.generateReply(trainerId, userMessage);

    // Timestamps explicitos: con el default de la BD pregunta y respuesta
    // salian identicas y el orden al recargar era aleatorio.
    const askedAt = new Date();
    await this.prisma.dietChatMessage.create({
      data: {
        userId: trainerId,
        role: 'clinical_user',
        content: userMessage,
        createdAt: askedAt,
      },
    });

    if (!generated.provider) {
      // No se guarda la respuesta de error: ensuciaria el contexto de la IA
      return { reply: generated.reply, messageId: null };
    }

    const saved = await this.prisma.dietChatMessage.create({
      data: {
        userId: trainerId,
        role: 'clinical_ai',
        content: generated.reply,
        createdAt: new Date(askedAt.getTime() + 1),
      },
    });
    return { reply: generated.reply, messageId: saved.id };
  }

  /**
   * Genera la respuesta sin guardar nada: arma el contexto, consulta al modelo
   * y valida cada accion propuesta contra la base de datos. Si alguna no es
   * aplicable, le devuelve los errores al mismo modelo una vez para que la
   * corrija; las que sigan mal se marcan como invalidas para que el chat no
   * ofrezca un boton de "Aplicar" que va a fallar.
   */
  async generateReply(
    trainerId: string,
    userMessage: string,
  ): Promise<GeneratedReply> {
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });
    if (!trainer) throw new NotFoundException('Entrenador no encontrado');

    if (this.geminiKeys.length === 0 && !this.mimoApiKey) {
      return {
        reply:
          '⚠️ El Director Clínico no tiene configurada ninguna clave de IA (ni Gemini ni MiMo).',
        provider: null,
        invalidActions: [],
        repaired: false,
      };
    }

    const { systemInstruction, athleteCount } = await this.buildContext(
      trainer.id,
      trainer.name.trim(),
    );
    const history = await this.loadHistory(trainerId);
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    const first = await this.callWithFailover(
      systemInstruction,
      [...history, { role: 'user', content: userMessage }],
      deadline,
    );
    if (!first) {
      return {
        reply:
          'Lo siento Coach, los motores de IA no respondieron a tiempo. Tu mensaje quedó guardado: vuelve a enviarlo en unos instantes.',
        provider: null,
        invalidActions: [],
        repaired: false,
      };
    }
    this.logger.log(
      `✅ Director Clínico respondió con [${first.provider}] (${athleteCount} atletas en contexto)`,
    );

    let reply = normalizeActionFormat(first.text);
    let provider = first.provider;
    let problems = await this.validateActions(trainerId, reply);
    let repaired = false;

    if (problems.length > 0 && Date.now() < deadline - MIN_ATTEMPT_MS) {
      this.logger.warn(
        `🔧 Acciones no aplicables, pidiendo corrección: ${problems.map((p) => p.reason).join(' | ')}`,
      );
      const fix = await this.callWithFailover(
        systemInstruction,
        [
          ...history,
          { role: 'user', content: userMessage },
          { role: 'model', content: reply },
          { role: 'user', content: this.repairPrompt(problems) },
        ],
        deadline,
        first.attempt,
      );
      if (fix) {
        const candidate = normalizeActionFormat(fix.text);
        const candidateProblems = await this.validateActions(
          trainerId,
          candidate,
        );
        if (candidateProblems.length < problems.length) {
          reply = candidate;
          problems = candidateProblems;
          provider = `${fix.provider} (corregida)`;
          repaired = true;
        }
      }
    }

    // Lo que siga sin ser aplicable se marca y se explica en el texto
    for (const p of [...problems].sort((a, b) => b.index - a.index)) {
      reply = setBlockMarker(reply, p.index, INVALID_MARKER);
    }
    if (problems.length > 0) {
      reply += `\n\n> ⚠️ No pude preparar ${problems.length === 1 ? 'la acción' : 'estas acciones'} para aplicarlas: ${problems
        .map((p) => p.reason)
        .join(' · ')}. Dime cómo quieres corregirlo y la preparo de nuevo.`;
    }

    return {
      reply,
      provider,
      invalidActions: problems.map((p) => p.reason),
      repaired,
    };
  }

  private async validateActions(trainerId: string, text: string) {
    const problems: Array<{ index: number; reason: string }> = [];
    for (const block of extractActionBlocks(text)) {
      if (block.status !== 'pending') continue;
      const reason =
        block.parseError ??
        (await this.actions.preflight(trainerId, block.data ?? {}));
      if (reason) problems.push({ index: block.index, reason });
    }
    return problems;
  }

  private repairPrompt(problems: Array<{ index: number; reason: string }>) {
    return [
      'VALIDACIÓN AUTOMÁTICA DEL SISTEMA (no es un mensaje del coach):',
      'Las siguientes acciones de tu respuesta anterior NO se pueden aplicar en la base de datos:',
      ...problems.map((p) => `- Acción #${p.index + 1}: ${p.reason}`),
      '',
      'Reescribe tu respuesta COMPLETA corrigiendo esos bloques [ACCION_RUTINA: {...}] con los nombres, IDs y números de día EXACTOS de la telemetría.',
      'Mantén el mismo contenido y criterio para el coach; no menciones esta validación ni pidas disculpas por ella.',
    ].join('\n');
  }

  async executeRoutineAction(
    trainerId: string,
    payload: Record<string, unknown>,
    source?: { messageId?: string; actionIndex?: number },
  ) {
    return this.actions.execute(trainerId, payload, source);
  }

  /** Endpoint antiguo de sustitucion simple; ahora pasa por el mismo motor. */
  async applyRoutineAdjustment(
    trainerId: string,
    payload: {
      clientName: string;
      oldExercise: string;
      newExercise: string;
      rationale?: string;
      routineName?: string;
    },
  ) {
    return this.actions.execute(trainerId, {
      action: 'sustituir_ejercicio',
      clientName: payload.clientName,
      routineName: payload.routineName,
      currentExercise: { name: payload.oldExercise },
      proposedExercise: { name: payload.newExercise },
      rationale: payload.rationale,
    });
  }

  // ─── Contexto ───────────────────────────────────────────────────────────

  private async buildContext(trainerId: string, trainerName: string) {
    // Cartera completa (propios + compartidos por colegas) y el propio coach,
    // para que tambien pueda pedir rutinas para si mismo.
    const scopeWhere = await this.trainerScope.buildVisibleUsersWhere(
      trainerId,
      { includeSelf: true },
    );
    const people = await this.prisma.user.findMany({
      where: scopeWhere,
      orderBy: { name: 'asc' },
    });
    const ids = people.map((p) => p.id);

    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);
    const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);

    const [todayMeals, todayStress, routines, recentLogs, trainers] =
      await Promise.all([
        this.prisma.meal.findMany({
          where: {
            userId: { in: ids },
            date: { gte: startOfToday, lte: endOfToday },
          },
        }),
        this.prisma.dailyStressLog.findMany({
          where: { userId: { in: ids }, date: todayStr },
        }),
        this.prisma.routine.findMany({
          where: { clientId: { in: ids } },
          include: {
            routineDays: {
              orderBy: { dayNumber: 'asc' },
              include: { exercises: { orderBy: { order: 'asc' } } },
            },
          },
          orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.workoutLog.groupBy({
          by: ['userId'],
          where: { userId: { in: ids }, updatedAt: { gte: since } },
          _count: { _all: true },
          _max: { updatedAt: true },
        }),
        this.prisma.user.findMany({
          where: { role: { not: 'client' } },
          select: { id: true, name: true },
        }),
      ]);

    const trainerNameOf = (id: string) =>
      trainers.find((t) => t.id === id)?.name.trim() ?? 'otro coach';

    const summary = people
      .map((c) => {
        const isSelf = c.id === trainerId;
        const meals = todayMeals.filter((m) => m.userId === c.id);
        const stress = todayStress.find((s) => s.userId === c.id);
        const own = routines.filter((r) => r.clientId === c.id);
        const active = own.find((r) => r.isActive);
        const logs = recentLogs.find((l) => l.userId === c.id);
        const kcal = meals.reduce((a, m) => a + (m.calories || 0), 0);
        const prot = meals.reduce((a, m) => a + (m.protein || 0), 0);

        let sleep = 'No registrado';
        if (stress?.notes) {
          try {
            const parsed = JSON.parse(stress.notes) as {
              sleepHours?: number;
              sleepQuality?: string;
            };
            if (parsed.sleepHours) {
              sleep = `${parsed.sleepHours}h (${parsed.sleepQuality || 'Normal'})`;
            }
          } catch {
            // notas en texto libre
          }
        }

        const targets = [
          c.targetCalories ? `${c.targetCalories} kcal` : null,
          c.targetProtein ? `P ${c.targetProtein} g` : null,
          c.targetCarbs ? `C ${c.targetCarbs} g` : null,
          c.targetFats ? `G ${c.targetFats} g` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        const activeBlock = active
          ? [
              `  • Rutina ACTIVA: "${active.name.trim()}" [routineId: ${active.id}] · ${active.weekCount} semanas · creada ${active.createdAt.toISOString().slice(0, 10)} por ${active.trainerId === trainerId ? 'ti' : trainerNameOf(active.trainerId)}`,
              ...active.routineDays.map((d) =>
                d.isRestDay
                  ? `      Día ${d.dayNumber} — ${d.focusArea} (descanso)`
                  : `      Día ${d.dayNumber} — ${d.focusArea}: ${d.exercises
                      .map(
                        (e) =>
                          `${e.name} ${e.sets}x${e.reps} (${e.restSeconds}s${e.targetWeight ? `, ${e.targetWeight} kg` : ''})`,
                      )
                      .join('; ')}`,
              ),
            ].join('\n')
          : '  • Rutina ACTIVA: ninguna';

        const others = own.filter((r) => !r.isActive);
        const othersLine =
          others.length > 0
            ? `  • Otras rutinas (inactivas): ${others
                .map(
                  (r) =>
                    `"${r.name.trim()}" [routineId: ${r.id}] (${r.createdAt.toISOString().slice(0, 10)})`,
                )
                .join(' | ')}`
            : '';

        return [
          `- ATLETA: ${c.name.trim()} [clientId: ${c.id}]${isSelf ? ' ← ES EL PROPIO COACH (tú le hablas a esta persona)' : ''}`,
          `  • Fase / objetivo: ${c.dietaryGoal || 'sin definir'} | Metas nutricionales: ${targets || 'sin definir'}`,
          `  • Biometría: peso ${c.weight ? `${c.weight} kg` : 'no registrado'}, altura ${c.height ? `${c.height} cm` : 'no registrada'}`,
          `  • Lesiones / condiciones: ${c.medicalConditions || 'ninguna reportada'}`,
          `  • Nivel / equipamiento: ${c.experienceLevel || 'no indicado'} / ${c.equipmentAccess || 'no indicado'}`,
          `  • Hoy: ${meals.length > 0 ? `${meals.length} comidas (${kcal} kcal, ${prot} g proteína)` : 'sin comidas registradas'} · estrés ${stress ? `${stress.stressLevel}/10 (${stress.mood || 'normal'})` : 'no registrado'} · sueño ${sleep}`,
          `  • Adherencia 14 días: ${logs ? `${logs._count._all} ejercicios registrados, último ${logs._max.updatedAt?.toISOString().slice(0, 10)}` : 'sin registros de entrenamiento'}`,
          activeBlock,
          othersLine,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');

    return {
      systemInstruction: this.systemPrompt(trainerName, todayStr, summary),
      athleteCount: people.length,
    };
  }

  private systemPrompt(trainerName: string, today: string, summary: string) {
    return `
Eres el DIRECTOR CLÍNICO, METABÓLICO Y BIOMECÁNICO de Vital Fit, la mano derecha del entrenador ${trainerName}. Hoy es ${today}.

1. COMUNICACIÓN
- Español impecable, cálido, profesional y directo. Respuestas claras, sin relleno ni halagos repetidos.
- En el texto para el coach NUNCA muestres IDs, JSON, llaves ni nombres de campos. Los IDs solo van dentro de los bloques de acción.
- Viñetas limpias; no amontones asteriscos.
- Cuando el coach pregunte por banderas rojas usa por atleta: "### 🚨 Nombre", luego Situación, Impacto biológico y Acción recomendada (una línea cada una). Si no las pide, no abras con alertas; menciónalas solo si afectan a lo que pidió.

2. PRECISIÓN (LO MÁS IMPORTANTE)
- Usa SOLO los datos de la TELEMETRÍA de abajo. Si un dato no está, dilo; no lo inventes.
- Cuando el coach hable de "la rutina anterior" o "la actual", léela completa en la telemetría (día por día, series, reps y descansos) y respeta su estructura salvo que el coach pida cambiarla.
- Si el coach pide la rutina completa, entrégala COMPLETA: todos los días, cada ejercicio con series x reps y descanso. Nunca resumas ni dejes días fuera.
- Ajusta series, reps y descansos al nivel, objetivo y lesiones de cada atleta, y explica brevemente el porqué.
- Si hay una instrucción ambigua que cambia el resultado (por ejemplo, cuántos días entrena), pregunta antes de proponer.

3. HONESTIDAD SOBRE LO QUE PUEDES HACER
- Solo puedes cambiar datos mediante los bloques [ACCION_RUTINA: {...}] y SOLO se aplican cuando el coach pulsa "Aplicar".
- NUNCA digas que ya guardaste, actualizaste, asignaste o cambiaste algo. Di "te dejo la propuesta lista para aplicar".
- No puedes enviar mensajes, editar comidas, ni modificar campos que no estén en las acciones de abajo. Si te lo piden, dilo claramente.

4. ACCIONES (bloques que el coach aprueba con un clic)
- Cuando propongas un cambio concreto, añade al FINAL de tu mensaje uno o varios bloques en texto plano (nunca dentro de \`\`\`):
  [ACCION_RUTINA: {...JSON válido en una sola línea...}]
- Un bloque por atleta y por cambio (máximo 4 por mensaje). Si el coach pide rutinas para tres atletas, emite tres bloques crear_rutina.
- Incluye SIEMPRE "clientId" y "clientName" exactos de la telemetría. Para tocar una rutina existente incluye su "routineId".
- Los nombres de ejercicios existentes y los "dayNumber" deben ser EXACTOS a la telemetría.
- Tipos: sets y dayNumber y restSeconds son números enteros; reps es texto ("8-10", "12", "30 s"); weekCount es entero.
- muscleGroup es uno de: chest, back, shoulders, biceps, triceps, legs, glutes, abs, cardio, full_body, quads, hamstrings, calves, forearms, traps, core, abductors, adductors, hybrid.
- Para cambiar la estructura de una rutina (días o ejercicios) usa crear_rutina (la anterior queda guardada como inactiva) o modificar_rutina con "days" completos. NUNCA metas ejercicios en "description".

  a) Sustituir un ejercicio:
  {"action":"sustituir_ejercicio","clientId":"…","clientName":"…","routineId":"…","dayNumber":2,"currentExercise":{"name":"Nombre exacto actual"},"proposedExercise":{"name":"Nuevo","sets":4,"reps":"10-12","restSeconds":90,"muscleGroup":"chest"},"rationale":"…"}
  b) Reemplazar todos los ejercicios de un día:
  {"action":"reemplazar_dia","clientId":"…","clientName":"…","routineId":"…","dayNumber":1,"dayFocus":"Nuevo enfoque","newExercises":[{"name":"…","sets":4,"reps":"8-10","restSeconds":90,"muscleGroup":"chest"}],"rationale":"…"}
  c) Agregar ejercicios a un día:
  {"action":"agregar_ejercicio","clientId":"…","clientName":"…","routineId":"…","dayNumber":2,"exercises":[{"name":"…","sets":3,"reps":"10-12","restSeconds":60,"muscleGroup":"biceps"}],"rationale":"…"}
  d) Quitar ejercicios:
  {"action":"eliminar_ejercicio","clientId":"…","clientName":"…","routineId":"…","dayNumber":3,"exercisesToRemove":["Nombre exacto"],"rationale":"…"}
  e) Crear rutina completa (queda activa; la anterior pasa a inactiva):
  {"action":"crear_rutina","clientId":"…","clientName":"…","routineName":"…","description":"Resumen breve","weekCount":6,"days":[{"dayNumber":1,"focusArea":"Pecho y tríceps","exercises":[{"name":"…","sets":4,"reps":"8-10","restSeconds":90,"muscleGroup":"chest","observations":"Técnica o tempo opcional"}]},{"dayNumber":2,"focusArea":"Descanso","isRestDay":true,"restDayNote":"Recuperación activa"}],"rationale":"…"}
  f) Eliminar una rutina concreta, o depurar todas las inactivas:
  {"action":"eliminar_rutina","clientId":"…","clientName":"…","routineId":"…","rationale":"…"}
  {"action":"eliminar_rutina","clientId":"…","clientName":"…","purgeAllInactive":true,"rationale":"…"}
  g) Modificar nombre, descripción, semanas o los días completos de una rutina:
  {"action":"modificar_rutina","clientId":"…","clientName":"…","routineId":"…","changes":{"name":"…","weekCount":8,"days":[…mismo formato que crear_rutina…]},"rationale":"…"}
  h) Guardar metas nutricionales en el perfil del atleta:
  {"action":"actualizar_metas_nutricionales","clientId":"…","clientName":"…","targetCalories":2400,"targetProtein":160,"targetCarbs":260,"targetFats":75,"dietaryGoal":"recomposicion","rationale":"…"}
  (dietaryGoal es uno de: deficit, volumen, mantenimiento, recomposicion)

5. SEMÁFORO DE SERIES
- 🟢 carga real dentro de ±10 % de lo prescrito · 🟡 desviación 10-20 % · 🔴 >20 % o molestia articular.
- Ante banderas rojas prioriza a quien reporte 🔴 o dolor, y propone la sustitución biomecánica preventiva.

6. CRITERIO CIENTÍFICO
- Schoenfeld, Israetel (volumen MEV/MAV/MRV), Beardsley, Zatsiorsky, Guyton & Hall, Lehninger.
- Hombro: plano escapular · lumbar: apoyo pectoral o prensa 45° · rodilla: bisagra de cadera.
- Salud articular y constancia por encima del ego en las cargas.

TELEMETRÍA EN VIVO (cartera de ${trainerName}):
${summary}
`;
  }

  private async loadHistory(trainerId: string): Promise<ChatTurn[]> {
    const rows = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      // Desempate por rol: los mensajes antiguos se guardaron en pareja con el
      // mismo createdAt, y sin esto la respuesta podia salir antes que la pregunta
      orderBy: [{ createdAt: 'desc' }, { role: 'asc' }],
      take: HISTORY_MESSAGES,
    });
    rows.reverse();

    // Gemini exige empezar por el usuario; turnos seguidos del mismo rol
    // (p. ej. la confirmacion de una accion aplicada) se fusionan.
    const turns: ChatTurn[] = [];
    for (const r of rows) {
      const role = r.role === 'clinical_ai' ? 'model' : 'user';
      const content =
        r.content.length > HISTORY_MESSAGE_MAX_CHARS
          ? `${r.content.slice(0, HISTORY_MESSAGE_MAX_CHARS)}…`
          : r.content;
      const last = turns[turns.length - 1];
      if (last && last.role === role) last.content += `\n\n${content}`;
      else turns.push({ role, content });
    }
    while (turns.length > 0 && turns[0].role === 'model') turns.shift();
    return turns;
  }

  // ─── Proveedores de IA ──────────────────────────────────────────────────

  private attempts(): Attempt[] {
    const list: Attempt[] = [];
    // Por modelo y luego por clave: si la cuota de un modelo se agota en una
    // clave se prueba el mismo modelo en la otra antes de bajar de calidad.
    for (const model of GEMINI_MODELS) {
      this.geminiKeys.forEach((key, k) =>
        list.push({
          kind: 'gemini',
          key,
          model,
          label: `${model} (clave #${k + 1})`,
        }),
      );
    }
    if (this.mimoApiKey) {
      for (const model of MIMO_MODELS) {
        list.push({ kind: 'mimo', model, label: `MiMo ${model}` });
      }
    }
    return list;
  }

  /**
   * Un modelo saturado (503) lo esta para todas las claves y una cuota agotada
   * (429) dura un rato: se aparcan para no gastar segundos en cada mensaje.
   */
  private coolDown(attempt: Attempt, error: string) {
    const now = Date.now();
    if (/\b503\b|overloaded|high demand|unavailable/i.test(error)) {
      this.cooldowns.set(`model:${attempt.model}`, now + 2 * 60_000);
    } else if (/\b429\b|quota|rate limit|exhausted/i.test(error)) {
      this.cooldowns.set(
        `key:${attempt.model}:${attempt.key ?? 'mimo'}`,
        now + 10 * 60_000,
      );
    } else if (/\b404\b|not found|not supported/i.test(error)) {
      this.cooldowns.set(`model:${attempt.model}`, now + 60 * 60_000);
    }
  }

  private isCoolingDown(attempt: Attempt): boolean {
    const now = Date.now();
    return [
      `model:${attempt.model}`,
      `key:${attempt.model}:${attempt.key ?? 'mimo'}`,
    ].some((k) => (this.cooldowns.get(k) ?? 0) > now);
  }

  private async callWithFailover(
    systemInstruction: string,
    turns: ChatTurn[],
    deadline: number,
    preferred?: Attempt,
  ): Promise<ModelReply | null> {
    const all = this.attempts();
    const ordered = preferred
      ? [
          preferred,
          ...all.filter(
            (a) => !(a.model === preferred.model && a.key === preferred.key),
          ),
        ]
      : all;

    // Si todo esta en pausa se intenta igualmente antes que no responder
    const allCooling = ordered.every((a) => this.isCoolingDown(a));
    for (const attempt of ordered) {
      // Se revisa en cada vuelta: si la clave #1 devuelve 503, el mismo modelo
      // queda en pausa y no se pierde tiempo probandolo con la clave #2
      if (!allCooling && this.isCoolingDown(attempt)) continue;
      const remaining = deadline - Date.now();
      if (remaining < MIN_ATTEMPT_MS) break;
      const timeout = Math.min(MAX_ATTEMPT_MS, remaining);
      const startedAt = Date.now();
      try {
        const text =
          attempt.kind === 'gemini'
            ? await this.callGemini(attempt, systemInstruction, turns, timeout)
            : await this.callMimo(attempt, systemInstruction, turns, timeout);
        if (!text.trim()) throw new Error('respuesta vacía');
        this.logger.log(
          `🩺 [${attempt.label}] respondió en ${((Date.now() - startedAt) / 1000).toFixed(1)} s`,
        );
        return { text, provider: attempt.label, attempt };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.coolDown(attempt, msg);
        this.logger.warn(
          `⚠️ [${attempt.label}] falló tras ${((Date.now() - startedAt) / 1000).toFixed(1)} s: ${msg.slice(-160)}`,
        );
      }
    }
    this.logger.error('🚨 Ningún proveedor de IA respondió a tiempo.');
    return null;
  }

  private async callGemini(
    attempt: Attempt,
    systemInstruction: string,
    turns: ChatTurn[],
    timeout: number,
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(attempt.key!);
    const model = genAI.getGenerativeModel(
      {
        model: attempt.model,
        systemInstruction,
        generationConfig: { temperature: 0.4, maxOutputTokens: 16384 },
      },
      { timeout },
    );
    const contents: Content[] = turns.map((t) => ({
      role: t.role,
      parts: [{ text: t.content }],
    }));
    const result = await model.generateContent({ contents });
    const candidate = result.response.candidates?.[0];
    if (candidate?.finishReason === FinishReason.MAX_TOKENS) {
      // Una accion cortada a la mitad no se puede aplicar; mejor otro intento
      throw new Error('respuesta truncada por longitud');
    }
    return result.response.text();
  }

  private async callMimo(
    attempt: Attempt,
    systemInstruction: string,
    turns: ChatTurn[],
    timeout: number,
  ): Promise<string> {
    const response = await fetch(`${this.mimoBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.mimoApiKey}`,
      },
      body: JSON.stringify({
        model: attempt.model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemInstruction },
          ...turns.map((t) => ({
            role: t.role === 'model' ? 'assistant' : 'user',
            content: t.content,
          })),
        ],
      }),
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${(await response.text()).slice(0, 150)}`,
      );
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? '';
  }

  // ─── Historial ──────────────────────────────────────────────────────────

  async getChatHistory(trainerId: string) {
    // Los ultimos 100 mensajes, no los primeros: con 'asc' + take el coach que
    // pasaba de 50 mensajes solo veia los mas viejos y sus consultas nuevas
    // "desaparecian" al recargar la terminal.
    const rows = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      orderBy: [{ createdAt: 'desc' }, { role: 'asc' }],
      take: 100,
    });
    rows.reverse();
    return rows.map((r) => ({
      id: r.id,
      role: r.role === 'clinical_user' ? ('user' as const) : ('ai' as const),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async clearChatHistory(trainerId: string) {
    await this.prisma.dietChatMessage.deleteMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
    });
    return { success: true };
  }
}
