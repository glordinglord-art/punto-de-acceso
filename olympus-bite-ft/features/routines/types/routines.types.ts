export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  observations: string | null;
  order: number;
}

export interface RoutineDay {
  id: string;
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string | null;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  userId: string;
  weekNumber: number;
  weight: number | null;
  repsDone: string | null;
  observations: string | null;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  clientId: string;
  weekCount: number;
  isFavorable?: boolean | null;
  isActive: boolean;
  days: RoutineDay[];
  createdAt: string;
}
