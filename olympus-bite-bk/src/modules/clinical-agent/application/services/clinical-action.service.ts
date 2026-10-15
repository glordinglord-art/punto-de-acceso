import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MuscleGroup, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TrainerScopeService } from '../../../../shared/application/trainer-scope/trainer-scope.service';
import {
  APPLIED_MARKER,
  extractActionBlocks,
  normalizeText,
  parseSetsReps,
  setBlockMarker,
  tokens,
  toInt,
  toNumber,
  toReps,
  toRestSeconds,
} from './routine-action-markers';

type Payload = Record<string, unknown>;
type Tx = Prisma.TransactionClient;

const ROUTINE_INCLUDE = {
  routineDays: {
    orderBy: { dayNumber: 'asc' as const },
    include: { exercises: { orderBy: { order: 'asc' as const } } },
  },
} satisfies Prisma.RoutineInclude;

type LoadedRoutine = Prisma.RoutineGetPayload<{
  include: typeof ROUTINE_INCLUDE;
}>;
type LoadedDay = LoadedRoutine['routineDays'][number];
type LoadedExercise = LoadedDay['exercises'][number];

interface Athlete {
  id: string;
  name: string;
}

interface NormalizedExercise {
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  restSeconds: number;
  observations: string | null;
  targetWeight: number | null;
  intensity: string;
}

interface NormalizedDay {
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string | null;
  exercises: NormalizedExercise[];
}

/** Ejercicio localizado por posicion, para poder seguirlo en una copia versionada. */
interface ExerciseRef {
  dayNumber: number;
  position: number;
  exercise: LoadedExercise;
}

/** Resultado de planificar una accion: todo resuelto, nada escrito aun. */
interface ActionPlan {
  athlete: Athlete;
  commit: (tx: Tx) => Promise<Payload>;
}

export const SUPPORTED_ACTIONS = [
  'sustituir_ejercicio',
  'reemplazar_dia',
  'agregar_ejercicio',
  'eliminar_ejercicio',
  'crear_rutina',
  'eliminar_rutina',
  'modificar_rutina',
  'actualizar_metas_nutricionales',
] as const;

const ACTION_ALIASES: Record<string, string> = {
  delete_routine: 'eliminar_rutina',
  update_routine: 'modificar_rutina',
  create_routine: 'crear_rutina',
  actualizar_perfil_nutricional: 'actualizar_metas_nutricionales',
  actualizar_metas: 'actualizar_metas_nutricionales',
};

/** Fases que usa la ficha del cliente (ClientProfileModal / FitnessGoal). */
const DIETARY_GOALS = ['deficit', 'volumen', 'mantenimiento', 'recomposicion'];

/**
 * Se aplica al grupo que manda la IA y, si no sirve, al nombre del ejercicio.
 * El orden importa: lo mas especifico primero ("curl femoral" antes que "curl").
 */
const MUSCLE_ALIASES: Array<[RegExp, MuscleGroup]> = [
  [
    /isquio|femoral|hamstring|peso muerto rumano|\brdl\b/,
    MuscleGroup.hamstrings,
  ],
  [
    /cuadricep|quad|sentadilla|squat|prensa|zancada|lunge|hack/,
    MuscleGroup.quads,
  ],
  [/hip thrust|puente de gluteo/, MuscleGroup.glutes],
  [/pantorrill|gemel|calf|calves|soleo/, MuscleGroup.calves],
  [/abductor/, MuscleGroup.abductors],
  [/aductor|adductor/, MuscleGroup.adductors],
  [/glute/, MuscleGroup.glutes],
  [
    /pecho|pectoral|chest|press banca|bench|apertura|pec deck|crossover/,
    MuscleGroup.chest,
  ],
  [
    /espalda|dorsal|back|lats?\b|remo|jalon|dominada|pull ?up|pulldown|pullover/,
    MuscleGroup.back,
  ],
  [
    /hombro|deltoid|shoulder|press militar|elevacion(es)? lateral|face pull/,
    MuscleGroup.shoulders,
  ],
  [/trapecio|trap/, MuscleGroup.traps],
  [/antebrazo|forearm/, MuscleGroup.forearms],
  [/tricep|press frances|pushdown|fondos/, MuscleGroup.triceps],
  [/bicep|\bcurl\b/, MuscleGroup.biceps],
  [/core|lumbar|plancha|plank/, MuscleGroup.core],
  [/abdom|abs\b|crunch/, MuscleGroup.abs],
  [/cardio/, MuscleGroup.cardio],
  [/hibrid|hybrid/, MuscleGroup.hybrid],
  [/pierna|leg/, MuscleGroup.legs],
  [/cuerpo completo|full ?body/, MuscleGroup.full_body],
];

/**
 * Ejecuta las acciones que propone el Director Clinico sobre rutinas y perfiles.
 *
 * Cada accion se resuelve primero por completo (atleta, rutina, dia, ejercicio)
 * contra la base de datos y solo despues se escribe, en una unica transaccion.
 * La misma resolucion se usa como validacion previa (`preflight`) al generar la
 * respuesta, de modo que el coach no vea botones de "Aplicar" que van a fallar.
 */
