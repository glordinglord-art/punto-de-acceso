export const APP_NAME = "Punto de Inflexión";
export const APP_DESCRIPTION = "Tu aliado en nutrición y entrenamiento";

export const MEAL_TYPES = {
  breakfast: { label: "Desayuno", icon: "🌅", color: "text-amber-500" },
  lunch: { label: "Almuerzo", icon: "☀️", color: "text-orange-500" },
  dinner: { label: "Cena", icon: "🌙", color: "text-indigo-500" },
  snack: { label: "Snack", icon: "🍎", color: "text-green-500" },
} as const;

export const MUSCLE_GROUPS = {
  chest: { label: "Pecho", icon: "💪" },
  back: { label: "Espalda", icon: "🔙" },
  shoulders: { label: "Hombros", icon: "🏋️" },
  biceps: { label: "Bíceps", icon: "💪" },
  triceps: { label: "Tríceps", icon: "💪" },
  legs: { label: "Piernas", icon: "🦵" },
  quads: { label: "Cuádriceps", icon: "🦵" },
  hamstrings: { label: "Isquiotibiales", icon: "🦵" },
  calves: { label: "Pantorrillas", icon: "🦶" },
  glutes: { label: "Glúteos", icon: "🍑" },
  abs: { label: "Abdominales", icon: "🎯" },
  core: { label: "Core", icon: "🎯" },
  forearms: { label: "Antebrazos", icon: "💪" },
  traps: { label: "Trapecios", icon: "🏋️" },
  abductors: { label: "Abductores", icon: "🦵" },
  adductors: { label: "Aductores", icon: "🦵" },
  hybrid: { label: "Híbrido", icon: "🔄" },
  cardio: { label: "Cardio", icon: "❤️" },
  full_body: { label: "Cuerpo completo", icon: "🏃" },
} as const;

export const DAYS_OF_WEEK = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
] as const;
