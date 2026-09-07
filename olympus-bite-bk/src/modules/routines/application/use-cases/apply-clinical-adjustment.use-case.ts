import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { MuscleGroup } from '@prisma/client';

export interface ApplyClinicalAdjustmentDto {
  routineId: string;
  targetExerciseId: string;
  replacementExercise: {
    name: string;
    muscleGroup?: string;
    sets?: number;
    reps?: string;
    restSeconds?: number;
    observations?: string;
    targetWeight?: number;
    intensity?: string;
  };
  clinicalRationale?: string;
  coachNote?: string;
}

@Injectable()
export class ApplyClinicalAdjustmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ApplyClinicalAdjustmentDto) {
    const existing = await this.prisma.exercise.findUnique({
      where: { id: dto.targetExerciseId },
      include: {
        routineDay: {
          include: {
            routine: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'El ejercicio a reemplazar no fue encontrado en la base de datos',
      );
    }

    // Determine valid Prisma muscle group enum or fallback
    let muscleGroupEnum: MuscleGroup = existing.muscleGroup;
    if (dto.replacementExercise.muscleGroup) {
      const candidate =
        dto.replacementExercise.muscleGroup.toLowerCase() as MuscleGroup;
      if (Object.values(MuscleGroup).includes(candidate)) {
        muscleGroupEnum = candidate;
      }
    }

    const observations = [
      dto.replacementExercise.observations,
      dto.clinicalRationale ? `[Clínico: ${dto.clinicalRationale}]` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const updated = await this.prisma.exercise.update({
      where: { id: dto.targetExerciseId },
      data: {
        name: dto.replacementExercise.name,
        muscleGroup: muscleGroupEnum,
        sets: dto.replacementExercise.sets ?? existing.sets,
        reps: dto.replacementExercise.reps ?? existing.reps,
        restSeconds:
          dto.replacementExercise.restSeconds ?? existing.restSeconds,
        observations: observations || existing.observations,
        intensity: dto.replacementExercise.intensity ?? existing.intensity,
      },
    });

    // Touch routine to bump updatedAt
    await this.prisma.routine.update({
      where: { id: existing.routineDay.routineId },
      data: { updatedAt: new Date() },
    });

    return {
      success: true,
      message: 'Ajuste clínico aprobado y sincronizado exitosamente.',
      data: updated,
    };
  }
}
