export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface PaymentRecord {
  id: string | null;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  paymentDate: string | null;
  notes: string | null;
}

export interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  dietaryGoal?: string | null;
  targetCalories?: number | null;
}

export interface TrainerInfo {
  id: string;
  name: string;
  email: string;
  branchName: string;
}

export interface ClientPaymentRow {
  client: ClientInfo;
  trainer: TrainerInfo | null;
  payment: PaymentRecord;
}

export interface FinancesSummary {
  totalRevenue: number;
  totalClients: number;
  paidCount: number;
  pendingCount: number;
  collectionRate: number;
}

export interface TrainerFinancesBreakdown {
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  branchName: string;
  totalClients: number;
  paidCount: number;
  pendingCount: number;
  totalRevenue: number;
  rate: number;
}

export interface FinancesOverviewResponse {
  month: string;
  summary: FinancesSummary;
  trainersBreakdown: TrainerFinancesBreakdown[];
  payments: ClientPaymentRow[];
}

export interface TrainerFinancesResponse {
  month: string;
  trainer: {
    id: string;
    name: string;
    email: string;
  };
  summary: FinancesSummary;
  clients: {
    client: ClientInfo;
    payment: PaymentRecord;
  }[];
}

export interface RecordPaymentDto {
  clientId: string;
  trainerId?: string;
  periodMonth: string;
  amount: number;
  status?: PaymentStatus;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
}
