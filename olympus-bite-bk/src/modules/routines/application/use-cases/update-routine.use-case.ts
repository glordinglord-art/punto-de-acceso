import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';
import { RoutineDay } from '../../domain/entities/routine-day.entity';
import { Exercise, MuscleGroup } from '../../domain/entities/exercise.entity';
import { CreateRoutineDto } from '../dtos/routine.dto';

@Injectable()
export class UpdateRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(routineId: string, dto: CreateRoutineDto): Promise<Routine> {
    const existing = await this.routineRepository.findById(routineId);
    if (!existing) {
      throw new NotFoundException('Rutina no encontrada');
    }

    const days = dto.days.map((dayDto) => {
      const existingDay = existing.days.find(
        (d) => d.dayNumber === dayDto.dayNumber,
      );
      const usedExerciseIds = new Set<string>();

      const exercises = (dayDto.exercises ?? []).map((e, index) => {
        let matchedId: string | undefined;

        if (existingDay) {
          // 1. Coincidencia exacta por ID enviado desde el frontend
          if (e.id) {
            const byId = existingDay.exercises.find(
              (ex) => ex.id === e.id && !usedExerciseIds.has(ex.id),
            );
            if (byId) matchedId = byId.id;
          }

          // 2. Coincidencia por nombre normalizado dentro del mismo día
          if (!matchedId) {
            const normName = e.name.trim().toLowerCase();
            const byName = existingDay.exercises.find(
              (ex) =>
                !usedExerciseIds.has(ex.id) &&
                ex.name.trim().toLowerCase() === normName,
            );
            if (byName) matchedId = byName.id;
          }

          // 3. Coincidencia por posición (orden) si el entrenador renombró el ejercicio en el mismo slot
          if (!matchedId) {
            const atIndex = existingDay.exercises[index];
            if (atIndex && !usedExerciseIds.has(atIndex.id)) {
              matchedId = atIndex.id;
            }
          }
        }

        if (matchedId) {
          usedExerciseIds.add(matchedId);
        }

        return new Exercise(
          {
            name: e.name,
            muscleGroup:
              (e.muscleGroup as MuscleGroup) || MuscleGroup.FULL_BODY,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            observations: e.observations,
            videoUrl: e.videoUrl,
            order: index + 1,
            targetWeight: e.targetWeight,
            intensity: e.intensity,
          },
          matchedId,
        );
      });

      return new RoutineDay(
        {
          dayNumber: dayDto.dayNumber,
          focusArea: dayDto.focusArea,
          isRestDay: dayDto.isRestDay,
          restDayNote: dayDto.restDayNote,
          exercises,
        },
        existingDay?.id,
      );
    });

    // Actualización in-place no destructiva: NUNCA resetea los WorkoutLogs del atleta
    existing.name = dto.name;
    existing.description = dto.description ?? '';
    existing.weekCount = dto.weekCount ?? existing.weekCount;
    (existing as any).days = days;

    return this.routineRepository.update(existing);
  }
}
