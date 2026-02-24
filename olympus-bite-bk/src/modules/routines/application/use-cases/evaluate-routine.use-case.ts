import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';

export class EvaluateRoutineDto {
  isFavorable: boolean;
}

@Injectable()
export class EvaluateRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(id: string, dto: EvaluateRoutineDto) {
    const routine = await this.routineRepository.findById(id);
    if (!routine) {
      throw new NotFoundException('Rutina no encontrada');
    }

    routine.evaluateFavorable(dto.isFavorable);

    return await this.routineRepository.update(routine);
  }
}
