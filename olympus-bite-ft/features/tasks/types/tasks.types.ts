export interface DailyTask {
  id: string;
  userId: string;
  title: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export interface FlaggedAthlete {
  athleteId: string;
  athleteName: string;
  phone: string | null;
  trainerId: string | null;
  complianceScore: number;
  nutritionScore: number;
  habitsScore: number;
  workoutsCount: number;
  actionTaken: string;
  reasons: string[];
}

export interface WeeklyAuditData {
  auditedAt: string;
  totalAthletes: number;
  approvedCount: number;
  flaggedCount: number;
  flaggedAthletes: FlaggedAthlete[];
}
