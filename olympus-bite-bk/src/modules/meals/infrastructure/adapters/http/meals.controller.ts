import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateMealUseCase } from '../../../application/use-cases/create-meal.use-case';
import { AnalyzeFoodPhotoUseCase } from '../../../application/use-cases/analyze-food-photo.use-case';
import {
  ChatDietRecommendationUseCase,
  ChatDietRecommendationDto,
} from '../../../application/use-cases/chat-diet-recommendation.use-case';
import { GetMealsByUserUseCase } from '../../../application/use-cases/get-meals-by-user.use-case';
import { RecommendMealUseCase } from '../../../application/use-cases/recommend-meal.use-case';
import { DeleteMealUseCase } from '../../../application/use-cases/delete-meal.use-case';
import { GetTrainerClientsMealsUseCase } from '../../../application/use-cases/get-trainer-clients-meals.use-case';
import {
  CreateMealDto,
  AnalyzeFoodPhotoDto,
  RecommendMealDto,
} from '../../../application/dtos/meal.dto';
import { MealResponseDto } from '../../../application/dtos/meal-response.dto';

@Controller('meals')
export class MealsController {
  constructor(
    private readonly createMealUseCase: CreateMealUseCase,
    private readonly analyzeFoodPhotoUseCase: AnalyzeFoodPhotoUseCase,
    private readonly getMealsByUserUseCase: GetMealsByUserUseCase,
    private readonly recommendMealUseCase: RecommendMealUseCase,
    private readonly chatDietRecommendationUseCase: ChatDietRecommendationUseCase,
    private readonly deleteMealUseCase: DeleteMealUseCase,
    private readonly getTrainerClientsMealsUseCase: GetTrainerClientsMealsUseCase,
  ) {}

  @Post(':userId')
  @HttpCode(HttpStatus.CREATED)
  async createMeal(
    @Param('userId') userId: string,
    @Body() dto: CreateMealDto,
  ) {
    const meal = await this.createMealUseCase.execute(dto, userId);
    return { success: true, data: MealResponseDto.fromEntity(meal) };
  }

  @Post('analyze/photo')
  @HttpCode(HttpStatus.OK)
  async analyzePhoto(@Body() dto: AnalyzeFoodPhotoDto) {
    const result = await this.analyzeFoodPhotoUseCase.execute(dto);
    return { success: true, data: result };
  }

  @Get('user/:userId')
  async getMealsByUser(@Param('userId') userId: string) {
    const meals = await this.getMealsByUserUseCase.execute(userId);
    return {
      success: true,
      data: meals.map(MealResponseDto.fromEntity),
    };
  }

  @Get('user/:userId/range')
  async getMealsByDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const meals = await this.getMealsByUserUseCase.executeByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      data: meals.map(MealResponseDto.fromEntity),
    };
  }

  @Get('trainer/:trainerId/clients')
  async getTrainerClientsMeals(
    @Param('trainerId') trainerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.getTrainerClientsMealsUseCase.execute(
      trainerId,
      new Date(startDate),
      new Date(endDate),
    );
    return { success: true, data: result };
  }

  @Post('recommend')
  @HttpCode(HttpStatus.CREATED)
  async recommendMeal(@Body() dto: RecommendMealDto) {
    // trainerId vendría del token en producción
    const meal = await this.recommendMealUseCase.execute(dto, 'trainer-id');
    return { success: true, data: MealResponseDto.fromEntity(meal) };
  }

  @Get('recommendations/:userId')
  async getRecommendations(@Param('userId') userId: string) {
    const meals = await this.recommendMealUseCase.getRecommendations(userId);
    return {
      success: true,
      data: meals.map(MealResponseDto.fromEntity),
    };
  }

  @Post('chat-recommendation/:userId')
  @HttpCode(HttpStatus.OK)
  async chatRecommendation(
    @Param('userId') userId: string,
    @Body() dto: ChatDietRecommendationDto,
  ) {
    const recommendation =
      await this.chatDietRecommendationUseCase.execute(dto);
    return { success: true, data: { text: recommendation } };
  }

  @Delete(':mealId')
  @HttpCode(HttpStatus.OK)
  async deleteMeal(@Param('mealId') mealId: string) {
    await this.deleteMealUseCase.execute(mealId);
    return { success: true, message: 'Comida eliminada correctamente' };
  }
}
