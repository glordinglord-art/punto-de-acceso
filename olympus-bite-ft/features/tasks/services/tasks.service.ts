import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types/common.types";
import type { DailyTask, TaskLog } from "../types/tasks.types";

export const tasksService = {
  getTasks: (userId: string) =>
    api.get<ApiResponse<DailyTask[]>>(`/tasks/${userId}`),

  createTask: (userId: string, data: { title: string; icon?: string; order?: number }) =>
    api.post<ApiResponse<DailyTask>>(`/tasks/${userId}`, data),

  updateTask: (taskId: string, data: { title?: string; icon?: string; order?: number; isActive?: boolean }) =>
    api.put<ApiResponse<DailyTask>>(`/tasks/${taskId}`, data),

  deleteTask: (taskId: string) =>
    api.delete<ApiResponse<null>>(`/tasks/${taskId}`),

  toggleLog: (taskId: string, userId: string, date: string) =>
    api.post<ApiResponse<TaskLog | null>>(`/tasks/${taskId}/toggle/${userId}`, { date }),

  getLogs: (userId: string, start: string, end: string) =>
    api.get<ApiResponse<TaskLog[]>>(`/tasks/${userId}/logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),

  getLogsByDate: (userId: string, date: string) =>
    api.get<ApiResponse<TaskLog[]>>(`/tasks/${userId}/logs/${date}`),

  saveDailyStress: (
    userId: string,
    data: {
      date: string;
      stressLevel: number;
      mood?: string;
      energyLevel?: number;
      notes?: string;
    }
  ) => api.post<ApiResponse<unknown>>(`/tasks/${userId}/stress`, data),

  getDailyStress: (userId: string, start?: string, end?: string) =>
    api.get<ApiResponse<unknown[]>>(
      `/tasks/${userId}/stress${start && end ? `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}` : ""}`
    ),

  saveWeeklyCheckin: (
    userId: string,
    data: {
      weekDate: string;
      stressRating: number;
      energyRating: number;
      recoveryRating?: string;
      dietPerception?: string;
      notes?: string;
      rawAnswers?: Record<string, unknown>;
    }
  ) => api.post<ApiResponse<unknown>>(`/tasks/${userId}/weekly-checkin`, data),

  getWeeklyCheckins: (userId: string) =>
    api.get<ApiResponse<unknown[]>>(`/tasks/${userId}/weekly-checkin`),

  getCompliance: (userId: string, date?: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(
      `/tasks/${userId}/compliance${date ? `?date=${encodeURIComponent(date)}` : ""}`
    ),
};
