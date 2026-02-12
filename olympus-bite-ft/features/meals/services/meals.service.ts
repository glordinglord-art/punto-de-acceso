import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { Meal, FoodAnalysis, ClientMealsGroup } from '../types/meals.types';

export const mealsService = {
  getByUser: (userId: string) =>
    api.get<ApiResponse<Meal[]>>(`/meals/user/${userId}`),

  getByDateRange: (userId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<Meal[]>>(
      `/meals/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`,
    ),

  create: (userId: string, data: {
    name: string;
    description?: string;
    mealType: string;
    imageBase64?: string;
    foods?: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    recommendation?: string;
    goalRating?: string;
  }) => api.post<ApiResponse<Meal>>(`/meals/${userId}`, data),

  analyzePhoto: (imageBase64: string, goal?: string) =>
    api.post<ApiResponse<FoodAnalysis>>('/meals/analyze/photo', { imageBase64, goal }),

  getRecommendations: (userId: string) =>
    api.get<ApiResponse<Meal[]>>(`/meals/recommendations/${userId}`),

  recommend: (data: {
    clientId: string;
    name: string;
    description: string;
    mealType: string;
    foods: string[];
  }) => api.post<ApiResponse<Meal>>('/meals/recommend', data),

  remove: (mealId: string) =>
    api.delete<ApiResponse<null>>(`/meals/${mealId}`),

  getByTrainerClients: (trainerId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<ClientMealsGroup[]>>(
      `/meals/trainer/${trainerId}/clients?startDate=${startDate}&endDate=${endDate}`,
    ),
};
