import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { InvitationCodeRepositoryPort } from '../../../domain/ports/invitation-code.repository.port';
import { InvitationCode } from '../../../domain/entities/invitation-code.entity';
import type { InvitationCode as PrismaCode } from '@prisma/client';

@Injectable()
export class PrismaInvitationCodeRepository implements InvitationCodeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: PrismaCode): InvitationCode {
    const code = new InvitationCode(raw.trainerId, raw.id);
    // Override auto-generated fields with DB values
    (code as any).code = raw.code;
    code.isUsed = raw.isUsed;
    code.usedByUserId = raw.usedByUserId;
    code.expiresAt = raw.expiresAt;
    (code as any).createdAt = raw.createdAt;
    (code as any).updatedAt = raw.updatedAt;
    return code;
  }

  async findById(id: string): Promise<InvitationCode | null> {
    const raw = await this.prisma.invitationCode.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(): Promise<InvitationCode[]> {
    const rows = await this.prisma.invitationCode.findMany();
    return rows.map((r) => this.toDomain(r));
  }

  async findByCode(code: string): Promise<InvitationCode | null> {
    const raw = await this.prisma.invitationCode.findUnique({
      where: { code },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByTrainerId(trainerId: string): Promise<InvitationCode[]> {
    const rows = await this.prisma.invitationCode.findMany({
      where: { trainerId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: InvitationCode): Promise<InvitationCode> {
    const raw = await this.prisma.invitationCode.create({
      data: {
        id: entity.id,
        code: entity.code,
        trainerId: entity.trainerId,
        isUsed: entity.isUsed,
        usedByUserId: entity.usedByUserId,
        expiresAt: entity.expiresAt,
      },
    });
    return this.toDomain(raw);
  }

  async update(entity: InvitationCode): Promise<InvitationCode> {
    const raw = await this.prisma.invitationCode.update({
      where: { id: entity.id },
      data: {
        isUsed: entity.isUsed,
        usedByUserId: entity.usedByUserId,
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invitationCode.delete({ where: { id } });
  }
}
