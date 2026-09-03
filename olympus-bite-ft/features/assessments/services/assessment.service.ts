import { api } from '@/shared/lib/api';
import type {
  ClientAssessmentsResponse,
  PhysicalAssessment,
} from '../types/assessment.types';

export const assessmentService = {
  async getClientAssessments(clientId: string): Promise<ClientAssessmentsResponse> {
    return api.get<ClientAssessmentsResponse>(`/assessments/client/${clientId}`);
  },

  async createAssessment(data: Partial<PhysicalAssessment>): Promise<PhysicalAssessment> {
    return api.post<PhysicalAssessment>('/assessments', data);
  },

  async updateAssessment(
    id: string,
    data: Partial<PhysicalAssessment>
  ): Promise<PhysicalAssessment> {
    return api.put<PhysicalAssessment>(`/assessments/${id}`, data);
  },

  async deleteAssessment(id: string): Promise<unknown> {
    return api.delete<unknown>(`/assessments/${id}`);
  },
};
