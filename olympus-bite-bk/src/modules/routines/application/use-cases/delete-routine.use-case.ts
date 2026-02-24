import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';

@Injectable()
export class DeleteRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(routineId: string): Promise<void> {
    const existing = await this.routineRepository.findById(routineId);
    if (!existing) {
      throw new NotFoundException('Rutina no encontrada');
    }
    await this.routineRepository.delete(routineId);
  }
}
