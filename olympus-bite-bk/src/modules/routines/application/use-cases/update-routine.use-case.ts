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
      const exercises = (dayDto.exercises ?? []).map(
        (e, index) =>
          new Exercise({
            name: e.name,
            muscleGroup:
              (e.muscleGroup as MuscleGroup) || MuscleGroup.FULL_BODY,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            observations: e.observations,
            videoUrl: e.videoUrl,
            order: index + 1,
          }),
      );

      return new RoutineDay({
        dayNumber: dayDto.dayNumber,
        focusArea: dayDto.focusArea,
        isRestDay: dayDto.isRestDay,
        restDayNote: dayDto.restDayNote,
        exercises,
      });
    });

    existing.name = dto.name;
    existing.description = dto.description ?? '';
    existing.weekCount = dto.weekCount ?? existing.weekCount;
    (existing as any).days = days;

    return this.routineRepository.update(existing);
  }
}
