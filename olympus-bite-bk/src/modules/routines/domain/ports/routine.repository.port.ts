import { RepositoryPort } from '../../../../shared/domain/repository.port';
import { Routine } from '../entities/routine.entity';

export const ROUTINE_REPOSITORY = Symbol('ROUTINE_REPOSITORY');

export interface RoutineRepositoryPort extends RepositoryPort<Routine> {
  findByClientId(clientId: string): Promise<Routine[]>;
  findByTrainerId(trainerId: string): Promise<Routine[]>;
  /** Rutinas creadas por el coach o asignadas a cualquiera de `clientIds`. */
  findVisibleToTrainer(
    trainerId: string,
    clientIds: string[],
  ): Promise<Routine[]>;
  hasLogs(routineId: string): Promise<boolean>;
  swapDays(
    routineId: string,
    dayNumberA: number,
    dayNumberB: number,
  ): Promise<Routine>;
}
