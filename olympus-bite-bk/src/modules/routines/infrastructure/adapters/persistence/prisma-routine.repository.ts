import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { RoutineRepositoryPort } from '../../../domain/ports/routine.repository.port';
import { Routine } from '../../../domain/entities/routine.entity';
import { RoutineDay } from '../../../domain/entities/routine-day.entity';
import { Exercise, MuscleGroup } from '../../../domain/entities/exercise.entity';
import type {
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  Exercise as PrismaExercise,
} from '@prisma/client';

type RoutineWithDays = PrismaRoutine & {
  routineDays: (PrismaRoutineDay & { exercises: PrismaExercise[] })[];
};

@Injectable()
export class PrismaRoutineRepository implements RoutineRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private includeAll = {
    routineDays: {
      orderBy: { dayNumber: 'asc' as const },
      include: {
        exercises: { orderBy: { order: 'asc' as const } },
      },
    },
  };

  private toDomain(raw: RoutineWithDays): Routine {
    const days = raw.routineDays.map((day) => {
      const exercises = day.exercises.map(
        (e) =>
          new Exercise(
            {
              name: e.name,
              muscleGroup: e.muscleGroup as unknown as MuscleGroup,
              sets: e.sets,
              reps: e.reps,
              restSeconds: e.restSeconds,
              observations: e.observations ?? undefined,
              videoUrl: e.videoUrl ?? undefined,
              order: e.order,
            },
            e.id,
          ),
      );

      const routineDay = new RoutineDay(
        {
          dayNumber: day.dayNumber,
          focusArea: day.focusArea,
          isRestDay: day.isRestDay,
          restDayNote: day.restDayNote ?? undefined,
          exercises,
        },
        day.id,
      );
      (routineDay as any).createdAt = day.createdAt;
      (routineDay as any).updatedAt = day.updatedAt;
      return routineDay;
    });

    const routine = new Routine(
      {
        name: raw.name,
        description: raw.description,
        trainerId: raw.trainerId,
        clientId: raw.clientId,
        weekCount: raw.weekCount,
        days,
      },
      raw.id,
    );
    routine.isActive = raw.isActive;
    (routine as any).createdAt = raw.createdAt;
    (routine as any).updatedAt = raw.updatedAt;
    return routine;
  }

  async findById(id: string): Promise<Routine | null> {
    const raw = await this.prisma.routine.findUnique({
      where: { id },
      include: this.includeAll,
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(): Promise<Routine[]> {
    const rows = await this.prisma.routine.findMany({ include: this.includeAll });
    return rows.map((r) => this.toDomain(r));
  }

  async findByClientId(clientId: string): Promise<Routine[]> {
    const rows = await this.prisma.routine.findMany({
      where: { clientId, isActive: true },
      include: this.includeAll,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByTrainerId(trainerId: string): Promise<Routine[]> {
    const rows = await this.prisma.routine.findMany({
      where: { trainerId },
      include: this.includeAll,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: Routine): Promise<Routine> {
    const raw = await this.prisma.routine.create({
      data: {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        trainerId: entity.trainerId,
        clientId: entity.clientId,
        weekCount: entity.weekCount,
        isActive: entity.isActive,
        routineDays: {
          create: entity.days.map((day) => ({
            id: day.id,
            dayNumber: day.dayNumber,
            focusArea: day.focusArea,
            isRestDay: day.isRestDay,
            restDayNote: day.restDayNote,
            exercises: {
              create: day.exercises.map((e) => ({
                id: e.id,
                name: e.name,
                muscleGroup: e.muscleGroup as string as any,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                observations: e.observations,
                videoUrl: e.videoUrl,
                order: e.order,
              })),
            },
          })),
        },
      },
      include: this.includeAll,
    });
    return this.toDomain(raw);
  }

  async update(entity: Routine): Promise<Routine> {
    // Eliminar días y ejercicios anteriores (cascade)
    await this.prisma.routineDay.deleteMany({
      where: { routineId: entity.id },
    });

    const raw = await this.prisma.routine.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        description: entity.description,
        weekCount: entity.weekCount,
        isActive: entity.isActive,
        routineDays: {
          create: entity.days.map((day) => ({
            id: day.id,
            dayNumber: day.dayNumber,
            focusArea: day.focusArea,
            isRestDay: day.isRestDay,
            restDayNote: day.restDayNote,
            exercises: {
              create: day.exercises.map((e) => ({
                id: e.id,
                name: e.name,
                muscleGroup: e.muscleGroup as string as any,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                observations: e.observations,
                videoUrl: e.videoUrl,
                order: e.order,
              })),
            },
          })),
        },
      },
      include: this.includeAll,
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.routine.delete({ where: { id } });
  }
}
