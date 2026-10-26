import type { Exercise, WorkoutLog, SetLogData } from "../types/routines.types";

export type VitalFitProgressionState =
  | "double_progression"
  | "rep_building"
  | "dip_1w"
  | "fatigue_shield_2w"
  | "first_week";

export interface ExerciseAutoregulationInsight {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  state: VitalFitProgressionState;
  badgeLabel: string;
  tone: "emerald" | "amber" | "rose" | "cyan" | "slate";
  historyChainText: string;
  missionText: string;
  whyText: string;
  trainerActionLabel?: string;
  recommendedWeightKg: number | null;
  recommendedReps: number;
  recommendedSets: number;
  bestE1RmKg: number;
  bestRepsAtMaxWeight: number;
  maxHistoricalWeightKg: number;
  previousWeekSets: SetLogData[];
}

function parseRepRange(repsStr: string): { minReps: number; maxReps: number } {
  const nums = (repsStr || "8-10").match(/\d+/g)?.map(Number) || [8, 10];
  if (nums.length === 1) {
    return { minReps: nums[0], maxReps: nums[0] };
  }
  return {
    minReps: Math.min(nums[0], nums[1]),
    maxReps: Math.max(nums[0], nums[1]),
  };
}

function computeWeekBestScore(
  log: WorkoutLog,
  fallbackWeight: number,
): {
  bestWeight: number;
  avgReps: number;
  maxReps: number;
  completedSets: SetLogData[];
  e1Rm: number;
} {
  const sets = (log.setsData || []).filter(
    (s) => s.completed || (s.reps !== null && s.reps > 0),
  );
  if (sets.length === 0) {
    const w = log.weight ?? fallbackWeight ?? 0;
    const rMatch = log.repsDone?.match(/\d+/);
    const r = rMatch ? parseInt(rMatch[0], 10) : 8;
    const e1Rm = w > 0 ? w * (1 + r / 30) : r;
    return {
      bestWeight: w,
      avgReps: r,
      maxReps: r,
      completedSets: [],
      e1Rm,
    };
  }

  let bestWeight = 0;
  let maxReps = 0;
  let totalReps = 0;
  let bestE1Rm = 0;

  for (const s of sets) {
    const w = s.weight ?? fallbackWeight ?? 0;
    const r = s.reps ?? 0;
    if (w > bestWeight) bestWeight = w;
    if (r > maxReps) maxReps = r;
    totalReps += r;
    const score = w > 0 ? w * (1 + r / 30) : r;
    if (score > bestE1Rm) bestE1Rm = score;
  }

  return {
    bestWeight,
    avgReps: Math.round((totalReps / sets.length) * 10) / 10,
    maxReps,
    completedSets: sets,
    e1Rm: Math.round(bestE1Rm * 100) / 100,
  };
}