@Injectable()
export class ClinicalActionService {
  private readonly logger = new Logger(ClinicalActionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trainerScope: TrainerScopeService,
  ) {}

  /** Valida una accion sin escribir nada. Devuelve el motivo si no es aplicable. */
  async preflight(trainerId: string, payload: Payload): Promise<string | null> {
    try {
      await this.plan(trainerId, payload);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : String(err);
    }
  }

  async execute(
    trainerId: string,
    payload: Payload,
    source?: { messageId?: string; actionIndex?: number },
  ): Promise<Payload> {
    const sourceMessage = await this.loadSourceMessage(trainerId, source);
    const plan = await this.plan(trainerId, payload);

    const result = await this.prisma.$transaction(
      async (tx) => {
        const res = await plan.commit(tx);
        if (sourceMessage) {
          await tx.dietChatMessage.update({
            where: { id: sourceMessage.id },
            data: {
              content: setBlockMarker(
                sourceMessage.content,
                source!.actionIndex!,
                APPLIED_MARKER,
              ),
            },
          });
        }
        return res;
      },
      { timeout: 20000, maxWait: 10000 },
    );

    const followUpMessage = this.buildFollowUp(result, payload, plan.athlete);
    try {
      await this.prisma.dietChatMessage.create({
        data: {
          userId: trainerId,
          role: 'clinical_ai',
          content: followUpMessage,
        },
      });
    } catch (err) {
      this.logger.warn(`No se pudo guardar la confirmacion en el chat: ${err}`);
    }

    this.logger.log(
      `✅ [${String(result.action)}] ${plan.athlete.name} por coach ${trainerId}: ${String(result.message)}`,
    );
    return { success: true, ...result, followUpMessage };
  }

  // ─── Mensaje de origen (para marcar la accion como aplicada) ────────────

  private async loadSourceMessage(
    trainerId: string,
    source?: { messageId?: string; actionIndex?: number },
  ) {
    if (!source?.messageId || source.actionIndex === undefined) return null;
    const message = await this.prisma.dietChatMessage.findFirst({
      where: { id: source.messageId, userId: trainerId, role: 'clinical_ai' },
    });
    if (!message) return null;
    const block = extractActionBlocks(message.content).find(
      (b) => b.index === source.actionIndex,
    );
    if (block?.status === 'applied') {
      throw new ConflictException(
        'Esta acción ya se aplicó. Si quieres repetirla, pídesela de nuevo al Director Clínico.',
      );
    }
    return block ? message : null;
  }

  // ─── Planificacion por tipo de accion ───────────────────────────────────

  private async plan(trainerId: string, raw: Payload): Promise<ActionPlan> {
    const action = this.normalizeActionName(raw.action);
    const athlete = await this.resolveAthlete(trainerId, raw);

    switch (action) {
      case 'sustituir_ejercicio':
        return this.planSubstitute(athlete, raw);
      case 'reemplazar_dia':
        return this.planReplaceDay(athlete, raw);
      case 'agregar_ejercicio':
        return this.planAddExercises(athlete, raw);
      case 'eliminar_ejercicio':
        return this.planRemoveExercises(athlete, raw);
      case 'crear_rutina':
        return this.planCreateRoutine(trainerId, athlete, raw);
      case 'eliminar_rutina':
        return this.planDeleteRoutine(athlete, raw);
      case 'modificar_rutina':
        return this.planUpdateRoutine(athlete, raw);
      case 'actualizar_metas_nutricionales':
        return this.planNutritionTargets(athlete, raw);
      default:
        throw new BadRequestException(
          `Acción no reconocida: "${String(raw.action)}".`,
        );
    }
  }

