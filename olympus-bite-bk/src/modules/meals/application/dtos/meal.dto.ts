import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MealType } from '../../domain/entities/meal.entity';

export class CreateMealDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MealType)
  mealType!: MealType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imagesBase64?: string[];

  @IsString({ each: true })
  @IsOptional()
  foods?: string[];

  // Datos nutricionales manuales (opcionales — si no se envían se intentan con IA)
  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsNumber()
  @IsOptional()
  protein?: number;

  @IsNumber()
  @IsOptional()
  carbs?: number;

  @IsNumber()
  @IsOptional()
  fat?: number;

  @IsNumber()
  @IsOptional()
  fiber?: number;

  @IsNumber()
  @IsOptional()
  sugar?: number;

  @IsString()
  @IsOptional()
  recommendation?: string;

  @IsString()
  @IsOptional()
  goalRating?: string;

  @IsString()
  @IsOptional()
  date?: string;
}

export class AnalyzeFoodPhotoDto {
  @IsArray()
  @IsString({ each: true })
  imagesBase64!: string[];

  @IsString()
  @IsOptional()
  goal?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @IsString()
  @IsOptional()
  equipmentAccess?: string;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  dietaryPreferences?: string;
}

export class RecommendMealDto {
  @IsString()
  clientId!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsEnum(MealType)
  mealType!: MealType;

  @IsString({ each: true })
  foods!: string[];
}
