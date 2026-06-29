"use client";

import { useState } from "react";

export function SetLogger({
  setNumber,
  totalSets,
  previousWeight,
  previousReps,
  disabled,
  onComplete,
}: {
  setNumber: number;
  totalSets: number;
  previousWeight: number | null;
  previousReps: number | null;
  disabled: boolean;
  onComplete: (weight: number | null, reps: number | null) => void;
}) {
  const [weight, setWeight] = useState(previousWeight?.toString() ?? "");
  const [reps, setReps] = useState(previousReps?.toString() ?? "");

  const handleComplete = () => {
    onComplete(
      weight !== "" ? parseFloat(weight) : null,
      reps !== "" ? parseInt(reps, 10) : null,
    );
  };

  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
      <span className="w-12 text-xs font-bold text-slate-400 shrink-0">
        S{setNumber}/{totalSets}
      </span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        disabled={disabled}
        className="w-16 rounded-xl bg-slate-800 border border-slate-600 px-2 py-2 text-center text-sm font-bold text-white focus:border-primary-500 focus:outline-none disabled:opacity-40"
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        disabled={disabled}
        className="w-16 rounded-xl bg-slate-800 border border-slate-600 px-2 py-2 text-center text-sm font-bold text-white focus:border-primary-500 focus:outline-none disabled:opacity-40"
      />
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 disabled:opacity-40 active:scale-95 transition-transform"
        aria-label="Marcar serie completada"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
}
