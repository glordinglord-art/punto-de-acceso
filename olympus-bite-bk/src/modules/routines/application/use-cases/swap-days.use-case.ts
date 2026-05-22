import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class SwapDaysUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(
    routineId: string,
    dayNumberA: number,
    dayNumberB: number,
  ): Promise<Routine> {
    const existing = await this.routineRepository.findById(routineId);
    if (!existing) {
      throw new NotFoundException('Rutina no encontrada');
    }

    try {
      return await this.routineRepository.swapDays(
        routineId,
        dayNumberA,
        dayNumberB,
      );
    } catch (error) {
      throw new NotFoundException(
        error instanceof Error ? error.message : 'Error al intercambiar días',
      );
    }
  }
}
