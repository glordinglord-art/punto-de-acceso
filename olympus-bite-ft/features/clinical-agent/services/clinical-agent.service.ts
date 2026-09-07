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
};
