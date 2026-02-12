export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trainer' | 'client';
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

/** El entrenador registra con code 9966 → role=trainer. trainer IS the admin. */
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'trainer';
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}
