import { Inject, Injectable } from '@nestjs/common';
import {
  DIET_RECOMMENDER_SERVICE,
  DietRecommenderPort,
  DietRecommenderContext,
} from '../../domain/ports/diet-recommender.port';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
import {
  DIET_CHAT_MESSAGE_REPOSITORY,
  DietChatMessageRepositoryPort,
} from '../../domain/ports/diet-chat-message.repository.port';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../../routines/domain/ports/routine.repository.port';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Meal, MealType } from '../../domain/entities/meal.entity';
import { NutritionalInfo } from '../../domain/value-objects/nutritional-info.vo';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DietRecommenderContextDto implements DietRecommenderContext {
  @IsOptional() @IsString() goal?: string;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsString() experienceLevel?: string;
  @IsOptional() @IsString() equipmentAccess?: string;
  @IsOptional() @IsString() medicalConditions?: string;
  @IsOptional() @IsString() dietaryPreferences?: string;
  @IsOptional() @IsNumber() targetCalories?: number;
  @IsOptional() @IsString() ecosystemSummary?: string;

  @IsOptional()
  recentMeals?: any[];

  @IsOptional()
  activeRoutine?: any;

  // Note: history is now fetched from the database, not strictly required from DTO.
  @IsOptional()
  history?: { role: string; content: string }[];
}

export class ChatDietRecommendationDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DietRecommenderContextDto)
  context?: DietRecommenderContextDto;
}

