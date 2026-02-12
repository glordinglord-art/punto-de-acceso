import { api } from '@/shared/lib/api';
import type { ApiResponse, User } from '@/shared/types/common.types';

export const clientsService = {
  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse<User[]>>(`/users/trainer/${trainerId}`),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
};
