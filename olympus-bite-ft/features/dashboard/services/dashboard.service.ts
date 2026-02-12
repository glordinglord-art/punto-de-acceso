import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { DashboardStats, ClientDashboard } from '../types/dashboard.types';

export const dashboardService = {
  getStats: (trainerId: string) =>
    api.get<ApiResponse<DashboardStats>>(`/dashboard/${trainerId}`),

  getClientDashboard: (clientId: string) =>
    api.get<ApiResponse<ClientDashboard>>(`/dashboard/client/${clientId}`),
};
