"use client";

import { useEffect, useRef } from "react";
import { FastForward } from "lucide-react";

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // AudioContext may be blocked on some browsers — silent fail is correct
  }
}

export function RestTimer({
  duration,
  remaining,
  onFinish,
  onSkip,
}: {
  duration: number;
  remaining: number;
  onFinish: () => void;
  onSkip: () => void;
}) {
  const prevRemaining = useRef(remaining);

  useEffect(() => {
    if (prevRemaining.current > 0 && remaining === 0) {
      navigator.vibrate?.(200);
      beep();
      onFinish();
    }
    prevRemaining.current = remaining;
  }, [remaining, onFinish]);

  const progress = duration > 0 ? remaining / duration : 0;
  const dashoffset = CIRCUMFERENCE * (1 - progress);
  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 px-4 rounded-3xl bg-gradient-to-b from-white/[0.08] to-black/60 border border-white/12 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-sm mx-auto">
      {/* Timer Circular Ring */}
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            className="stroke-white/10"
          />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-amber-500 transition-all duration-700 ease-linear shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white tabular-nums tracking-tight">
            {mm}:{ss}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
            Descanso
          </span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <p className="text-sm font-black text-white">
          Respira y recupera fuerzas
        </p>
        <p className="text-xs text-slate-400">
          Prepárate para la siguiente serie
        </p>
      </div>

      {/* Quick Action Button */}
      <div className="flex items-center gap-3 w-full pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FastForward className="w-4 h-4 text-amber-400" />
          <span>Saltar</span>
        </button>
      </div>
    </div>
  );
}
