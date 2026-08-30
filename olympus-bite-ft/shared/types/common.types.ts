export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "trainer" | "client";
  avatarUrl: string | null;
  phone: string | null;
  gymId?: string | null;
  branchId?: string | null;
  gymName?: string | null;
  branchName?: string | null;
  dietaryGoal?: string | null;
  weight?: number | null;
  height?: number | null;
  targetCalories?: number | null;
  onboardingCompleted?: boolean;

  experienceLevel?: string | null;
  equipmentAccess?: string | null;
  medicalConditions?: string | null;
  dietaryPreferences?: string | null;

  isActive: boolean;
  createdAt: string;
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "super_admin";
}

/** El entrenador registra con code 9966 → role=trainer. trainer IS admin/trainer. */
export function isAdmin(role?: string | null): boolean {
  return role === "super_admin" || role === "admin" || role === "trainer";
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}
