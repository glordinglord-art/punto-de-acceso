"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Check } from "lucide-react";

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
  const [weight, setWeight] = useState(previousWeight?.toString() ?? "20");
  const [reps, setReps] = useState(previousReps?.toString() ?? "10");

  useEffect(() => {
    if (previousWeight !== null && previousWeight !== undefined) {
      setWeight(previousWeight.toString());
    }
    if (previousReps !== null && previousReps !== undefined) {
      setReps(previousReps.toString());
    }
  }, [previousWeight, previousReps, setNumber]);

  const numWeight = parseFloat(weight) || 0;
  const numReps = parseInt(reps, 10) || 0;

  const adjustWeight = (delta: number) => {
    const next = Math.max(0, Math.round((numWeight + delta) * 10) / 10);
    setWeight(next.toString());
  };

  const adjustReps = (delta: number) => {
    const next = Math.max(1, numReps + delta);
    setReps(next.toString());
  };

  const handleComplete = () => {
    onComplete(
      weight !== "" ? parseFloat(weight) : null,
      reps !== "" ? parseInt(reps, 10) : null,
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-white/8 to-white/4 rounded-3xl border border-white/12 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
      {/* Set Badge Header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-xs font-black uppercase tracking-wider text-primary-400 border border-primary-500/30">
          Serie {setNumber} de {totalSets}
        </span>
        {previousWeight !== null && previousReps !== null && (
          <span className="text-[11px] font-semibold text-slate-400">
            Anterior: <strong className="text-white">{previousWeight} kg</strong> × {previousReps} reps
          </span>
        )}
      </div>

      {/* Touch Controls Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight Control */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-black/40 border border-white/8">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
            🏋️ Peso (kg)
          </span>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => adjustWeight(-2.5)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40"
              aria-label="Restar peso"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={disabled}
              className="w-full bg-transparent text-center text-xl font-black text-white focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => adjustWeight(2.5)}
              disabled={disabled}
              className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40"
              aria-label="Sumar peso"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Quick pills */}
          <div className="flex justify-center gap-1 pt-0.5">
            {[-5, +2.5, +5].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => adjustWeight(delta)}
                className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* Reps Control */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-black/40 border border-white/8">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
            🔄 Repeticiones
          </span>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40"
              aria-label="Restar reps"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              disabled={disabled}
              className="w-full bg-transparent text-center text-xl font-black text-white focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-40"
              aria-label="Sumar reps"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Quick pills */}
          <div className="flex justify-center gap-1 pt-0.5">
            {[-2, +1, +2].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => adjustReps(delta)}
                className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Submit Action Button */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-amber-500 text-slate-950 font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4 stroke-[3]" />
        Registrar Serie {setNumber} de {totalSets}
      </button>
    </div>
  );
}
