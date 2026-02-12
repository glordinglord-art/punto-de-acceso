import { Meal } from '../../domain/entities/meal.entity';

export class MealResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  description!: string;
  imageUrl!: string | null;
  mealType!: string;
  calories!: number;
  protein!: number;
  carbs!: number;
  fat!: number;
  fiber!: number;
  sugar!: number;
  foods!: string[];
  recommendation!: string | null;
  goalRating!: string | null;
  isRecommendation!: boolean;
  recommendedBy!: string | null;
  date!: Date;
  createdAt!: Date;

  static fromEntity(meal: Meal): MealResponseDto {
    const dto = new MealResponseDto();
    dto.id = meal.id;
    dto.userId = meal.userId;
    dto.name = meal.name;
    dto.description = meal.description;
    dto.imageUrl = meal.imageUrl;
    dto.mealType = meal.mealType;
    dto.calories = meal.nutritionalInfo.calories;
    dto.protein = meal.nutritionalInfo.protein;
    dto.carbs = meal.nutritionalInfo.carbs;
    dto.fat = meal.nutritionalInfo.fat;
    dto.fiber = meal.nutritionalInfo.fiber;
    dto.sugar = meal.nutritionalInfo.sugar;
    dto.foods = meal.foods;
    dto.recommendation = meal.recommendation;
    dto.goalRating = meal.goalRating;
    dto.isRecommendation = meal.isRecommendation;
    dto.recommendedBy = meal.recommendedBy;
    dto.date = meal.date;
    dto.createdAt = meal.createdAt;
    return dto;
  }
}
