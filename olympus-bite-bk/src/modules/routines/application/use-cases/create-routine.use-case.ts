import { Inject, Injectable } from '@nestjs/common';
import { ROUTINE_REPOSITORY, RoutineRepositoryPort } from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';
import { RoutineDay } from '../../domain/entities/routine-day.entity';
import { Exercise, MuscleGroup } from '../../domain/entities/exercise.entity';
import { CreateRoutineDto } from '../dtos/routine.dto';

@Injectable()
export class CreateRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(dto: CreateRoutineDto, trainerId: string): Promise<Routine> {
    const days = dto.days.map((dayDto) => {
      const exercises = (dayDto.exercises ?? []).map(
        (e, index) =>
          new Exercise({
            name: e.name,
            muscleGroup: (e.muscleGroup as MuscleGroup) || MuscleGroup.FULL_BODY,
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

    const routine = new Routine({
      name: dto.name,
      description: dto.description,
      trainerId,
      clientId: dto.clientId,
      weekCount: dto.weekCount,
      days,
    });

    return this.routineRepository.save(routine);
  }
}
