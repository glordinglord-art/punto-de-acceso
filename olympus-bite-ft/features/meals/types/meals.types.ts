export interface Meal {
  id: string;
  userId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  foods: string[];
  recommendation: string | null;
  goalRating: GoalRating | null;
  isRecommendation: boolean;
  recommendedBy: string | null;
  date: string;
  createdAt: string;
}

export type FitnessGoal = 'deficit' | 'volumen' | 'mantenimiento' | 'recomposicion';

export type GoalRating = 'excelente' | 'buena' | 'regular' | 'mala';

export const FITNESS_GOALS: Record<FitnessGoal, { label: string; icon: string; description: string }> = {
  deficit: { label: 'Déficit', icon: '🔥', description: 'Pérdida de grasa' },
  volumen: { label: 'Volumen', icon: '💪', description: 'Ganancia muscular' },
  mantenimiento: { label: 'Mantenimiento', icon: '⚖️', description: 'Mantener peso' },
  recomposicion: { label: 'Recomposición', icon: '🔄', description: 'Menos grasa, más músculo' },
};

export const GOAL_RATING_CONFIG: Record<GoalRating, { label: string; color: string; bgColor: string; icon: string }> = {
  excelente: { label: 'Excelente', color: 'text-primary-600', bgColor: 'bg-primary-50 dark:bg-primary-900/20', icon: '🌟' },
  buena: { label: 'Buena', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: '👍' },
  regular: { label: 'Regular', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', icon: '⚠️' },
  mala: { label: 'No recomendada', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: '❌' },
};

export interface FoodAnalysis {
  foods: string[];
  description: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  confidence: number;
  recommendation: string;
  goalRating: GoalRating;
}

export interface ClientMealsGroup {
  clientId: string;
  clientName: string;
  clientAvatarUrl: string | null;
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
