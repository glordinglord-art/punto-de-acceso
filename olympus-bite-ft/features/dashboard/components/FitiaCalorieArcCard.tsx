'use client';

import { useState } from 'react';
import { Pencil, MoreHorizontal, Check, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface FitiaCalorieArcCardProps {
  consumedCalories: number;
  targetCalories: number;
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
  isDayFinished?: boolean;
  onFinishDay?: () => void;
  onEditTargets?: () => void;
}

export function FitiaCalorieArcCard({
  consumedCalories,
  targetCalories = 2000,
  consumedProtein,
  targetProtein = 150,
  consumedCarbs,
  targetCarbs = 200,
  consumedFat,
  targetFat = 65,
  isDayFinished = false,
  onFinishDay,
  onEditTargets,
}: FitiaCalorieArcCardProps) {
  const [slide, setSlide] = useState<0 | 1>(0);

  // Remaining values
  const remainingCals = Math.max(0, targetCalories - consumedCalories);
  const remainingProtein = Math.max(0, targetProtein - consumedProtein);
  const remainingCarbs = Math.max(0, targetCarbs - consumedCarbs);
  const remainingFat = Math.max(0, targetFat - consumedFat);

  // Targets range (e.g. ±10%)
  const minTarget = Math.round(targetCalories * 0.9);
  const maxTarget = Math.round(targetCalories * 1.1);

  // Percentage consumed (0 to 1)
  const pct = Math.min(1, Math.max(0, consumedCalories / Math.max(targetCalories, 1)));

  // SVG Arc parameters for a sleek low-dome curve
  // We use a gentle bezier curve or elliptical arc
  // Path starts at (20, 75) and curves to (280, 75) with control peak at (150, 15)
  // Arc length is approximately 285
  const arcLength = 285;
  const strokeDashoffset = arcLength - pct * arcLength;

  return (
    <div className="w-full rounded-[28px] bg-[#12141a] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-1/4 w-48 h-32 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Top Header of the Card: ✏️  |  kcal restantes >  |  ··· */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onEditTargets}
          className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          title="Editar meta calórica"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setSlide(slide === 0 ? 1 : 0)}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <span>{slide === 0 ? 'kcal restantes' : 'Totales consumidos'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onEditTargets}
          className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          title="Más opciones"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {slide === 0 ? (
          <motion.div
            key="slide-remaining"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            {/* Huge bold remaining calories number */}
            <div className="text-center my-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white tabular-nums font-display leading-none">
                {remainingCals.toLocaleString('es-ES')}
              </span>
            </div>

            {/* Gentle Low-Dome Arc Gauge */}
            <div className="relative w-full max-w-[300px] h-[75px] my-1 flex items-center justify-center">
              <svg
                width="300"
                height="80"
                viewBox="0 0 300 80"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="fitiaArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Background Track Arc */}
                <path
                  d="M 25 65 Q 150 10 275 65"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Foreground Animated Progress Arc */}
                <path
                  d="M 25 65 Q 150 10 275 65"
                  fill="none"
                  stroke="url(#fitiaArcGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.5))',
                  }}
                />

                {/* Left Tick Mark (Min target ~ 1,735) */}
                <line
                  x1="110"
                  y1="26"
                  x2="110"
                  y2="38"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Right Tick Mark (Max target ~ 2,121) */}
                <line
                  x1="190"
                  y1="26"
                  x2="190"
                  y2="38"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Tick Labels under the arc */}
              <div className="absolute inset-x-0 bottom-0 flex justify-between px-16 text-[10px] font-mono text-neutral-400">
                <span>{minTarget.toLocaleString('es-ES')}</span>
                <span>{maxTarget.toLocaleString('es-ES')}</span>
              </div>
            </div>

            {/* 3 Macro Columns underneath */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-white/[0.06]">
              {/* Proteínas */}
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-xs text-neutral-300 font-semibold mb-0.5">
                  <span>Proteínas</span>
                  <ChevronRight className="w-3 h-3 text-neutral-400" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white tabular-nums truncate">
                  {Math.round(remainingProtein)} g <span className="text-[11px] font-normal text-neutral-400">restan...</span>
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (consumedProtein / Math.max(targetProtein, 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-xs text-neutral-300 font-semibold mb-0.5">
                  <span>Carbs</span>
                  <ChevronRight className="w-3 h-3 text-neutral-400" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white tabular-nums truncate">
                  {Math.round(remainingCarbs)} g <span className="text-[11px] font-normal text-neutral-400">restan...</span>
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (consumedCarbs / Math.max(targetCarbs, 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Grasas */}
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-xs text-neutral-300 font-semibold mb-0.5">
                  <span>Grasas</span>
                  <ChevronRight className="w-3 h-3 text-neutral-400" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white tabular-nums truncate">
                  {Math.round(remainingFat)} g <span className="text-[11px] font-normal text-neutral-400">restan...</span>
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (consumedFat / Math.max(targetFat, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slide-consumed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center py-2"
          >
            <div className="text-center my-1">
              <p className="text-xs font-mono uppercase text-neutral-400 mb-1">Calorías consumidas</p>
              <span className="text-5xl font-black text-white tabular-nums font-display">
                {consumedCalories.toLocaleString('es-ES')}
              </span>
              <span className="text-sm text-neutral-400 font-medium ml-2">/ {targetCalories} kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-3 border-t border-white/[0.06] text-center">
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Proteína</p>
                <p className="font-bold text-cyan-300 text-sm mt-0.5">{Math.round(consumedProtein)} / {targetProtein}g</p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Carbohidratos</p>
                <p className="font-bold text-amber-300 text-sm mt-0.5">{Math.round(consumedCarbs)} / {targetCarbs}g</p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 font-medium">Grasas</p>
                <p className="font-bold text-rose-300 text-sm mt-0.5">{Math.round(consumedFat)} / {targetFat}g</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button: Terminar Día (Tactile pill matching Fitia screenshot) */}
      <button
        type="button"
        onClick={onFinishDay}
        className={cn(
          "w-full mt-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98",
          isDayFinished
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
            : "bg-[#21242d] hover:bg-[#282d38] border border-white/[0.06] text-neutral-400 hover:text-white"
        )}
      >
        {isDayFinished ? (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            <span>¡Día Completado! 🔥</span>
          </>
        ) : (
          <span>Terminar Día</span>
        )}
      </button>

      {/* Carousel Dots Indicator: ● ○ */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => setSlide(0)}
          className={cn(
            "w-2 h-2 rounded-full transition-all cursor-pointer",
            slide === 0 ? "bg-white w-4" : "bg-white/20 hover:bg-white/40"
          )}
        />
        <button
          type="button"
          onClick={() => setSlide(1)}
          className={cn(
            "w-2 h-2 rounded-full transition-all cursor-pointer",
            slide === 1 ? "bg-white w-4" : "bg-white/20 hover:bg-white/40"
          )}
        />
      </div>
    </div>
  );
}
