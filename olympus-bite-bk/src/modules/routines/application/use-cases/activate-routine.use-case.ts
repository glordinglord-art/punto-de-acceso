import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class ActivateRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(routineId: string): Promise<Routine> {
    const existing = await this.routineRepository.findById(routineId);
    if (!existing) {
      throw new NotFoundException('Rutina no encontrada');
    }
    existing.isActive = true;
    return this.routineRepository.update(existing);
  }
}
