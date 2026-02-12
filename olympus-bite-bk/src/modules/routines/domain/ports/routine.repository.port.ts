import { RepositoryPort } from '../../../../shared/domain/repository.port';
import { Routine } from '../entities/routine.entity';

export const ROUTINE_REPOSITORY = Symbol('ROUTINE_REPOSITORY');

export interface RoutineRepositoryPort extends RepositoryPort<Routine> {
  findByClientId(clientId: string): Promise<Routine[]>;
  findByTrainerId(trainerId: string): Promise<Routine[]>;
}
