import { Inject, Injectable } from '@nestjs/common';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
import { Meal, MealType } from '../../domain/entities/meal.entity';
import { NutritionalInfo } from '../../domain/value-objects/nutritional-info.vo';
import { RecommendMealDto } from '../dtos/meal.dto';

@Injectable()
export class RecommendMealUseCase {
  constructor(
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
  ) {}

  async execute(dto: RecommendMealDto, trainerId: string): Promise<Meal> {
    const meal = new Meal({
      userId: dto.clientId,
      name: dto.name,
      description: dto.description,
      mealType: dto.mealType,
      nutritionalInfo: new NutritionalInfo({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }),
      foods: dto.foods,
      isRecommendation: true,
      recommendedBy: trainerId,
    });

    return this.mealRepository.save(meal);
  }

  async getRecommendations(userId: string): Promise<Meal[]> {
    return this.mealRepository.findRecommendationsByUserId(userId);
  }
}
