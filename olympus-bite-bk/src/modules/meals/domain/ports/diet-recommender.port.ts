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
  history?: { role: string; content: string }[];
}

export const DIET_RECOMMENDER_SERVICE = 'DIET_RECOMMENDER_SERVICE';

export interface DietRecommenderPort {
  generateRecommendation(
    prompt: string,
    context?: DietRecommenderContext,
  ): Promise<string>;
}
