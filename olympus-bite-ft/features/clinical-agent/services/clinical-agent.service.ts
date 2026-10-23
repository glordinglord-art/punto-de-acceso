import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types/common.types";

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

export const clinicalAgentService = {
  sendMessage: (trainerId: string, message: string) =>
    api.post<ApiResponse<{ reply: string }>>(`/clinical-agent/chat/${trainerId}`, {
      message,
    }),

  getHistory: (trainerId: string) =>
    api.get<ApiResponse<ChatMessage[]>>(`/clinical-agent/history/${trainerId}`),

  clearHistory: (trainerId: string) =>
    api.delete<ApiResponse<null>>(`/clinical-agent/history/${trainerId}`),

  sendAthleteCaseMessage: (
    athleteId: string,
    payload: { message: string; trainerPrivateNotes?: string },
  ) =>
    api.post<
      ApiResponse<{ reply: string; trainerPrivateNotes: string }>
    >(`/clinical-agent/athlete/${athleteId}/chat`, payload),

  getAthleteCaseHistory: (athleteId: string) =>
    api.get<
      ApiResponse<{ trainerPrivateNotes: string; messages: ChatMessage[] }>
    >(`/clinical-agent/athlete/${athleteId}/history`),

  clearAthleteCaseHistory: (athleteId: string) =>
    api.delete<ApiResponse<null>>(`/clinical-agent/athlete/${athleteId}/history`),
};