  private async planSubstitute(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    const routine = await this.resolveRoutine(athlete, raw);
    const day = this.resolveOptionalDay(routine, raw);
    const current = asObject(raw.currentExercise);
    const proposed = asObject(raw.proposedExercise);
    const currentName = asString(current.name) ?? asString(raw.oldExercise);
    const newName = asString(proposed.name) ?? asString(raw.newExercise);
    if (!currentName || !newName) {
      throw new BadRequestException(
        'Falta el ejercicio actual o el ejercicio propuesto.',
      );
    }

    const ref = this.resolveExercise(routine, currentName, day);
    const fromSetsReps = parseSetsReps(proposed.setsReps);
    const sets = clampInt(toInt(proposed.sets) ?? fromSetsReps.sets, 1, 10);
    const reps = toReps(proposed.reps) ?? fromSetsReps.reps;
    const restSeconds = clampInt(toRestSeconds(proposed.restSeconds), 0, 600);
    const muscleGroup = proposed.muscleGroup
      ? this.resolveMuscleGroup(proposed.muscleGroup, ref.exercise.muscleGroup)
      : undefined;
    const rationale = asString(raw.rationale);

    return {
      athlete,
      commit: async (tx) => {
        const target = await this.versionIfLogged(tx, routine, [ref]);
        const exercise = target.refs[0].exercise;
        await tx.exercise.update({
          where: { id: exercise.id },
          data: {
            name: newName,
            ...(sets !== undefined && { sets }),
            ...(reps && { reps }),
            ...(restSeconds !== undefined && { restSeconds }),
            ...(muscleGroup && { muscleGroup }),
            observations: joinNotes(
              asString(proposed.observations),
              rationale && `[Ajuste Equipo Vital Fit: ${rationale}]`,
            ),
          },
        });
        await this.touch(tx, target.routine.id);
        const setsReps =
          sets || reps
            ? ` (${sets ?? exercise.sets}x${reps ?? exercise.reps})`
            : '';
        return {
          action: 'sustituir_ejercicio',
          message: `Se sustituyó "${exercise.name}" por "${newName}"${setsReps} en el día ${ref.dayNumber} de "${target.routine.name}" de ${athlete.name}.`,
          clientName: athlete.name,
          routineName: target.routine.name,
          oldExercise: exercise.name,
          newExercise: newName,
          dayNumber: ref.dayNumber,
          versioned: target.versioned,
        };
      },
    };
  }

  private async planReplaceDay(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    const routine = await this.resolveRoutine(athlete, raw);
    const day = this.resolveDay(routine, raw);
    const newExercises = this.normalizeExercises(
      raw.newExercises ?? raw.exercises,
      asString(raw.rationale) ?? 'Rediseño del día',
    );
    if (newExercises.length === 0) {
      throw new BadRequestException(
        'La acción reemplazar_dia necesita la lista "newExercises" con al menos un ejercicio.',
      );
    }
    // dayFocus es el nuevo enfoque solo si el dia se localizo por numero; si se
    // uso para encontrar el dia, se conserva el nombre que ya tenia
    const newFocus =
      toInt(raw.dayNumber) === day.dayNumber
        ? (asString(raw.dayFocus) ?? day.focusArea)
        : day.focusArea;
    const refs = day.exercises.map((exercise, position) => ({
      dayNumber: day.dayNumber,
      position,
      exercise,
    }));

    return {
      athlete,
      commit: async (tx) => {
        const target = await this.versionIfLogged(tx, routine, refs);
        const targetDay = this.dayOf(target.routine, day.dayNumber);
        await tx.exercise.deleteMany({ where: { routineDayId: targetDay.id } });
        await tx.routineDay.update({
          where: { id: targetDay.id },
          data: { focusArea: newFocus, isRestDay: false },
        });
        await tx.exercise.createMany({
          data: newExercises.map((ex, idx) => ({
            ...ex,
            routineDayId: targetDay.id,
            order: idx + 1,
          })),
        });
        await this.touch(tx, target.routine.id);
        return {
          action: 'reemplazar_dia',
          message: `Día ${day.dayNumber} (${newFocus}) rediseñado en "${target.routine.name}" de ${athlete.name}: ${day.exercises.length} ejercicios reemplazados por ${newExercises.length}.`,
          clientName: athlete.name,
          routineName: target.routine.name,
          dayNumber: day.dayNumber,
          dayFocus: newFocus,
          oldExercises: day.exercises.map((e) => e.name),
          newExercises: newExercises.map((e) => e.name),
          versioned: target.versioned,
        };
      },
    };
  }

  private async planAddExercises(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    const routine = await this.resolveRoutine(athlete, raw);
    const day = this.resolveDay(routine, raw);
    const existing = new Set(day.exercises.map((e) => normalizeText(e.name)));
    const exercises = this.normalizeExercises(
      raw.exercises ?? raw.newExercises,
      asString(raw.rationale) ?? 'Complemento de entrenamiento',
    ).filter((ex) => !existing.has(normalizeText(ex.name)));
    if (exercises.length === 0) {
      throw new BadRequestException(
        `No hay ejercicios nuevos para agregar al día ${day.dayNumber}: la lista está vacía o ya están en la rutina.`,
      );
    }
    const maxOrder = day.exercises.reduce((m, e) => Math.max(m, e.order), 0);

    return {
      athlete,
      commit: async (tx) => {
        await tx.exercise.createMany({
          data: exercises.map((ex, idx) => ({
            ...ex,
            routineDayId: day.id,
            order: maxOrder + idx + 1,
          })),
        });
        await this.touch(tx, routine.id);
        return {
          action: 'agregar_ejercicio',
          message: `Se agregaron ${exercises.length} ejercicio(s) al día ${day.dayNumber} (${day.focusArea}) de "${routine.name}" de ${athlete.name}.`,
          clientName: athlete.name,
          routineName: routine.name,
          dayNumber: day.dayNumber,
          dayFocus: day.focusArea,
          addedExercises: exercises.map((e) => e.name),
        };
      },
    };
  }

