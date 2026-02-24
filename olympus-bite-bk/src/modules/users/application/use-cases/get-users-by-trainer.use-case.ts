import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetUsersByTrainerUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(trainerId: string): Promise<User[]> {
    return this.userRepository.findByTrainerId(trainerId);
  }
}
