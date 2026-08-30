export type FitnessGoalKey = 'lose_weight' | 'maintain' | 'gain_muscle';

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGlasses: number;
  goalLabel: string;
  goalEmoji: string;
  goalDescription: string;
}

/**
 * Calculates optimal calorie and macro targets based on user biometric data and fitness goal.
 * Uses Mifflin-St Jeor formula with athletic macro distribution.
 */
export function calculateNutritionTargets(user?: {
  weight?: number | null;
  height?: number | null;
  dietaryGoal?: string | null;
  targetCalories?: number | null;
} | null): MacroTarget {
  const weight = user?.weight && user.weight > 30 ? user.weight : 75;
  const height = user?.height && user.height > 100 ? user.height : 175;
  const age = 26; // Default standard athletic age
  
  // Basal Metabolic Rate (Mifflin-St Jeor)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  // Moderate activity multiplier (gym training 3-5 days/week)
  const tdee = Math.round(bmr * 1.55);

  const goal = (user?.dietaryGoal || 'maintain').toLowerCase();

  let calories = user?.targetCalories && user.targetCalories > 1000 ? user.targetCalories : tdee;
  let protein = Math.round(weight * 2.0); // 2.0g/kg baseline
  let fat = Math.round(weight * 0.9);     // 0.9g/kg baseline
  let carbs = Math.max(Math.round((calories - (protein * 4 + fat * 9)) / 4), 50);

  let goalLabel = 'Mantenimiento';
  let goalEmoji = '⚡';
  let goalDescription = 'Recomposición corporal y equilibrio energético.';

  if (goal.includes('lose') || goal.includes('defin') || goal.includes('perder') || goal.includes('deficit')) {
    goalLabel = 'Definición & Pérdida de Grasa';
    goalEmoji = '🎯';
    goalDescription = 'Déficit calórico controlado (-20%) preservando masa muscular con alta proteína.';
    if (!user?.targetCalories) {
      calories = Math.round(tdee * 0.80); // 20% deficit
    }
    protein = Math.round(weight * 2.2); // 2.2g/kg in deficit
    fat = Math.round(weight * 0.8);     // 0.8g/kg
    carbs = Math.max(Math.round((calories - (protein * 4 + fat * 9)) / 4), 60);
  } else if (goal.includes('gain') || goal.includes('volum') || goal.includes('muscul') || goal.includes('aumento')) {
    goalLabel = 'Volumen & Ganancia Muscular';
    goalEmoji = '🦍';
    goalDescription = 'Superávit calórico óptimo (+15%) para hipertrofia y ganancia de fuerza.';
    if (!user?.targetCalories) {
      calories = Math.round(tdee * 1.15); // 15% surplus
    }
    protein = Math.round(weight * 2.0); // 2.0g/kg
    fat = Math.round(weight * 1.0);     // 1.0g/kg
    carbs = Math.max(Math.round((calories - (protein * 4 + fat * 9)) / 4), 100);
  }

  // Water recommendation: ~35ml per kg of bodyweight
  const waterGlasses = Math.max(Math.round((weight * 35) / 250), 8);

  return {
    calories,
    protein,
    carbs,
    fat,
    waterGlasses,
    goalLabel,
    goalEmoji,
    goalDescription,
  };
}
