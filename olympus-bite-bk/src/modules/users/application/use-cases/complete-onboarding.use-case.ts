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

  @IsOptional()
  @IsNumber()
  targetCalories?: number;
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

    // Cálculo metabólico automático (BMR Mifflin-St Jeor + Factor TDEE)
    let targetCalories = data.targetCalories;
    if (!targetCalories && data.weight && data.height) {
      const bmr = 10 * data.weight + 6.25 * data.height - 5 * 26 + 5;
      const tdee = Math.round(bmr * 1.55);
      const goal = (data.dietaryGoal || '').toLowerCase();
      if (
        goal.includes('lose') ||
        goal.includes('defin') ||
        goal.includes('perder') ||
        goal.includes('deficit')
      ) {
        targetCalories = Math.round(tdee * 0.8);
      } else if (
        goal.includes('gain') ||
        goal.includes('volum') ||
        goal.includes('muscul') ||
        goal.includes('aumento')
      ) {
        targetCalories = Math.round(tdee * 1.15);
      } else {
        targetCalories = tdee;
      }
    }

    user.completeOnboarding({
      weight: data.weight,
      height: data.height,
      dietaryGoal: data.dietaryGoal,
      targetCalories,
      experienceLevel: data.experienceLevel,
      equipmentAccess: data.equipmentAccess,
      medicalConditions: data.medicalConditions,
      dietaryPreferences: data.dietaryPreferences,
    });

    return await this.userRepository.update(user);
  }
}
