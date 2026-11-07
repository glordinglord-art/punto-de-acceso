'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Play,
  Eye,
  Shield,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { routinesService } from '@/features/routines/services/routines.service';
import { mealsService } from '@/features/meals/services/meals.service';
import { FoodScanner } from '@/features/meals/components/FoodScanner';
import { Modal } from '@/shared/components/ui/Modal';
import { cn, getLocalDateString, localDateToRange } from '@/shared/lib/utils';
import { calculateNutritionTargets } from '@/features/meals/utils/nutrition-calculator';
import { toast } from 'react-hot-toast';

import { GymCarnetModal, GymPlanTier } from './GymCarnetModal';
import { ExercisePreviewModal } from './ExercisePreviewModal';
import { FitiaCalorieArcCard } from './FitiaCalorieArcCard';
import { FitiaMealCard } from './FitiaMealCard';
import { FitiaHabitCards } from './FitiaHabitCards';

import type { Routine, WorkoutLog } from '@/features/routines/types/routines.types';
import type { Meal } from '@/features/meals/types/meals.types';
import type { ClientDashboard } from '@/features/dashboard/types/dashboard.types';

export function ClientDashboardView() {
  const { user, activeMode, setActiveMode, availableModes, logout } = useAuth();
  const router = useRouter();

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [data, setData] = useState<ClientDashboard | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [updatingWater, setUpdatingWater] = useState(false);
  const [isDayFinished, setIsDayFinished] = useState(false);

  const [showCarnetModal, setShowCarnetModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerMealType, setScannerMealType] = useState('breakfast');
  const [activePlanTier, setActivePlanTier] = useState<GymPlanTier>('pro_hibrido');
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<Meal | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 130);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const [dashRes, routRes] = await Promise.all([
        dashboardService.getClientDashboard(user.id),
        routinesService.getByClient(user.id),
      ]);

      if (dashRes?.data) {
        setData(dashRes.data);
        setWaterGlasses(dashRes.data.waterGlasses || 0);
      }

      const list = routRes?.data || [];
      const act = list.find((r) => r.isActive) || list[0] || null;
      setActiveRoutine(act);
      if (act) {
        try {
          const logsRes = await routinesService.getWorkoutLogs(act.id, user.id);
          setWorkoutLogs(logsRes?.data || []);
        } catch {
          setWorkoutLogs([]);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }, [user]);

  const loadMeals = useCallback(async () => {
    if (!user) return;
    try {
      const { start, end } = localDateToRange(selectedDate);
      const res = await mealsService.getByDateRange(user.id, start, end);
      setMeals(res?.data || []);
    } catch {
      setMeals([]);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await mealsService.remove(mealId);
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      loadDashboard();
      toast.success('Alimento eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const targets = useMemo(() => calculateNutritionTargets(user), [user]);
  const weightKg = user?.weight || 72;
  const targetWaterLiters = Number(((weightKg * 35 + 500) / 1000).toFixed(1));

  const consumedNutrition = useMemo(() => {
    if (meals.length > 0) {
      return meals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
    }
    return {
      calories: data?.caloriesToday || 0,
      protein: data?.proteinToday || 0,
      carbs: data?.carbsToday || 0,
      fat: data?.fatToday || 0,
    };
  }, [meals, data]);

  const remainingCals = Math.max(0, targets.calories - consumedNutrition.calories);
  const remainingProtein = Math.max(0, Math.round(targets.protein - consumedNutrition.protein));
  const remainingCarbs = Math.max(0, Math.round(targets.carbs - consumedNutrition.carbs));
  const remainingFat = Math.max(0, Math.round(targets.fat - consumedNutrition.fat));

  const groupedMeals = useMemo(() => {
    const breakfast = meals.filter((m) => m.mealType === 'breakfast');
    const lunch = meals.filter((m) => m.mealType === 'lunch');
    const dinner = meals.filter((m) => m.mealType === 'dinner');
    const snack = meals.filter((m) => m.mealType === 'snack');
    return { breakfast, lunch, dinner, snack };
  }, [meals]);

  const handleWaterDelta = async (delta: number) => {
    if (!user || updatingWater) return;
    const next = Math.max(0, Math.min(24, waterGlasses + delta));
    setWaterGlasses(next);
    setUpdatingWater(true);
    try {
      await dashboardService.updateWater(user.id, selectedDate, next);
    } catch {
      toast.error('No se pudo actualizar el agua');
    } finally {
      setUpdatingWater(false);
    }
  };

  const handleFinishDay = () => {
    setIsDayFinished((prev) => !prev);
    if (!isDayFinished) {
      toast.success('¡Día completado! Racha sumada 🔥', {
        icon: '⚡',
        style: {
          background: '#090b10',
          color: '#00F0FF',
          border: '1px solid rgba(0,240,255,0.4)',
        },
      });
    }
  };

  const handleOpenScanner = (mType: string) => {
    setScannerMealType(mType);
    setShowScannerModal(true);
  };

  const weekDays = useMemo(() => {
    const now = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const dayLetters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = getLocalDateString(d);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === todayStr;

      return {
        dateStr,
        dayNum: d.getDate(),
        dayLetter: dayLetters[idx],
        isSelected,
        isToday,
      };
    });
  }, [selectedDate, todayStr]);

  const formatHeaderLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Hoy';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === getLocalDateString(yesterday)) return 'Ayer';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
    });
  };

  const todayWorkoutDay = activeRoutine?.days?.[0];
  const workoutExercises = todayWorkoutDay?.exercises || [];
  const canSwitchRole = availableModes.length > 1;

  // Real Gym Progress Summary computed from activeRoutine + workoutLogs
  const realGymSummary = useMemo(() => {
    const allEx =
      activeRoutine?.days
        ?.filter((d) => !d.isRestDay)
        .flatMap((d) => d.exercises) || [];
    const plannedSets = allEx.reduce((s, ex) => s + (ex.sets || 1), 0);

    let tonnage = 0;
    let completedSets = 0;
    let topWeight = 0;
    let topExName = allEx[0]?.name || 'Rutina';

    allEx.forEach((ex) => {
      if ((ex.targetWeight || 0) > topWeight) {
        topWeight = ex.targetWeight || 0;
        topExName = ex.name;
      }
    });

    workoutLogs.forEach((l) => {
      const ex = allEx.find((e) => e.id === l.exerciseId);
      if (Array.isArray(l.setsData) && l.setsData.length > 0) {
        l.setsData.forEach((s) => {
          if (s.completed || s.weight || s.reps) {
            completedSets += 1;
            tonnage += (Number(s.weight) || 0) * (Number(s.reps) || 0);
            if ((Number(s.weight) || 0) >= topWeight) {
              topWeight = Number(s.weight) || 0;
              if (ex) topExName = ex.name;
            }
          }
        });
      } else if (l.weight) {
        completedSets += 1;
        tonnage += Number(l.weight) * 8;
        if (Number(l.weight) >= topWeight) {
          topWeight = Number(l.weight);
          if (ex) topExName = ex.name;
        }
      }
    });

    const pct =
      plannedSets > 0 ? Math.min(100, Math.round((completedSets / plannedSets) * 100)) : 0;

    return {
      tonnage: Math.round(tonnage),
      completedSets,
      plannedSets,
      pct,
      topWeight,
      topExName,
    };
  }, [activeRoutine, workoutLogs]);

  const modeLabels: Record<string, { label: string; short: string; emoji: string }> = {
    client: { label: 'Modo Atleta', short: 'Atleta', emoji: '⚡' },
    trainer: { label: 'Modo Entrenador', short: 'Entrenador', emoji: '🏋️' },
    superadmin: { label: 'Modo Super Admin', short: 'Admin', emoji: '👑' },
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white pb-32 pt-2 select-none overflow-x-hidden font-sans">
      <div className="max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-8 space-y-5">
        {/* ═════════════════════════════════════════════════════════
            1. TOP FITIA HEADER + MOBILE ROLE SWITCHER + AVATAR
           ═════════════════════════════════════════════════════════ */}
        <header className="flex items-center justify-between pt-2 pb-1">
          <div
            onClick={() => setSelectedDate(todayStr)}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <h1 className="font-display font-black text-2xl lg:text-3xl tracking-tight text-white group-hover:text-cyan-300 transition">
              {formatHeaderLabel(selectedDate)}
            </h1>
            <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-white transition" />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile & Desktop Quick Role Switcher Pill (Only if user has Admin/Trainer permissions) */}
            {canSwitchRole && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/12 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer active:scale-95"
                  title="Cambiar entre Atleta, Entrenador o Super Admin"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>{modeLabels[activeMode]?.short || 'Rol'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {showRoleMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
                      onClick={() => setShowRoleMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-[24px] border border-white/15 bg-[#12141a] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.95)] z-50 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-white/[0.06]">
                        Cambiar Vista ({availableModes.length} permisos)
                      </div>
                      {availableModes.map((mode) => {
                        const info = modeLabels[mode] || {
                          label: mode,
                          short: mode,
                          emoji: '🔹',
                        };
                        const isCurrent = activeMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setShowRoleMenu(false);
                              setActiveMode(mode, true);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left',
                              isCurrent
                                ? 'bg-cyan-400 text-slate-950 font-black shadow-sm'
                                : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white',
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span>{info.emoji}</span>
                              <span>{info.label}</span>
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/15">
                                Activo
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleMenu(false);
                            router.push('/profile');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-bold text-neutral-300 cursor-pointer"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Perfil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleMenu(false);
                            logout();
                          }}
                          className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-bold text-rose-400 cursor-pointer"
                          title="Cerrar Sesión"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Streak Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12141a] border border-white/[0.08] text-xs font-bold text-neutral-200">
              <span className="text-base leading-none">🔥</span>
              <span className="font-mono text-sm">4</span>
            </div>

            {/* Avatar Circle */}
            <div
              onClick={() =>
                canSwitchRole ? setShowRoleMenu((p) => !p) : router.push('/profile')
              }
              className="w-10 h-10 rounded-full bg-[#121622] border-2 border-cyan-400/80 flex items-center justify-center font-display font-black text-xs text-white shadow-[0_0_12px_rgba(0,240,255,0.35)] cursor-pointer active:scale-95 transition"
              title="Mi Perfil / Cambiar Modo"
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'VF'}
            </div>
          </div>
        </header>

        {/* ═════════════════════════════════════════════════════════
            2. HORIZONTAL 7-DAY STRIP (FITIA STYLE)
           ═════════════════════════════════════════════════════════ */}
        <div className="w-full flex items-center justify-between px-1 lg:px-6 py-1.5 lg:py-2.5 rounded-[24px] bg-transparent lg:bg-[#12141a] lg:border lg:border-white/[0.06]">
          {weekDays.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className="flex flex-col items-center cursor-pointer transition active:scale-95 group"
            >
              {d.isSelected ? (
                <div className="w-10 h-14 rounded-full bg-white flex flex-col items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.3)]">
                  <span className="text-[11px] font-black uppercase text-black leading-none mb-0.5">
                    {d.dayLetter}
                  </span>
                  <span className="text-sm font-black text-orange-500 leading-none">
                    {d.dayNum}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-14 rounded-full flex flex-col items-center justify-center group-hover:bg-white/5 transition">
                  <span className="text-[11px] font-bold uppercase text-neutral-400 leading-none mb-1">
                    {d.dayLetter}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold leading-none',
                      d.isToday ? 'text-cyan-400 font-black' : 'text-neutral-300',
                    )}
                  >
                    {d.dayNum}
                  </span>
                </div>
              )}

              <div className="h-1.5 flex items-center justify-center mt-1">
                <div
                  className={cn(
                    'w-1 h-1 rounded-full',
                    d.isSelected ? 'bg-orange-500' : 'bg-neutral-600',
                  )}
                />
              </div>
            </button>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════
            3. RESPONSIVE BENTO GRID (1 Col on Mobile, 12-Col on PC)
           ═════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT COLUMN ON PC: Calorie Arc + Gym Routine + Gym Progress ── */}
          <div className="lg:col-span-5 space-y-5">
            {/* Calorie & Macro Arc Card */}
            <FitiaCalorieArcCard
              consumedCalories={consumedNutrition.calories}
              targetCalories={targets.calories}
              consumedProtein={consumedNutrition.protein}
              targetProtein={targets.protein}
              consumedCarbs={consumedNutrition.carbs}
              targetCarbs={targets.carbs}
              consumedFat={consumedNutrition.fat}
              targetFat={targets.fat}
              isDayFinished={isDayFinished}
              onFinishDay={handleFinishDay}
              onEditTargets={() => router.push('/onboarding')}
            />

            {/* Today's Gym Workout Card */}
            <div className="w-full rounded-[26px] bg-[#12141a] border border-white/[0.08] p-4 sm:p-5 shadow-lg relative overflow-hidden transition hover:border-white/15">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    Gimnasio · Vital Fit Labs
                  </span>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  Semana 1 de {activeRoutine?.weekCount || 4}
                </span>
              </div>

              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                {activeRoutine?.name || 'Rutina de Fuerza y Recomposición'}
              </h3>

              <p className="text-xs text-neutral-400 mb-3">
                {todayWorkoutDay?.focusArea || 'Pierna y Core'} ·{' '}
                {workoutExercises.length || 3} ejercicios
              </p>

              <div className="space-y-1.5 mb-4">
                {workoutExercises.slice(0, 3).map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white group-hover:text-cyan-300 transition truncate">
                        {ex.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px] shrink-0">
                      <span>
                        {ex.sets || 3} × {ex.reps || '10-12'}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-neutral-400 group-hover:text-cyan-400" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Ver Rutina</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/routines')}
                  className="py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Entrenar Hoy</span>
                </button>
              </div>
            </div>

            {/* Widget: Progreso en el Gym */}
            <div className="w-full rounded-[26px] bg-[#12141a] border border-cyan-400/20 p-4 sm:p-5 shadow-lg relative overflow-hidden transition hover:border-cyan-400/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Progreso en el Gym
                  </h3>
                </div>
                <Link
                  href="/progress"
                  className="text-xs text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Ver Todo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">
                    Tonelaje
                  </p>
                  <p className="font-display font-black text-base text-white mt-0.5 tabular-nums">
                    {realGymSummary.tonnage.toLocaleString('es')} kg
                  </p>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    {realGymSummary.tonnage > 0 ? 'Registrado' : 'Semana activa'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">
                    Series Sem.
                  </p>
                  <p className="font-display font-black text-base text-cyan-300 mt-0.5 tabular-nums">
                    {realGymSummary.completedSets}/{realGymSummary.plannedSets || '—'}
                  </p>
                  <span className="text-[9px] text-cyan-400 font-bold">
                    {realGymSummary.pct}% listo
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">
                    Carga Top
                  </p>
                  <p className="font-display font-black text-base text-white mt-0.5 tabular-nums">
                    {realGymSummary.topWeight > 0 ? `${realGymSummary.topWeight} kg` : 'Corp.'}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-bold truncate block">
                    {realGymSummary.topExName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ON PC: Meals & Habits ── */}
          <div className="lg:col-span-7 space-y-5">
            {/* Meal Cards (2x2 Grid on XL Desktop, Stacked on Mobile) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <FitiaMealCard
                title="Desayuno"
                mealType="breakfast"
                meals={groupedMeals.breakfast}
                onAdd={handleOpenScanner}
                onDeleteMeal={handleDeleteMeal}
                onViewMeal={(m) => setSelectedMealForDetail(m)}
              />

              <FitiaMealCard
                title="Almuerzo"
                mealType="lunch"
                meals={groupedMeals.lunch}
                onAdd={handleOpenScanner}
                onDeleteMeal={handleDeleteMeal}
                onViewMeal={(m) => setSelectedMealForDetail(m)}
              />

              <FitiaMealCard
                title="Cena"
                mealType="dinner"
                meals={groupedMeals.dinner}
                onAdd={handleOpenScanner}
                onDeleteMeal={handleDeleteMeal}
                onViewMeal={(m) => setSelectedMealForDetail(m)}
              />

              <FitiaMealCard
                title="Meds y Suplementos"
                mealType="supplement"
                meals={groupedMeals.snack}
                onAdd={handleOpenScanner}
                onDeleteMeal={handleDeleteMeal}
                onViewMeal={(m) => setSelectedMealForDetail(m)}
              />
            </div>

            {/* Habit Cards (Actividad, Agua, Pasos) */}
            <FitiaHabitCards
              waterGlasses={waterGlasses}
              targetWaterLiters={targetWaterLiters}
              onWaterDelta={handleWaterDelta}
              updatingWater={updatingWater}
            />
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          4. COLLAPSED STICKY HEADER WHEN SCROLLING DOWN
             Responsive for both Mobile & PC (lg:left-72)
         ═════════════════════════════════════════════════════════ */}
      {isScrolled && (
        <div className="fixed top-0 left-0 lg:left-72 right-0 z-40 bg-[#090b10]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] pt-2 pb-2.5 transition-all duration-300">
          <div className="max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-2 lg:gap-6">
              {/* Row 1 / Left on PC: Week Days Strip */}
              <div className="lg:col-span-6 flex items-center justify-between pb-2 lg:pb-0">
                {weekDays.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition"
                  >
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase mb-0.5',
                        d.isSelected ? 'text-white' : 'text-neutral-400',
                      )}
                    >
                      {d.dayLetter}
                    </span>
                    {d.isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                        <span className="text-xs font-black text-orange-500 leading-none">
                          {d.dayNum}
                        </span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center">
                        <span
                          className={cn(
                            'text-xs font-bold leading-none',
                            d.isToday
                              ? 'text-cyan-400 font-black'
                              : 'text-neutral-300',
                          )}
                        >
                          {d.dayNum}
                        </span>
                      </div>
                    )}
                    <div className="h-1 flex items-center justify-center mt-0.5">
                      <div
                        className={cn(
                          'w-1 h-1 rounded-full',
                          d.isSelected ? 'bg-orange-500' : 'bg-neutral-600',
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 2 / Right on PC: 4 Compact Remaining Columns */}
              <div className="lg:col-span-6 grid grid-cols-4 gap-2 pt-1.5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 text-center">
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    kcal
                  </p>
                  <p className="text-xs font-bold text-white tabular-nums truncate">
                    {remainingCals.toLocaleString('es-ES')}{' '}
                    <span className="text-[9px] font-normal text-neutral-400">
                      resta...
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Proteínas
                  </p>
                  <p className="text-xs font-bold text-white tabular-nums truncate">
                    {remainingProtein} g{' '}
                    <span className="text-[9px] font-normal text-neutral-400">
                      resta...
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Carbs
                  </p>
                  <p className="text-xs font-bold text-white tabular-nums truncate">
                    {remainingCarbs} g{' '}
                    <span className="text-[9px] font-normal text-neutral-400">
                      resta...
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Grasas
                  </p>
                  <p className="text-xs font-bold text-white tabular-nums truncate">
                    {remainingFat} g{' '}
                    <span className="text-[9px] font-normal text-neutral-400">
                      restan...
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <GymCarnetModal
        isOpen={showCarnetModal}
        onClose={() => setShowCarnetModal(false)}
        currentTier={activePlanTier}
        onSelectTier={setActivePlanTier}
      />

      <ExercisePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        routine={activeRoutine}
      />

      <Modal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        title="Escanear Alimento con IA"
        description="Reconocimiento fotográfico con Gemini 2.5 Flash & MiMo"
        size="lg"
      >
        {user && (
          <FoodScanner
            userId={user.id}
            defaultMealType={scannerMealType}
            onMealSaved={() => {
              setShowScannerModal(false);
              loadMeals();
              loadDashboard();
              toast.success('Comida registrada exitosamente');
            }}
          />
        )}
      </Modal>

      {selectedMealForDetail && (
        <Modal
          isOpen={Boolean(selectedMealForDetail)}
          onClose={() => setSelectedMealForDetail(null)}
          title={selectedMealForDetail.name}
          description="Detalle nutricional y alimentos detectados"
          size="md"
        >
          <div className="space-y-4 text-white">
            {selectedMealForDetail.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedMealForDetail.imageUrl}
                alt={selectedMealForDetail.name}
                className="w-full h-48 object-cover rounded-2xl border border-white/10"
              />
            )}
            <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs">
              <div>
                <p className="text-neutral-400 text-[10px]">Calorías</p>
                <p className="font-bold text-amber-400 text-sm">
                  {selectedMealForDetail.calories} kcal
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[10px]">Proteínas</p>
                <p className="font-bold text-cyan-300 text-sm">
                  {selectedMealForDetail.protein}g
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[10px]">Carbs</p>
                <p className="font-bold text-amber-300 text-sm">
                  {selectedMealForDetail.carbs}g
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-[10px]">Grasas</p>
                <p className="font-bold text-rose-300 text-sm">
                  {selectedMealForDetail.fat}g
                </p>
              </div>
            </div>
            {selectedMealForDetail.foods &&
              selectedMealForDetail.foods.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Ingredientes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMealForDetail.foods.map((food, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            <button
              onClick={() => setSelectedMealForDetail(null)}
              className="w-full py-3 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
