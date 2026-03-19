import { api } from "@/shared/lib/api";
import type { ApiResponse, User } from "@/shared/types/common.types";

export const clientsService = {
  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse<User[]>>(`/users/trainer/${trainerId}`),

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  updateProfile: (
    id: string,
    data: { dietaryGoal?: string; targetCalories?: number | null },
  ) => api.put<ApiResponse<User>>(`/users/${id}/profile`, data),

  completeOnboarding: (
    id: string,
    data: {
      weight: number;
      height: number;
      dietaryGoal: string;
      experienceLevel?: string;
      equipmentAccess?: string;
      medicalConditions?: string;
      dietaryPreferences?: string;
    },
  ) => api.put<ApiResponse<User>>(`/users/${id}/onboarding`, data),

  linkClient: (trainerId: string, email: string) =>
    api.patch<ApiResponse<User>>(`/users/trainer/${trainerId}/link-client`, { email }),
};
