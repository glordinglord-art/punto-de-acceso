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
    data: {
      name?: string;
      phone?: string | null;
      dietaryGoal?: string | null;
      weight?: number | null;
      height?: number | null;
      targetCalories?: number | null;
      targetProtein?: number | null;
      targetCarbs?: number | null;
      targetFats?: number | null;
      weightUnitPreference?: string;
      experienceLevel?: string | null;
      equipmentAccess?: string | null;
      medicalConditions?: string | null;
      dietaryPreferences?: string | null;
      anamnesisData?: any;
      onboardingCompleted?: boolean;
      password?: string;
    },
  ) => api.put<ApiResponse<User>>(`/users/${id}/profile`, data),

  resetDiscovery: (id: string) =>
    api.post<ApiResponse<User>>(`/users/${id}/reset-discovery`, {}),

  submitDiscovery: (id: string, data: any) =>
    api.post<ApiResponse<User>>(`/users/${id}/discovery`, data),

  updateHeroPact: (id: string, data: any) =>
    api.put<ApiResponse<User>>(`/users/${id}/hero-pact`, data),

  logWeeklyWeighIn: (
    id: string,
    data: {
      weight: number;
      unit: 'kg' | 'lbs';
      date?: string;
      neckCm?: number;
      waistCm?: number;
      hipCm?: number;
      bodyFatPct?: number;
      notes?: string;
    },
  ) =>
    api.post<ApiResponse<{ user: User; entry: any }>>(
      `/users/${id}/weekly-weighin`,
      data,
    ),

  logSleepRegularity: (
    id: string,
    data: {
      date?: string;
      bedtime: string;
      wakeTime: string;
      hoursSlept?: number;
      quality?: string;
    },
  ) =>
    api.post<ApiResponse<{ user: User; log: any }>>(
      `/users/${id}/sleep-log`,
      data,
    ),

  publishWeeklyReport: (
    id: string,
    data: {
      weekNumber: number;
      trainingScore: number;
      nutritionScore: number;
      recoveryScore: number;
      trainerNotes: string;
      nextWeekFocus: string;
      isDeloadWeek?: boolean;
      trainerName?: string;
    },
  ) =>
    api.post<ApiResponse<{ user: User; report: any }>>(
      `/users/${id}/weekly-report`,
      data,
    ),

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
