import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  CLINICAL_DIRECTOR_PORT,
  ClinicalDirectorPort,
  ClinicalProposalResult,
} from '../../domain/ports/clinical-director.port';

export interface ProposeClinicalAdjustmentDto {
  routineId: string;
  exerciseId: string;
  coachNote: string;
}

@Injectable()
export class ProposeClinicalAdjustmentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLINICAL_DIRECTOR_PORT)
    private readonly clinicalDirector: ClinicalDirectorPort,
  ) {}

  async execute(
    dto: ProposeClinicalAdjustmentDto,
  ): Promise<ClinicalProposalResult> {
    const routine = await this.prisma.routine.findUnique({
      where: { id: dto.routineId },
      include: {
        client: true,
        routineDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!routine) {
      throw new NotFoundException('Rutina no encontrada');
    }

    // Find the target exercise inside routine days
    let targetExercise: any = null;
    let targetDay: any = null;

    for (const day of routine.routineDays) {
      const found = day.exercises.find((ex) => ex.id === dto.exerciseId);
      if (found) {
        targetExercise = found;
        targetDay = day;
        break;
      }
    }

    if (!targetExercise) {
      // If exerciseId was not matched, take the first exercise mentioned or first in active day
      targetDay = routine.routineDays[0];
      targetExercise = targetDay?.exercises[0];
    }

    if (!targetExercise) {
      throw new NotFoundException(
        'No se encontró ningún ejercicio en la rutina para evaluar',
      );
    }

    const client = routine.client;

    const proposal = await this.clinicalDirector.proposeAdjustment({
      clientName: client?.name || 'Atleta Vital Fit',
      medicalConditions: client?.medicalConditions ?? undefined,
      experienceLevel: client?.experienceLevel ?? undefined,
      dietaryGoal: client?.dietaryGoal ?? undefined,
      routineName: routine.name,
      dayFocusArea: targetDay?.focusArea || 'Entrenamiento General',
      currentExercise: {
        id: targetExercise.id,
        name: targetExercise.name,
        muscleGroup: String(targetExercise.muscleGroup),
        sets: targetExercise.sets,
        reps: targetExercise.reps,
        observations: targetExercise.observations ?? undefined,
        targetWeight: targetExercise.targetWeight ?? undefined,
        intensity: targetExercise.intensity ?? 'medium',
      },
      coachNote: dto.coachNote,
    });

    return proposal;
  }
}