@Injectable()
export class ChatDietRecommendationUseCase {
  constructor(
    @Inject(DIET_RECOMMENDER_SERVICE)
    private readonly recommenderService: DietRecommenderPort,
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
    @Inject(DIET_CHAT_MESSAGE_REPOSITORY)
    private readonly chatMessageRepository: DietChatMessageRepositoryPort,
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    userId: string,
    dto: ChatDietRecommendationDto,
  ): Promise<string> {
    const rawMeals = await this.mealRepository.findByUserId(userId);
    const recentMeals = rawMeals
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map((m) => ({
        name: m.name,
        type: m.mealType,
        date: m.date.toISOString().split('T')[0],
        calories: m.nutritionalInfo.calories,
        macros: `P:${m.nutritionalInfo.protein}g, C:${m.nutritionalInfo.carbs}g, G:${m.nutritionalInfo.fat}g`,
        foods: m.foods,
      }));

    if (!dto.context) dto.context = new DietRecommenderContextDto();
    dto.context.recentMeals = recentMeals;

    const todayStr = new Date().toISOString().slice(0, 10);
    const athleteRecord = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const anamnesis =
      athleteRecord?.anamnesisData &&
      typeof athleteRecord.anamnesisData === 'object'
        ? (athleteRecord.anamnesisData as any)
        : {};
    const pact = anamnesis.heroPact;
    const todayWaterLog = Array.isArray(anamnesis.waterLogs)
      ? anamnesis.waterLogs.find((w: any) => w.date === todayStr)
      : null;
    const waterToday = todayWaterLog ? Number(todayWaterLog.liters) : 0;
    const waterTarget = pact?.pillars?.nutrition?.waterLitersTarget || 3.0;
    const lastSleep =
      Array.isArray(anamnesis.sleepLogs) && anamnesis.sleepLogs.length > 0
        ? anamnesis.sleepLogs[anamnesis.sleepLogs.length - 1]
        : null;
    const lastWeighIn =
      Array.isArray(anamnesis.fastedWeighIns) &&
      anamnesis.fastedWeighIns.length > 0
        ? anamnesis.fastedWeighIns[anamnesis.fastedWeighIns.length - 1]
        : null;

    // Fetch recent real WorkoutLogs (sets, reps, weight lifted per week)
    let workoutLogsSummary = '';
    try {
      const recentLogs = await this.prisma.workoutLog.findMany({
        where: { userId },
        include: { exercise: { select: { name: true, reps: true, targetWeight: true } } },
        orderBy: [{ weekNumber: 'desc' }, { updatedAt: 'desc' }],
        take: 15,
      });
      if (recentLogs.length > 0) {
        const logParts = recentLogs.slice(0, 8).map((l) => {
          const sets = Array.isArray(l.setsData)
            ? (l.setsData as any[]).filter((s) => s.completed !== false)
            : [];
          const best = sets.reduce(
            (acc, s) => {
              const w = Number(s.weight) || 0;
              const r = Number(s.reps) || 0;
              return w * (1 + r / 30) > acc.e1rm ? { w, r, e1rm: w * (1 + r / 30) } : acc;
            },
            { w: 0, r: 0, e1rm: 0 },
          );
          return `${l.exercise?.name || 'Ejercicio'} (Sem ${l.weekNumber}: ${best.w}kg×${best.r} reps)`;
        });
        workoutLogsSummary = `Marcas Reales Recientes (WorkoutLogs): ${logParts.join(' | ')}`;
      }
    } catch {
      // ignore if workout_logs query fails
    }

    dto.context.ecosystemSummary = [
      pact?.objectives
        ? `4 Metas de 120 Días: 1) Biométrica: ${pact.objectives.biometric?.currentWeightKg || athleteRecord?.weight || '?'}kg -> ${pact.objectives.biometric?.targetWeightKg || '?'}kg (ritmo ${pact.objectives.biometric?.weeklyDeltaTargetKg || 0.25}kg/sem) | 2) Fuerza: ${pact.objectives.strength?.exerciseName || ''} (${pact.objectives.strength?.currentWeight || '?'} -> ${pact.objectives.strength?.targetWeight || '?'}${pact.weightUnit || 'kg'}) | 3) Dominio Corporal: ${pact.objectives.bodyMastery?.skillName || ''} (${pact.objectives.bodyMastery?.targetMark || ''}) | 4) Aeróbico: ${pact.objectives.aerobic?.enabled ? pact.objectives.aerobic?.targetMark : 'No activo'}`
        : 'Pacto de 120 días en configuración',
      `Agua Hoy: ${waterToday}L / ${waterTarget}L`,
      lastSleep
        ? `Último Sueño: ${lastSleep.hoursSlept}h (${lastSleep.bedtime} a ${lastSleep.wakeTime} | Regularidad ±1h: ${lastSleep.withinOneHourWindow ? 'Cumplida' : 'Desfasada'})`
        : 'Sueño hoy: pendiente de registro',
      lastWeighIn
        ? `Último Pesaje en Ayunas: ${lastWeighIn.weightKg}kg (${lastWeighIn.date})`
        : '',
      workoutLogsSummary,
    ]
      .filter(Boolean)
      .join(' | ');

    // Fetch user active routine if any
    try {
      const userRoutines = await this.routineRepository.findByClientId(userId);
      const activeRoutineEntity = userRoutines.find((r) => r.isActive);
      if (activeRoutineEntity) {
        const volumeByMuscle: Record<string, number> = {};
        for (const d of activeRoutineEntity.days) {
          if (d.isRestDay) continue;
          for (const ex of d.exercises) {
            const grp = (ex.muscleGroup || d.focusArea || 'General').trim();
            volumeByMuscle[grp] = (volumeByMuscle[grp] || 0) + (ex.sets || 0);
          }
        }
        const volumeSummary = Object.entries(volumeByMuscle)
          .map(
            ([m, s]) =>
              `${m}: ${s} series/sem (${s < 6 ? 'Bajo MEV' : s <= 20 ? 'Óptimo MAV' : 'Alto MRV'})`,
          )
          .join(' | ');

        dto.context.activeRoutine = {
          name: activeRoutineEntity.name,
          description: activeRoutineEntity.description,
          volumeSummary,
          days: activeRoutineEntity.days.map((d) => ({
            dayNumber: d.dayNumber,
            focusArea: d.focusArea,
            isRestDay: d.isRestDay,
            exercises: d.exercises.map((ex) => ({
              name: ex.name,
              muscleGroup: ex.muscleGroup,
              sets: ex.sets,
              reps: ex.reps,
              targetWeight: ex.targetWeight,
              observations: ex.observations ?? undefined,
            })),
          })),
        };
      }
    } catch (err) {
      console.error('Error fetching client routine for AI chat:', err);
    }

    // Fetch DB history
    const rawHistory = await this.chatMessageRepository.findByUserId(userId);
    const dbHistory = rawHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // Overwrite the DTO history with what's in the DB to enforce single truth
    dto.context.history = dbHistory;

    // Save User Prompt
    await this.chatMessageRepository.save({
      userId,
      role: 'user',
      content: dto.prompt,
    });

    let aiResponse = await this.recommenderService.generateRecommendation(
      dto.prompt,
      dto.context,
    );

    // Procesar comandos ejecutores [ACCION_COMIDA: {...}] solicitados por el atleta
    const actionMatches = [
      ...aiResponse.matchAll(/\[ACCION_COMIDA:\s*(\{.*?\})\]/gs),
    ];
    for (const match of actionMatches) {
      try {
        const cmd = JSON.parse(match[1]);
        if (cmd.action === 'create_meal' && cmd.name) {
          const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          const mType = validTypes.includes(cmd.mealType)
            ? (cmd.mealType as MealType)
            : MealType.LUNCH;
          const newMeal = new Meal({
            userId,
            name: String(cmd.name),
            description: 'Registrado por el Agente IA',
            mealType: mType,
            nutritionalInfo: new NutritionalInfo({
              calories: Number(cmd.calories) || 0,
              protein: Number(cmd.protein) || 0,
              carbs: Number(cmd.carbs) || 0,
              fat: Number(cmd.fat) || 0,
              fiber: 4,
              sugar: 3,
            }),
            foods: [String(cmd.name)],
            recommendation: 'Registrado en directo desde tu chat IA.',
            goalRating: 'excelente',
          });
          await this.mealRepository.save(newMeal);
          aiResponse = aiResponse.replace(
            match[0],
            `\n> ✅ **Comida guardada en tu registro:** *${cmd.name}* (${cmd.calories || 0} kcal · ${cmd.protein || 0}g P · ${cmd.carbs || 0}g C · ${cmd.fat || 0}g G).\n`,
          );
        } else if (cmd.action === 'update_last_meal' && rawMeals.length > 0) {
          const sorted = [...rawMeals].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
          );
          const last = sorted[0];
          await this.mealRepository.delete(last.id);
          const updatedMeal = new Meal({
            userId,
            name: cmd.name ? String(cmd.name) : last.name,
            description: last.description,
            mealType: last.mealType,
            nutritionalInfo: new NutritionalInfo({
              calories:
                cmd.calories !== undefined
                  ? Number(cmd.calories)
                  : last.nutritionalInfo.calories,
              protein:
                cmd.protein !== undefined
                  ? Number(cmd.protein)
                  : last.nutritionalInfo.protein,
              carbs:
                cmd.carbs !== undefined
                  ? Number(cmd.carbs)
                  : last.nutritionalInfo.carbs,
              fat:
                cmd.fat !== undefined
                  ? Number(cmd.fat)
                  : last.nutritionalInfo.fat,
              fiber: last.nutritionalInfo.fiber,
              sugar: last.nutritionalInfo.sugar,
            }),
            foods: last.foods,
            recommendation: last.recommendation ?? undefined,
            goalRating: last.goalRating ?? undefined,
            date: last.date,
          });
          await this.mealRepository.save(updatedMeal);
          aiResponse = aiResponse.replace(
            match[0],
            `\n> ✅ **Comida actualizada:** *${updatedMeal.name}* (${updatedMeal.nutritionalInfo.calories} kcal · ${updatedMeal.nutritionalInfo.protein}g P).\n`,
          );
        } else if (cmd.action === 'delete_last_meal' && rawMeals.length > 0) {
          const sorted = [...rawMeals].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
          );
          const last = sorted[0];
          await this.mealRepository.delete(last.id);
          aiResponse = aiResponse.replace(
            match[0],
            `\n> 🗑️ **Comida eliminada de tu registro:** *${last.name}*.\n`,
          );
        } else if (cmd.action === 'log_water' && cmd.liters !== undefined) {
          const prevLogs = Array.isArray(anamnesis.waterLogs)
            ? anamnesis.waterLogs.filter((w: any) => w.date !== todayStr)
            : [];
          anamnesis.waterLogs = [
            ...prevLogs.slice(-60),
            {
              date: todayStr,
              liters: Number(cmd.liters),
              targetLiters: waterTarget,
            },
          ];
          await this.prisma.user.update({
            where: { id: userId },
            data: { anamnesisData: anamnesis },
          });
          aiResponse = aiResponse.replace(
            match[0],
            `\n> 💧 **Agua actualizada hoy:** **${cmd.liters} L** registrados en tu plan.\n`,
          );
        } else if (cmd.action === 'log_sleep' && cmd.hoursSlept !== undefined) {
          const prevSleep = Array.isArray(anamnesis.sleepLogs)
            ? anamnesis.sleepLogs.filter((s: any) => s.date !== todayStr)
            : [];
          anamnesis.sleepLogs = [
            ...prevSleep.slice(-60),
            {
              date: todayStr,
              hoursSlept: Number(cmd.hoursSlept),
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
            where: { id: userId },
            data: { anamnesisData: anamnesis },
          });
          aiResponse = aiResponse.replace(
            match[0],
            `\n> 🌙 **Descanso registrado:** **${cmd.hoursSlept}h** (${cmd.bedtime || '22:30'} a ${cmd.wakeTime || '06:00'}).\n`,
          );
        } else if (cmd.action === 'log_weighin' && cmd.weight !== undefined) {
          const weightKg =
            cmd.unit === 'lbs'
              ? Math.round((Number(cmd.weight) / 2.20462) * 100) / 100
              : Math.round(Number(cmd.weight) * 100) / 100;
          const prevWeighIns = Array.isArray(anamnesis.fastedWeighIns)
            ? anamnesis.fastedWeighIns.filter((w: any) => w.date !== todayStr)
            : [];
          const lastEma =
            prevWeighIns.length > 0
              ? prevWeighIns[prevWeighIns.length - 1].movingAverageKg || weightKg
              : weightKg;
          const movingAverageKg =
            Math.round((weightKg * 0.35 + lastEma * 0.65) * 100) / 100;
          anamnesis.fastedWeighIns = [
            ...prevWeighIns.slice(-52),
            {
              date: todayStr,
              weightKg,
              movingAverageKg,
              bodyFatPct:
                cmd.bodyFatPct !== undefined
                  ? Number(cmd.bodyFatPct)
                  : undefined,
            },
          ];
          await this.prisma.user.update({
            where: { id: userId },
            data: { weight: weightKg, anamnesisData: anamnesis },
          });
          aiResponse = aiResponse.replace(
            match[0],
            `\n> ⚖️ **Peso en ayunas registrado:** **${cmd.weight} ${cmd.unit || 'kg'}** (Tendencia: ${movingAverageKg} kg).\n`,
          );
        } else if (cmd.action === 'update_load' && cmd.exerciseName) {
          const routine = await this.prisma.routine.findFirst({
            where: { clientId: userId, isActive: true },
            include: { routineDays: { include: { exercises: true } } },
          });
          if (routine) {
            const weightInKg =
              cmd.targetWeight !== undefined
                ? cmd.unit === 'lbs'
                  ? Math.round((Number(cmd.targetWeight) / 2.20462) * 10) / 10
                  : Number(cmd.targetWeight)
                : undefined;
            for (const day of routine.routineDays) {
              const target = day.exercises.find((ex) =>
                ex.name
                  .toLowerCase()
                  .includes(String(cmd.exerciseName).toLowerCase()),
              );
              if (target) {
                await this.prisma.exercise.update({
                  where: { id: target.id },
                  data: {
                    sets:
                      cmd.sets !== undefined ? Number(cmd.sets) : target.sets,
                    reps:
                      cmd.reps !== undefined ? String(cmd.reps) : target.reps,
                    targetWeight:
                      weightInKg !== undefined
                        ? weightInKg
                        : target.targetWeight,
                  },
                });
                break;
              }
            }
          }
          aiResponse = aiResponse.replace(
            match[0],
            `\n> 🏋️ **Rutina actualizada:** Se ajustó *${cmd.exerciseName}* sin reiniciar tu progreso.\n`,
          );
        } else if (
          cmd.action === 'replace_exercise' &&
          cmd.oldExercise &&
          cmd.newExercise
        ) {
          const routine = await this.prisma.routine.findFirst({
            where: { clientId: userId, isActive: true },
            include: { routineDays: { include: { exercises: true } } },
          });
          if (routine) {
            for (const day of routine.routineDays) {
              const target = day.exercises.find((ex) =>
                ex.name
                  .toLowerCase()
                  .includes(String(cmd.oldExercise).toLowerCase()),
              );
              if (target) {
                await this.prisma.exercise.update({
                  where: { id: target.id },
                  data: { name: String(cmd.newExercise) },
                });
                break;
              }
            }
          }
          aiResponse = aiResponse.replace(
            match[0],
            `\n> 🏋️ **Ejercicio cambiado:** *${cmd.oldExercise}* por *${cmd.newExercise}* en tu rutina activa.\n`,
          );
        } else {
          aiResponse = aiResponse.replace(match[0], '');
        }
      } catch {
        aiResponse = aiResponse.replace(match[0], '');
      }
    }

    aiResponse = aiResponse.replace(/\[ACCION_COMIDA:[^\]]*\]/gs, '').trim();

    // Save AI Response
    await this.chatMessageRepository.save({
      userId,
      role: 'ai',
      content: aiResponse,
    });

    return aiResponse;
  }
}
