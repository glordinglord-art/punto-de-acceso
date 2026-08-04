import { api } from "@/shared/lib/api";

export interface ExerciseDict {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl?: string | null;
  equipment?: string | null;
  category?: string | null;
  target?: string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  instructionsEs?: string | null;
  instructionStepsEs?: string[];
  secondaryMuscles?: string[];
  attribution?: string | null;
  createdAt: string;
}

export interface CreateExerciseDto {
  name: string;
  muscleGroup: string;
  videoUrl?: string;
  equipment?: string;
  target?: string;
  gifUrl?: string;
  imageUrl?: string;
  instructionsEs?: string;
}

export interface SearchExercisesParams {
  q?: string;
  muscle?: string;
  equipment?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchExercisesResult {
  data: ExerciseDict[];
  total: number;
  limit: number;
  offset: number;
}

export const exerciseDictionaryService = {
  getAll: async (): Promise<ExerciseDict[]> => {
    const data = await api.get<{ success: boolean; data: ExerciseDict[] }>(
      "/exercise-dictionary",
    );
    return data.data;
  },

  search: async (params: SearchExercisesParams): Promise<SearchExercisesResult> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.muscle) searchParams.set("muscle", params.muscle);
    if (params.equipment) searchParams.set("equipment", params.equipment);
    if (params.category) searchParams.set("category", params.category);
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.offset) searchParams.set("offset", String(params.offset));

    const qs = searchParams.toString();
    const data = await api.get<{
      success: boolean;
      data: ExerciseDict[];
      total: number;
      limit: number;
      offset: number;
    }>(`/exercise-dictionary/search${qs ? `?${qs}` : ""}`);

    return {
      data: data.data,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
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
