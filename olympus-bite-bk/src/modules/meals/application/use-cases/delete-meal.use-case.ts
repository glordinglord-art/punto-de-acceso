import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';

@Injectable()
export class DeleteMealUseCase {
  constructor(
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
  ) {}

  async execute(mealId: string): Promise<void> {
    const meal = await this.mealRepository.findById(mealId);
    if (!meal) {
      throw new NotFoundException(`Comida con id ${mealId} no encontrada`);
    }
    await this.mealRepository.delete(mealId);
  }
}
