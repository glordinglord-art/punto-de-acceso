import { api } from "@/shared/lib/api";

export interface ExerciseDict {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl?: string | null;
  createdAt: string;
}

export interface CreateExerciseDto {
  name: string;
  muscleGroup: string;
  videoUrl?: string;
}

export const exerciseDictionaryService = {
  getAll: async (): Promise<ExerciseDict[]> => {
    const data = await api.get<{ success: boolean; data: ExerciseDict[] }>(
      "/exercise-dictionary",
    );
    return data.data;
  },

  create: async (payload: CreateExerciseDto): Promise<ExerciseDict> => {
    const data = await api.post<{ success: boolean; data: ExerciseDict }>(
      "/exercise-dictionary",
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/exercise-dictionary/${id}`);
  },
};
