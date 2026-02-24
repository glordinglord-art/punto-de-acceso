import { Inject, Injectable } from '@nestjs/common';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
import { Meal } from '../../domain/entities/meal.entity';

@Injectable()
export class GetMealsByUserUseCase {
  constructor(
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Meal[]> {
    return this.mealRepository.findByUserId(userId);
  }

  async executeByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]> {
    return this.mealRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );
  }
}
