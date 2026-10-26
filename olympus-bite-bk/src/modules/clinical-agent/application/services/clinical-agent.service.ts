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

        // Volumen semanal por grupo muscular (MEV/MAV/MRV)
        const volumeByMuscle: Record<string, number> = {};
        if (active) {
          for (const day of active.routineDays) {
            if (day.isRestDay) continue;
            for (const ex of day.exercises) {
              const group = (ex.muscleGroup || day.focusArea || 'General').trim();
              volumeByMuscle[group] = (volumeByMuscle[group] || 0) + (ex.sets || 0);
            }
          }
        }
        const volumeSummary =
          Object.keys(volumeByMuscle).length > 0
            ? Object.entries(volumeByMuscle)
                .map(
                  ([m, s]) =>
                    `${m}: ${s}s (${s < 6 ? 'Bajo MEV' : s <= 20 ? 'Óptimo MAV' : 'Exceso MRV'})`,
                )
                .join(' | ')
            : 'Sin series cuantificadas';

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


  private async executeRoutineReplacement(
    clientId?: string,
    clientName?: string,
    oldExerciseName?: string,
    newExerciseName?: string,
    rationale?: string,
  ) {
    if (!oldExerciseName || !newExerciseName) return;

    let targetId = clientId;
    if (!targetId && clientName) {
      const athlete = await this.prisma.user.findFirst({
        where: { name: { contains: clientName, mode: 'insensitive' } },
      });
      if (athlete) targetId = athlete.id;
    }
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine) return;

    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(oldExerciseName.toLowerCase()),
      );
      if (target) {
        const updatedObs = [
          target.observations,
          rationale ? `[Clínico: ${rationale}]` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        await this.prisma.exercise.update({
          where: { id: target.id },
          data: {
            name: newExerciseName,
            observations: updatedObs,
          },
        });

        await this.prisma.routine.update({
          where: { id: routine.id },
          data: { updatedAt: new Date() },
        });
        break;
      }
    }
  }

  private async resolveAthleteId(clientId?: string, clientName?: string): Promise<string | null> {
    if (clientId) return clientId;
    if (!clientName) return null;
    const athlete = await this.prisma.user.findFirst({
      where: { name: { contains: clientName, mode: 'insensitive' } },
    });
    return athlete?.id ?? null;
  }

  private async executeLoadUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine) return;

    const weightInKg =
      cmd.targetWeight !== undefined
        ? cmd.unit === 'lbs'
          ? Math.round((Number(cmd.targetWeight) / 2.20462) * 10) / 10
          : Number(cmd.targetWeight)
        : undefined;

    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(String(cmd.exerciseName).toLowerCase()),
      );
      if (target) {
        await this.prisma.exercise.update({
          where: { id: target.id },
          data: {
            sets: cmd.sets !== undefined ? Number(cmd.sets) : target.sets,
            reps: cmd.reps !== undefined ? String(cmd.reps) : target.reps,
            targetWeight:
              weightInKg !== undefined ? weightInKg : target.targetWeight,
          },
        });
        break;
      }
    }
  }

  /**
   * Extrae todos los bloques [COMANDO_RUTINA: { ... }] soportando objetos y arrays anidados
   * (ej. días y ejercicios dentro de create_and_assign_routine o mesocycles en save_macrocycle_map).
   */
  private extractRoutineCommands(
    text: string,
  ): { fullMatch: string; jsonStr: string }[] {
    const results: { fullMatch: string; jsonStr: string }[] = [];
    const marker = '[COMANDO_RUTINA:';
    let searchFrom = 0;

    while (searchFrom < text.length) {
      const startIdx = text.indexOf(marker, searchFrom);
      if (startIdx === -1) break;

      const braceStart = text.indexOf('{', startIdx + marker.length);
      if (braceStart === -1) break;

      let depth = 0;
      let inString = false;
      let escaped = false;
      let braceEnd = -1;

      for (let i = braceStart; i < text.length; i++) {
        const ch = text[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              braceEnd = i;
              break;
            }
          }
        }
      }

      if (braceEnd === -1) break;

      let endIdx = braceEnd + 1;
      while (endIdx < text.length && /\s/.test(text[endIdx])) {
        endIdx++;
      }
      if (text[endIdx] === ']') {
        endIdx++;
      }

      results.push({
        fullMatch: text.slice(startIdx, endIdx),
        jsonStr: text.slice(braceStart, braceEnd + 1),
      });
      searchFrom = endIdx;
    }

    return results;
  }

  private stripLeftoverRoutineCommands(text: string): string {
    let cleaned = text;
    const leftover = this.extractRoutineCommands(cleaned);
    for (const item of leftover) {
      cleaned = cleaned.replace(item.fullMatch, '');
    }
    return cleaned.replace(/\[COMANDO_RUTINA:[^\]]*\]/gs, '');
  }

  private normalizeMuscleGroup(raw?: string): string {
    const val = String(raw || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const validMuscleGroups = [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'legs',
      'glutes',
      'abs',
      'cardio',
      'full_body',
      'quads',
      'hamstrings',
      'calves',
      'forearms',
      'traps',
      'core',
      'abductors',
      'adductors',
      'hybrid',
    ];
    if (validMuscleGroups.includes(val)) return val;

    if (val.includes('pecho') || val.includes('pectoral') || val.includes('empuje')) return 'chest';
    if (val.includes('espalda') || val.includes('dorsal') || val.includes('traccion') || val.includes('dominada')) return 'back';
    if (val.includes('hombro') || val.includes('deltoide')) return 'shoulders';
    if (val.includes('bicep')) return 'biceps';
    if (val.includes('tricep')) return 'triceps';
    if (val.includes('cuadricep')) return 'quads';
    if (val.includes('isquio') || val.includes('femoral')) return 'hamstrings';
    if (val.includes('glute')) return 'glutes';
    if (val.includes('gemelo') || val.includes('pantorrilla') || val.includes('soleo')) return 'calves';
    if (val.includes('pierna') || val.includes('tren inferior')) return 'legs';
    if (val.includes('abdom') || val.includes('core')) return 'abs';
    if (val.includes('cardio') || val.includes('aerob') || val.includes('correr')) return 'cardio';
    if (val.includes('calistenia') || val.includes('skill') || val.includes('hibrid')) return 'hybrid';
    return 'full_body';
  }

  private async executeSaveMacrocycleMap(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? { ...(athlete.anamnesisData as any) }
        : {};
    if (!anamnesis.heroPact) {
      anamnesis.heroPact = { status: 'ACTIVE', objectives: {} };
    }

    anamnesis.heroPact.macrocycleMap = {
      title: cmd.title || 'Mapa del Macrociclo de 120 Días — Vital Fit Labs',
      splitType: cmd.splitType || 'Frecuencia 2 · Jerarquía Híbrida (MAV)',
      weeklyVolumeTarget:
        cmd.weeklyVolumeTarget || '10–18 series efectivas/músculo/semana',
      updatedAt: new Date().toISOString().slice(0, 10),
      mesocycles:
        Array.isArray(cmd.mesocycles) && cmd.mesocycles.length > 0
          ? cmd.mesocycles.map((m: any, idx: number) => ({
              number: Number(m.number) || idx + 1,
              weeks: m.weeks || `Semanas ${idx * 4 + 1}-${(idx + 1) * 4}`,
              name: m.name || `Mesociclo ${idx + 1}`,
              focus: m.focus || 'Sobrecarga progresiva y control técnico',
              volumeRange: m.volumeRange || '12-16 series/sem · RIR 1-2',
            }))
          : [
              {
                number: 1,
                weeks: 'Semanas 1-4',
                name: 'Mesociclo 1: Adaptación Anatómica y Base MEV-MAV',
                focus: 'Fijación técnica, dominio corporal fresco y RIR 2-3',
                volumeRange: '10-12 series/sem · RIR 2-3',
              },
              {
                number: 2,
                weeks: 'Semanas 5-8',
                name: 'Mesociclo 2: Sobrecarga Progresiva (Pico MAV)',
                focus: 'Doble progresión de cargas en básicos e hipertrofia',
                volumeRange: '14-18 series/sem · RIR 1-2',
              },
              {
                number: 3,
                weeks: 'Semanas 9-12',
                name: 'Mesociclo 3: Intensificación, Récords y Consolidación',
                focus: 'Conquista de las 4 Metas de 120 Días + Descarga Inteligente',
                volumeRange: '12-15 series/sem · RIR 1 + Deload',
              },
            ],
    };

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeCreateAndAssignRoutine(
    cmd: any,
    fallbackTrainerId?: string,
  ): Promise<string | null> {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return null;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return null;

    const trainerId = athlete.trainerId || fallbackTrainerId || athlete.id;
    const routineName = String(
      cmd.routineName ||
        cmd.name ||
        `Mesociclo Activo — ${athlete.name} (Vital Fit Labs)`,
    );
    const description = String(
      cmd.description ||
        'Rutina estructurada y asignada automáticamente por Vital Fit Labs (Jerarquía Híbrida + Zona MAV)',
    );
    const weekCount = Number(cmd.weekCount) || 4;
    const rawDays = Array.isArray(cmd.days) ? cmd.days : [];
    if (rawDays.length === 0) return null;

    // Desactivar rutinas previas del atleta para que esta quede como la Rutina Activa oficial
    await this.prisma.routine.updateMany({
      where: { clientId: targetId, isActive: true },
      data: { isActive: false },
    });

    const createdRoutine = await this.prisma.routine.create({
      data: {
        name: routineName,
        description,
        trainerId,
        clientId: targetId,
        weekCount,
        isFavorable: true,
        isActive: true,
        routineDays: {
          create: rawDays.map((day: any, dIdx: number) => {
            const rawExercises = Array.isArray(day.exercises)
              ? day.exercises
              : [];
            const isRestDay = Boolean(day.isRestDay) || rawExercises.length === 0;
            return {
              dayNumber: Number(day.dayNumber) || dIdx + 1,
              focusArea: String(
                day.focusArea || day.name || `Día ${dIdx + 1}`,
              ),
              isRestDay,
              restDayNote: day.restDayNote
                ? String(day.restDayNote)
                : isRestDay
                  ? 'Día de recuperación sistémica, sueño ±1h e hidratación óptima'
                  : null,
              exercises: {
                create: rawExercises.map((ex: any, exIdx: number) => {
                  const rawWeight =
                    ex.targetWeight !== undefined ? Number(ex.targetWeight) : null;
                  const weightInKg =
                    rawWeight !== null && !Number.isNaN(rawWeight)
                      ? ex.unit === 'lbs'
                        ? Math.round((rawWeight / 2.20462) * 10) / 10
                        : rawWeight
                      : null;

                  return {
                    name: String(
                      ex.name || ex.exerciseName || `Ejercicio ${exIdx + 1}`,
                    ),
                    muscleGroup: this.normalizeMuscleGroup(
                      ex.muscleGroup || day.focusArea,
                    ) as any,
                    sets: Number(ex.sets) || 3,
                    reps: String(ex.reps || '8-10'),
                    restSeconds: Number(ex.restSeconds) || 90,
                    targetWeight: weightInKg,
                    observations: ex.observations
                      ? String(ex.observations)
                      : 'Doble progresión Vital Fit Labs · RIR 1-2',
                    order: exIdx + 1,
                  };
                }),
              },
            };
          }),
        },
      },
    });

    return createdRoutine.name;
  }

  private async executeAddExercise(cmd: any, fallbackTrainerId?: string) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    let routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });

    // Si el atleta aún no tenía rutina activa, crear una automáticamente para no fallar en silencio
    if (!routine || routine.routineDays.length === 0) {
      await this.executeCreateAndAssignRoutine(
        {
          clientId: targetId,
          routineName: 'Mesociclo 1 — Vital Fit Labs',
          days: [
            {
              dayNumber: Number(cmd.dayNumber) || 1,
              focusArea: cmd.focusArea || 'Entrenamiento Principal',
              exercises: [cmd],
            },
          ],
        },
        fallbackTrainerId,
      );
      return;
    }

    const targetDay =
      routine.routineDays.find((d) => d.dayNumber === Number(cmd.dayNumber)) ||
      routine.routineDays[0];

    const weightInKg =
      cmd.targetWeight !== undefined
        ? cmd.unit === 'lbs'
          ? Math.round((Number(cmd.targetWeight) / 2.20462) * 10) / 10
          : Number(cmd.targetWeight)
        : null;

    const normalizedMuscle = this.normalizeMuscleGroup(cmd.muscleGroup);

    await this.prisma.exercise.create({
      data: {
        routineDayId: targetDay.id,
        name: String(cmd.exerciseName || cmd.name),
        muscleGroup: normalizedMuscle as any,
        sets: Number(cmd.sets) || 3,
        reps: String(cmd.reps || '8-10'),
        targetWeight: weightInKg,
        restSeconds: Number(cmd.restSeconds) || 90,
        observations: cmd.observations ? String(cmd.observations) : 'Añadido por Vital Fit Labs',
        order: targetDay.exercises.length + 1,
      },
    });
  }

  private async executeRemoveExercise(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine) return;

    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(String(cmd.exerciseName).toLowerCase()),
      );
      if (target) {
        await this.prisma.exercise.delete({ where: { id: target.id } });
        break;
      }
    }
  }

  private async executeNutritionUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    if (!anamnesis.heroPact) anamnesis.heroPact = {};
    if (!anamnesis.heroPact.pillars) anamnesis.heroPact.pillars = {};
    if (!anamnesis.heroPact.pillars.nutrition) anamnesis.heroPact.pillars.nutrition = {};

    if (cmd.calories) anamnesis.heroPact.pillars.nutrition.calories = Number(cmd.calories);
    if (cmd.protein) anamnesis.heroPact.pillars.nutrition.protein = Number(cmd.protein);
    if (cmd.carbs) anamnesis.heroPact.pillars.nutrition.carbs = Number(cmd.carbs);
    if (cmd.fats) anamnesis.heroPact.pillars.nutrition.fats = Number(cmd.fats);
    if (cmd.waterLitersTarget)
      anamnesis.heroPact.pillars.nutrition.waterLitersTarget = Number(cmd.waterLitersTarget);

    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        targetCalories: cmd.calories !== undefined ? Number(cmd.calories) : athlete.targetCalories,
        targetProtein: cmd.protein !== undefined ? Number(cmd.protein) : athlete.targetProtein,
        targetCarbs: cmd.carbs !== undefined ? Number(cmd.carbs) : athlete.targetCarbs,
        targetFats: cmd.fats !== undefined ? Number(cmd.fats) : athlete.targetFats,
        anamnesisData: anamnesis,
      },
    });
  }

  private async executeHeroPactUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    if (!anamnesis.heroPact) anamnesis.heroPact = { status: 'ACTIVE', objectives: {} };
    if (!anamnesis.heroPact.objectives) anamnesis.heroPact.objectives = {};
    const obj = anamnesis.heroPact.objectives;

    if (cmd.targetWeightKg !== undefined || cmd.weeklyDeltaTargetKg !== undefined) {
      obj.biometric = {
        ...(obj.biometric || {}),
        targetWeightKg:
          cmd.targetWeightKg !== undefined
            ? Number(cmd.targetWeightKg)
            : obj.biometric?.targetWeightKg,
        weeklyDeltaTargetKg:
          cmd.weeklyDeltaTargetKg !== undefined
            ? Number(cmd.weeklyDeltaTargetKg)
            : obj.biometric?.weeklyDeltaTargetKg,
      };
    }
    if (cmd.strengthExercise || cmd.strengthTargetWeight !== undefined) {
      obj.strength = {
        ...(obj.strength || {}),
        exerciseName: cmd.strengthExercise || obj.strength?.exerciseName,
        targetWeight:
          cmd.strengthTargetWeight !== undefined
            ? Number(cmd.strengthTargetWeight)
            : obj.strength?.targetWeight,
      };
    }
    if (cmd.skillName || cmd.skillTargetMark) {
      obj.bodyMastery = {
        ...(obj.bodyMastery || {}),
        skillName: cmd.skillName || obj.bodyMastery?.skillName,
        targetMark: cmd.skillTargetMark || obj.bodyMastery?.targetMark,
      };
    }
    if (cmd.aerobicTargetMark) {
      obj.aerobic = {
        ...(obj.aerobic || {}),
        enabled: true,
        targetMark: String(cmd.aerobicTargetMark),
      };
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeWaterLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevLogs = Array.isArray(anamnesis.waterLogs)
      ? anamnesis.waterLogs.filter((w: any) => w.date !== todayStr)
      : [];
    const targetLiters =
      anamnesis.heroPact?.pillars?.nutrition?.waterLitersTarget || 3.0;
    anamnesis.waterLogs = [
      ...prevLogs.slice(-60),
      {
        date: todayStr,
        liters: Number(cmd.liters),
        targetLiters,
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeSleepLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevLogs = Array.isArray(anamnesis.sleepLogs)
      ? anamnesis.sleepLogs.filter((s: any) => s.date !== todayStr)
      : [];
    anamnesis.sleepLogs = [
      ...prevLogs.slice(-60),
      {
        date: todayStr,
        hoursSlept: Number(cmd.hoursSlept) || 7.5,
        bedtime: String(cmd.bedtime || '22:30'),
        wakeTime: String(cmd.wakeTime || '06:00'),
        withinOneHourWindow:
          cmd.withinOneHourWindow !== undefined
            ? Boolean(cmd.withinOneHourWindow)
            : true,
        quality: 'óptima',
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeWeighInLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const weightKg =
      cmd.unit === 'lbs'
        ? Math.round((Number(cmd.weight) / 2.20462) * 100) / 100
        : Math.round(Number(cmd.weight) * 100) / 100;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevWeighIns = Array.isArray(anamnesis.fastedWeighIns)
      ? anamnesis.fastedWeighIns.filter((w: any) => w.date !== todayStr)
      : [];
    const lastEma =
      prevWeighIns.length > 0
        ? prevWeighIns[prevWeighIns.length - 1].movingAverageKg || weightKg
        : weightKg;
    const movingAverageKg = Math.round((weightKg * 0.35 + lastEma * 0.65) * 100) / 100;

    anamnesis.fastedWeighIns = [
      ...prevWeighIns.slice(-52),
      {
        date: todayStr,
        weightKg,
        movingAverageKg,
        bodyFatPct: cmd.bodyFatPct !== undefined ? Number(cmd.bodyFatPct) : undefined,
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        weight: weightKg,
        anamnesisData: anamnesis,
      },
    });
  }

  private async executePublishWeeklyReport(cmd: any, trainerName: string) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevReports: any[] = Array.isArray(anamnesis.weeklyReports)
      ? [...anamnesis.weeklyReports]
      : [];

    const targetWeekNumber = Number(cmd.weekNumber) || (prevReports.length + 1);
    const existingIndex = prevReports.findIndex(
      (r) => Number(r.weekNumber) === targetWeekNumber,
    );

    const reportPayload = {
      id: existingIndex >= 0 ? prevReports[existingIndex].id : `rep-${Date.now()}`,
      weekNumber: targetWeekNumber,
      publishedAt: todayStr,
      trainerName: trainerName || 'Tu Entrenador',
      summary: String(cmd.summary || ''),
      wins: String(cmd.wins || ''),
      nextWeekFocus: String(cmd.nextWeekFocus || ''),
      volumeTotalKg: cmd.volumeTotalKg ? Number(cmd.volumeTotalKg) : undefined,
      volumeDeltaPct: cmd.volumeDeltaPct ? Number(cmd.volumeDeltaPct) : undefined,
      sleepCompliance: cmd.sleepCompliance ? String(cmd.sleepCompliance) : undefined,
    };

    if (existingIndex >= 0) {
      prevReports[existingIndex] = reportPayload;
      anamnesis.weeklyReports = prevReports;
    } else {
      anamnesis.weeklyReports = [...prevReports.slice(-24), reportPayload];
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeMealLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealType = validTypes.includes(cmd.mealType) ? cmd.mealType : 'lunch';

    await this.prisma.meal.create({
      data: {
        userId: targetId,
        name: String(cmd.mealName),
        description: cmd.description || 'Registrada mediante el Agente IA',
        mealType: mealType as any,
        calories: Number(cmd.calories) || 0,
        protein: Number(cmd.protein) || 0,
        carbs: Number(cmd.carbs) || 0,
        fat: Number(cmd.fat) || 0,
        foods: [String(cmd.mealName)],
      },
    });
  }


  async processAthleteCaseMessage(
    athleteId: string,
    trainerMessage: string,
    trainerPrivateNotes?: string,
  ): Promise<{ reply: string; trainerPrivateNotes: string }> {
    const athlete = await this.prisma.user.findUnique({
      where: { id: athleteId },
    });
    if (!athlete) {
      throw new Error('Atleta no encontrado');
    }

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? { ...(athlete.anamnesisData as any) }
        : {};

    // Si el entrenador actualizó la bitácora clínica privada, persistirla
    if (
      trainerPrivateNotes !== undefined &&
      trainerPrivateNotes !== anamnesis.trainerPrivateMemory
    ) {
      anamnesis.trainerPrivateMemory = trainerPrivateNotes;
      await this.prisma.user.update({
        where: { id: athleteId },
        data: { anamnesisData: anamnesis },
      });
    }

    const savedPrivateMemory =
      anamnesis.trainerPrivateMemory ||
      'Sin anotaciones clínicas privadas previas.';

    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

    const [recentMeals, activeRoutine, athleteWorkoutLogs, lastAssessment] =
      await Promise.all([
        this.prisma.meal.findMany({
          where: { userId: athleteId },
          orderBy: { date: 'desc' },
          take: 20,
        }),
        this.prisma.routine.findFirst({
          where: { clientId: athleteId, isActive: true },
          include: { routineDays: { include: { exercises: true } } },
        }),
        this.prisma.workoutLog.findMany({
          where: { userId: athleteId },
          include: { exercise: true },
          orderBy: [{ weekNumber: 'asc' }, { createdAt: 'asc' }],
        }),
        this.prisma.physicalAssessment.findFirst({
          where: { clientId: athleteId },
          orderBy: { date: 'desc' },
        }),
      ]);

    const todayMeals = recentMeals.filter(
      (m) => m.date >= startOfToday && m.date <= endOfToday,
    );
    const totalKcalToday = todayMeals.reduce(
      (acc, m) => acc + (m.calories || 0),
      0,
    );
    const totalProtToday = todayMeals.reduce(
      (acc, m) => acc + (m.protein || 0),
      0,
    );

    const volumeByMuscle: Record<string, number> = {};
    if (activeRoutine) {
      for (const day of activeRoutine.routineDays) {
        if (day.isRestDay) continue;
        for (const ex of day.exercises) {
          const group = (ex.muscleGroup || day.focusArea || 'General').trim();
          volumeByMuscle[group] = (volumeByMuscle[group] || 0) + (ex.sets || 0);
        }
      }
    }
    const volumeSummary =
      Object.keys(volumeByMuscle).length > 0
        ? Object.entries(volumeByMuscle)
            .map(
              ([m, s]) =>
                `${m}: ${s} series/sem (${s < 6 ? 'Bajo MEV' : s <= 20 ? 'Óptimo MAV' : 'Exceso MRV'})`,
            )
            .join(' | ')
        : 'Sin series cuantificadas';

    const routineDetails = activeRoutine
      ? `Rutina Activa: "${activeRoutine.name}" | Volumen Semanal: [${volumeSummary}]\n` +
        activeRoutine.routineDays
          .map(
            (d) =>
              `  • Día ${d.dayNumber} (${d.focusArea}): ` +
              d.exercises
                .map(
                  (e) =>
                    `${e.name} ${e.sets}x${e.reps}${e.targetWeight ? ` @${e.targetWeight}kg` : ''}`,
                )
                .join(', '),
          )
          .join('\n')
      : 'Sin rutina activa asignada';

    const pact = anamnesis.heroPact || {};
    const sleepLogs = Array.isArray(anamnesis.sleepLogs)
      ? anamnesis.sleepLogs.slice(-5)
      : [];
    const weighIns = Array.isArray(anamnesis.fastedWeighIns)
      ? anamnesis.fastedWeighIns.slice(-5)
      : [];
    const waterLogs = Array.isArray(anamnesis.waterLogs)
      ? anamnesis.waterLogs.slice(-5)
      : [];

    // Construir cadena de progresión/fatiga real desde WorkoutLogs
    const logsByEx = new Map<string, any[]>();
    athleteWorkoutLogs.forEach((l) => {
      const exName = l.exercise?.name || 'Ejercicio';
      if (!logsByEx.has(exName)) logsByEx.set(exName, []);
      logsByEx.get(exName)!.push(l);
    });
    const workoutProgressionLines: string[] = [];
    logsByEx.forEach((exLogs, exName) => {
      const chain = exLogs
        .slice(-4)
        .map((l) => {
          const setsStr = Array.isArray(l.setsData)
            ? (l.setsData as any[])
                .filter((s) => s.completed || s.reps)
                .map((s) => `${s.weight || 0}kgx${s.reps || 0}`)
                .join(',')
            : `${l.weight || 0}kgx${l.repsDone || '?'}`;
          return `Sem ${l.weekNumber}: [${setsStr}]${l.observations ? ` (Nota: ${l.observations})` : ''}`;
        })
        .join(' ➔ ');
      workoutProgressionLines.push(`  • ${exName}: ${chain}`);
    });
    const workoutLogsSummary =
      workoutProgressionLines.length > 0
        ? workoutProgressionLines.join('\n')
        : '  • Sin series registradas aún en WorkoutLogs.';

    const assessmentSummary = lastAssessment
      ? `Última Valoración Física (${lastAssessment.date.toISOString().slice(0, 10)}): Cintura ${lastAssessment.waist || '?'}cm, Espalda ${lastAssessment.back || '?'}cm, Brazo ${lastAssessment.rightArm || '?'}cm, Muslo ${lastAssessment.rightThigh || '?'}cm, %Grasa ${lastAssessment.fatPercentage || '?'}%`
      : 'Sin valoraciones antropométricas registradas';

    const systemInstruction = `
Eres el AGENTE CLÍNICO Y CO-PILOTO CIENTÍFICO PRIVADO DEL ENTRENADOR analizando el caso exclusivo del atleta **${athlete.name}**.
IMPORTANTE: Esta es la MEMORIA CLÍNICA PRIVADA de la Ficha Técnica de ${athlete.name}. El atleta NUNCA ve este chat. Aquí puedes discutir con total franqueza clínica y biomecánica con el entrenador sobre adherencia, estancamientos, psicología del atleta, ajustes de volumen semanal (MEV-MAV-MRV), cargas y nutrición.

EXPEDIENTE COMPLETO EN VIVO DE ${athlete.name.toUpperCase()}:
- Bitácora / Memoria Clínica Privada del Entrenador: "${savedPrivateMemory}"
- Radiografía / Descubrimiento: Propósito profundo: "${anamnesis.deepWhy || 'No especificado'}" | Obstáculos: "${anamnesis.mainObstacle || 'No especificado'}" | Lesiones: "${athlete.medicalConditions || 'Ninguna'}"
- Pacto de 120 Días (4 Metas):
  1) Biométrico: ${pact.objectives?.biometric?.currentWeightKg || athlete.weight || '?'}kg -> ${pact.objectives?.biometric?.targetWeightKg || '?'}kg (Ritmo meta: ${pact.objectives?.biometric?.weeklyDeltaTargetKg || 0.25}kg/sem)
  2) Fuerza: ${pact.objectives?.strength?.exerciseName || 'No definido'} (${pact.objectives?.strength?.currentWeight || '?'} -> ${pact.objectives?.strength?.targetWeight || '?'}${pact.weightUnit || 'kg'})
  3) Dominio Corporal: ${pact.objectives?.bodyMastery?.skillName || 'No definido'} (${pact.objectives?.bodyMastery?.targetMark || ''})
  4) Aeróbico: ${pact.objectives?.aerobic?.targetMark || 'No definido'}
- Pilares y Telemetría Reciente:
  • Nutrición hoy: ${todayMeals.length} comidas (${totalKcalToday} / ${athlete.targetCalories || 2200} kcal | ${totalProtToday} / ${athlete.targetProtein || 150}g Proteína)
  • Últimos registros de Agua: ${waterLogs.length > 0 ? waterLogs.map((w: any) => `${w.date}: ${w.liters}L`).join(', ') : 'Sin registros'} (Meta: ${pact.pillars?.nutrition?.waterLitersTarget || 3.0}L)
  • Últimos registros de Sueño (±1h): ${sleepLogs.length > 0 ? sleepLogs.map((s: any) => `${s.date}: ${s.hoursSlept}h (${s.bedtime}-${s.wakeTime}, ±1h:${s.withinOneHourWindow ? 'OK' : 'FALLÓ'})`).join(' | ') : 'Sin registros'}
  • Últimos Pesajes en Ayunas: ${weighIns.length > 0 ? weighIns.map((w: any) => `${w.date}: ${w.weightKg}kg (EMA:${w.movingAverageKg || w.trendWeightKg || w.weightKg}kg)`).join(' | ') : 'Sin pesajes'}
- Plan de Entrenamiento y Volumen Semanal (MEV 6-9, MAV 10-20, MRV >20, máx 8-10 series/sesión por músculo):
${routineDetails}
- HISTORIAL REAL DE CARGAS Y SERIES SEMANA A SEMANA (WorkoutLogs en Gimnasio):
${workoutLogsSummary}
- VALORACIÓN FÍSICA / PERÍMETROS: ${assessmentSummary}

PROTOCOLO ANTE CAÍDA DE RENDIMIENTO DE 2 SEMANAS:
- Si detectas en los WorkoutLogs que el atleta bajó peso o repeticiones durante 2 semanas seguidas:
  1) Revisa primero si falló en Sueño (±1h) o Agua/Calorías (Deuda de Recuperación).
  2) Si Sueño y Agua están bien pero cayó 2 semanas seguidas, diagnostica fatiga acumulada / exceso de MRV y propón una Descarga Inteligente (-1 serie y -10% de peso con RIR 2-3).

REGLAS Y PERMISOS EJECUTORES DE VITAL FIT LABS SOBRE ${athlete.name.toUpperCase()}:
1. FLUJO DE TRABAJO CLÍNICO EN 3 PASOS:
   - Paso 1: Debatir y fijar el Acuerdo de las 4 Metas de 120 Días + 3 Pilares (Entreno, Agua/Nutrición, Sueño ±1h).
   - Paso 2: Estructurar y guardar el Mapa del Macrociclo de 120 Días (3 Mesociclos de 4 semanas) en la Ficha Técnica.
   - Paso 3: Crear y asignar directamente la Rutina Activa en la base de datos.
2. Incluye siempre al final una breve cápsula: ### 🎓 Fundamento Científico para el Entrenador.
3. REGLA DE ORO DE EJECUCIÓN AUTOMÁTICA: El Entrenador NUNCA debe transcribir ni asignar manualmente lo que acuerden aquí. Cuando el Entrenador te pida fijar metas, guardar el mapa del macrociclo o crear/asignar la rutina para ${athlete.name}, DEBES emitir obligatoriamente al final de tu respuesta la etiqueta exacta (usando siempre "clientId": "${athlete.id}"):
   - CREAR Y ASIGNAR LA RUTINA COMPLETA EN LA BASE DE DATOS (úsalo SIEMPRE que te pidan crear, armar, diseñar o asignar una rutina):
     [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "create_and_assign_routine", "routineName": "Mesociclo 1: Fuerza y Dominio Corporal (Vital Fit Labs)", "description": "Frecuencia 2 · Jerarquía Híbrida · Zona MAV", "weekCount": 4, "days": [{"dayNumber": 1, "focusArea": "Día 1: Torso Fuerza + Dominio Corporal", "exercises": [{"name": "Dominadas Estrictas / Lastradas", "muscleGroup": "back", "sets": 4, "reps": "6-8", "targetWeight": 10, "restSeconds": 120, "observations": "1º Dominio Corporal · RIR 2"}, {"name": "Press Inclinado con Mancuernas", "muscleGroup": "chest", "sets": 4, "reps": "8-10", "targetWeight": 28, "restSeconds": 120, "observations": "2º Compuesto Pesado · Doble Progresión"}]}]}]
   - GUARDAR EL MAPA DEL MACROCICLO DE 120 DÍAS (3 MESOCICLOS) EN LA FICHA TÉCNICA:
     [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "save_macrocycle_map", "title": "Macrociclo 120 Días — Vital Fit Labs", "splitType": "Upper / Lower Híbrido (4 días/sem)", "weeklyVolumeTarget": "12-16 series/músculo/sem (Zona MAV)", "mesocycles": [{"number": 1, "weeks": "Semanas 1-4", "name": "Mesociclo 1: Base Técnica y MEV-MAV", "focus": "Control motor, RIR 2-3 y adherencia a los 3 pilares", "volumeRange": "10-12 series/sem"}, {"number": 2, "weeks": "Semanas 5-8", "name": "Mesociclo 2: Sobrecarga Progresiva (Pico MAV)", "focus": "Doble progresión de cargas e hipertrofia", "volumeRange": "14-16 series/sem"}, {"number": 3, "weeks": "Semanas 9-12", "name": "Mesociclo 3: Intensificación y Récords", "focus": "Conquista de las 4 Metas + Descarga Inteligente", "volumeRange": "12-15 series/sem + Deload"}]}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "replace_exercise", "oldExercise": "...", "newExercise": "...", "rationale": "..."}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_load", "exerciseName": "...", "sets": 4, "reps": "6-8", "targetWeight": 80, "unit": "kg"}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "add_exercise", "dayNumber": 1, "exerciseName": "...", "muscleGroup": "chest", "sets": 3, "reps": "8-10", "targetWeight": 20, "unit": "kg"}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "remove_exercise", "exerciseName": "..."}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_nutrition", "calories": 2500, "protein": 170, "carbs": 280, "fats": 70, "waterLitersTarget": 3.2}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_hero_pact", "targetWeightKg": 76, "weeklyDeltaTargetKg": 0.25, "strengthExercise": "Press Banca", "strengthTargetWeight": 100, "skillName": "Dominadas", "skillTargetMark": "12 reps estrictas", "aerobicTargetMark": "5K en 24 min"}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "publish_weekly_report", "weekNumber": 1, "summary": "...", "wins": "...", "nextWeekFocus": "..."}]
   - Si el entrenador menciona un dato clínico nuevo importante para recordar en el futuro, puedes guardarlo en la bitácora privada con:
     [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "append_private_note", "note": "Resumen corto del hallazgo o acuerdo clínico"}]
`;

    // Failover resiliente con modelos Flash y MiMo de respaldo
    const history = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: athleteId,
        role: { in: ['clinical_case_user', 'clinical_case_ai'] },
      },
      orderBy: [{ createdAt: 'desc' }, { role: 'asc' }],
      take: 10,
    });
    history.reverse();

    const turns: ChatTurn[] = [];
    for (const m of history) {
      const role = m.role === 'clinical_case_ai' ? ('model' as const) : ('user' as const);
      turns.push({ role, content: m.content });
    }
    turns.push({ role: 'user', content: trainerMessage });

    const deadline = Date.now() + TOTAL_BUDGET_MS;
    const replyObj = await this.callWithFailover(systemInstruction, turns, deadline);
    let replyText =
      replyObj?.text ||
      'Lo siento Coach, hubo una sobrecarga en la conexión con el motor clínico. Por favor intenta tu consulta de nuevo.';
    let updatedNotes = anamnesis.trainerPrivateMemory || '';

    const commandMatches = this.extractRoutineCommands(replyText);
    for (const match of commandMatches) {
      try {
        const cmd = JSON.parse(match.jsonStr);
        cmd.clientId = athlete.id;
        cmd.clientName = athlete.name;
        const action = cmd.action;

        if (action === 'create_and_assign_routine' && Array.isArray(cmd.days)) {
          const createdName = await this.executeCreateAndAssignRoutine(
            cmd,
            athlete.trainerId || athlete.id,
          );
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Rutina Creada y Asignada en Base de Datos:** Se activó **${createdName || cmd.routineName || 'Nueva Rutina Vital Fit Labs'}** (${cmd.days.length} días programados) directamente en el perfil de ${athlete.name}.\n`,
          );
        } else if (action === 'save_macrocycle_map') {
          await this.executeSaveMacrocycleMap(cmd);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> 🗺️ **Mapa del Macrociclo (120 Días) Guardado:** Los 3 Mesociclos quedaron registrados en la Ficha Técnica de ${athlete.name}.\n`,
          );
        } else if (action === 'replace_exercise' && cmd.oldExercise && cmd.newExercise) {
          await this.executeRoutineReplacement(
            athlete.id,
            athlete.name,
            cmd.oldExercise,
            cmd.newExercise,
            cmd.rationale,
          );
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Acción Ejecutada:** Se cambió *${cmd.oldExercise}* por *${cmd.newExercise}* en la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'update_load' && cmd.exerciseName) {
          await this.executeLoadUpdate(cmd);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Carga Actualizada:** Se ajustó *${cmd.exerciseName}* en la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'add_exercise' && (cmd.exerciseName || cmd.name)) {
          await this.executeAddExercise(cmd, athlete.trainerId || athlete.id);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Ejercicio Añadido:** Se agregó *${cmd.exerciseName || cmd.name}* al Día ${cmd.dayNumber || 1} de ${athlete.name}.\n`,
          );
        } else if (action === 'remove_exercise' && cmd.exerciseName) {
          await this.executeRemoveExercise(cmd);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Volumen Depurado:** Se eliminó *${cmd.exerciseName}* de la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'update_nutrition') {
          await this.executeNutritionUpdate(cmd);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Nutrición/Agua Calibrada:** Metas actualizadas en la ficha de ${athlete.name}.\n`,
          );
        } else if (action === 'update_hero_pact') {
          await this.executeHeroPactUpdate(cmd);
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Pacto de 120 Días Actualizado:** Se recalibraron las metas de ${athlete.name}.\n`,
          );
        } else if (action === 'publish_weekly_report' && cmd.summary) {
          await this.executePublishWeeklyReport(cmd, 'Tu Entrenador');
          replyText = replyText.replace(
            match.fullMatch,
            `\n> ⚡ **Reporte Semanal Publicado:** Ya visible en el panel de ${athlete.name}.\n`,
          );
        } else if (action === 'append_private_note' && cmd.note) {
          const freshUser = await this.prisma.user.findUnique({
            where: { id: athlete.id },
          });
          const freshAnamnesis =
            freshUser?.anamnesisData &&
            typeof freshUser.anamnesisData === 'object'
              ? { ...(freshUser.anamnesisData as any) }
              : {};
          const dateTag = new Date().toISOString().slice(0, 10);
          updatedNotes = [
            freshAnamnesis.trainerPrivateMemory,
            `[${dateTag}] ${cmd.note}`,
          ]
            .filter(Boolean)
            .join('\n');
          freshAnamnesis.trainerPrivateMemory = updatedNotes;
          await this.prisma.user.update({
            where: { id: athlete.id },
            data: { anamnesisData: freshAnamnesis },
          });
          replyText = replyText.replace(
            match.fullMatch,
            `\n> 🔒 **Guardado en Memoria Clínica Privada:** *"${cmd.note}"*\n`,
          );
        } else {
          replyText = replyText.replace(match.fullMatch, '');
        }
      } catch (cmdErr) {
        this.logger.warn('Error procesando COMANDO_RUTINA en Ficha Técnica:', cmdErr);
        replyText = replyText.replace(match.fullMatch, '');
      }
    }

    replyText = this.stripLeftoverRoutineCommands(replyText)
      .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
      .trim();

    await this.prisma.dietChatMessage.createMany({
      data: [
        {
          userId: athleteId,
          role: 'clinical_case_user',
          content: trainerMessage,
        },
        {
          userId: athleteId,
          role: 'clinical_case_ai',
          content: replyText,
        },
      ],
    });

    return {
      reply: replyText,
      trainerPrivateNotes: updatedNotes,
    };
  }

  async getAthleteCaseHistory(athleteId: string) {
    const [athlete, rows] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: athleteId } }),
      this.prisma.dietChatMessage.findMany({
        where: {
          userId: athleteId,
          role: { in: ['clinical_case_user', 'clinical_case_ai'] },
        },
        orderBy: { createdAt: 'asc' },
        take: 60,
      }),
    ]);

    const anamnesis =
      athlete?.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};

    return {
      trainerPrivateNotes: anamnesis.trainerPrivateMemory || '',
      messages: rows.map((r) => ({
        id: r.id,
        role:
          r.role === 'clinical_case_user'
            ? ('user' as const)
            : ('ai' as const),
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async clearAthleteCaseHistory(athleteId: string) {
    await this.prisma.dietChatMessage.deleteMany({
      where: {
        userId: athleteId,
        role: { in: ['clinical_case_user', 'clinical_case_ai'] },
      },
    });
    return { success: true };
  }

}
