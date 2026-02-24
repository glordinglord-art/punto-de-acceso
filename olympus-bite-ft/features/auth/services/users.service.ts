import { api } from "@/shared/lib/api";
import type { ApiResponse, User } from "@/shared/types/common.types";

export const usersService = {
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  updateProfile: (
    id: string,
    data: {
      name?: string;
      phone?: string;
      avatarUrl?: string;
      weight?: number;
      height?: number;
      targetCalories?: number | null;
      dietaryGoal?: string;
      experienceLevel?: string;
      equipmentAccess?: string;
      medicalConditions?: string;
      dietaryPreferences?: string;
    },
  ) => api.put<ApiResponse<User>>(`/users/${id}/profile`, data),

  changePassword: (
    id: string,
    data: { currentPassword: string; newPassword: string },
  ) => api.put<ApiResponse<User>>(`/users/${id}/password`, data),
};
