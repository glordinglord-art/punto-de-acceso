import { api } from '@/shared/lib/api';
import type {
  FinancesOverviewResponse,
  TrainerFinancesResponse,
  RecordPaymentDto,
} from '../types/finances.types';

export const financesService = {
  async getOverview(month?: string): Promise<FinancesOverviewResponse> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return api.get<FinancesOverviewResponse>(`/payments/overview${query}`);
  },

  async getTrainerPayments(trainerId: string, month?: string): Promise<TrainerFinancesResponse> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return api.get<TrainerFinancesResponse>(`/payments/trainer/${trainerId}${query}`);
  },

  async recordPayment(data: RecordPaymentDto): Promise<unknown> {
    return api.post<unknown>('/payments', data);
  },

  async deletePayment(paymentId: string): Promise<unknown> {
    return api.delete<unknown>(`/payments/${paymentId}`);
  },
};
