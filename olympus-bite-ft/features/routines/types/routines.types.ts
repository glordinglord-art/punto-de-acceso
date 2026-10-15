export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  observations: string | null;
  order: number;
  targetWeight?: number | null;
  intensity?: "relax" | "medium" | "failure" | string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  instructionsEs?: string | null;
}

export interface RoutineDay {
  id: string;
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string | null;
  exercises: Exercise[];
}

export interface SetLogData {
  set: number;
  weight: number | null;
  reps: number | null;
  rest: number | null;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  userId: string;
  weekNumber: number;
  weight: number | null;
  repsDone: string | null;
  observations: string | null;
  setsData: SetLogData[] | null;
  duration: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  /** Coach que la asigno; viene del backend para mostrar rutinas de colegas. */
  trainerName?: string | null;
  clientId: string;
  weekCount: number;
  isFavorable?: boolean | null;
  isActive: boolean;
  days: RoutineDay[];
  createdAt: string;
}
