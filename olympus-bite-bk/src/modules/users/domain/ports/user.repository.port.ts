import { RepositoryPort } from '../../../../shared/domain/repository.port';
import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort extends RepositoryPort<User> {
  findByEmail(email: string): Promise<User | null>;
  findByTrainerId(trainerId: string): Promise<User[]>;
  linkToTrainer(email: string, trainerId: string): Promise<User | null>;
}
