import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../../application/use-cases/get-user.use-case';
import { GetUsersByTrainerUseCase } from '../../../application/use-cases/get-users-by-trainer.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../../application/dtos/user.dto';
import { ChangePasswordDto } from '../../../application/use-cases/change-password.use-case';
import { UserResponseDto } from '../../../application/dtos/user-response.dto';
import {
  CompleteOnboardingUseCase,
  CompleteOnboardingDto,
} from '../../../application/use-cases/complete-onboarding.use-case';
import { ProcessOnboardingUseCase } from '../../../application/use-cases/process-onboarding.use-case';
import { OnboardingSubmissionDto } from '../../../application/dtos/onboarding-submission.dto';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../domain/ports/user.repository.port';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersByTrainerUseCase: GetUsersByTrainerUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    private readonly processOnboardingUseCase: ProcessOnboardingUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.getUserUseCase.execute(id);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Get('trainer/:trainerId')
  async getUsersByTrainer(@Param('trainerId') trainerId: string) {
    const users = await this.getUsersByTrainerUseCase.execute(trainerId);
    return {
      success: true,
      data: users.map((u) => UserResponseDto.fromEntity(u)),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.updateProfileUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.changePasswordUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/onboarding')
  async completeOnboarding(
    @Param('id') id: string,
    @Body() dto: CompleteOnboardingDto,
  ) {
    const user = await this.completeOnboardingUseCase.execute(id, dto);
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Post(':id/onboarding')
  @HttpCode(HttpStatus.OK)
  async submitOnboarding(
    @Param('id') id: string,
    @Body() dto: OnboardingSubmissionDto,
  ) {
    const result = await this.processOnboardingUseCase.execute(id, dto);
    return { success: true, data: result };
  }

  /**
   * 1. Disparar / Reiniciar la Radiografía del Atleta (Soluciona que a cualquiera de los 13 atletas le salga el nuevo formulario)
   */
  @Post(':id/reset-discovery')
  @HttpCode(HttpStatus.OK)
  async resetDiscovery(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};

    user.updateProfile({
      onboardingCompleted: false,
      anamnesisData: {
        ...currentData,
        cycleStatus: 'NEEDS_DISCOVERY',
        discoveryVersion: 2,
        discoveryRequestedAt: new Date().toISOString(),
      },
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      message: 'Radiografía habilitada para el atleta',
      data: UserResponseDto.fromEntity(updated),
    };
  }

  /**
   * 2. Recibir la nueva Radiografía Profunda del Atleta (5 Bloques) y preparar el borrador del Pacto de 120 Días
   */
  @Post(':id/discovery')
  @HttpCode(HttpStatus.OK)
  async submitDiscovery(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const unit = body.weightUnit === 'lbs' ? 'lbs' : 'kg';
    const rawWeight = Number(body.weight) || user.weight || 70;
    const weightKg =
      unit === 'lbs'
        ? Number((rawWeight / 2.20462).toFixed(1))
        : Number(rawWeight.toFixed(1));
    const heightCm = Number(body.height) || user.height || 170;
    const age = Number(body.age) || user.age || 26;
    const gender = body.gender || user.gender || 'male';

    // Cálculo Mifflin-St Jeor base para el taller del entrenador
    const bmr = Math.round(
      gender === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161,
    );
    const mult =
      body.activityLevel === 'active'
        ? 1.55
        : body.activityLevel === 'moderate'
          ? 1.4
          : 1.25;
    const tdee = Math.round(bmr * mult);

    const biometricMode = body.biometricMode || 'surplus'; // 'surplus' | 'deficit' | 'recomp'
    const suggestedCalories =
      biometricMode === 'surplus'
        ? tdee + 250
        : biometricMode === 'deficit'
          ? Math.max(1300, tdee - 450)
          : tdee;
    const suggestedProtein = Math.round(weightKg * 2.0);
    const suggestedFats = Math.round(weightKg * 0.9);
    const suggestedCarbs = Math.max(
      80,
      Math.round(
        (suggestedCalories - suggestedProtein * 4 - suggestedFats * 9) / 4,
      ),
    );
    const waterLitersTarget = Number(
      ((weightKg * 35 + 500) / 1000).toFixed(1),
    );
    const weeklyDeltaTarget =
      biometricMode === 'surplus'
        ? 0.25
        : biometricMode === 'deficit'
          ? -0.5
          : 0;

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};

    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + 120);
    const endDate = endDateObj.toISOString().split('T')[0];

    const draftHeroPact = currentData.heroPact || {
      status: 'PENDING_MENTOR_REVIEW',
      cycleDays: 120,
      startDate,
      endDate,
      weightUnit: unit,
      objectives: {
        biometric: {
          mode: biometricMode,
          title:
            biometricMode === 'surplus'
              ? 'Volumen Limpio'
              : biometricMode === 'deficit'
                ? 'Definición Atlética'
                : 'Recomposición Corporal',
          startWeightKg: weightKg,
          targetWeightKg:
            Number(body.targetWeightKg) ||
            Number((weightKg + weeklyDeltaTarget * 16).toFixed(1)),
          currentWeightKg: weightKg,
          weeklyDeltaTargetKg: weeklyDeltaTarget,
          startBodyFatPct: Number(body.estimatedBodyFat) || 18,
          targetBodyFatPct:
            Number(body.targetBodyFat) ||
            (biometricMode === 'deficit' ? 12 : 15),
          why:
            body.biometricWhy ||
            'Optimizar relación fuerza-peso y composición corporal en 16 semanas.',
        },
        strength: {
          exerciseName: body.strengthExercise || 'Press Banca con Mancuernas',
          startWeight: Number(body.strengthCurrentWeight) || 25,
          targetWeight: Number(body.strengthTargetWeight) || 40,
          currentWeight: Number(body.strengthCurrentWeight) || 25,
          unit,
          weeklyProgression:
            Number(
              (
                ((Number(body.strengthTargetWeight) || 40) -
                  (Number(body.strengthCurrentWeight) || 25)) /
                16
              ).toFixed(2),
            ) || 1.25,
          why:
            body.strengthWhy ||
            'Sobrecarga progresiva mecánica y reclutamiento de unidades motoras de alto umbral.',
        },
        bodyMastery: {
          skillName: body.masterySkill || 'Parada de Manos (Handstand)',
          startMark: body.masteryCurrentLevel || 'Pino asistido en pared',
          targetMark: body.masteryTargetLevel || '15s libre controlado',
          currentMark: body.masteryCurrentLevel || 'Pino asistido en pared',
          weeklyPracticeTarget: '3 bloques técnicos/semana (15 min sin fallo)',
          why:
            body.masteryWhy ||
            'Control propioceptivo, estabilidad escapular y transferencia híbrida.',
        },
        aerobic: {
          enabled: Boolean(body.aerobicEnabled),
          metricName: body.aerobicSkill || 'Carrera 5K / Capacidad Aeróbica',
          startMark: body.aerobicCurrentMark || 'Base actual',
          targetMark: body.aerobicTargetMark || '5K en < 24 min',
          currentMark: body.aerobicCurrentMark || 'Base actual',
          why: 'Capacidad mitocondrial para acelerar la recuperación entre series pesadas.',
        },
      },
      pillars: {
        training: {
          daysPerWeek: Number(body.trainingDaysPerWeek) || 4,
          minutesPerSession: Number(body.minutesPerSession) || 60,
          weeklyHoursRequired: Number(
            (
              ((Number(body.trainingDaysPerWeek) || 4) *
                (Number(body.minutesPerSession) || 60)) /
              60
            ).toFixed(1),
          ),
          cycleWhy:
            'Mesociclo Híbrido de 16 semanas: Acumulación (Sem 1-4) → Intensificación (Sem 5-8) → Transferencia (Sem 9-12) → Realización (Sem 13-16).',
        },
        nutrition: {
          calories: suggestedCalories,
          protein: suggestedProtein,
          carbs: suggestedCarbs,
          fats: suggestedFats,
          waterLitersTarget,
          nutritionWhy:
            biometricMode === 'surplus'
              ? `Superávit limpio (+250 kcal) para sostener un ritmo de +${weeklyDeltaTarget} kg/semana sin acumular tejido adiposo.`
              : biometricMode === 'deficit'
                ? `Déficit calibrado para oxidar ${Math.abs(weeklyDeltaTarget)} kg/semana blindando la masa muscular con ${suggestedProtein}g de proteína.`
                : `Normocalórica de alta densidad proteica (${suggestedProtein}g) e hidratación (${waterLitersTarget}L) para recomposición.`,
        },
        recovery: {
          sleepHoursTarget: Number(body.sleepHoursTarget) || 7.5,
          targetBedtime: body.targetBedtime || '22:30',
          targetWakeTime: body.targetWakeTime || '06:00',
          toleranceMinutes: 60,
          recoveryWhy:
            'Dormir 7.5-8h levantándote siempre a la misma hora (±1h) sincroniza el pulso de hormona de crecimiento y graba los patrones motores en fase REM.',
        },
      },
    };

    const nextAnamnesis = {
      ...currentData,
      cycleStatus: 'PENDING_PACT',
      discoveryVersion: 2,
      discoveryCompletedAt: new Date().toISOString(),
      discoveryAnswers: body,
      heroPact: draftHeroPact,
      fastedWeighIns: currentData.fastedWeighIns || [
        {
          id: `w-${Date.now()}`,
          date: startDate,
          weightKg,
          trendWeightKg: weightKg,
          unit,
          deltaKg: 0,
          bodyFatPct: Number(body.estimatedBodyFat) || null,
          notes: 'Peso base inicial en ayunas',
        },
      ],
    };

    user.completeOnboarding({
      weight: weightKg,
      height: heightCm,
      dietaryGoal:
        biometricMode === 'surplus'
          ? 'muscle_gain'
          : biometricMode === 'deficit'
            ? 'weight_loss'
            : 'recomposition',
      targetCalories: user.targetCalories || suggestedCalories,
      targetProtein: user.targetProtein || suggestedProtein,
      targetCarbs: user.targetCarbs || suggestedCarbs,
      targetFats: user.targetFats || suggestedFats,
      weightUnitPreference: unit,
      gender,
      age,
      anamnesisData: nextAnamnesis,
      experienceLevel: body.experienceLevel || 'intermediate',
      equipmentAccess: body.equipmentAccess || 'full_gym',
      medicalConditions: body.injuries || 'Ninguna reportada',
      dietaryPreferences: body.nutritionWeakness || 'Estándar',
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      data: UserResponseDto.fromEntity(updated),
    };
  }

  /**
   * 3. Guardar / Activar el Pacto de los 120 Días (Entrenador o Atleta al dar el SÍ)
   */
  @Put(':id/hero-pact')
  @HttpCode(HttpStatus.OK)
  async updateHeroPact(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};
    const existingPact = currentData.heroPact || {};

    const updatedPact = {
      ...existingPact,
      ...body,
      objectives: {
        ...(existingPact.objectives || {}),
        ...(body.objectives || {}),
      },
      pillars: {
        ...(existingPact.pillars || {}),
        ...(body.pillars || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    const nutritionPillar = updatedPact.pillars?.nutrition;

    user.updateProfile({
      targetCalories:
        nutritionPillar?.calories !== undefined
          ? Number(nutritionPillar.calories)
          : user.targetCalories,
      targetProtein:
        nutritionPillar?.protein !== undefined
          ? Number(nutritionPillar.protein)
          : user.targetProtein,
      targetCarbs:
        nutritionPillar?.carbs !== undefined
          ? Number(nutritionPillar.carbs)
          : user.targetCarbs,
      targetFats:
        nutritionPillar?.fats !== undefined
          ? Number(nutritionPillar.fats)
          : user.targetFats,
      weightUnitPreference:
        updatedPact.weightUnit || user.weightUnitPreference,
      onboardingCompleted: true,
      anamnesisData: {
        ...currentData,
        cycleStatus: body.status === 'ACTIVE' ? 'ACTIVE_CYCLE' : (currentData.cycleStatus || 'PENDING_PACT'),
        heroPact: updatedPact,
      },
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      data: UserResponseDto.fromEntity(updated),
    };
  }

  /**
   * 4. Registrar Pesaje Semanal en Ayunas (+0.25kg / -0.50kg) y % Grasa Mensual (US Navy / Manual)
   */
  @Post(':id/weekly-weighin')
  @HttpCode(HttpStatus.OK)
  async logWeeklyWeighIn(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const unit = body.unit === 'lbs' ? 'lbs' : 'kg';
    const rawWeight = Number(body.weight);
    const weightKg =
      unit === 'lbs'
        ? Number((rawWeight / 2.20462).toFixed(2))
        : Number(rawWeight.toFixed(2));

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};
    const history: any[] = Array.isArray(currentData.fastedWeighIns)
      ? [...currentData.fastedWeighIns]
      : [];

    const prevEntry = history.length > 0 ? history[history.length - 1] : null;
    const prevWeightKg = prevEntry ? Number(prevEntry.weightKg) : (user.weight || weightKg);
    const prevTrendKg = prevEntry
      ? Number(prevEntry.trendWeightKg || prevEntry.weightKg)
      : prevWeightKg;

    // Algoritmo Peso Tendencial (Media Móvil Exponencial estilo MacroFactor)
    const trendWeightKg = Number(
      (0.35 * weightKg + 0.65 * prevTrendKg).toFixed(2),
    );
    const deltaKg = Number((weightKg - prevWeightKg).toFixed(2));

    // Cálculo opcional de % Grasa por método US Navy si envía cuello + cintura
    let bodyFatPct = body.bodyFatPct ? Number(body.bodyFatPct) : null;
    const neckCm = body.neckCm ? Number(body.neckCm) : null;
    const waistCm = body.waistCm ? Number(body.waistCm) : null;
    const hipCm = body.hipCm ? Number(body.hipCm) : null;
    const heightCm = user.height || 170;

    if (!bodyFatPct && neckCm && waistCm && waistCm > neckCm) {
      if (user.gender === 'female' && hipCm) {
        const navy =
          495 /
            (1.29579 -
              0.35004 * Math.log10(waistCm + hipCm - neckCm) +
              0.221 * Math.log10(heightCm)) -
          450;
        bodyFatPct = Number(Math.max(8, Math.min(50, navy)).toFixed(1));
      } else {
        const navy =
          495 /
            (1.0324 -
              0.19077 * Math.log10(waistCm - neckCm) +
              0.15456 * Math.log10(heightCm)) -
          450;
        bodyFatPct = Number(Math.max(4, Math.min(45, navy)).toFixed(1));
      }
    }

    const entry = {
      id: `w-${Date.now()}`,
      date: body.date || new Date().toISOString().split('T')[0],
      weightKg,
      trendWeightKg,
      unit,
      deltaKg,
      neckCm,
      waistCm,
      hipCm,
      bodyFatPct,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };

    history.push(entry);

    // Actualizar peso actual en el Pacto Biométrico
    const heroPact = currentData.heroPact || {};
    if (heroPact.objectives?.biometric) {
      heroPact.objectives.biometric.currentWeightKg = weightKg;
      if (bodyFatPct) {
        heroPact.objectives.biometric.currentBodyFatPct = bodyFatPct;
      }
    }

    user.updateProfile({
      weight: weightKg,
      anamnesisData: {
        ...currentData,
        heroPact,
        fastedWeighIns: history.slice(-32),
      },
    });

    const updated = await this.userRepository.update(user);

    // Sincronizar automáticamente con la tabla physical_assessments si se suministran medidas o % de grasa
    if (bodyFatPct !== null || waistCm !== null) {
      try {
        const assessmentId = randomUUID();
        const now = new Date();
        const assessmentDate = body.date ? new Date(body.date) : now;
        const trainerId = user.trainerId || user.id;

        await this.prisma.$executeRawUnsafe(
          `INSERT INTO physical_assessments (
            id, client_id, trainer_id, date,
            neck, waist, hip,
            weight, fat_percentage,
            notes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9,
            $10, $11, $12
          )`,
          assessmentId,
          user.id,
          trainerId,
          assessmentDate,
          neckCm,
          waistCm,
          hipCm,
          weightKg,
          bodyFatPct,
          body.notes || 'Registro automático desde Bitácora Semanal / Valoración Corporal',
          now,
          now,
        );
      } catch (err) {
        console.warn('Aviso: No se pudo registrar en physical_assessments:', err);
      }
    }

    return {
      success: true,
      data: {
        user: UserResponseDto.fromEntity(updated),
        entry,
      },
    };
  }

  /**
   * 5. Registrar Sueño y Regularidad Circadiana (±1 Hora con Aritmética Circular de 24h)
   */
  @Post(':id/sleep-log')
  @HttpCode(HttpStatus.OK)
  async logSleepRegularity(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};
    const recoveryPillar = currentData.heroPact?.pillars?.recovery || {
      targetBedtime: '22:30',
      targetWakeTime: '06:00',
      sleepHoursTarget: 7.5,
      toleranceMinutes: 60,
    };

    const toMinutes = (hhmm: string) => {
      const [h, m] = (hhmm || '00:00').split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    // Distancia circular mínima en reloj de 24h (resuelve el cruce de medianoche 23:30 vs 00:15)
    const circularDiffMinutes = (t1: string, t2: string) => {
      const m1 = toMinutes(t1);
      const m2 = toMinutes(t2);
      const diff = Math.abs(m1 - m2);
      return Math.min(diff, 1440 - diff);
    };

    const bedtime = body.bedtime || '23:00';
    const wakeTime = body.wakeTime || '06:30';
    const bedDeviationMin = circularDiffMinutes(
      bedtime,
      recoveryPillar.targetBedtime || '22:30',
    );
    const wakeDeviationMin = circularDiffMinutes(
      wakeTime,
      recoveryPillar.targetWakeTime || '06:00',
    );

    // Cálculo de horas dormidas reales cruzando medianoche
    const bedMin = toMinutes(bedtime);
    const wakeMin = toMinutes(wakeTime);
    const durationMin =
      wakeMin >= bedMin ? wakeMin - bedMin : 1440 - bedMin + wakeMin;
    const hoursSlept =
      body.hoursSlept !== undefined
        ? Number(body.hoursSlept)
        : Number((durationMin / 60).toFixed(1));

    const withinOneHourWindow = wakeDeviationMin <= 60 && bedDeviationMin <= 60;
    const meetsHoursTarget = hoursSlept >= 7 && hoursSlept <= 9;

    const sleepLogs: any[] = Array.isArray(currentData.sleepLogs)
      ? [...currentData.sleepLogs]
      : [];

    const todayStr = body.date || new Date().toISOString().split('T')[0];
    const filtered = sleepLogs.filter((s) => s.date !== todayStr);

    const newLog = {
      id: `sl-${Date.now()}`,
      date: todayStr,
      bedtime,
      wakeTime,
      hoursSlept,
      bedDeviationMin,
      wakeDeviationMin,
      withinOneHourWindow,
      meetsHoursTarget,
      quality: body.quality || 'good',
      createdAt: new Date().toISOString(),
    };

    filtered.push(newLog);

    user.updateProfile({
      anamnesisData: {
        ...currentData,
        sleepLogs: filtered.slice(-60),
      },
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      data: {
        user: UserResponseDto.fromEntity(updated),
        log: newLog,
      },
    };
  }

  /**
   * 6. Publicar Reporte Semanal del Entrenador a 1 Clic (Bitácora de Mentoría)
   */
  @Post(':id/weekly-report')
  @HttpCode(HttpStatus.OK)
  async publishWeeklyReport(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Atleta no encontrado');

    const currentData =
      user.anamnesisData && typeof user.anamnesisData === 'object'
        ? user.anamnesisData
        : {};
    const reports: any[] = Array.isArray(currentData.weeklyReports)
      ? [...currentData.weeklyReports]
      : [];

    const report = {
      id: `rep-${Date.now()}`,
      weekNumber: Number(body.weekNumber) || reports.length + 1,
      date: new Date().toISOString().split('T')[0],
      trainingScore: Number(body.trainingScore) ?? 100,
      nutritionScore: Number(body.nutritionScore) ?? 100,
      recoveryScore: Number(body.recoveryScore) ?? 100,
      trainerNotes: body.trainerNotes || '',
      nextWeekFocus: body.nextWeekFocus || '',
      isDeloadWeek: Boolean(body.isDeloadWeek),
      trainerName: body.trainerName || 'Tu Mentor',
      createdAt: new Date().toISOString(),
    };

    const withoutSameWeek = reports.filter(
      (r) => r.weekNumber !== report.weekNumber,
    );
    withoutSameWeek.push(report);
    withoutSameWeek.sort((a, b) => b.weekNumber - a.weekNumber);

    user.updateProfile({
      anamnesisData: {
        ...currentData,
        weeklyReports: withoutSameWeek,
      },
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      data: {
        user: UserResponseDto.fromEntity(updated),
        report,
      },
    };
  }

  @Patch('trainer/:trainerId/link-client')
  async linkClient(
    @Param('trainerId') trainerId: string,
    @Body() body: { email: string },
  ) {
    const user = await this.userRepository.linkToTrainer(body.email, trainerId);
    if (!user)
      throw new NotFoundException(
        'No se encontró ningún usuario con ese email',
      );
    return { success: true, data: UserResponseDto.fromEntity(user) };
  }

  @Put(':id/biological-phase')
  async updateBiologicalPhase(
    @Param('id') id: string,
    @Body() dto: { phase: string },
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const weight = user.weight && user.weight > 30 ? user.weight : 75;
    const height = user.height && user.height > 100 ? user.height : 175;
    const bmr = 10 * weight + 6.25 * height - 5 * 26 + 5;
    const tdee = Math.round(bmr * 1.55);

    const phase = dto.phase.toLowerCase();
    let targetCalories = tdee;
    if (
      phase.includes('deficit') ||
      phase.includes('perder') ||
      phase.includes('defin')
    ) {
      targetCalories = Math.round(tdee * 0.8);
    } else if (
      phase.includes('volum') ||
      phase.includes('muscul') ||
      phase.includes('gain') ||
      phase.includes('aumento')
    ) {
      targetCalories = Math.round(tdee * 1.15);
    } else {
      targetCalories = tdee;
    }

    user.updateProfile({
      dietaryGoal: dto.phase,
      targetCalories,
    });

    const updated = await this.userRepository.update(user);
    return {
      success: true,
      message: `Fase biológica actualizada a "${dto.phase}". Requerimientos metabólicos recalculados: ${targetCalories} kcal.`,
      data: UserResponseDto.fromEntity(updated),
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRepository.delete(id);
    return { success: true };
  }
}
