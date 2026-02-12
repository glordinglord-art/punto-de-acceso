export class DashboardStatsDto {
  totalClients: number;
  activeMealsToday: number;
  totalRoutines: number;
  activeRoutines: number;
  avgCaloriesToday: number;

  // Comparaciones con semana anterior
  mealsThisWeek: number;
  mealsLastWeek: number;

  // Promedio de macros del día
  macroAverages: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };

  // Comidas por día en los últimos 7 días
  weeklyTrend: {
    day: string; // "Lun", "Mar", etc.
    date: string; // ISO date
    meals: number;
    calories: number;
  }[];

  // Distribución de tipos de comida
  mealTypeDistribution: {
    type: string;
    count: number;
  }[];

  // Alimentos más comunes
  topFoods: {
    name: string;
    count: number;
  }[];

  // Últimas comidas reales
  recentMeals: {
    id: string;
    userName: string;
    mealName: string;
    calories: number;
    protein: number;
    mealType: string;
    imageUrl: string | null;
    time: Date;
  }[];

  // Resumen por cliente
  clientsOverview: {
    id: string;
    name: string;
    avatarUrl: string | null;
    mealsToday: number;
    caloriesToday: number;
    proteinToday: number;
    mealsThisWeek: number;
    hasActiveRoutine: boolean;
    lastMealTime: Date | null;
  }[];
}
