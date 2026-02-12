import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { Routine, WorkoutLog } from '../types/routines.types';

export interface LogWorkoutPayload {
  exerciseId: string;
  weekNumber: number;
  weight?: number;
  repsDone?: string;
  observations?: string;
}

export const routinesService = {
  getByClient: (clientId: string) =>
    api.get<ApiResponse<Routine[]>>(`/routines/client/${clientId}`),

  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse<Routine[]>>(`/routines/trainer/${trainerId}`),

  create: (trainerId: string, data: unknown) =>
    api.post<ApiResponse<Routine>>(`/routines/${trainerId}`, data),

  update: (routineId: string, data: unknown) =>
    api.put<ApiResponse<Routine>>(`/routines/${routineId}`, data),

  remove: (routineId: string) =>
    api.delete<ApiResponse<null>>(`/routines/${routineId}`),

  logWorkout: (routineId: string, userId: string, data: LogWorkoutPayload) =>
    api.post<ApiResponse<WorkoutLog>>(`/routines/${routineId}/log/${userId}`, data),

  getWorkoutLogs: (routineId: string, userId: string) =>
    api.get<ApiResponse<WorkoutLog[]>>(`/routines/${routineId}/logs/${userId}`),
};
