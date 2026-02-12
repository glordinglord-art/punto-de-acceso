import { Inject, Injectable } from '@nestjs/common';
import {
  MEAL_REPOSITORY,
  MealRepositoryPort,
} from '../../domain/ports/meal.repository.port';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { MealResponseDto } from '../dtos/meal-response.dto';

export interface ClientMealsGroup {
  clientId: string;
  clientName: string;
  clientAvatarUrl: string | null;
  meals: MealResponseDto[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

@Injectable()
export class GetTrainerClientsMealsUseCase {
  constructor(
    @Inject(MEAL_REPOSITORY)
    private readonly mealRepository: MealRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    trainerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClientMealsGroup[]> {
    const clients = await this.prisma.user.findMany({
      where: { trainerId, isActive: true },
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    });

    if (clients.length === 0) return [];

    const clientIds = clients.map((c) => c.id);
    const meals = await this.mealRepository.findByUserIdsAndDateRange(
      clientIds,
      startDate,
      endDate,
    );

    return clients.map((client) => {
      const clientMeals = meals.filter((m) => m.userId === client.id);
      const totals = clientMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.nutritionalInfo.calories,
          protein: acc.protein + m.nutritionalInfo.protein,
          carbs: acc.carbs + m.nutritionalInfo.carbs,
          fat: acc.fat + m.nutritionalInfo.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );

      return {
        clientId: client.id,
        clientName: client.name,
        clientAvatarUrl: client.avatarUrl,
        meals: clientMeals.map(MealResponseDto.fromEntity),
        totals,
      };
    });
  }
}