  private async planRemoveExercises(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    const routine = await this.resolveRoutine(athlete, raw);
    const day = this.resolveOptionalDay(routine, raw);
    const names = asStringArray(raw.exercisesToRemove);
    if (names.length === 0) {
      throw new BadRequestException(
        'La acción eliminar_ejercicio necesita "exercisesToRemove" con al menos un ejercicio.',
      );
    }
    const refs: ExerciseRef[] = [];
    for (const name of names) {
      const ref = this.resolveExercise(routine, name, day);
      if (!refs.some((r) => r.exercise.id === ref.exercise.id)) refs.push(ref);
    }

    return {
      athlete,
      commit: async (tx) => {
        const target = await this.versionIfLogged(tx, routine, refs);
        await tx.exercise.deleteMany({
          where: { id: { in: target.refs.map((r) => r.exercise.id) } },
        });
        await this.touch(tx, target.routine.id);
        const removed = refs.map((r) => r.exercise.name);
        return {
          action: 'eliminar_ejercicio',
          message: `Se retiraron ${removed.length} ejercicio(s) de "${target.routine.name}" de ${athlete.name}: ${removed.join(', ')}.`,
          clientName: athlete.name,
          routineName: target.routine.name,
          removedExercises: removed,
          versioned: target.versioned,
        };
      },
    };
  }

  private planCreateRoutine(
    trainerId: string,
    athlete: Athlete,
    raw: Payload,
  ): ActionPlan {
    const days = this.normalizeDays(raw.days);
    const name =
      asString(raw.routineName) ?? `Rutina Vital Fit - ${athlete.name}`;
    const description = asString(raw.description) ?? '';
    const weekCount = clampInt(toInt(raw.weekCount), 1, 52) ?? 4;

    return {
      athlete,
      commit: async (tx) => {
        const previous = await tx.routine.findFirst({
          where: { clientId: athlete.id, isActive: true },
          select: { name: true },
        });
        await tx.routine.updateMany({
          where: { clientId: athlete.id, isActive: true },
          data: { isActive: false },
        });
        const created = await tx.routine.create({
          data: {
            name,
            description,
            trainerId,
            clientId: athlete.id,
            weekCount,
            isActive: true,
            routineDays: { create: days.map(toDayCreate) },
          },
        });
        const exercisesCount = days.reduce((n, d) => n + d.exercises.length, 0);
        return {
          action: 'crear_rutina',
          message: `Rutina "${created.name}" creada y activada para ${athlete.name}: ${days.length} días, ${exercisesCount} ejercicios.`,
          clientName: athlete.name,
          routineName: created.name,
          previousRoutineName: previous?.name ?? null,
          daysCount: days.length,
          exercisesCount,
        };
      },
    };
  }

  private async planDeleteRoutine(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    if (raw.purgeAllInactive === true) {
      const inactive = await this.prisma.routine.findMany({
        where: { clientId: athlete.id, isActive: false },
        select: { id: true, name: true },
      });
      if (inactive.length === 0) {
        throw new BadRequestException(
          `${athlete.name} no tiene rutinas inactivas para depurar.`,
        );
      }
      return {
        athlete,
        commit: async (tx) => {
          await tx.routine.deleteMany({
            where: { id: { in: inactive.map((r) => r.id) } },
          });
          return {
            action: 'eliminar_rutina',
            message: `Se eliminaron ${inactive.length} rutinas inactivas de ${athlete.name}.`,
            clientName: athlete.name,
            deletedCount: inactive.length,
            deletedRoutines: inactive.map((r) => r.name),
          };
        },
      };
    }

    // Antes, si no encontraba la rutina por nombre, borraba la ACTIVA. Ahora
    // solo se borra una rutina identificada sin ambiguedad.
    if (!raw.routineId && !raw.routineName) {
      throw new BadRequestException(
        'Para eliminar una rutina hace falta su "routineId" o su nombre exacto.',
      );
    }
    const routine = await this.resolveRoutine(athlete, raw, {
      fallbackToActive: false,
    });
    return {
      athlete,
      commit: async (tx) => {
        await tx.routine.delete({ where: { id: routine.id } });
        return {
          action: 'eliminar_rutina',
          message: `La rutina "${routine.name}" de ${athlete.name} fue eliminada.`,
          clientName: athlete.name,
          routineName: routine.name,
          wasActive: routine.isActive,
        };
      },
    };
  }

