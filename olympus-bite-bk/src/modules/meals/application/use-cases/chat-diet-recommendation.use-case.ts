import { Inject, Injectable } from '@nestjs/common';
import {
  DIET_RECOMMENDER_SERVICE,
  DietRecommenderPort,
  DietRecommenderContext,
} from '../../domain/ports/diet-recommender.port';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
import {
  DIET_CHAT_MESSAGE_REPOSITORY,
  DietChatMessageRepositoryPort,
} from '../../domain/ports/diet-chat-message.repository.port';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../../routines/domain/ports/routine.repository.port';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DietRecommenderContextDto implements DietRecommenderContext {
  @IsOptional() @IsString() goal?: string;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsString() experienceLevel?: string;
  @IsOptional() @IsString() equipmentAccess?: string;
  @IsOptional() @IsString() medicalConditions?: string;
  @IsOptional() @IsString() dietaryPreferences?: string;
  @IsOptional() @IsNumber() targetCalories?: number;

  @IsOptional()
  recentMeals?: any[];

  @IsOptional()
  activeRoutine?: any;

  // Note: history is now fetched from the database, not strictly required from DTO.
  @IsOptional()
  history?: { role: string; content: string }[];
}

export class ChatDietRecommendationDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DietRecommenderContextDto)
  context?: DietRecommenderContextDto;
}

@Injectable()
export class ChatDietRecommendationUseCase {
  constructor(
    @Inject(DIET_RECOMMENDER_SERVICE)
    private readonly recommenderService: DietRecommenderPort,
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
    @Inject(DIET_CHAT_MESSAGE_REPOSITORY)
    private readonly chatMessageRepository: DietChatMessageRepositoryPort,
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(
    userId: string,
    dto: ChatDietRecommendationDto,
  ): Promise<string> {
    const rawMeals = await this.mealRepository.findByUserId(userId);
    const recentMeals = rawMeals
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map((m) => ({
        name: m.name,
        type: m.mealType,
        date: m.date.toISOString().split('T')[0],
        calories: m.nutritionalInfo.calories,
        macros: `P:${m.nutritionalInfo.protein}g, C:${m.nutritionalInfo.carbs}g, G:${m.nutritionalInfo.fat}g`,
        foods: m.foods,
      }));

    if (!dto.context) dto.context = new DietRecommenderContextDto();
    dto.context.recentMeals = recentMeals;

    // Fetch user active routine if any
    try {
      const userRoutines = await this.routineRepository.findByClientId(userId);
      const activeRoutineEntity = userRoutines.find((r) => r.isActive);
      if (activeRoutineEntity) {
        dto.context.activeRoutine = {
          name: activeRoutineEntity.name,
          description: activeRoutineEntity.description,
          days: activeRoutineEntity.days.map((d) => ({
            dayNumber: d.dayNumber,
            focusArea: d.focusArea,
            isRestDay: d.isRestDay,
            exercises: d.exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              observations: ex.observations ?? undefined,
            })),
          })),
        };
      }
    } catch (err) {
      console.error('Error fetching client routine for AI chat:', err);
    }

    // Fetch DB history
    const rawHistory = await this.chatMessageRepository.findByUserId(userId);
    const dbHistory = rawHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // Overwrite the DTO history with what's in the DB to enforce single truth
    dto.context.history = dbHistory;

    // Save User Prompt
    await this.chatMessageRepository.save({
      userId,
      role: 'user',
      content: dto.prompt,
    });

    const aiResponse = await this.recommenderService.generateRecommendation(
      dto.prompt,
      dto.context,
    );

    // Save AI Response
    await this.chatMessageRepository.save({
      userId,
      role: 'ai',
      content: aiResponse,
    });

    return aiResponse;
  }
}
