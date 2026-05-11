import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { MealRepositoryPort } from '../../../domain/ports/meal.repository.port';
import { Meal, MealType } from '../../../domain/entities/meal.entity';
import { NutritionalInfo } from '../../../domain/value-objects/nutritional-info.vo';
import type { Meal as PrismaMeal } from '@prisma/client';

@Injectable()
export class PrismaMealRepository implements MealRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: PrismaMeal): Meal {
    const meal = new Meal(
      {
        userId: raw.userId,
        name: raw.name,
        description: raw.description,
        imageUrl: raw.imageUrl ?? undefined,
        imageUrls: raw.imageUrls,
        mealType: raw.mealType as unknown as MealType,
        nutritionalInfo: new NutritionalInfo({
          calories: raw.calories,
          protein: raw.protein,
          carbs: raw.carbs,
          fat: raw.fat,
          fiber: raw.fiber,
          sugar: raw.sugar,
        }),
        foods: raw.foods,
        recommendation: raw.recommendation ?? undefined,
        goalRating: raw.goalRating ?? undefined,
        isRecommendation: raw.isRecommendation,
        recommendedBy: raw.recommendedBy ?? undefined,
      },
      raw.id,
    );
    meal.date = raw.date;
    (meal as any).createdAt = raw.createdAt;
    (meal as any).updatedAt = raw.updatedAt;
    return meal;
  }

  async findById(id: string): Promise<Meal | null> {
    const raw = await this.prisma.meal.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(): Promise<Meal[]> {
    const rows = await this.prisma.meal.findMany({ orderBy: { date: 'desc' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findByUserId(userId: string): Promise<Meal[]> {
    const rows = await this.prisma.meal.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]> {
    const rows = await this.prisma.meal.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByUserIdsAndDateRange(
    userIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Meal[]> {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.meal.findMany({
      where: {
        userId: { in: userIds },
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findRecommendationsByUserId(userId: string): Promise<Meal[]> {
    const rows = await this.prisma.meal.findMany({
      where: { userId, isRecommendation: true },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: Meal): Promise<Meal> {
    const raw = await this.prisma.meal.create({
      data: {
        id: entity.id,
        userId: entity.userId,
        name: entity.name,
        description: entity.description,
        imageUrl: entity.imageUrl,
        imageUrls: entity.imageUrls,
        mealType: entity.mealType as string as any,
        calories: entity.nutritionalInfo.calories,
        protein: entity.nutritionalInfo.protein,
        carbs: entity.nutritionalInfo.carbs,
        fat: entity.nutritionalInfo.fat,
        fiber: entity.nutritionalInfo.fiber,
        sugar: entity.nutritionalInfo.sugar,
        foods: entity.foods,
        recommendation: entity.recommendation,
        goalRating: entity.goalRating,
        isRecommendation: entity.isRecommendation,
        recommendedBy: entity.recommendedBy,
        date: entity.date,
      },
    });
    return this.toDomain(raw);
  }

  async update(entity: Meal): Promise<Meal> {
    const raw = await this.prisma.meal.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        description: entity.description,
        imageUrl: entity.imageUrl,
        imageUrls: entity.imageUrls,
        mealType: entity.mealType as string as any,
        calories: entity.nutritionalInfo.calories,
        protein: entity.nutritionalInfo.protein,
        carbs: entity.nutritionalInfo.carbs,
        fat: entity.nutritionalInfo.fat,
        fiber: entity.nutritionalInfo.fiber,
        sugar: entity.nutritionalInfo.sugar,
        foods: entity.foods,
        recommendation: entity.recommendation,
        goalRating: entity.goalRating,
        isRecommendation: entity.isRecommendation,
        recommendedBy: entity.recommendedBy,
        date: entity.date,
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.meal.delete({ where: { id } });
  }
}
