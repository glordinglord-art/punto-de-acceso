"use client";

import { useEffect, useRef } from "react";

const RADIUS = 40;
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
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none" strokeWidth="6"
            className="stroke-primary-900/40"
          />
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none" strokeWidth="6" strokeLinecap="round"
            className="stroke-primary-500"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">
          {mm}:{ss}
        </span>
      </div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Descanso en curso</p>
      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-primary-400 hover:text-primary-300 underline"
      >
        Saltar
      </button>
    </div>
  );
}
