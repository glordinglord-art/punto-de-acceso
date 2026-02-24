import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
