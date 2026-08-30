'use client';

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

/* ── Semicircular Arc Gauge ─────────────────────────── */
function CalorieArc({ consumed, goal }: { consumed: number; goal: number }) {
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // shift center down a bit so arc sits nicely

  // Arc from 180° (left) to 0° (right)  →  π to 0  (top half)
  const startAngle = Math.PI;         // left
  const endAngle = 0;                 // right
  const totalArc = Math.PI;           // half circle

  const pct = Math.min(consumed / goal, 1.15); // allow slight overshoot visually
  const filledAngle = startAngle - totalArc * Math.min(pct, 1);

  // Helper to get point on arc
  const pt = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  const bgStart = pt(startAngle);
  const bgEnd = pt(endAngle);
  const fillEnd = pt(filledAngle);

  // Large arc flag for filled portion
  const fillSweep = totalArc * Math.min(pct, 1) > Math.PI ? 1 : 0;

  // Color based on progress
  const getGradientId = () => {
    if (pct >= 1) return 'arcOver';
    if (pct >= 0.85) return 'arcGood';
    return 'arcProgress';
  };

  const remaining = Math.max(goal - consumed, 0);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`} className="overflow-visible">
        <defs>
          <linearGradient id="arcProgress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="arcGood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="arcOver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0.25, 0.5, 0.75].map((t) => {
          const angle = startAngle - totalArc * t;
          const inner = { x: cx + (r - 8) * Math.cos(angle), y: cy - (r - 8) * Math.sin(angle) };
          const outer = { x: cx + (r + 8) * Math.cos(angle), y: cy - (r + 8) * Math.sin(angle) };
          return (
            <line
              key={t}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Filled arc */}
        {consumed > 0 && (
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${fillSweep} 1 ${fillEnd.x} ${fillEnd.y}`}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        )}
      </svg>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '16px' }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">kcal restantes</span>
        <span className="text-5xl font-black tracking-tight text-white tabular-nums leading-none">
          {remaining.toLocaleString()}
        </span>
      </div>

      {/* Consumed (left) / Objective (right) */}
      <div className="flex w-full justify-between px-2 -mt-2">
        <div className="text-center">
          <span className="text-xl font-bold text-white tabular-nums">{consumed.toLocaleString()}</span>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mt-0.5">Consumidas</p>
        </div>
        <div className="text-center">
          <span className="text-xl font-bold text-white tabular-nums">{goal.toLocaleString()}</span>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mt-0.5">Objetivo</p>
        </div>
      </div>
    </div>
  );
}

/* ── Macro Progress Bar ─────────────────────────────── */
function MacroBar({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const remaining = Math.max(target - current, 0);
  const pct = Math.min((current / target) * 100, 100);

  const colorMap: Record<string, { bar: string; text: string }> = {
    blue: { bar: 'bg-blue-500', text: 'text-blue-400' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
    orange: { bar: 'bg-orange-500', text: 'text-orange-400' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-black tabular-nums", c.text)}>{Math.round(remaining)}g</span>
        <span className="text-[10px] text-white/30 font-medium">restan</span>
      </div>
      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", c.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Hydration Tracker ──────────────────────────────── */
function HydrationTracker({ glasses, goal = 8 }: { glasses: number; goal?: number }) {
  return (
    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">💧</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Hidratación (vasos)</span>
        </div>
        <span className="text-sm font-bold text-cyan-400 tabular-nums">{glasses}/{goal}</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-lg transition-all duration-300 border",
              i < glasses
                ? "bg-cyan-400 border-cyan-400/50 shadow-sm shadow-cyan-400/20"
                : "bg-white/5 border-white/5"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export function NutritionArcGauge({
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
  const targetP = proteinGoal || Math.round((calorieGoal * 0.30) / 4);
  const targetC = carbsGoal || Math.round((calorieGoal * 0.45) / 4);
  const targetF = fatGoal || Math.round((calorieGoal * 0.25) / 9);

  const remainingCalories = Math.max(calorieGoal - calories, 0);

  const getAiInsight = () => {
    if (calories === 0) return "Aún no has registrado nada. ¡Comienza tu día con un buen desayuno!";
    if (sugar > 50) return "⚠️ Has superado el límite recomendado de azúcar. Intenta reducir los dulces por hoy.";
    if (protein < targetP * 0.5 && calories > calorieGoal * 0.5) return "💡 Tus calorías van bien, pero la proteína está baja. Agrega pollo, huevo o legumbres en tu próxima comida.";
    if (fiber < 15 && calories > calorieGoal * 0.6) return "🥦 Te faltan vegetales. Un buen bowl de ensalada ayudará con tu digestión.";
    if (calories > calorieGoal) return "🔥 Has superado tus calorías. ¡Mañana ajustamos, no te rindas!";
    if (remainingCalories < 200) return "🎯 ¡Estás a punto de alcanzar tu meta exacta! Excelente trabajo.";
    return "✨ Vas por excelente camino. ¡Tus macros están equilibrados!";
  };

  return (
    <div className="w-full bg-[#18181A] rounded-[32px] p-6 text-white shadow-sm relative overflow-hidden">
      {/* ── Calorie Arc ─── */}
      <CalorieArc consumed={calories} goal={calorieGoal} />

      {/* ── Macro Bars ─── */}
      <div className="grid grid-cols-3 gap-6 mt-6 mb-6">
        <MacroBar label="Proteínas" current={protein} target={targetP} color="blue" />
        <MacroBar label="Carbs" current={carbs} target={targetC} color="amber" />
        <MacroBar label="Grasas" current={fat} target={targetF} color="orange" />
      </div>

      {/* ── Micronutrients ─── */}
      <div className="grid grid-cols-3 gap-4 mb-5 border-t border-white/5 pt-5">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-1">Fibra</span>
          <span className="text-sm font-semibold text-white/80 tabular-nums">{Math.round(fiber)} g</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-1">Azúcar</span>
          <span className="text-sm font-semibold text-white/80 tabular-nums">{Math.round(sugar)} g</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-1">Agua</span>
          <span className="text-sm font-semibold text-white/80 tabular-nums">{waterGlasses} vasos</span>
        </div>
      </div>

      {/* ── Hydration ─── */}
      <HydrationTracker glasses={waterGlasses} />

      {/* ── AI Insight Box ─── */}
      <div className="bg-gradient-to-br from-primary-900/30 to-transparent border border-primary-500/20 rounded-2xl p-4 mt-5 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
          ✨
        </div>
        <div>
          <h4 className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Coach IA</h4>
          <p className="text-xs text-white/70 leading-relaxed">
            {getAiInsight()}
          </p>
        </div>
      </div>
    </div>
  );
}