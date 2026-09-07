'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Utensils,
  Moon,
  Brain,
  Dumbbell,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { tasksService } from '@/features/tasks/services/tasks.service';
import { Modal } from '@/shared/components/ui/Modal';
import { FoodScanner } from '@/features/meals/components/FoodScanner';

interface VitalBioPillarsWidgetProps {
  userId: string;
  selectedDate: string;
  calories: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  waterGlasses: number;
  waterGoal: number;
  activeRoutine?: {
    name: string;
    trainingDays: number;
    weekCount: number;
    completedLogs: number;
    totalLogs: number;
    days: Array<{
      dayNumber: number;
      focusArea: string;
      isRestDay: boolean;
      exercises: Array<{ id: string; name: string; sets: number; reps: string }>;
    }>;
  } | null;
  onOpenMealLogger?: () => void;
  onMealLogged?: () => void;
  className?: string;
}

interface StressData {
  stressLevel: number;
  mood?: string;
  energyLevel?: number;
  sleepHours?: number;
  sleepQuality?: string;
  notes?: string;
}

interface RawStressItem {
  stressLevel?: number;
  mood?: string;
  energyLevel?: number;
  notes?: string;
}

interface RawComplianceItem {
  today?: {
    workoutsLogged?: number;
  };
}

export function VitalBioPillarsWidget({
  userId,
  selectedDate,
  calories,
  protein,
  proteinGoal,
  activeRoutine,
  onOpenMealLogger,
  onMealLogged,
  className,
}: VitalBioPillarsWidgetProps) {
  const [stressData, setStressData] = useState<StressData | null>(null);
  const [savingStress, setSavingStress] = useState(false);
  const [savingSleep, setSavingSleep] = useState(false);
  const [workoutsLoggedToday, setWorkoutsLoggedToday] = useState(0);
  const [showFoodScanner, setShowFoodScanner] = useState(false);

  // Load existing logs for selected date
  const loadDayLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await tasksService.getDailyStress(userId, selectedDate, selectedDate);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const row = res.data[0] as RawStressItem;
        let sleepHours: number | undefined = undefined;
        let sleepQuality: string | undefined = undefined;

        if (row.notes) {
          try {
            const parsed = JSON.parse(row.notes);
            if (parsed.sleepHours) sleepHours = parsed.sleepHours;
            if (parsed.sleepQuality) sleepQuality = parsed.sleepQuality;
          } catch {
            // Notes is plain text
          }
        }

        setStressData({
          stressLevel: row.stressLevel ?? 5,
          mood: row.mood,
          energyLevel: row.energyLevel ?? 5,
          sleepHours,
          sleepQuality,
          notes: row.notes,
        });
      } else {
        setStressData(null);
      }

      // Check compliance for workouts logged today
      const compRes = await tasksService.getCompliance(userId, selectedDate);
      if (compRes?.data) {
        const comp = compRes.data as RawComplianceItem;
        setWorkoutsLoggedToday(comp.today?.workoutsLogged ?? 0);
      }
    } catch {
      // Ignore background fetch error
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    loadDayLogs();
  }, [loadDayLogs]);

  // Handle instant 1-tap Stress Logging
  const handleSelectStress = async (level: number, label: string) => {
    setSavingStress(true);
    const prev = stressData;
    const updated: StressData = {
      ...prev,
      stressLevel: level,
      mood: label,
      energyLevel: level <= 3 ? 8 : level <= 6 ? 6 : 3,
    };
    setStressData(updated);

    try {
      await tasksService.saveDailyStress(userId, {
        date: selectedDate,
        stressLevel: level,
        mood: label,
        energyLevel: updated.energyLevel,
        notes: prev?.notes,
      });
      toast.success(`Foco registrado: ${label}`, {
        icon: level <= 3 ? '🟢' : level <= 6 ? '🟡' : '🔴',
        style: {
          borderRadius: '16px',
          background: '#12141C',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
    } catch {
      setStressData(prev);
      toast.error('No se pudo guardar el estrés');
    } finally {
      setSavingStress(false);
    }
  };

  // Handle instant 1-tap Sleep Logging
  const handleSelectSleep = async (hours: number, quality: string) => {
    setSavingSleep(true);
    const prev = stressData;
    const currentNotesObj = (() => {
      if (!prev?.notes) return {};
      try {
        return JSON.parse(prev.notes);
      } catch {
        return { text: prev.notes };
      }
    })();

    const updatedNotes = JSON.stringify({
      ...currentNotesObj,
      sleepHours: hours,
      sleepQuality: quality,
      updatedAt: new Date().toISOString(),
    });

    const updated: StressData = {
      ...prev,
      stressLevel: prev?.stressLevel ?? 4,
      sleepHours: hours,
      sleepQuality: quality,
      notes: updatedNotes,
    };
    setStressData(updated);

    try {
      await tasksService.saveDailyStress(userId, {
        date: selectedDate,
        stressLevel: updated.stressLevel,
        mood: prev?.mood || 'Equilibrado',
        energyLevel: hours >= 7 ? 8 : 5,
        notes: updatedNotes,
      });
      toast.success(`Descanso registrado: ${hours}h (${quality})`, {
        icon: '💤',
        style: {
          borderRadius: '16px',
          background: '#12141C',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
    } catch {
      setStressData(prev);
      toast.error('No se pudo guardar el descanso');
    } finally {
      setSavingSleep(false);
    }
  };

  // ── Calculate 4 Pillars Status ──
  const nutritionDone = calories > 0;
  const sleepDone = typeof stressData?.sleepHours === 'number' && stressData.sleepHours > 0;
  const stressDone = !!stressData && typeof stressData.stressLevel === 'number';

  const todayDayOfWeek = (() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const day = d.getDay();
    return day === 0 ? 7 : day;
  })();
  const todayRoutineDay = activeRoutine?.days?.find((d) => d.dayNumber === todayDayOfWeek);
  const workoutDone = workoutsLoggedToday > 0 || (todayRoutineDay?.isRestDay ?? false);

  const pillarsCount = [nutritionDone, sleepDone, stressDone, workoutDone].filter(Boolean).length;
  const readinessPct = Math.round((pillarsCount / 4) * 100);

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Top Hero Bar: Adaptación Biológica Diaria (Estilo Pulso / Whoop) ── */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#12141F] via-[#0E1017] to-[#08090E] p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-primary-500/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Adaptación Biológica
              </p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              {readinessPct === 100 ? (
                <>
                  <span>Organismo en Sincronía Total</span>
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                </>
              ) : readinessPct >= 75 ? (
                'Rendimiento Celular Óptimo'
              ) : readinessPct >= 50 ? (
                'Construcción de Hábito Activa'
              ) : (
                'Inicia tu Sincronización Diaria'
              )}
            </h3>
            <p className="text-xs text-white/50 font-medium">
              {pillarsCount} de 4 Pilares registrados hoy · Cero fricción
            </p>
          </div>

          {/* Mini-Score Gauge */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <p className="text-2xl font-black text-white leading-none font-mono">
                {readinessPct}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mt-0.5">
                Bio-Score
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-2 relative shadow-inner">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className={cn(
                    readinessPct >= 75
                      ? 'text-emerald-400'
                      : readinessPct >= 50
                      ? 'text-amber-400'
                      : 'text-primary-400'
                  )}
                  strokeDasharray={`${readinessPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${readinessPct}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <HeartPulse className="absolute h-4 w-4 text-white/70" />
            </div>
          </div>
        </div>

        {/* 4 Pillars Mini Progress Bar */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Nutrición', done: nutritionDone, color: 'bg-emerald-400' },
            { label: 'Sueño', done: sleepDone, color: 'bg-indigo-400' },
            { label: 'Estrés', done: stressDone, color: 'bg-amber-400' },
            { label: 'Entreno', done: workoutDone, color: 'bg-rose-500' },
          ].map((pil, idx) => (
            <div key={idx} className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', pil.done ? pil.color : 'bg-transparent')}
                  initial={{ width: 0 }}
                  animate={{ width: pil.done ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  style={pil.done ? { boxShadow: '0 0 10px currentColor' } : undefined}
                />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 truncate text-center">
                {pil.label} {pil.done && '✓'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── The 4 Tactile Cards Grid (Estilo Pulso / Bevel) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* ── CARD 1: NUTRICIÓN ── */}
        <div
          className={cn(
            'group relative overflow-hidden rounded-[24px] border p-4.5 transition-all duration-200',
            nutritionDone
              ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 via-[#111419] to-[#0A0C11]'
              : 'border-white/5 bg-[#12141C]/80 hover:border-white/10'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90">
                  1. Nutrición & Combustible
                </p>
                <h4 className="text-sm font-bold text-white">
                  {calories > 0 ? `${calories.toLocaleString('es')} kcal` : 'Sin comidas hoy'}
                </h4>
              </div>
            </div>

            {nutritionDone && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                <Check className="h-3 w-3" /> Registrado
              </span>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-xs text-white/60">
              <span className="font-semibold text-white">{protein}g</span>{' '}
              <span className="text-white/40">/ {proteinGoal}g proteína</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenMealLogger) {
                  onOpenMealLogger();
                } else {
                  setShowFoodScanner(true);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-all active:scale-95 shadow-sm"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{calories > 0 ? '+ Registrar' : 'Tomar Foto'}</span>
            </button>
          </div>
        </div>

        {/* ── CARD 2: SUEÑO & RECUPERACIÓN (1-TAP QUICK SELECT) ── */}
        <div
          className={cn(
            'group relative overflow-hidden rounded-[24px] border p-4.5 transition-all duration-200',
            sleepDone
              ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-950/15 via-[#111419] to-[#0A0C11]'
              : 'border-white/5 bg-[#12141C]/80 hover:border-white/10'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/90">
                  2. Descanso & Sueño
                </p>
                <h4 className="text-sm font-bold text-white">
                  {sleepDone
                    ? `${stressData?.sleepHours} horas · ${stressData?.sleepQuality || 'Reparador'}`
                    : '¿Cuánto dormiste?'}
                </h4>
              </div>
            </div>

            {sleepDone && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/20">
                <Check className="h-3 w-3" /> OK
              </span>
            )}
          </div>

          {/* 1-Tap Sleep Selector Chips */}
          <div className="mt-3.5 flex items-center gap-2 border-t border-white/5 pt-3">
            {[
              { hours: 5.5, label: '< 6h', quality: 'Incompleto' },
              { hours: 7.5, label: '7-8h', quality: 'Reparador' },
              { hours: 8.5, label: '8h+', quality: 'Óptimo' },
            ].map((s) => {
              const isSelected = stressData?.sleepHours === s.hours;
              return (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectSleep(s.hours, s.quality)}
                  disabled={savingSleep}
                  className={cn(
                    'flex-1 rounded-xl py-1.5 px-2 text-xs font-bold transition-all text-center border cursor-pointer',
                    isSelected
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                      : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {s.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── CARD 3: ESTRÉS MENTAL & FOCO (SEMÁFORO 1-TAP) ── */}
        <div
          className={cn(
            'group relative overflow-hidden rounded-[24px] border p-4.5 transition-all duration-200',
            stressDone
              ? 'border-amber-500/20 bg-gradient-to-br from-amber-950/15 via-[#111419] to-[#0A0C11]'
              : 'border-white/5 bg-[#12141C]/80 hover:border-white/10'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                  3. Estrés & Sistema Nervioso
                </p>
                <h4 className="text-sm font-bold text-white">
                  {stressDone
                    ? `Nivel ${stressData?.stressLevel}/10 · ${stressData?.mood || 'Equilibrado'}`
                    : 'Semáforo de Estrés'}
                </h4>
              </div>
            </div>

            {stressDone && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                <Check className="h-3 w-3" /> Listo
              </span>
            )}
          </div>

          {/* 1-Tap Semaphore Chips */}
          <div className="mt-3.5 flex items-center gap-2 border-t border-white/5 pt-3">
            {[
              { level: 2, label: '🟢 Zen', mood: 'Calmado' },
              { level: 5, label: '🟡 Normal', mood: 'Enfocado' },
              { level: 8, label: '🔴 Alto', mood: 'Sobrecargado' },
            ].map((lvl) => {
              const isSelected = stressData?.stressLevel === lvl.level;
              return (
                <motion.button
                  key={lvl.level}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectStress(lvl.level, lvl.mood)}
                  disabled={savingStress}
                  className={cn(
                    'flex-1 rounded-xl py-1.5 px-2 text-xs font-bold transition-all text-center border cursor-pointer',
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {lvl.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── CARD 4: ENTRENAMIENTO BIOMECÁNICO ── */}
        <div
          className={cn(
            'group relative overflow-hidden rounded-[24px] border p-4.5 transition-all duration-200',
            workoutDone
              ? 'border-rose-500/20 bg-gradient-to-br from-rose-950/15 via-[#111419] to-[#0A0C11]'
              : 'border-white/5 bg-[#12141C]/80 hover:border-white/10'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/90">
                  4. Entrenamiento del Día
                </p>
                <h4 className="text-sm font-bold text-white truncate">
                  {todayRoutineDay?.isRestDay
                    ? 'Descanso y Crecimiento'
                    : todayRoutineDay?.focusArea || 'Sesión Programada'}
                </h4>
              </div>
            </div>

            {workoutDone && (
              <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/20">
                <Check className="h-3 w-3" /> {todayRoutineDay?.isRestDay ? 'Descanso' : 'Hecho'}
              </span>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3">
            <p className="text-xs text-white/60">
              {todayRoutineDay?.isRestDay
                ? 'Recuperación activa recomendada'
                : todayRoutineDay?.exercises?.length
                ? `${todayRoutineDay.exercises.length} ejercicios de alta tensión`
                : 'Consulta tu plan de entrenamiento'}
            </p>

            <Link
              href="/routines"
              className="inline-flex items-center gap-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 transition-all active:scale-95 shadow-sm"
            >
              <span>{workoutDone ? 'Ver Rutina' : 'Iniciar ▶'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── MODAL ESCANEO DE PLATO IA (MOTOR 2) ── */}
      <Modal
        isOpen={showFoodScanner}
        onClose={() => setShowFoodScanner(false)}
        title="Escáner Nutricional IA"
        size="lg"
      >
        <div className="p-1">
          <FoodScanner
            userId={userId}
            onMealSaved={() => {
              setShowFoodScanner(false);
              onMealLogged?.();
              loadDayLogs();
              toast.success('¡Comida registrada y macros actualizados!', { icon: '🥗' });
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
