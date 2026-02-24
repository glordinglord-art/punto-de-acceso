import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteOnboardingDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsString()
  dietaryGoal: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  equipmentAccess?: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  dietaryPreferences?: string;
}

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string, data: CompleteOnboardingDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.completeOnboarding({
      weight: data.weight,
      height: data.height,
      dietaryGoal: data.dietaryGoal,
      experienceLevel: data.experienceLevel,
      equipmentAccess: data.equipmentAccess,
      medicalConditions: data.medicalConditions,
      dietaryPreferences: data.dietaryPreferences,
    });

    return await this.userRepository.update(user);
  }
}
