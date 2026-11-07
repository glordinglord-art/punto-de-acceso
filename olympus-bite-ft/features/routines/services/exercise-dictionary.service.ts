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

let memoryCache: ExerciseDict[] | null = null;
let inflightPromise: Promise<ExerciseDict[]> | null = null;
const STORAGE_KEY = "ob_exercise_dict_cache_v1";

export const exerciseDictionaryService = {
  getAll: async (): Promise<ExerciseDict[]> => {
    if (memoryCache && memoryCache.length > 0) {
      return memoryCache;
    }

    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ExerciseDict[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryCache = parsed;
            return parsed;
          }
        }
      } catch {
        // Ignore storage errors
      }
    }

    if (inflightPromise) {
      return inflightPromise;
    }

    inflightPromise = api
      .get<{ success: boolean; data: ExerciseDict[] }>("/exercise-dictionary")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          memoryCache = list;
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            } catch {
              // Ignore quota errors
            }
          }
        }
        return list;
      })
      .finally(() => {
        inflightPromise = null;
      });

    return inflightPromise;
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
    memoryCache = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/exercise-dictionary/${id}`);
    memoryCache = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  },
};
