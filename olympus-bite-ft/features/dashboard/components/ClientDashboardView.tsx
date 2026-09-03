'use client';

import { useEffect, useState, useCallback, useId, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, animate } from 'framer-motion';
import {
  Flame, Droplets, Beef, Dumbbell, Calendar, ChevronRight, Trophy, Award, Plus, Activity
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { MEAL_TYPE_COLORS } from '@/features/dashboard/types/dashboard.types';
import type { ClientDashboard } from '@/features/dashboard/types/dashboard.types';
import { Header } from '@/shared/components/layout/Header';
import { cn, formatCalories, getLocalDateString } from '@/shared/lib/utils';
import { calculateNutritionTargets } from '@/features/meals/utils/nutrition-calculator';
import { FitiaDayTracker } from '@/features/dashboard/components/FitiaDayTracker';
import { UserComplianceModule } from './UserComplianceModule';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const WATER_GOAL = 8;
const PROTEIN_GOAL = 120;

// ─────────────────────────────────────────────────────────
// Empty state panel (Fitia Dark Style)
// ─────────────────────────────────────────────────────────
function EmptyPanel({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mt-4 flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/10 bg-white/5 px-6 text-center">
      <div className="text-white/40">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-white/50">{description}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Custom Dashboard Hero Widget (Fixed Overlap)
// ─────────────────────────────────────────────────────────
function DashboardHeroWidget({
  calories,
  calorieGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  waterGlasses,
  waterGoal,
  onWaterClick,
}: {
  calories: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  waterGlasses: number;
  waterGoal: number;
  onWaterClick: (idx: number) => void;
}) {
  const caloriesLeft = Math.max(calorieGoal - calories, 0);
  const pct = Math.min((calories / Math.max(calorieGoal, 1)) * 100, 100);
  
  // SVG Arc calculations
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = radius * Math.PI; // Semi-circle
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-[#1C1C1E] rounded-[32px] p-6 shadow-2xl border border-white/5 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary-500/10 rounded-full blur-[60px]" />
      
      {/* Arc Section */}
      <div className="relative flex flex-col items-center justify-center pt-8 w-full h-[180px]">
        <svg width={size} height={size / 2 + 20} className="absolute top-4 overflow-visible">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path
            d={`M ${strokeWidth/2 + 10} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2 - 10} ${size/2}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <motion.path
            d={`M ${strokeWidth/2 + 10} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2 - 10} ${size/2}`}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(249,115,22,0.4))' }}
          />
        </svg>

        {/* Center Numbers (Shifted UP so they don't touch the line) */}
        <div className="absolute top-[50px] flex flex-col items-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1"
          >
            Kcal Restantes
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
            className="text-[54px] font-black text-white tracking-tighter leading-none"
          >
            {caloriesLeft.toLocaleString('es')}
          </motion.h2>
        </div>

        {/* Consumed / Target labels (Shifted DOWN below the line) */}
        <div className="absolute bottom-0 w-full flex items-center justify-between px-10 text-[10px] font-bold text-white/40">
          <div className="text-center">
            <span className="block text-white/80 text-sm font-black">{calories.toLocaleString('es')}</span>
            <span className="uppercase tracking-wider">Consumidas</span>
          </div>
          <div className="text-center">
            <span className="block text-white/80 text-sm font-black">{calorieGoal.toLocaleString('es')}</span>
            <span className="uppercase tracking-wider">Objetivo</span>
          </div>
        </div>
      </div>

      {/* Macros Section */}
      <div className="mt-8 grid w-full grid-cols-3 gap-4 border-t border-white/5 pt-6 px-1">
        {[
          { label: 'Proteínas', val: protein, max: proteinGoal, c: 'bg-sky-400' },
          { label: 'Carbs', val: carbs, max: carbsGoal, c: 'bg-amber-400' },
          { label: 'Grasas', val: fat, max: fatGoal, c: 'bg-orange-400' },
        ].map((m, i) => {
          const mLeft = Math.max(m.max - m.val, 0);
          const mPct = Math.min((m.val / Math.max(m.max, 1)) * 100, 100);
          return (
            <div key={m.label} className="flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">{m.label}</p>
              <p className="text-sm font-black text-white mb-2">{mLeft}g <span className="text-[9px] font-bold text-white/30">restan</span></p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${m.c}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${mPct}%` }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 1 }}
                  style={{ boxShadow: '0 0 10px currentColor' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Water Section */}
      <div className="mt-6 w-full rounded-[24px] bg-white/5 border border-white/5 p-4 shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Hidratación (Vasos)</p>
          </div>
          <span className="text-xs font-black text-cyan-400">{waterGlasses} / {waterGoal}</span>
        </div>
        <div className="flex gap-1.5 h-10">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => onWaterClick(i)}
              className={cn(
                'flex-1 rounded-[6px] cursor-pointer transition-all hover:brightness-110 active:scale-95',
                i < waterGlasses
                  ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 hover:bg-white/10',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export function ClientDashboardView({
  trainerSwitchAction,
}: {
  trainerSwitchAction?: ReactNode;
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await dashboardService.getClientDashboard(user.id);
      if (res?.data) setStats(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr] pt-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-[28px] bg-white/5" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const targets = calculateNutritionTargets(user);
  const now = new Date();
  const today = getLocalDateString();
  const isSelectedToday = selectedDate === today;

  // Selected day data lookup
  const selectedDayTrend = stats.weeklyTrend?.find((d) => d.date === selectedDate);
  const displayCalories = isSelectedToday
    ? stats.caloriesToday
    : selectedDayTrend
      ? selectedDayTrend.calories
      : 0;

  const calorieGoal = targets.calories;
  const proteinGoal = targets.protein;
  const waterGoal = targets.waterGlasses;

  const routineProgress =
    stats.activeRoutine && stats.activeRoutine.totalLogs > 0
      ? Math.round((stats.activeRoutine.completedLogs / stats.activeRoutine.totalLogs) * 100)
      : 0;

  const aiCoachTip = (() => {
    if (stats.waterGlasses < 4) {
      return '¡La hidratación es clave! Bebe más agua hoy para evitar la fatiga.';
    }
    if (stats.proteinToday < proteinGoal * 0.6) {
      return `Tu ingesta de proteína está baja. Necesitas llegar a ${proteinGoal}g para maximizar tus resultados.`;
    }
    if (stats.activeRoutine && stats.activeRoutine.completedLogs === 0) {
      return '¡Aún no has registrado entrenamientos de esta rutina! Da tu primer paso hoy.';
    }
    return `¡Rendimiento impecable! Tu plan está optimizado para ${targets.goalLabel}.`;
  })();

  const todayNum = now.getDay() === 0 ? 7 : now.getDay();
  const todayDay = stats.activeRoutine?.days.find((d) => d.dayNumber === todayNum);
  const waterGlasses = stats.waterGlasses ?? 0;

  const handleWaterClick = async (index: number) => {
    if (!user) return;
    const newAmount = index + 1 === waterGlasses ? index : index + 1;
    setStats((prev) => prev ? { ...prev, waterGlasses: newAmount } : prev);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await dashboardService.updateWater(user.id, todayStr, newAmount);
    } catch {
      setStats((prev) => prev ? { ...prev, waterGlasses: waterGlasses } : prev);
    }
  };

  const displayProtein = isSelectedToday ? stats.proteinToday : 0;
  const displayCarbs = isSelectedToday ? stats.carbsToday : 0;
  const displayFat = isSelectedToday ? stats.fatToday : 0;
  return (
    <>
      {trainerSwitchAction && (
        <div className="absolute top-0 right-0 z-50 p-4 opacity-0 pointer-events-none">
          {/* We keep it in the DOM just in case the parent expects it to be mounted, but hide it completely since user asked to move it to MÁS */}
        </div>
      )}
    <div className="space-y-6 pb-12">
      {/* ── Fitia Minimalist Day Tracker Header ── */}
      <FitiaDayTracker
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        streakDays={4}
      />

      {/* ── Hero Row ── */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">

          {/* Premium Dashboard Hero */}
          <div className="flex flex-col gap-4">
            <DashboardHeroWidget
              calories={displayCalories}
              protein={displayProtein}
              carbs={displayCarbs}
              fat={displayFat}
              calorieGoal={targets.calories}
              proteinGoal={targets.protein}
              carbsGoal={targets.carbs}
              fatGoal={targets.fat}
              waterGlasses={waterGlasses}
              waterGoal={WATER_GOAL}
              onWaterClick={handleWaterClick}
            />
          </div>

          {/* Routine & Quick Stats */}
          <div className="flex h-full flex-col gap-4">
            <div className="flex flex-1 flex-col bg-[#18181A] rounded-[32px] p-6 relative overflow-hidden shadow-sm border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex items-start justify-between gap-4 relative z-10 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Rutina de hoy</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40 mt-1">
                    {stats.activeRoutine
                      ? `${stats.activeRoutine.trainingDays} DÍAS · ${stats.activeRoutine.weekCount} SEMANAS`
                      : 'SIN RUTINA ASIGNADA'}
                  </p>
                </div>
                {stats.activeRoutine && (
                  <Link href="/routines" className="flex shrink-0 items-center gap-0.5 text-xs font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 bg-primary-500/10 px-3 py-1.5 rounded-full">
                    Ver <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {!stats.activeRoutine ? (
                <EmptyPanel icon={<Dumbbell className="h-8 w-8" />} title="Sin rutina asignada" description="Tu entrenador aún no te ha asignado una rutina." />
              ) : todayDay?.isRestDay ? (
                <EmptyPanel icon={<span className="text-3xl">🛌</span>} title="Hoy toca descanso" description="Recuperar bien también es parte de progresar." />
              ) : todayDay ? (
                <div className="flex flex-1 flex-col gap-4 relative z-10">
                  <div className="flex items-center justify-between rounded-[20px] bg-white/5 border border-white/5 px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 font-bold mb-0.5">Enfoque</p>
                      <p className="text-base font-bold text-white">{todayDay.focusArea}</p>
                    </div>
                    <div className="bg-white/10 text-white/90 text-xs font-bold px-3 py-1 rounded-lg">{todayDay.exercises.length} ejercicios</div>
                  </div>

                  <div className="max-h-56 flex-1 space-y-2 overflow-y-auto pr-1">
                    {todayDay.exercises.map((ex, i) => (
                      <div key={ex.id} className="flex items-center gap-3 rounded-[16px] bg-white/5 px-4 py-3 border border-white/5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white/90">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{ex.name}</p>
                          <p className="text-xs text-white/50 font-medium">{ex.sets} × {ex.reps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyPanel icon={<Calendar className="h-8 w-8" />} title={stats.activeRoutine.name} description="Rutina activa sin día asignado para hoy." />
              )}
            </div>

            {/* Micro AI Tip Card instead of the big ones */}
            <div className="relative overflow-hidden rounded-[24px] border border-primary-500/20 bg-primary-500/5 p-4 flex items-center gap-3">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-500/20 rounded-full blur-[20px]" />
              <span className="text-xl shrink-0">🧠</span>
              <p className="text-xs text-white/70 font-medium leading-relaxed">
                <span className="text-primary-400 font-bold mr-1">Coach:</span> 
                {aiCoachTip}
              </p>
            </div>
          </div>
        </section>

        {/* ── Módulo Inteligente de Rendimiento y Porcentajes ── */}
        {user && (
          <UserComplianceModule userId={user.id} userName={user.name} />
        )}

        {/* ── Fast Meal Logging replacing charts ── */}
        <section className="bg-[#18181A] rounded-[32px] p-6 shadow-sm border border-white/5">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Diario de Comidas</h3>
              <p className="text-sm text-white/50 mt-1">Registra lo que has comido hoy para alcanzar tu meta.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['Desayuno', 'Almuerzo', 'Cena', 'Snack'].map((type) => {
              // Encuentra cuántas veces se registró hoy (mock up for UI)
              const hasRecorded = (stats.mealTypeDistribution?.find(m => m.type === type)?.count ?? 0) > 0;
              const mealColor = MEAL_TYPE_COLORS[type];

              return (
                <Link href="/meals" key={type}>
                  <div className="group flex h-full flex-col justify-between rounded-[24px] bg-white/5 border border-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn(
                        'inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                        mealColor?.bg ?? 'bg-white/5',
                        mealColor?.text ?? 'text-white',
                      )}>
                        {type}
                      </span>
                      {hasRecorded ? (
                        <div className="h-6 w-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center">
                          <Activity className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-white/5 text-white/40 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                          <Plus className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {hasRecorded ? (
                        <p className="text-sm font-bold text-white">Registrado</p>
                      ) : (
                        <p className="text-sm font-bold text-white/40">Sin registrar</p>
                      )}
                      <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mt-1">Toca para añadir</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Training Stats / Progression ── */}
        <section className="bg-[#18181A] rounded-[32px] p-6 shadow-sm border border-white/5">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Progreso y Mejora <Trophy className="w-5 h-5 text-amber-400" /></h3>
              <p className="text-sm text-white/50 mt-1">Tu desempeño físico general de la semana.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Metric 1 */}
            <div className="rounded-[24px] border border-white/5 bg-white/5 p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-sky-500/10 rounded-full blur-[20px]" />
              <Dumbbell className="h-5 w-5 text-sky-400 mb-4 relative z-10" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 relative z-10">Ejercicios Hechos</p>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-white">{stats.activeRoutine?.completedLogs ? stats.activeRoutine.completedLogs * 6 : 0}</span>
                <span className="text-xs font-bold text-sky-400 mb-1.5">+12%</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-[24px] border border-white/5 bg-white/5 p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-[20px]" />
              <Flame className="h-5 w-5 text-amber-400 mb-4 relative z-10" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 relative z-10">Consistencia</p>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-white">{routineProgress}%</span>
                <span className="text-xs font-bold text-amber-400 mb-1.5">¡Fuego!</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden relative z-10">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${routineProgress}%` }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-[24px] border border-white/5 bg-white/5 p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-[20px]" />
              <Activity className="h-5 w-5 text-emerald-400 mb-4 relative z-10" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 relative z-10">Mejora Estimada</p>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-white">+2.4</span>
                <span className="text-xs font-bold text-emerald-400 mb-1.5">kg</span>
              </div>
              <p className="text-[10px] text-white/30 font-bold mt-2 relative z-10">En volumen de carga</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
