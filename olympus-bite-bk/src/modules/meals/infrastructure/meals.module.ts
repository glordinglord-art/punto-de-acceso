import { Module } from '@nestjs/common';
import { MealsController } from './adapters/http/meals.controller';
import { PrismaMealRepository } from './adapters/persistence/prisma-meal.repository';
import { GeminiFoodRecognitionAdapter } from './adapters/ai/gemini-food-recognition.adapter';
import { MimoFoodRecognitionAdapter } from './adapters/ai/mimo-food-recognition.adapter';
import { HybridFoodRecognitionAdapter } from './adapters/ai/hybrid-food-recognition.adapter';
import { GeminiDietRecommenderAdapter } from './adapters/ai/gemini-diet-recommender.adapter';
import { CreateMealUseCase } from '../application/use-cases/create-meal.use-case';
import { AnalyzeFoodPhotoUseCase } from '../application/use-cases/analyze-food-photo.use-case';
import { GetMealsByUserUseCase } from '../application/use-cases/get-meals-by-user.use-case';
import { RecommendMealUseCase } from '../application/use-cases/recommend-meal.use-case';
import { ChatDietRecommendationUseCase } from '../application/use-cases/chat-diet-recommendation.use-case';
import { DeleteMealUseCase } from '../application/use-cases/delete-meal.use-case';
import { GetTrainerClientsMealsUseCase } from '../application/use-cases/get-trainer-clients-meals.use-case';
import { MEAL_REPOSITORY } from '../domain/ports/meal.repository.port';
import { DIET_CHAT_MESSAGE_REPOSITORY } from '../domain/ports/diet-chat-message.repository.port';
import { FOOD_RECOGNITION_SERVICE } from '../domain/ports/food-recognition.port';
import { DIET_RECOMMENDER_SERVICE } from '../domain/ports/diet-recommender.port';
import { SupabaseStorageService } from '../../../shared/infrastructure/supabase/supabase-storage.service';

import { PrismaDietChatMessageRepository } from './adapters/persistence/prisma-diet-chat-message.repository';
import { GetDietChatHistoryUseCase } from '../application/use-cases/get-diet-chat-history.use-case';
import { ClearDietChatHistoryUseCase } from '../application/use-cases/clear-diet-chat-history.use-case';
import { RoutinesModule } from '../../routines/infrastructure/routines.module';

@Module({
  imports: [RoutinesModule],
  controllers: [MealsController],
  providers: [
    {
      provide: MEAL_REPOSITORY,
      useClass: PrismaMealRepository,
    },
    {
      provide: DIET_CHAT_MESSAGE_REPOSITORY,
      useClass: PrismaDietChatMessageRepository,
    },
    GeminiFoodRecognitionAdapter,
    MimoFoodRecognitionAdapter,
    {
      provide: FOOD_RECOGNITION_SERVICE,
      useClass: HybridFoodRecognitionAdapter,
    },
    {
      provide: DIET_RECOMMENDER_SERVICE,
      useClass: GeminiDietRecommenderAdapter,
    },
    SupabaseStorageService,
    CreateMealUseCase,
    AnalyzeFoodPhotoUseCase,
    GetMealsByUserUseCase,
    RecommendMealUseCase,
    ChatDietRecommendationUseCase,
    DeleteMealUseCase,
    GetTrainerClientsMealsUseCase,
    GetDietChatHistoryUseCase,
    ClearDietChatHistoryUseCase,
  ],
  exports: [MEAL_REPOSITORY, GetMealsByUserUseCase],
})
export class MealsModule {}
