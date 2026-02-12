import { Module } from '@nestjs/common';
import { MealsController } from './adapters/http/meals.controller';
import { PrismaMealRepository } from './adapters/persistence/prisma-meal.repository';
import { GeminiFoodRecognitionAdapter } from './adapters/ai/gemini-food-recognition.adapter';
import { CreateMealUseCase } from '../application/use-cases/create-meal.use-case';
import { AnalyzeFoodPhotoUseCase } from '../application/use-cases/analyze-food-photo.use-case';
import { GetMealsByUserUseCase } from '../application/use-cases/get-meals-by-user.use-case';
import { RecommendMealUseCase } from '../application/use-cases/recommend-meal.use-case';
import { DeleteMealUseCase } from '../application/use-cases/delete-meal.use-case';
import { GetTrainerClientsMealsUseCase } from '../application/use-cases/get-trainer-clients-meals.use-case';
import { MEAL_REPOSITORY } from '../domain/ports/meal.repository.port';
import { FOOD_RECOGNITION_SERVICE } from '../domain/ports/food-recognition.port';
import { SupabaseStorageService } from '../../../shared/infrastructure/supabase/supabase-storage.service';

@Module({
  controllers: [MealsController],
  providers: [
    {
      provide: MEAL_REPOSITORY,
      useClass: PrismaMealRepository,
    },
    {
      provide: FOOD_RECOGNITION_SERVICE,
      useClass: GeminiFoodRecognitionAdapter,
    },
    SupabaseStorageService,
    CreateMealUseCase,
    AnalyzeFoodPhotoUseCase,
    GetMealsByUserUseCase,
    RecommendMealUseCase,
    DeleteMealUseCase,
    GetTrainerClientsMealsUseCase,
  ],
  exports: [MEAL_REPOSITORY, GetMealsByUserUseCase],
})
export class MealsModule {}
