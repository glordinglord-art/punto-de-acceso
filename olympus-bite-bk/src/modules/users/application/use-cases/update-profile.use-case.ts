import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dtos/user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.updateProfile({
      name: dto.name,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      dietaryGoal: dto.dietaryGoal,
      experienceLevel: dto.experienceLevel,
      equipmentAccess: dto.equipmentAccess,
      medicalConditions: dto.medicalConditions,
      dietaryPreferences: dto.dietaryPreferences,
      weight: dto.weight,
      height: dto.height,
      targetCalories: dto.targetCalories,
    });

    if (dto.password) {
      const hashedPassword = crypto
        .createHash('sha256')
        .update(dto.password)
        .digest('hex');
      user.changePassword(hashedPassword);
    }

    return this.userRepository.update(user);
  }
}
