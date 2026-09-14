import { api } from "@/shared/lib/api";
import type { ApiResponse, User } from "@/shared/types/common.types";

export interface OnboardingSubmission {
  displayName?: string;
  purposes?: string[];
  targetWeight?: number;
  medicalConditionsList?: string[];
  performanceAspects?: string[];
  bodyFatPercentage?: string;
  physicalActivityTypes?: string[];
  strengthFrequency?: string;
  sessionDurationMinutes?: number;
  foodPreferences?: string[];
  allergiesAndIntolerances?: string[];
  lifestyleHabits?: string[];
  country?: string;
  intermittentFasting?: string;
  takesSupplements?: boolean;
  customMemories?: string[];
  macroPreset?: string;
  customCalories?: number;
  customProtein?: number;
  customCarbs?: number;
  customFats?: number;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  weightBehavior: 'stable' | 'fluctuating' | 'increasing' | 'decreasing';
  dietaryGoal: 'fat_loss' | 'muscle_gain' | 'recomposition' | 'health_performance';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipmentAccess: 'commercial_gym' | 'building_gym' | 'home';
  jointDiscomfort: string[];
  neatLevel: 'sedentary' | 'standing' | 'heavy_labor';
  sleepQuality: 'under_6h' | '6_to_7h' | '7_to_9h_deep';
  stressLevel: 'low' | 'moderate' | 'high';
  anxietyTrigger: 'afternoon' | 'night' | 'weekends' | 'none';
  digestiveHealth: 'good' | 'bloated' | 'lactose_intolerant' | 'gluten_sensitive';
  mealFrequency: '2_to_3' | '4_to_5';
}

export interface OnboardingResult {
  user: User;
  clinicalSummary: {
    justification: string;
    biomechanicAdvice?: string;
    adjustmentPercentage: number;
    recommendedWaterGlasses: number;
  };
  metrics: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    weightKg: number;
  };
}

export const clientsService = {
  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse<User[]>>(`/users/trainer/${trainerId}`),

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  updateProfile: (
    id: string,
    data: { dietaryGoal?: string; targetCalories?: number | null; password?: string },
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

  submitOnboarding: (id: string, data: OnboardingSubmission) =>
    api.post<ApiResponse<OnboardingResult>>(`/users/${id}/onboarding`, data),

  linkClient: (trainerId: string, email: string) =>
    api.patch<ApiResponse<User>>(`/users/trainer/${trainerId}/link-client`, { email }),
    
  deleteClient: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
};
