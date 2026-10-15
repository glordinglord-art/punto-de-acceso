import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  RoutineRepositoryPort,
} from '../../domain/ports/routine.repository.port';
import { Routine } from '../../domain/entities/routine.entity';
import { TrainerScopeService } from '../../../../shared/application/trainer-scope/trainer-scope.service';

@Injectable()
export class GetRoutinesByClientUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepositoryPort,
    private readonly trainerScope: TrainerScopeService,
  ) {}

  async execute(clientId: string): Promise<Routine[]> {
    return this.routineRepository.findByClientId(clientId);
  }

  /**
   * Rutinas que ve el coach: las que creo el y las de cualquier cliente de su
   * cartera, incluidos los compartidos por colegas vinculados. Asi, si un
   * colega le asigna rutina a un cliente compartido, el resto del equipo la ve.
   */
  async getByTrainer(trainerId: string): Promise<Routine[]> {
    const clientIds = await this.trainerScope.getVisibleUserIds(trainerId, {
      includeSelf: true,
    });
    return this.routineRepository.findVisibleToTrainer(trainerId, clientIds);
  }
}
