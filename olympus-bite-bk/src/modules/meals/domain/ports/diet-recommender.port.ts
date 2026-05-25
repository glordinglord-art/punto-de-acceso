export interface DietRecommenderContext {
  goal?: string;
  weight?: number;
  height?: number;
  experienceLevel?: string;
  equipmentAccess?: string;
  medicalConditions?: string;
  dietaryPreferences?: string;
  targetCalories?: number;
  recentMeals?: {
    name: string;
    type: string;
    date: string;
    calories: number;
    macros: string;
    foods: string[];
  }[];
  activeRoutine?: {
    name: string;
    description?: string;
    days: {
      dayNumber: number;
      focusArea: string;
      isRestDay: boolean;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        observations?: string;
      }[];
    }[];
  };
  history?: { role: string; content: string }[];
}

export const DIET_RECOMMENDER_SERVICE = 'DIET_RECOMMENDER_SERVICE';

export interface DietRecommenderPort {
  generateRecommendation(
    prompt: string,
    context?: DietRecommenderContext,
  ): Promise<string>;
}
