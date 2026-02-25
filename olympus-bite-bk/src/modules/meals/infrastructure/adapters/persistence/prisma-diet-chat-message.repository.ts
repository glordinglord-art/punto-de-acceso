import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import {
  DietChatMessageRepositoryPort,
  DietChatMessageEntity,
} from '../../../domain/ports/diet-chat-message.repository.port';

@Injectable()
export class PrismaDietChatMessageRepository implements DietChatMessageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<DietChatMessageEntity[]> {
    const rows = await this.prisma.dietChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.dietChatMessage.deleteMany({
      where: { userId },
    });
  }

  async findById(id: string): Promise<DietChatMessageEntity | null> {
    const row = await this.prisma.dietChatMessage.findUnique({ where: { id } });
    return row;
  }

  async findAll(): Promise<DietChatMessageEntity[]> {
    return this.prisma.dietChatMessage.findMany();
  }

  async save(entity: DietChatMessageEntity): Promise<DietChatMessageEntity> {
    return this.prisma.dietChatMessage.create({
      data: {
        userId: entity.userId,
        role: entity.role,
        content: entity.content,
      },
    });
  }

  async update(entity: DietChatMessageEntity): Promise<DietChatMessageEntity> {
    return this.prisma.dietChatMessage.update({
      where: { id: entity.id },
      data: {
        role: entity.role,
        content: entity.content,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dietChatMessage.delete({ where: { id } });
  }
}
