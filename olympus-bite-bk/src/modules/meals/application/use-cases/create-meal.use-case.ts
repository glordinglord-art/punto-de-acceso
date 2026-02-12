import { Inject, Injectable } from '@nestjs/common';
import { MEAL_REPOSITORY, MealRepositoryPort } from '../../domain/ports/meal.repository.port';
import { Meal, MealType } from '../../domain/entities/meal.entity';
import { NutritionalInfo } from '../../domain/value-objects/nutritional-info.vo';
import { CreateMealDto } from '../dtos/meal.dto';
import {
  FOOD_RECOGNITION_SERVICE,
  FoodRecognitionPort,
} from '../../domain/ports/food-recognition.port';
import { SupabaseStorageService } from '../../../../shared/infrastructure/supabase/supabase-storage.service';

@Injectable()
export class CreateMealUseCase {
  constructor(
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
    @Inject(FOOD_RECOGNITION_SERVICE)
    private readonly foodRecognition: FoodRecognitionPort,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(dto: CreateMealDto, userId: string): Promise<Meal> {
    let nutritionalInfo: NutritionalInfo;
    let foods = dto.foods ?? [];
    let description = dto.description ?? '';
    let imageUrl: string | undefined;

    // Si se envían datos nutricionales manuales, usarlos directamente
    if (dto.calories !== undefined) {
      nutritionalInfo = new NutritionalInfo({
        calories: dto.calories,
        protein: dto.protein ?? 0,
        carbs: dto.carbs ?? 0,
        fat: dto.fat ?? 0,
        fiber: dto.fiber ?? 0,
        sugar: dto.sugar ?? 0,
      });
    } else if (dto.imageBase64) {
      // Analizar imagen con IA (mock por ahora)
      const analysis = await this.foodRecognition.analyzeImage(dto.imageBase64);
      nutritionalInfo = analysis.nutritionalInfo;
      foods = analysis.foods;
      description = analysis.description;
    } else {
      nutritionalInfo = new NutritionalInfo({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }

    // Subir imagen a Supabase Storage si existe
    if (dto.imageBase64) {
      const uploadedUrl = await this.storageService.uploadImage(
        dto.imageBase64,
        `meal-${userId}`,
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const meal = new Meal({
      userId,
      name: dto.name,
      description,
      mealType: dto.mealType,
      nutritionalInfo,
      foods,
      recommendation: dto.recommendation,
      goalRating: dto.goalRating,
      imageUrl,
    });

    return this.mealRepository.save(meal);
  }
}
