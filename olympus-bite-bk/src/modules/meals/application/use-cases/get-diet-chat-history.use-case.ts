import { Inject, Injectable } from '@nestjs/common';
import {
  DIET_CHAT_MESSAGE_REPOSITORY,
  DietChatMessageRepositoryPort,
} from '../../domain/ports/diet-chat-message.repository.port';

@Injectable()
export class GetDietChatHistoryUseCase {
  constructor(
    @Inject(DIET_CHAT_MESSAGE_REPOSITORY)
    private readonly repository: DietChatMessageRepositoryPort,
  ) {}

  async execute(userId: string) {
    const rawHistory = await this.repository.findByUserId(userId);
    return rawHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  }
}
