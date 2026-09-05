import { api } from '@/shared/lib/api';
import type { ApiResponse, User } from '@/shared/types/common.types';
import type { AdminOverview, TrainerRosterItem, TrainerLink } from '../types/admin.types';

export const adminService = {
  async getOverview(): Promise<ApiResponse<AdminOverview>> {
    return api.get<ApiResponse<AdminOverview>>('/admin/overview');
  },

  async getTrainers(): Promise<ApiResponse<TrainerRosterItem[]>> {
    return api.get<ApiResponse<TrainerRosterItem[]>>('/admin/trainers');
  },

  async assignUser(
    userId: string,
    data: {
      gymId?: string | null;
      branchId?: string | null;
      trainerId?: string | null;
    }
  ): Promise<ApiResponse<User>> {
    return api.patch<ApiResponse<User>>(`/admin/users/${userId}/assign`, data);
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/users/${userId}`);
  },

  async updateUserRole(
    userId: string,
    role: string
  ): Promise<ApiResponse<User>> {
    return api.patch<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
  },

  async seedDefault(): Promise<ApiResponse<{ message: string; data: unknown }>> {
    return api.post<ApiResponse<{ message: string; data: unknown }>>('/admin/seed-default', {});
  },

  async linkTrainers(
    trainerAId: string,
    trainerBId: string,
    gymId?: string | null,
    mode: 'bidirectional' | 'unidirectional' = 'bidirectional',
    sharedClientIds?: string[],
  ): Promise<ApiResponse<{ message: string }>> {
    return api.post<ApiResponse<{ message: string }>>('/admin/trainers/link', {
      trainerAId,
      trainerBId,
      gymId,
      mode,
      sharedClientIds,
    });
  },

  async getTrainerLinks(): Promise<ApiResponse<TrainerLink[]>> {
    return api.get<ApiResponse<TrainerLink[]>>('/admin/trainers/links');
  },

  async unlinkTrainers(linkId: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/admin/trainers/link/${linkId}`);
  },
};
