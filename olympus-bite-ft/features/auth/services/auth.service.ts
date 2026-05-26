import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { AuthResponse, LoginRequest, RegisterRequest, InvitationCode } from '../types/auth.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  generateCode: (trainerId: string) =>
    api.post<ApiResponse<{ code: string; expiresAt: string }>>(
      `/auth/invitation-codes/${trainerId}`,
      {},
    ),

  getCodes: (trainerId: string) =>
    api.get<ApiResponse<InvitationCode[]>>(`/auth/invitation-codes/${trainerId}`),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword }),
};
