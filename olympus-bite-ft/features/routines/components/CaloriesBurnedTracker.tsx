"use client";

import { useState, useEffect } from "react";

// Standard MET values by muscle group key (from Exercise.muscleGroup)
const MET: Record<string, number> = {
  chest: 7,
  back: 7,
  shoulders: 6,
  biceps: 5,
  triceps: 5,
  legs: 8,
  glutes: 8,
  abs: 5,
  cardio: 10,
  full_body: 7,
  other: 6,
};

export function calcCalories(
  muscleGroups: string[],
  weightKg: number,
  durationSeconds: number,
): number {
  if (!muscleGroups.length || weightKg <= 0 || durationSeconds <= 0) return 0;
  const avgMet =
    muscleGroups.reduce((sum, g) => sum + (MET[g] ?? 6), 0) / muscleGroups.length;
  return Math.round(avgMet * weightKg * (durationSeconds / 3600));
}

export function CaloriesBurnedTracker({
  muscleGroups,
  weightKg,
  sessionStartTime,
}: {
  muscleGroups: string[];
  weightKg: number;
  sessionStartTime: number;
}) {
  const [kcal, setKcal] = useState(0);

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      setKcal(calcCalories(muscleGroups, weightKg, elapsed));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [muscleGroups, weightKg, sessionStartTime]);

  if (kcal === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-primary-500/10 border-t border-primary-500/20">
      <span className="text-base" aria-hidden>🔥</span>
      <span className="text-sm font-bold text-primary-400">{kcal} kcal</span>
      <span className="text-xs text-slate-400">quemadas (estimado)</span>
    </div>
  );
}
