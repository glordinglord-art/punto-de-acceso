import { Inject, Injectable } from '@nestjs/common';
import { ROUTINE_REPOSITORY, RoutineRepositoryPort } from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';

@Injectable()
export class GetRoutinesByClientUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<Routine[]> {
    return this.routineRepository.findByClientId(clientId);
  }

  async getByTrainer(trainerId: string): Promise<Routine[]> {
    return this.routineRepository.findByTrainerId(trainerId);
  }
}
