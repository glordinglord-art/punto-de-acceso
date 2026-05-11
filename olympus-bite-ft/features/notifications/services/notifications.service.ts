import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  NotificationConfig,
  NotificationPreferences,
  SerializedPushSubscription,
} from '../types/notifications.types';

export const notificationsService = {
  getConfig: () => api.get<ApiResponse<NotificationConfig>>('/notifications/config'),

  getPreferences: (userId: string) =>
    api.get<ApiResponse<NotificationPreferences>>(`/notifications/${userId}/preferences`),

  updatePreferences: (userId: string, data: Partial<NotificationPreferences>) =>
    api.put<ApiResponse<NotificationPreferences>>(`/notifications/${userId}/preferences`, data),

  subscribe: (userId: string, subscription: SerializedPushSubscription) =>
    api.post<ApiResponse<unknown>>(`/notifications/${userId}/subscribe`, {
      subscription,
      userAgent: navigator.userAgent,
    }),

  sendTest: (userId: string) =>
    api.post<ApiResponse<{ sent: number; skipped?: boolean; reason?: string }>>(
      `/notifications/${userId}/test`,
      {},
    ),
};
