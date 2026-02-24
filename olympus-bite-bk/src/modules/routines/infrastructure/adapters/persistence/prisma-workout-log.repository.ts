import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { WorkoutLogRepositoryPort } from '../../../application/use-cases/log-workout.use-case';
import { WorkoutLog } from '../../../domain/entities/workout-log.entity';
import type { WorkoutLog as PrismaWorkoutLog } from '@prisma/client';

@Injectable()
export class PrismaWorkoutLogRepository implements WorkoutLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: PrismaWorkoutLog): WorkoutLog {
    const log = new WorkoutLog(
      {
        exerciseId: raw.exerciseId,
        userId: raw.userId,
        weekNumber: raw.weekNumber,
        weight: raw.weight ?? undefined,
        repsDone: raw.repsDone ?? undefined,
        observations: raw.observations ?? undefined,
      },
      raw.id,
    );
    (log as any).createdAt = raw.createdAt;
    (log as any).updatedAt = raw.updatedAt;
    return log;
  }

  async findByExerciseAndUser(
    exerciseId: string,
    userId: string,
  ): Promise<WorkoutLog[]> {
    const rows = await this.prisma.workoutLog.findMany({
      where: { exerciseId, userId },
      orderBy: { weekNumber: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByRoutineAndUser(
    routineId: string,
    userId: string,
  ): Promise<WorkoutLog[]> {
    const rows = await this.prisma.workoutLog.findMany({
      where: {
        userId,
        exercise: {
          routineDay: {
            routineId,
          },
        },
      },
      orderBy: [{ weekNumber: 'asc' }],
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: WorkoutLog): Promise<WorkoutLog> {
    const raw = await this.prisma.workoutLog.create({
      data: {
        id: entity.id,
        exerciseId: entity.exerciseId,
        userId: entity.userId,
        weekNumber: entity.weekNumber,
        weight: entity.weight,
        repsDone: entity.repsDone,
        observations: entity.observations,
      },
    });
    return this.toDomain(raw);
  }

  async update(entity: WorkoutLog): Promise<WorkoutLog> {
    const raw = await this.prisma.workoutLog.update({
      where: { id: entity.id },
      data: {
        weight: entity.weight,
        repsDone: entity.repsDone,
        observations: entity.observations,
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workoutLog.delete({
      where: { id },
    });
  }
}
