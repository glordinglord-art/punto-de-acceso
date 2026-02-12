import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import * as crypto from 'crypto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto, trainerId?: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(dto.password)
      .digest('hex');

    const user = new User({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role ?? UserRole.CLIENT,
      trainerId: trainerId,
      phone: dto.phone,
    });

    return this.userRepository.save(user);
  }
}
