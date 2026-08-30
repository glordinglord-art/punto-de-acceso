'use client';

import { useState, useRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  waterGlasses?: number;
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
}


export function NutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  fiber = 0,
  sugar = 0,
  waterGlasses = 0,
  calorieGoal = 2000,
  proteinGoal,
  carbsGoal,
  fatGoal,
}: NutritionSummaryProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(0);

  const targetP = proteinGoal || Math.round((calorieGoal * 0.30) / 4);
  const targetC = carbsGoal || Math.round((calorieGoal * 0.45) / 4);
  const targetF = fatGoal || Math.round((calorieGoal * 0.25) / 9);

  const remainingCalories = Math.max(calorieGoal - calories, 0);
  const remainingProtein = Math.max(targetP - protein, 0);
  const remainingCarbs = Math.max(targetC - carbs, 0);
  const remainingFat = Math.max(targetF - fat, 0);

  const calPct = Math.min((calories / calorieGoal) * 100, 100);

  const getBarColor = () => {
    const pct = (calories / calorieGoal) * 100;
    if (pct >= 90 && pct <= 110) return 'bg-emerald-500';
    if (pct > 110) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  const getThumbColor = () => {
    const pct = (calories / calorieGoal) * 100;
    if (pct >= 90 && pct <= 110) return 'bg-emerald-400';
    if (pct > 110) return 'bg-rose-400';
    return 'bg-amber-400';
  };

  const getAiInsight = () => {
    if (calories === 0) return "Aún no has registrado nada. ¡Comienza tu día con un buen desayuno!";
    if (sugar > 50) return "⚠️ Has superado el límite recomendado de azúcar. Intenta reducir los dulces por hoy.";
    if (protein < targetP * 0.5 && calories > calorieGoal * 0.5) return "💡 Tus calorías van bien, pero la proteína está baja. Agrega pollo, huevo o legumbres.";
    if (fiber < 15 && calories > calorieGoal * 0.6) return "🥦 Te faltan vegetales. Una buena ensalada ayudará con tu digestión.";
    if (calories > calorieGoal) return "🔥 Has superado tus calorías. ¡Mañana ajustamos, no te rindas!";
    if (remainingCalories < 200) return "🎯 ¡Estás a punto de alcanzar tu meta! Excelente trabajo.";
    return "✨ Vas por excelente camino. ¡Tus macros están equilibrados!";
  };

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeSlide < 1) setActiveSlide(1);
      if (diff < 0 && activeSlide > 0) setActiveSlide(0);
    }
  };

  const slides = [
    // ── Slide 1: Calories + Macros ──
    (
      <div key="macros" className="px-1">
        {/* kcal restantes label */}
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-1">kcal restantes</p>

        {/* Big number */}
        <h2 className="text-center text-4xl font-black tracking-tight text-white tabular-nums leading-none mb-4">
          {remainingCalories.toLocaleString()}
        </h2>

        {/* Progress bar */}
        <div className="px-2 mb-5">
          <div className="h-1.5 bg-white/[0.06] rounded-full w-full relative">
            {/* Range markers */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-0.5 h-3 bg-white/15 z-10 rounded-full" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-0.5 h-3 bg-white/15 z-10 rounded-full" />

            {/* Filled track */}
            <div
              className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-1000", getBarColor())}
              style={{ width: `${calPct}%` }}
            />

            {/* Thumb */}
            <div
              className={cn("absolute top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full transition-all duration-1000 z-20 shadow-lg", getThumbColor())}
              style={{ left: `calc(${calPct}% - 3px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-1.5 px-6 font-medium tabular-nums">
            <span>{Math.round(calorieGoal * 0.9).toLocaleString()}</span>
            <span>{Math.round(calorieGoal * 1.1).toLocaleString()}</span>
          </div>
        </div>

        {/* Macro horizontal bars (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {[
            { label: 'Proteínas', value: protein, target: targetP, remaining: remainingProtein, color: 'bg-indigo-400', track: 'bg-indigo-400/15', text: 'text-indigo-400' },
            { label: 'Carbs', value: carbs, target: targetC, remaining: remainingCarbs, color: 'bg-amber-400', track: 'bg-amber-400/15', text: 'text-amber-400' },
            { label: 'Grasas', value: fat, target: targetF, remaining: remainingFat, color: 'bg-orange-400', track: 'bg-orange-400/15', text: 'text-orange-400' },
            { label: 'Fibra', value: fiber, target: 25, remaining: Math.max(25 - fiber, 0), color: 'bg-emerald-400', track: 'bg-emerald-400/15', text: 'text-emerald-400' },
          ].map((m) => (
            <div key={m.label} className="bg-white/[0.02] p-2.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{m.label}</span>
                <span className="text-[11px] font-bold text-white/70 tabular-nums">
                  {Math.round(m.value)}g <span className="text-white/30 font-normal">/ {m.target}g</span>
                </span>
              </div>
              <div className={cn("h-1.5 rounded-full w-full relative overflow-hidden", m.track)}>
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", m.color)}
                  style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="text-center flex-1">
            <span className="text-lg font-bold text-white tabular-nums">{calories.toLocaleString()}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Consumidas</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center flex-1">
            <span className="text-lg font-bold text-white tabular-nums">{calorieGoal.toLocaleString()}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Objetivo</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center flex-1">
            <span className="text-lg font-bold text-white tabular-nums">{Math.round(sugar)}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Azúcar (g)</p>
          </div>
        </div>
      </div>
    ),

    // ── Slide 2: Full Nutritional Details (Scrollable) ──
    (
      <div key="details" className="px-1 h-[305px] overflow-y-auto scrollbar-thin pr-1">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-2.5 sticky top-0 bg-[#18181A] py-1 z-10">Detalles completos</p>

        {/* Calorie breakdown */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 mb-2.5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">🔥 Energía</h4>
          <div className="space-y-2">
            {[
              { label: 'Consumidas', value: `${calories.toLocaleString()} kcal`, highlight: false },
              { label: 'Objetivo', value: `${calorieGoal.toLocaleString()} kcal`, highlight: false },
              { label: 'Restantes', value: `${remainingCalories.toLocaleString()} kcal`, highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-white/50">{row.label}</span>
                <span className={cn("text-sm font-bold tabular-nums", row.highlight ? (remainingCalories > 0 ? "text-emerald-400" : "text-rose-400") : "text-white")}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Macronutrients */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 mb-2.5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">💪 Macronutrientes</h4>
          <div className="space-y-2">
            {[
              { label: 'Proteínas', value: `${Math.round(protein)}g`, target: `${targetP}g`, pct: Math.round((protein / targetP) * 100), color: 'text-indigo-400' },
              { label: 'Carbohidratos', value: `${Math.round(carbs)}g`, target: `${targetC}g`, pct: Math.round((carbs / targetC) * 100), color: 'text-amber-400' },
              { label: 'Grasas totales', value: `${Math.round(fat)}g`, target: `${targetF}g`, pct: Math.round((fat / targetF) * 100), color: 'text-orange-400' },
              { label: 'Grasas saturadas', value: `${Math.round(fat * 0.35)}g`, target: `${Math.round(targetF * 0.35)}g`, pct: Math.round(((fat * 0.35) / (targetF * 0.35)) * 100), color: 'text-orange-300' },
              { label: 'Fibra', value: `${Math.round(fiber)}g`, target: '25g', pct: Math.round((fiber / 25) * 100), color: 'text-emerald-400' },
              { label: 'Azúcares', value: `${Math.round(sugar)}g`, target: '50g', pct: Math.round((sugar / 50) * 100), color: 'text-pink-400' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-white/50">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold tabular-nums", row.pct > 100 ? "text-rose-400" : "text-white/30")}>{row.pct}%</span>
                  <span className={cn("text-sm font-bold tabular-nums", row.color)}>{row.value}</span>
                  <span className="text-[10px] text-white/20 tabular-nums">/ {row.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vitamins (estimated) */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 mb-2.5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">🧬 Vitaminas (estimado)</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: 'Vitamina A', value: `${Math.round(calories * 0.4)}μg`, daily: '900μg' },
              { label: 'Vitamina C', value: `${Math.round(fiber * 3.2)}mg`, daily: '90mg' },
              { label: 'Vitamina D', value: `${Math.round(fat * 0.15)}μg`, daily: '15μg' },
              { label: 'Vitamina E', value: `${Math.round(fat * 0.22)}mg`, daily: '15mg' },
              { label: 'Vitamina K', value: `${Math.round(fiber * 4.8)}μg`, daily: '120μg' },
              { label: 'Vitamina B12', value: `${(protein * 0.03).toFixed(1)}μg`, daily: '2.4μg' },
              { label: 'Ácido fólico', value: `${Math.round(fiber * 16)}μg`, daily: '400μg' },
              { label: 'Niacina (B3)', value: `${Math.round(protein * 0.11)}mg`, daily: '16mg' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] text-white/40">{row.label}</span>
                <span className="text-[11px] font-bold text-white/60 tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Minerals (estimated) */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 mb-2.5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">⚡ Minerales (estimado)</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: 'Calcio', value: `${Math.round(calories * 0.45)}mg`, daily: '1000mg' },
              { label: 'Hierro', value: `${(protein * 0.07).toFixed(1)}mg`, daily: '8mg' },
              { label: 'Magnesio', value: `${Math.round(calories * 0.18)}mg`, daily: '400mg' },
              { label: 'Potasio', value: `${Math.round(calories * 1.8)}mg`, daily: '2600mg' },
              { label: 'Sodio', value: `${Math.round(calories * 1.1)}mg`, daily: '2300mg' },
              { label: 'Zinc', value: `${(protein * 0.08).toFixed(1)}mg`, daily: '11mg' },
              { label: 'Fósforo', value: `${Math.round(protein * 12)}mg`, daily: '700mg' },
              { label: 'Selenio', value: `${Math.round(protein * 0.4)}μg`, daily: '55μg' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] text-white/40">{row.label}</span>
                <span className="text-[11px] font-bold text-white/60 tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 mb-2.5">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">💧 Hidratación</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Vasos de agua</span>
            <span className="text-sm font-bold text-cyan-400 tabular-nums">{waterGlasses} / 8</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-lg transition-all border",
                  i < waterGlasses
                    ? "bg-cyan-400 border-cyan-400/50 shadow-sm shadow-cyan-400/20"
                    : "bg-white/5 border-white/5"
                )}
              />
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-primary-900/30 to-transparent border border-primary-500/20 rounded-2xl p-3.5 flex gap-3 items-start mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">✨</div>
          <div>
            <h4 className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Coach IA</h4>
            <p className="text-xs text-white/70 leading-relaxed">{getAiInsight()}</p>
          </div>
        </div>
      </div>
    ),
  ];

  return (
    <div
      className="w-full bg-[#18181A] rounded-[28px] p-5 text-white shadow-sm relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out items-start"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="w-full shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeSlide === i ? "bg-white w-5" : "bg-white/15 w-1.5 hover:bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}