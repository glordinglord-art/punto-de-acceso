import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types/common.types";
import type {
  Meal,
  FoodAnalysis,
  ClientMealsGroup,
} from "../types/meals.types";

export const mealsService = {
  getByUser: (userId: string) =>
    api.get<ApiResponse<Meal[]>>(`/meals/user/${userId}`),

  getByDateRange: (userId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<Meal[]>>(
      `/meals/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`,
    ),

  create: (
    userId: string,
    data: {
      name: string;
      description?: string;
      mealType: string;
      imagesBase64?: string[];
      foods?: string[];
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      recommendation?: string;
      goalRating?: string;
      date?: string;
    },
  ) => api.post<ApiResponse<Meal>>(`/meals/${userId}`, data),

  analyzePhoto: (
    imagesBase64: string[],
    context?: {
      goal?: string;
      description?: string;
      weight?: number;
      height?: number;
      experienceLevel?: string;
      equipmentAccess?: string;
      medicalConditions?: string;
      dietaryPreferences?: string;
    },
  ) =>
    api.post<ApiResponse<FoodAnalysis>>("/meals/analyze/photo", {
      imagesBase64,
      ...context,
    }),

  getRecommendations: (userId: string) =>
    api.get<ApiResponse<Meal[]>>(`/meals/recommendations/${userId}`),

  chatRecommendation: (
    userId: string,
    data: {
      prompt: string;
      context?: {
        goal?: string;
        weight?: number;
        height?: number;
        experienceLevel?: string;
        equipmentAccess?: string;
        medicalConditions?: string;
        dietaryPreferences?: string;
        targetCalories?: number | null;
        history?: { role: "user" | "ai"; content: string }[];
      };
    },
  ) =>
    api.post<ApiResponse<{ text: string }>>(
      `/meals/chat-recommendation/${userId}`,
      data,
    ),

  recommend: (data: {
    clientId: string;
    name: string;
    description: string;
    mealType: string;
    foods: string[];
  }) => api.post<ApiResponse<Meal>>("/meals/recommend", data),

  remove: (mealId: string) => api.delete<ApiResponse<null>>(`/meals/${mealId}`),

  getChatHistory: (userId: string) =>
    api.get<
      ApiResponse<{ role: "user" | "ai"; content: string; createdAt: string }[]>
    >(`/meals/chat-history/${userId}`),

  clearChatHistory: (userId: string) =>
    api.delete<ApiResponse<null>>(`/meals/chat-history/${userId}`),

  getByTrainerClients: (
    trainerId: string,
    startDate: string,
    endDate: string,
  ) =>
    api.get<ApiResponse<ClientMealsGroup[]>>(
      `/meals/trainer/${trainerId}/clients?startDate=${startDate}&endDate=${endDate}`,
    ),
};
