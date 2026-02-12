import { Injectable } from '@nestjs/common';
import { Meal } from '../../../domain/entities/meal.entity';
import { MealRepositoryPort } from '../../../domain/ports/meal.repository.port';

@Injectable()
export class InMemoryMealRepository implements MealRepositoryPort {
  private meals: Map<string, Meal> = new Map();

  async findById(id: string): Promise<Meal | null> {
    return this.meals.get(id) ?? null;
  }

  async findAll(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }

  async findByUserId(userId: string): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter((m) => m.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(
        (m) =>
          m.userId === userId &&
          m.date >= startDate &&
          m.date <= endDate,
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByUserIdsAndDateRange(
    userIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(
        (m) =>
          userIds.includes(m.userId) &&
          m.date >= startDate &&
          m.date <= endDate,
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findRecommendationsByUserId(userId: string): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (m) => m.userId === userId && m.isRecommendation,
    );
  }

  async save(entity: Meal): Promise<Meal> {
    this.meals.set(entity.id, entity);
    return entity;
  }

  async update(entity: Meal): Promise<Meal> {
    this.meals.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.meals.delete(id);
  }
}