export function analyzeExerciseProgression(
  exercise: Exercise,
  allLogs: WorkoutLog[],
  currentWeek: number,
  options?: {
    sleepRegularityOk?: boolean;
    waterOk?: boolean;
  },
): ExerciseAutoregulationInsight {
  const { minReps, maxReps } = parseRepRange(exercise.reps);
  const baseWeight = exercise.targetWeight ?? 0;

  // Logs of this exercise from previous weeks sorted chronologically
  const prevLogs = allLogs
    .filter((l) => l.exerciseId === exercise.id && l.weekNumber < currentWeek)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  // Also compute all-time best for PR detection
  let maxHistoricalWeightKg = baseWeight;
  let bestRepsAtMaxWeight = maxReps;
  let bestE1RmKg = baseWeight > 0 ? baseWeight * (1 + maxReps / 30) : maxReps;

  allLogs
    .filter((l) => l.exerciseId === exercise.id)
    .forEach((l) => {
      const m = computeWeekBestScore(l, baseWeight);
      if (m.e1Rm > bestE1RmKg) bestE1RmKg = m.e1Rm;
      if (m.bestWeight > maxHistoricalWeightKg) {
        maxHistoricalWeightKg = m.bestWeight;
        bestRepsAtMaxWeight = m.maxReps;
      } else if (
        m.bestWeight === maxHistoricalWeightKg &&
        m.maxReps > bestRepsAtMaxWeight
      ) {
        bestRepsAtMaxWeight = m.maxReps;
      }
    });

  if (prevLogs.length === 0) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      state: "first_week",
      badgeLabel: "⚡ Vital Fit Labs · Marca Base",
      tone: "slate",
      historyChainText: "Primera semana registrando este ejercicio",
      missionText:
        baseWeight > 0
          ? `Hoy establece tu base: ${baseWeight} kg × ${maxReps} reps con técnica limpia`
          : `Hoy establece tu base: ${maxReps} reps controladas`,
      whyText:
        "Hoy medimos tu punto de partida real para calcular tu progresión de la próxima semana.",
      recommendedWeightKg: baseWeight > 0 ? baseWeight : null,
      recommendedReps: maxReps,
      recommendedSets: exercise.sets,
      bestE1RmKg,
      bestRepsAtMaxWeight,
      maxHistoricalWeightKg,
      previousWeekSets: [],
    };
  }

  const weeklyScores = prevLogs.map((l) => ({
    week: l.weekNumber,
    ...computeWeekBestScore(l, baseWeight),
  }));

  const last = weeklyScores[weeklyScores.length - 1];
  const prev1 =
    weeklyScores.length >= 2 ? weeklyScores[weeklyScores.length - 2] : null;
  const prev2 =
    weeklyScores.length >= 3 ? weeklyScores[weeklyScores.length - 3] : null;

  const historyChainText = weeklyScores
    .slice(-3)
    .map((w) =>
      w.bestWeight > 0
        ? `Sem ${w.week}: ${w.bestWeight}kg×${Math.round(w.avgReps)}`
        : `Sem ${w.week}: ${Math.round(w.avgReps)} reps`,
    )
    .join(" ➔ ");

  // Detect 2 consecutive weeks of performance drop:
  // Either (prev2 -> prev1 dropped AND prev1 -> last dropped)
  // OR (prev1 -> last dropped significantly >= 12% or >= 2 reps below minimum target)
  const droppedTwoWeeksInARow =
    (prev2 !== null &&
      prev1 !== null &&
      prev1.e1Rm < prev2.e1Rm * 0.98 &&
      last.e1Rm < prev1.e1Rm * 0.98) ||
    (prev1 !== null &&
      last.e1Rm < prev1.e1Rm * 0.94 &&
      last.avgReps < minReps);

  if (droppedTwoWeeksInARow) {
    const deloadWeight =
      last.bestWeight > 0
        ? Math.max(2.5, Math.round(last.bestWeight * 0.9 * 2) / 2)
        : null;
    const deloadSets = Math.max(2, exercise.sets - 1);
    const pillarIssue =
      options?.sleepRegularityOk === false || options?.waterOk === false;

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      state: "fatigue_shield_2w",
      badgeLabel: "🛡️ Vital Fit Labs · Ajuste Protector (Fatiga Detectada)",
      tone: "cyan",
      historyChainText,
      missionText: deloadWeight
        ? `Escudo activo hoy: Baja a ${deloadWeight} kg × ${minReps} reps (${deloadSets} series lejos del fallo)`
        : `Escudo activo hoy: Haz ${deloadSets} series × ${minReps} reps dejando 2 reps en reserva`,
      whyText: pillarIssue
        ? "Tu fuerza bajó en las últimas 2 sesiones por deuda de sueño (±1h) o hidratación. Hoy reducimos la carga un 10% para proteger tus tendones y recuperar tu sistema nervioso."
        : "Acumulaste fatiga muscular en las últimas 2 semanas (techo MRV). Hoy aplicamos una descarga inteligente del 10% para que supercompenses y vuelvas a romper récord la próxima semana.",
      trainerActionLabel: deloadWeight
        ? `Aplicar Descarga (${deloadSets} series a ${deloadWeight} kg)`
        : `Aplicar Descarga (${deloadSets} series)`,
      recommendedWeightKg: deloadWeight,
      recommendedReps: minReps,
      recommendedSets: deloadSets,
      bestE1RmKg,
      bestRepsAtMaxWeight,
      maxHistoricalWeightKg,
      previousWeekSets: last.completedSets,
    };
  }

  // Detect 1 week dip
  if (prev1 !== null && last.e1Rm < prev1.e1Rm * 0.97) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      state: "dip_1w",
      badgeLabel: "⚠️ Vital Fit Labs · Consolidar Marca",
      tone: "amber",
      historyChainText,
      missionText:
        last.bestWeight > 0
          ? `Hoy no subas peso: Mantén ${last.bestWeight} kg y recupera ${Math.round(prev1.avgReps)} reps`
          : `Hoy busca recuperar ${Math.round(prev1.avgReps)} reps con técnica estricta`,
      whyText:
        "En la sesión anterior bajaron ligeramente tus repeticiones. Hoy consolidamos el peso antes de volver a subir.",
      recommendedWeightKg: last.bestWeight > 0 ? last.bestWeight : null,
      recommendedReps: Math.max(minReps, Math.round(prev1.avgReps)),
      recommendedSets: exercise.sets,
      bestE1RmKg,
      bestRepsAtMaxWeight,
      maxHistoricalWeightKg,
      previousWeekSets: last.completedSets,
    };
  }

  // Detect Double Progression Ready (hit top of rep range!)
  if (last.avgReps >= maxReps) {
    const nextWeight =
      last.bestWeight > 0
        ? Math.round((last.bestWeight + 2.5) * 2) / 2
        : null;
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      state: "double_progression",
      badgeLabel: "🚀 Vital Fit Labs · ¡Listo para Subir Peso!",
      tone: "emerald",
      historyChainText,
      missionText: nextWeight
        ? `¡Dominaste el rango! Hoy sube a ${nextWeight} kg × ${minReps} reps (o saca ${ Math.round(last.avgReps) + 1} reps con ${last.bestWeight} kg)`
        : `¡Dominaste el rango! Hoy busca ${Math.round(last.avgReps) + 1} repeticiones`,
      whyText:
        "Cumpliste el tope de repeticiones en tu sesión anterior. Según el principio de Doble Progresión, tu cuerpo está listo para un nuevo estímulo.",
      trainerActionLabel: nextWeight
        ? `Subir Carga Oficial a ${nextWeight} kg`
        : undefined,
      recommendedWeightKg: nextWeight ?? (last.bestWeight > 0 ? last.bestWeight : null),
      recommendedReps: nextWeight ? minReps : Math.round(last.avgReps) + 1,
      recommendedSets: exercise.sets,
      bestE1RmKg,
      bestRepsAtMaxWeight,
      maxHistoricalWeightKg,
      previousWeekSets: last.completedSets,
    };
  }

  // Default: Rep Building inside the prescribed range
  const targetRepsToday = Math.min(maxReps + 1, Math.round(last.avgReps) + 1);
  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    state: "rep_building",
    badgeLabel: "📈 Vital Fit Labs · Subir +1 Repetición",
    tone: "emerald",
    historyChainText,
    missionText:
      last.bestWeight > 0
        ? `Mantén ${last.bestWeight} kg y hoy busca ${targetRepsToday} reps (+1 rep que la semana pasada)`
        : `Hoy busca ${targetRepsToday} repeticiones (+1 rep que la semana pasada)`,
    whyText:
      "Ganar 1 repetición más con el mismo peso es sobrecarga progresiva real y te acerca a subir de peso la próxima semana.",
    recommendedWeightKg: last.bestWeight > 0 ? last.bestWeight : null,
    recommendedReps: targetRepsToday,
    recommendedSets: exercise.sets,
    bestE1RmKg,
    bestRepsAtMaxWeight,
    maxHistoricalWeightKg,
    previousWeekSets: last.completedSets,
  };
}
