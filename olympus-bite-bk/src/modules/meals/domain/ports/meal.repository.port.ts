import { RepositoryPort } from '../../../../shared/domain/repository.port';
import { Meal } from '../entities/meal.entity';

export const MEAL_REPOSITORY = Symbol('MEAL_REPOSITORY');

export interface MealRepositoryPort extends RepositoryPort<Meal> {
  findByUserId(userId: string): Promise<Meal[]>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]>;
  findByUserIdsAndDateRange(
    userIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]>;
  findRecommendationsByUserId(userId: string): Promise<Meal[]>;
}
