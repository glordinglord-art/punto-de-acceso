export interface TrainerOverview {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  gymName: string;
  branchName: string;
  clientsCount: number;
  activeRoutinesCount: number;
}

export interface BranchDistribution {
  branchId: string;
  branchName: string;
  gymId: string;
  gymName: string;
  city: string | null;
  trainersCount: number;
  clientsCount: number;
}

export interface AdminOverview {
  totalGyms: number;
  totalBranches: number;
  totalTrainers: number;
  totalClients: number;
  activeRoutines: number;
  trainersOverview: TrainerOverview[];
  branchDistribution: BranchDistribution[];
}

export interface TrainerRosterItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  gymId: string | null;
  gymName: string | null;
  branchId: string | null;
  branchName: string | null;
  branchCity: string | null;
  activeRoutinesCount: number;
  clients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    dietaryGoal: string | null;
    targetCalories: number | null;
    onboardingCompleted: boolean;
    createdAt: string;
  }>;
}