  private async planUpdateRoutine(
    athlete: Athlete,
    raw: Payload,
  ): Promise<ActionPlan> {
    const routine = await this.resolveRoutine(athlete, raw);
    const changes = asObject(raw.changes);
    const name = asString(changes.name);
    const description = asString(changes.description);
    const weekCount = clampInt(toInt(changes.weekCount), 1, 52);
    const rawDays = changes.days ?? raw.days;
    const days = rawDays !== undefined ? this.normalizeDays(rawDays) : null;

    // La IA llego a meter la rutina entera dentro de la descripcion: el coach
    // aprobaba y los ejercicios no cambiaban. Se rechaza para que lo corrija.
    if (
      !days &&
      description &&
      /d[ií]a\s*\d/i.test(description) &&
      /\d\s*x\s*\d/i.test(description)
    ) {
      throw new BadRequestException(
        'La descripción no cambia los ejercicios. Para cambiar la estructura envía los días completos en "changes.days" (o usa crear_rutina).',
      );
    }
    if (!name && description === undefined && !weekCount && !days) {
      throw new BadRequestException(
        'La acción modificar_rutina no trae cambios (name, description, weekCount o days).',
      );
    }

    const allRefs = routine.routineDays.flatMap((d) =>
      d.exercises.map((exercise, position) => ({
        dayNumber: d.dayNumber,
        position,
        exercise,
      })),
    );

    return {
      athlete,
      commit: async (tx) => {
        let target = routine;
        let versioned = false;
        if (days) {
          const v = await this.versionIfLogged(tx, routine, allRefs);
          target = v.routine;
          versioned = v.versioned;
          await tx.routineDay.deleteMany({ where: { routineId: target.id } });
          for (const day of days) {
            await tx.routineDay.create({
              data: { routineId: target.id, ...toDayCreate(day) },
            });
          }
        }
        const updated = await tx.routine.update({
          where: { id: target.id },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(weekCount && { weekCount }),
            updatedAt: new Date(),
          },
        });
        return {
          action: 'modificar_rutina',
          message: `La rutina "${updated.name}" de ${athlete.name} fue actualizada${
            days ? ` con ${days.length} días` : ''
          }.`,
          clientName: athlete.name,
          routineName: updated.name,
          versioned,
        };
      },
    };
  }

  private planNutritionTargets(athlete: Athlete, raw: Payload): ActionPlan {
    const data: {
      targetCalories?: number;
      targetProtein?: number;
      targetCarbs?: number;
      targetFats?: number;
      dietaryGoal?: string;
    } = {};
    const calories = clampInt(toInt(raw.targetCalories), 800, 6000);
    if (calories !== undefined) data.targetCalories = calories;
    for (const key of ['targetProtein', 'targetCarbs', 'targetFats'] as const) {
      const v = toNumber(raw[key]);
      if (v !== undefined) {
        if (v < 0 || v > 700) {
          throw new BadRequestException(`${key} fuera de rango: ${v} g.`);
        }
        data[key] = Math.round(v);
      }
    }
    if (raw.dietaryGoal !== undefined) {
      const goal = normalizeText(raw.dietaryGoal).replace(/ /g, '');
      if (!DIETARY_GOALS.includes(goal)) {
        throw new BadRequestException(
          `dietaryGoal debe ser uno de: ${DIETARY_GOALS.join(', ')}.`,
        );
      }
      data.dietaryGoal = goal;
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'La acción actualizar_metas_nutricionales no trae valores (targetCalories, targetProtein, targetCarbs, targetFats o dietaryGoal).',
      );
    }

    return {
      athlete,
      commit: async (tx) => {
        await tx.user.update({ where: { id: athlete.id }, data });
        const parts = [
          data.targetCalories !== undefined &&
            `${String(data.targetCalories)} kcal`,
          data.targetProtein !== undefined &&
            `P ${String(data.targetProtein)} g`,
          data.targetCarbs !== undefined && `C ${String(data.targetCarbs)} g`,
          data.targetFats !== undefined && `G ${String(data.targetFats)} g`,
          data.dietaryGoal !== undefined && `fase ${String(data.dietaryGoal)}`,
        ].filter(Boolean);
        return {
          action: 'actualizar_metas_nutricionales',
          message: `Metas nutricionales de ${athlete.name} actualizadas en su perfil: ${parts.join(' · ')}.`,
          clientName: athlete.name,
          targets: data,
        };
      },
    };
  }

  // ─── Resolucion contra la base de datos ─────────────────────────────────

  private normalizeActionName(value: unknown): string {
    const action = normalizeText(value).replace(/ /g, '_');
    const resolved = ACTION_ALIASES[action] ?? action;
    if (!resolved) {
      throw new BadRequestException('Falta el campo "action".');
    }
    return resolved;
  }

  /**
   * Busca al atleta solo dentro de la cartera del coach (propios, compartidos
   * por colegas y el propio coach). Antes se buscaba por "contains" en toda la
   * base y solo entre role=client: no encontraba al coach cuando la rutina era
   * para el mismo, fallaba con tildes distintas y podia elegir a otra persona
   * con un nombre parecido.
   */
  private async resolveAthlete(
    trainerId: string,
    raw: Payload,
  ): Promise<Athlete> {
    const where = await this.trainerScope.buildVisibleUsersWhere(trainerId, {
      includeSelf: true,
    });
    const people = await this.prisma.user.findMany({
      where,
      select: { id: true, name: true },
    });

    const clientId = asString(raw.clientId);
    if (clientId) {
      const byId = people.find((p) => p.id === clientId);
      if (byId) return { id: byId.id, name: byId.name.trim() };
    }

    const wanted = asString(raw.clientName);
    if (!wanted) {
      throw new BadRequestException('Falta el atleta ("clientName").');
    }
    const match = pickUnique(
      people,
      (p) => p.name,
      wanted,
      'atleta',
      `en tu cartera (${people.length} personas). Revisa que esté vinculado a ti o a un colega`,
    );
    return { id: match.id, name: match.name.trim() };
  }

  private async resolveRoutine(
    athlete: Athlete,
    raw: Payload,
    opts: { fallbackToActive?: boolean } = {},
  ): Promise<LoadedRoutine> {
    const { fallbackToActive = true } = opts;
    const routines = await this.prisma.routine.findMany({
      where: { clientId: athlete.id },
      include: ROUTINE_INCLUDE,
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    });
    if (routines.length === 0) {
      throw new NotFoundException(`${athlete.name} no tiene rutinas.`);
    }

    const routineId = asString(raw.routineId);
    if (routineId) {
      const byId = routines.find((r) => r.id === routineId);
      if (byId) return byId;
    }

    const routineName = asString(raw.routineName);
    if (routineName) {
      const wanted = normalizeText(routineName);
      const exact = routines.filter((r) => normalizeText(r.name) === wanted);
      if (exact.length >= 1) return exact[0];
      const partial = routines.filter((r) => {
        const n = normalizeText(r.name);
        return n.includes(wanted) || wanted.includes(n);
      });
      if (partial.length === 1) return partial[0];
    }

    const active = routines.find((r) => r.isActive);
    if (fallbackToActive && active) return active;

    const catalog = routines
      .map((r) => `"${r.name.trim()}"${r.isActive ? ' (activa)' : ''}`)
      .join(', ');
    throw new NotFoundException(
      `No encontré la rutina ${routineName ? `"${routineName}"` : 'activa'} de ${athlete.name}. Rutinas disponibles: ${catalog}.`,
    );
  }

  private resolveDay(routine: LoadedRoutine, raw: Payload): LoadedDay {
    const day = this.resolveOptionalDay(routine, raw);
    if (!day) {
      throw new BadRequestException(
        `Indica el día ("dayNumber"). Días de "${routine.name}": ${describeDays(routine)}.`,
      );
    }
    return day;
  }

  private resolveOptionalDay(
    routine: LoadedRoutine,
    raw: Payload,
  ): LoadedDay | null {
    const dayNumber = toInt(raw.dayNumber);
    if (dayNumber !== undefined) {
      const byNumber = routine.routineDays.find(
        (d) => d.dayNumber === dayNumber,
      );
      if (byNumber) return byNumber;
    }
    const focus = asString(raw.dayFocus);
    if (focus) {
      const wanted = normalizeText(focus);
      const matches = routine.routineDays.filter((d) => {
        const n = normalizeText(d.focusArea);
        return n === wanted || n.includes(wanted) || wanted.includes(n);
      });
      if (matches.length === 1) return matches[0];
    }
    if (dayNumber !== undefined) {
      throw new BadRequestException(
        `El día ${dayNumber} no existe en "${routine.name}". Días: ${describeDays(routine)}.`,
      );
    }
    return null;
  }

  private resolveExercise(
    routine: LoadedRoutine,
    name: string,
    day: LoadedDay | null,
  ): ExerciseRef {
    const days = day ? [day] : routine.routineDays;
    const refs: ExerciseRef[] = days.flatMap((d) =>
      d.exercises.map((exercise, position) => ({
        dayNumber: d.dayNumber,
        position,
        exercise,
      })),
    );
    const where = day
      ? `el día ${day.dayNumber} (${day.focusArea})`
      : `"${routine.name}"`;
    if (refs.length === 0) {
      throw new NotFoundException(`No hay ejercicios en ${where}.`);
    }
    return pickUnique(
      refs,
      (r) => r.exercise.name,
      name,
      'ejercicio',
      `en ${where}. Ejercicios: ${refs.map((r) => `${r.exercise.name} (día ${r.dayNumber})`).join(', ')}`,
      day ? undefined : 'Indica el "dayNumber" para precisar cuál.',
    );
  }

  // ─── Normalizacion de lo que propone la IA ──────────────────────────────

  private normalizeExercises(value: unknown, note?: string) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => this.normalizeExercise(asObject(item), note))
      .filter((e): e is NormalizedExercise => e !== null);
  }

  private normalizeExercise(
    raw: Payload,
    note?: string,
  ): NormalizedExercise | null {
    const fromSetsReps = parseSetsReps(raw.setsReps);
    const name = asString(raw.name);
    if (!name) return null;
    const intensity = normalizeText(raw.intensity);
    return {
      name,
      muscleGroup: this.resolveMuscleGroup(raw.muscleGroup, undefined, name),
      sets: clampInt(toInt(raw.sets) ?? fromSetsReps.sets, 1, 10) ?? 3,
      reps: toReps(raw.reps) ?? fromSetsReps.reps ?? '8-12',
      restSeconds: clampInt(toRestSeconds(raw.restSeconds), 0, 600) ?? 60,
      observations:
        asString(raw.observations) ??
        (note ? `[Ajuste Equipo Vital Fit: ${note}]` : null),
      targetWeight: toNumber(raw.targetWeight) ?? null,
      intensity: ['low', 'medium', 'high'].includes(intensity)
        ? intensity
        : 'medium',
    };
  }

  private normalizeDays(value: unknown): NormalizedDay[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new BadRequestException(
        'La rutina necesita la lista "days" con al menos un día.',
      );
    }
    const days = value.map((item, idx) => {
      const raw = asObject(item);
      const exercises = this.normalizeExercises(raw.exercises);
      const isRestDay = raw.isRestDay === true || exercises.length === 0;
      return {
        dayNumber: toInt(raw.dayNumber) ?? idx + 1,
        focusArea:
          asString(raw.focusArea) ??
          asString(raw.dayFocus) ??
          (isRestDay ? 'Descanso' : `Día ${idx + 1}`),
        isRestDay,
        restDayNote: isRestDay
          ? (asString(raw.restDayNote) ?? 'Recuperación activa')
          : null,
        exercises: isRestDay ? [] : exercises,
      };
    });

    // dayNumber es unico por rutina: si la IA repite o salta numeros se
    // renumeran en el orden que los propuso.
    const numbers = days.map((d) => d.dayNumber);
    if (
      new Set(numbers).size !== numbers.length ||
      numbers.some((n) => n < 1)
    ) {
      days.forEach((d, idx) => (d.dayNumber = idx + 1));
    }
    if (days.every((d) => d.exercises.length === 0)) {
      throw new BadRequestException(
        'La rutina propuesta no tiene ningún ejercicio.',
      );
    }
    for (const d of days) {
      for (const ex of d.exercises) {
        ex.observations ??= '[Diseñado por Equipo Vital Fit]';
      }
    }
    return days.sort((a, b) => a.dayNumber - b.dayNumber);
  }

  private resolveMuscleGroup(
    value: unknown,
    fallback?: MuscleGroup,
    exerciseName?: string,
  ): MuscleGroup {
    const valid = Object.values(MuscleGroup) as string[];
    const key = normalizeText(value).replace(/ /g, '_');
    if (valid.includes(key)) return key as MuscleGroup;
    for (const source of [normalizeText(value), normalizeText(exerciseName)]) {
      if (!source) continue;
      const alias = MUSCLE_ALIASES.find(([re]) => re.test(source));
      if (alias) return alias[1];
    }
    return fallback ?? MuscleGroup.full_body;
  }

  // ─── Escritura ──────────────────────────────────────────────────────────

  /**
   * Borrar o reemplazar un ejercicio borra en cascada las series que el atleta
   * ya registro. Si alguno de los ejercicios afectados tiene registros, se
   * trabaja sobre una copia nueva de la rutina y la anterior queda inactiva con
   * su historial intacto (mismo criterio que el editor manual de rutinas).
   */
  private async versionIfLogged(
    tx: Tx,
    routine: LoadedRoutine,
    refs: ExerciseRef[],
  ): Promise<{
    routine: LoadedRoutine;
    refs: ExerciseRef[];
    versioned: boolean;
  }> {
    const ids = refs.map((r) => r.exercise.id);
    const logged =
      ids.length > 0
        ? await tx.workoutLog.count({ where: { exerciseId: { in: ids } } })
        : 0;
    if (logged === 0) return { routine, refs, versioned: false };

    if (routine.isActive) {
      await tx.routine.update({
        where: { id: routine.id },
        data: { isActive: false },
      });
    }
    const copy = await tx.routine.create({
      data: {
        name: routine.name,
        description: routine.description,
        trainerId: routine.trainerId,
        clientId: routine.clientId,
        weekCount: routine.weekCount,
        isFavorable: routine.isFavorable,
        isActive: routine.isActive,
        routineDays: {
          create: routine.routineDays.map((d) => ({
            dayNumber: d.dayNumber,
            focusArea: d.focusArea,
            isRestDay: d.isRestDay,
            restDayNote: d.restDayNote,
            exercises: {
              create: d.exercises.map((e) => ({
                name: e.name,
                muscleGroup: e.muscleGroup,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                observations: e.observations,
                videoUrl: e.videoUrl,
                order: e.order,
                targetWeight: e.targetWeight,
                intensity: e.intensity,
              })),
            },
          })),
        },
      },
      include: ROUTINE_INCLUDE,
    });

    const mapped = refs.map((r) => ({
      ...r,
      exercise: this.dayOf(copy, r.dayNumber).exercises[r.position],
    }));
    return { routine: copy, refs: mapped, versioned: true };
  }

  private dayOf(routine: LoadedRoutine, dayNumber: number): LoadedDay {
    const day = routine.routineDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new NotFoundException(`Día ${dayNumber} no encontrado.`);
    }
    return day;
  }

  private async touch(tx: Tx, routineId: string) {
    await tx.routine.update({
      where: { id: routineId },
      data: { updatedAt: new Date() },
    });
  }

  // ─── Mensaje de confirmacion en el chat ─────────────────────────────────

  private buildFollowUp(
    result: Payload,
    raw: Payload,
    athlete: Athlete,
  ): string {
    const rationale = asString(raw.rationale);
    const versionNote = result.versioned
      ? '\n\n🗂️ Como el atleta ya tenía series registradas, guardé la versión anterior como inactiva para no perder su historial.'
      : '';
    const why = rationale ? `\n\n🧠 **Criterio:** ${rationale}` : '';
    const header: Record<string, string> = {
      sustituir_ejercicio: '🩺 **Ajuste aplicado**',
      reemplazar_dia: '⚡ **Día rediseñado**',
      agregar_ejercicio: '➕ **Ejercicios agregados**',
      eliminar_ejercicio: '🗑️ **Ejercicios retirados**',
      crear_rutina: '✨ **Nueva rutina activada**',
      eliminar_rutina: '🗑️ **Rutina eliminada**',
      modificar_rutina: '✏️ **Rutina actualizada**',
      actualizar_metas_nutricionales: '🥗 **Metas nutricionales guardadas**',
    };
    const action = String(result.action);
    let next = '';
    if (action === 'crear_rutina') {
      next = `\n\n📌 ¿Quieres que ajustemos también las metas de calorías y macros de ${athlete.name} para acompañar este estímulo?`;
    } else if (action !== 'actualizar_metas_nutricionales') {
      next =
        '\n\n📌 Recomiendo revisar sensaciones y RIR en la próxima sesión.';
    }
    return `${header[action] ?? '✅ **Acción aplicada**'}: ${String(result.message)}${why}${versionNote}${next}`;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function asObject(value: unknown): Payload {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Payload)
    : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] {
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v : asString(asObject(v).name)))
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map((v) => v.trim());
}

