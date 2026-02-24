export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  invitationCode: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "trainer" | "client";
    dietaryGoal?: string | null;
    weight?: number | null;
    height?: number | null;
    targetCalories?: number | null;
    onboardingCompleted?: boolean;
    experienceLevel?: string | null;
    equipmentAccess?: string | null;
    medicalConditions?: string | null;
    dietaryPreferences?: string | null;
  };
}

export interface InvitationCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}
