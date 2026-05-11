import { Inject, Injectable } from '@nestjs/common';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
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
    const imageUrls: string[] = [];

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
    } else if (dto.imagesBase64 && dto.imagesBase64.length > 0) {
      // Analizar imagen con IA
      const analysis = await this.foodRecognition.analyzeImages(
        dto.imagesBase64,
      );
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

    // Subir imágenes a Supabase Storage si existen
    if (dto.imagesBase64 && dto.imagesBase64.length > 0) {
      const uploadPromises = dto.imagesBase64.map((base64Image, index) =>
        this.storageService.uploadImage(base64Image, `meal-${userId}-${index}`),
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(
        (url): url is string => url !== null,
      );

      if (validUrls.length > 0) {
        imageUrl = validUrls[0];
        imageUrls.push(...validUrls);
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
      imageUrls,
      date: dto.date ? new Date(dto.date) : undefined,
    });

    return this.mealRepository.save(meal);
  }
}
