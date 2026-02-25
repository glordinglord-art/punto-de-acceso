import { Inject, Injectable } from '@nestjs/common';
import {
  DIET_CHAT_MESSAGE_REPOSITORY,
  DietChatMessageRepositoryPort,
} from '../../domain/ports/diet-chat-message.repository.port';

@Injectable()
export class ClearDietChatHistoryUseCase {
  constructor(
    @Inject(DIET_CHAT_MESSAGE_REPOSITORY)
    private readonly repository: DietChatMessageRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.repository.deleteByUserId(userId);
  }
}
