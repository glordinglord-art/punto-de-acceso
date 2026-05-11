import { BaseEntity } from '../../../../shared/domain/base.entity';
import { NutritionalInfo } from '../value-objects/nutritional-info.vo';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export interface CreateMealProps {
  userId: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  mealType: MealType;
  nutritionalInfo: NutritionalInfo;
  foods: string[];
  recommendation?: string;
  goalRating?: string;
  isRecommendation?: boolean;
  recommendedBy?: string;
  date?: Date;
}

export class Meal extends BaseEntity {
  userId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  imageUrls: string[];
  mealType: MealType;
  nutritionalInfo: NutritionalInfo;
  foods: string[];
  recommendation: string | null;
  goalRating: string | null;
  isRecommendation: boolean;
  recommendedBy: string | null;
  date: Date;

  constructor(props: CreateMealProps, id?: string) {
    super(id);
    this.userId = props.userId;
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl ?? null;
    this.imageUrls = props.imageUrls ?? [];
    this.mealType = props.mealType;
    this.nutritionalInfo = props.nutritionalInfo;
    this.foods = props.foods;
    this.recommendation = props.recommendation ?? null;
    this.goalRating = props.goalRating ?? null;
    this.isRecommendation = props.isRecommendation ?? false;
    this.recommendedBy = props.recommendedBy ?? null;
    this.date = props.date ?? new Date();
  }
}
