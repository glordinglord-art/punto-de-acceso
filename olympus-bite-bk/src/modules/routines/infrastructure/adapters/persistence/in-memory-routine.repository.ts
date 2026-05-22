import { Injectable } from '@nestjs/common';
import { Routine } from '../../../domain/entities/routine.entity';
import { RoutineRepositoryPort } from '../../../domain/ports/routine.repository.port';

@Injectable()
export class InMemoryRoutineRepository implements RoutineRepositoryPort {
  private routines: Map<string, Routine> = new Map();

  async findById(id: string): Promise<Routine | null> {
    return this.routines.get(id) ?? null;
  }

  async findAll(): Promise<Routine[]> {
    return Array.from(this.routines.values());
  }

  async findByClientId(clientId: string): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(
      (r) => r.clientId === clientId && r.isActive,
    );
  }

  async findByTrainerId(trainerId: string): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(
      (r) => r.trainerId === trainerId,
    );
  }

  async save(entity: Routine): Promise<Routine> {
    this.routines.set(entity.id, entity);
    return entity;
  }

  async update(entity: Routine): Promise<Routine> {
    this.routines.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.routines.delete(id);
  }

  async hasLogs(routineId: string): Promise<boolean> {
    return false;
  }

  async swapDays(
    routineId: string,
    dayNumberA: number,
    dayNumberB: number,
  ): Promise<Routine> {
    const routine = this.routines.get(routineId);
    if (!routine) {
      throw new Error('Rutina no encontrada');
    }
    const dayA = routine.days.find((d) => d.dayNumber === dayNumberA);
    const dayB = routine.days.find((d) => d.dayNumber === dayNumberB);
    if (!dayA || !dayB) {
      throw new Error('Uno o ambos días no existen en la rutina');
    }
    const temp = dayA.dayNumber;
    dayA.dayNumber = dayB.dayNumber;
    dayB.dayNumber = temp;
    return routine;
  }
}
