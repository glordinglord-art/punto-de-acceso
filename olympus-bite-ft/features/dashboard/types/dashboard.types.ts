export interface MacroAverages {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface WeeklyTrendDay {
  day: string;
  date: string;
  meals: number;
  calories: number;
}

export interface MealTypeCount {
  type: string;
  count: number;
}

export interface TopFood {
  name: string;
  count: number;
}

export interface RecentMeal {
  id: string;
  userName: string;
  mealName: string;
  calories: number;
  protein: number;
  mealType: string;
  imageUrl: string | null;
  time: string;
}

export interface ClientOverview {
  id: string;
  name: string;
  avatarUrl: string | null;
  mealsToday: number;
  caloriesToday: number;
  proteinToday: number;
  mealsThisWeek: number;
  hasActiveRoutine: boolean;
  lastMealTime: string | null;
}

export interface DashboardStats {
  totalClients: number;
  activeMealsToday: number;
  totalRoutines: number;
  activeRoutines: number;
  avgCaloriesToday: number;
  mealsThisWeek: number;
  mealsLastWeek: number;
  macroAverages: MacroAverages;
  weeklyTrend: WeeklyTrendDay[];
  mealTypeDistribution: MealTypeCount[];
  topFoods: TopFood[];
  recentMeals: RecentMeal[];
  clientsOverview: ClientOverview[];
}

// Colores para tipos de comida
export const MEAL_TYPE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  Desayuno: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: '#f59e0b' },
  Almuerzo: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', ring: '#10b981' },
  Cena: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', ring: '#6366f1' },
  Snack: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', ring: '#ec4899' },
};

// ── Client Dashboard Types ──

export interface ClientRoutineExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
}

export interface ClientRoutineDay {
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  exercises: ClientRoutineExercise[];
}

export interface ClientActiveRoutine {
  id: string;
  name: string;
  description: string | null;
  weekCount: number;
  totalDays: number;
  trainingDays: number;
  exerciseCount: number;
  completedLogs: number;
  totalLogs: number;
  days: ClientRoutineDay[];
}

export interface ClientRecentMeal {
  id: string;
  mealName: string;
  calories: number;
  protein: number;
  mealType: string;
  imageUrl: string | null;
  time: string;
}

export interface ClientDashboard {
  clientName: string;
  trainerName: string | null;
  mealsToday: number;
  caloriesToday: number;
  proteinToday: number;
  carbsToday: number;
  fatToday: number;
  fiberToday: number;
  sugarToday: number;
  mealsThisWeek: number;
  weeklyTrend: WeeklyTrendDay[];
  mealTypeDistribution: MealTypeCount[];
  activeRoutine: ClientActiveRoutine | null;
  recentMeals: ClientRecentMeal[];
}