function clampInt(
  value: number | undefined,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function joinNotes(...notes: Array<string | undefined | null | false>) {
  const text = notes.filter(Boolean).join(' · ');
  return text.length > 0 ? text : null;
}

function describeDays(routine: LoadedRoutine): string {
  return routine.routineDays
    .map((d) => `${d.dayNumber} (${d.focusArea})`)
    .join(', ');
}

function toDayCreate(day: NormalizedDay) {
  return {
    dayNumber: day.dayNumber,
    focusArea: day.focusArea,
    isRestDay: day.isRestDay,
    restDayNote: day.restDayNote,
    exercises: {
      create: day.exercises.map((ex, idx) => ({ ...ex, order: idx + 1 })),
    },
  };
}

/**
 * Elige un unico elemento por nombre: exacto (sin tildes ni mayusculas), luego
 * contenido en cualquier direccion y por ultimo por palabras en comun. Si hay
 * empate lanza un error con los candidatos en vez de adivinar.
 */
export function pickUnique<T>(
  items: T[],
  nameOf: (item: T) => string,
  wanted: string,
  label: string,
  notFoundHint: string,
  ambiguousHint = '',
): T {
  const target = normalizeText(wanted);
  const named = items.map((item) => ({ item, n: normalizeText(nameOf(item)) }));

  const decide = (list: typeof named): T | null => {
    if (list.length === 1) return list[0].item;
    if (list.length > 1) {
      const names = [...new Set(list.map((c) => nameOf(c.item).trim()))];
      throw new BadRequestException(
        `"${wanted}" coincide con varios (${label}): ${names.join(' / ')}. ${ambiguousHint}`.trim(),
      );
    }
    return null;
  };

  const exact = decide(named.filter((c) => c.n === target));
  if (exact) return exact;

  if (target.length >= 3) {
    const partial = decide(
      named.filter((c) => c.n.includes(target) || target.includes(c.n)),
    );
    if (partial) return partial;
  }

  const wantedTokens = new Set(tokens(wanted));
  const scored = named
    .map((c) => {
      const t = new Set(tokens(nameOf(c.item)));
      const common = [...wantedTokens].filter((w) => t.has(w)).length;
      const union = new Set([...wantedTokens, ...t]).size;
      return { ...c, score: union === 0 ? 0 : common / union };
    })
    .filter((c) => c.score >= 0.5)
    .sort((a, b) => b.score - a.score);
  if (scored.length > 0) {
    const best = scored.filter((c) => c.score === scored[0].score);
    const picked = decide(best);
    if (picked) return picked;
  }

  throw new NotFoundException(
    `No encontré el ${label} "${wanted}" ${notFoundHint}.`,
  );
}
