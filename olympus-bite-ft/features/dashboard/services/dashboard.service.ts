import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { DashboardStats, ClientDashboard } from '../types/dashboard.types';

export const dashboardService = {
  getStats: (trainerId: string) => {
    const tz = new Date().getTimezoneOffset();
    return api.get<ApiResponse<DashboardStats>>(`/dashboard/${trainerId}?tz=${tz}`);
  },

  getClientDashboard: (clientId: string) => {
    const tz = new Date().getTimezoneOffset();
    return api.get<ApiResponse<ClientDashboard>>(`/dashboard/client/${clientId}?tz=${tz}`);
  },

  updateWater: (clientId: string, date: string, amount: number) => {
    return api.post<ApiResponse<unknown>>(`/dashboard/client/${clientId}/water`, {
      date,
      amount,
    });
  },
};

