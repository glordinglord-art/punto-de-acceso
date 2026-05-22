'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Shield, Sparkles, TrendingUp } from 'lucide-react';
import type { ClientDashboard } from '../types/dashboard.types';

interface AthleteSkillsChartProps {
  stats: ClientDashboard;
}

interface Skill {
  key: string;
  name: string;
  value: number;
  description: string;
  color: string;
  glow: string;
}

const CENTER = 150;
const RADIUS = 90;
const TOTAL_AXES = 5;

export function AthleteSkillsChart({ stats }: AthleteSkillsChartProps) {
  const [animatedSkills, setAnimatedSkills] = useState<number[]>([0, 0, 0, 0, 0]);

  // 1. Calculate values for the 5 axes: Fuerza, Volumen, Frecuencia, Consistencia, Dieta
  const skillsData = useMemo(() => {
    // A. Fuerza (Strength): completed logs ratio
    const routine = stats.activeRoutine;
    const forceRatio = routine && routine.totalLogs > 0 ? routine.completedLogs / routine.totalLogs : 0;
    const fuerza = Math.round(40 + forceRatio * 60);

    // B. Volumen (Volume): sets completed (estimated from logs)
    const volumeRatio = routine && routine.totalLogs > 0 ? Math.min(routine.completedLogs * 5, 100) : 0;
    const volumen = Math.round(35 + (volumeRatio / 100) * 65);

    // C. Frecuencia (Frequency): days active this week (from weeklyTrend)
    const activeDays = stats.weeklyTrend?.filter((d) => d.meals > 0 || d.calories > 0).length ?? 0;
    const frecuencia = Math.round(30 + (activeDays / 7) * 70);

    // D. Consistencia (Consistency): today's water + meal logs adherence
    const waterRatio = Math.min(stats.waterGlasses / 8, 1);
    const mealsRatio = stats.mealsToday >= 3 ? 1 : stats.mealsToday / 3;
    const consistencia = Math.round(30 + (waterRatio * 0.5 + mealsRatio * 0.5) * 70);

    // E. Dieta (Diet): calorie adherence (closer to target is better)
    const targetCals = stats.targetCalories ?? 2200;
    const calDiff = Math.abs(stats.caloriesToday - targetCals);
    const calRatio = Math.max(0, 1 - calDiff / targetCals);
    const dieta = Math.round(40 + calRatio * 60);

    return [
      {
        key: 'fuerza',
        name: 'Fuerza',
        value: fuerza,
        description: 'Progreso y peso levantado de tu rutina activa.',
        color: '#FF6B35',
        glow: 'rgba(255, 107, 53, 0.4)',
      },
      {
        key: 'volumen',
        name: 'Volumen',
        value: volumen,
        description: 'Cantidad total de series y repeticiones registradas.',
        color: '#A3F900',
        glow: 'rgba(163, 249, 0, 0.4)',
      },
      {
        key: 'frecuencia',
        name: 'Frecuencia',
        value: frecuencia,
        description: 'Días activos con registros de entrenamientos o comidas.',
        color: '#00D9FF',
        glow: 'rgba(0, 217, 255, 0.4)',
      },
      {
        key: 'consistencia',
        name: 'Consistencia',
        value: consistencia,
        description: 'Adherencia diaria a tus hábitos de agua y comidas.',
        color: '#ec4899',
        glow: 'rgba(236, 72, 153, 0.4)',
      },
      {
        key: 'dieta',
        name: 'Dieta',
        value: dieta,
        description: 'Alineación de tus calorías diarias a la meta asignada.',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
      },
    ];
  }, [stats]);

  // 2. Trigger entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSkills(skillsData.map((s) => s.value));
    }, 100);
    return () => clearTimeout(timer);
  }, [skillsData]);

  // 3. Helper to get X, Y coordinates for a given value (0-100) and index
  const getCoordinates = (value: number, index: number) => {
    const angle = (index * 2 * Math.PI) / TOTAL_AXES - Math.PI / 2;
    const r = RADIUS * (value / 100);
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);
    return { x, y };
  };

  // 4. Generate points string for SVG polygon
  const polygonPoints = useMemo(() => {
    return animatedSkills
      .map((val, idx) => {
        const { x, y } = getCoordinates(val, idx);
        return `${x},${y}`;
      })
      .join(' ');
  }, [animatedSkills]);

  // 5. Grid levels (outer pentagons)
  const gridLevels = [20, 40, 60, 80, 100];

  // 6. Label positions (slightly offset from 100% boundary)
  const getLabelPosition = (index: number) => {
    const angle = (index * 2 * Math.PI) / TOTAL_AXES - Math.PI / 2;
    const r = RADIUS + 18; // offset from graph
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);

    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    let dy = '0.35em';

    // Fine-tune text anchors depending on coordinates
    if (Math.abs(x - CENTER) < 10) {
      textAnchor = 'middle';
      dy = y < CENTER ? '-0.5em' : '1.2em';
    } else if (x > CENTER) {
      textAnchor = 'start';
    } else {
      textAnchor = 'end';
    }

    return { x, y, textAnchor, dy };
  };

  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  const averageScore = Math.round(
    skillsData.reduce((s, d) => s + d.value, 0) / TOTAL_AXES
  );

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Habilidades <Sparkles className="h-4 w-4 text-primary-400" />
          </CardTitle>
          <CardDescription>Tu perfil de hábitos y fuerza</CardDescription>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400">
          <Shield className="h-5 w-5" />
        </div>
      </div>

      {/* Radar Chart SVG Area */}
      <div className="relative mt-4 flex items-center justify-center">
        <div className="w-full max-w-[270px] aspect-square">
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full select-none"
            aria-label="Gráfica de radar de rendimiento"
          >
            <defs>
              {/* Radial gradient for the polygon fill */}
              <radialGradient id="skills-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="70%" stopColor="#FF6B35" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#FF2D55" stopOpacity={0.45} />
              </radialGradient>
              {/* Shadow filter for the polygon glow */}
              <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF6B35" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Concentric grid pentagons */}
            {gridLevels.map((level) => {
              const points = Array.from({ length: TOTAL_AXES })
                .map((_, idx) => {
                  const { x, y } = getCoordinates(level, idx);
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <polygon
                  key={level}
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200/50 dark:text-white/5"
                  strokeWidth={1}
                />
              );
            })}

            {/* Axis lines from center to outer vertices */}
            {Array.from({ length: TOTAL_AXES }).map((_, idx) => {
              const outer = getCoordinates(100, idx);
              return (
                <line
                  key={idx}
                  x1={CENTER}
                  y1={CENTER}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="currentColor"
                  className="text-slate-200/50 dark:text-white/5"
                  strokeWidth={1}
                />
              );
            })}

            {/* Value grid levels labels (e.g. 50, 100) */}
            <text x={CENTER + 3} y={CENTER - RADIUS * 0.5 + 4} className="text-[8px] font-bold fill-slate-400">50</text>
            <text x={CENTER + 3} y={CENTER - RADIUS + 4} className="text-[8px] font-bold fill-slate-400">100</text>

            {/* The main performance polygon (animated) */}
            <motion.polygon
              points={polygonPoints}
              fill="url(#skills-grad)"
              stroke="#FF6B35"
              strokeWidth={2.5}
              strokeLinejoin="round"
              filter="url(#glow-filter)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Vertex handle nodes on the user's polygon */}
            {animatedSkills.map((val, idx) => {
              const { x, y } = getCoordinates(val, idx);
              const skill = skillsData[idx];

              return (
                <g key={skill.key} className="cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill={skill.color}
                    className="stroke-white dark:stroke-slate-900 transition-all duration-300"
                    strokeWidth={1.5}
                    onClick={() => setActiveSkill(skill)}
                    onMouseEnter={() => setActiveSkill(skill)}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={skill.color}
                    fillOpacity={0.15}
                    className="hover:scale-150 transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Labels around the perimeter */}
            {skillsData.map((skill, idx) => {
              const { x, y, textAnchor, dy } = getLabelPosition(idx);
              const isActive = activeSkill?.key === skill.key;

              return (
                <text
                  key={skill.key}
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dy={dy}
                  className={`text-[10px] font-display font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                    isActive ? 'fill-primary-400 font-bold scale-105' : 'fill-slate-700 dark:fill-slate-300'
                  }`}
                  onClick={() => setActiveSkill(skill)}
                  onMouseEnter={() => setActiveSkill(skill)}
                >
                  {skill.name} ({skill.value})
                </text>
              );
            })}
          </svg>
        </div>

        {/* Center core badge display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Nivel</span>
          <span className="font-display text-2xl font-black text-slate-900 dark:text-white">{averageScore}</span>
        </div>
      </div>

      {/* Selected skill info or Overall breakdown */}
      <div className="mt-4 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition-all dark:border-white/5 dark:bg-white/3 min-h-[96px] flex flex-col justify-center">
        {activeSkill ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: activeSkill.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeSkill.color, boxShadow: `0 0 6px ${activeSkill.glow}` }} />
                {activeSkill.name}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                Puntaje: {activeSkill.value}/100
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              {activeSkill.description}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-primary-400" /> Rendimiento Global
            </span>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
              Toca o pasa el cursor sobre las habilidades para ver el detalle y consejos para aumentarlas.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
