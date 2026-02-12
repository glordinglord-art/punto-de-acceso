import { Injectable } from '@nestjs/common';
import { InvitationCode } from '../../../domain/entities/invitation-code.entity';
import { InvitationCodeRepositoryPort } from '../../../domain/ports/invitation-code.repository.port';

@Injectable()
export class InMemoryInvitationCodeRepository implements InvitationCodeRepositoryPort {
  private codes: Map<string, InvitationCode> = new Map();

  async findById(id: string): Promise<InvitationCode | null> {
    return this.codes.get(id) ?? null;
  }

  async findAll(): Promise<InvitationCode[]> {
    return Array.from(this.codes.values());
  }

  async findByCode(code: string): Promise<InvitationCode | null> {
    return (
      Array.from(this.codes.values()).find((c) => c.code === code) ?? null
    );
  }

  async findByTrainerId(trainerId: string): Promise<InvitationCode[]> {
    return Array.from(this.codes.values()).filter(
      (c) => c.trainerId === trainerId,
    );
  }

  async save(entity: InvitationCode): Promise<InvitationCode> {
    this.codes.set(entity.id, entity);
    return entity;
  }

  async update(entity: InvitationCode): Promise<InvitationCode> {
    this.codes.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.codes.delete(id);
  }
}
