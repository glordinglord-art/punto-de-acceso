import { RepositoryPort } from '../../../../shared/domain/repository.port';

export const DIET_CHAT_MESSAGE_REPOSITORY = Symbol(
  'DIET_CHAT_MESSAGE_REPOSITORY',
);

export interface DietChatMessageEntity {
  id?: string;
  userId: string;
  role: string;
  content: string;
  createdAt?: Date;
}

export interface DietChatMessageRepositoryPort extends RepositoryPort<DietChatMessageEntity> {
  findByUserId(userId: string): Promise<DietChatMessageEntity[]>;
  deleteByUserId(userId: string): Promise<void>;
}
