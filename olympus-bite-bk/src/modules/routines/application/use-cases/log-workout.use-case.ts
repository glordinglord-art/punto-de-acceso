import { Inject, Injectable } from '@nestjs/common';
import { ROUTINE_REPOSITORY, RoutineRepositoryPort } from '../../domain/ports/routine.repository.port';
import { WorkoutLog } from '../../domain/entities/workout-log.entity';
import { LogWorkoutDto } from '../dtos/routine.dto';

export const WORKOUT_LOG_REPOSITORY = Symbol('WORKOUT_LOG_REPOSITORY');

export interface WorkoutLogRepositoryPort {
  findByExerciseAndUser(exerciseId: string, userId: string): Promise<WorkoutLog[]>;
  findByRoutineAndUser(routineId: string, userId: string): Promise<WorkoutLog[]>;
  save(log: WorkoutLog): Promise<WorkoutLog>;
  update(log: WorkoutLog): Promise<WorkoutLog>;
}

@Injectable()
export class LogWorkoutUseCase {
  constructor(
    @Inject(WORKOUT_LOG_REPOSITORY)
    private readonly workoutLogRepository: WorkoutLogRepositoryPort,
  ) {}

  async execute(dto: LogWorkoutDto, userId: string): Promise<WorkoutLog> {
    const existing = await this.workoutLogRepository.findByExerciseAndUser(
      dto.exerciseId,
      userId,
    );

    const existingForWeek = existing.find((l) => l.weekNumber === dto.weekNumber);

    if (existingForWeek) {
      existingForWeek.updateLog({
        weight: dto.weight,
        repsDone: dto.repsDone,
        observations: dto.observations,
      });
      return this.workoutLogRepository.update(existingForWeek);
    }

    const log = new WorkoutLog({
      exerciseId: dto.exerciseId,
      userId,
      weekNumber: dto.weekNumber,
      weight: dto.weight,
      repsDone: dto.repsDone,
      observations: dto.observations,
    });

    return this.workoutLogRepository.save(log);
  }

  async getByRoutine(routineId: string, userId: string): Promise<WorkoutLog[]> {
    return this.workoutLogRepository.findByRoutineAndUser(routineId, userId);
  }
}
