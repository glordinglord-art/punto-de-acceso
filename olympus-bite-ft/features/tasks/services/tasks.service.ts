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
};
