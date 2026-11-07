'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  ChevronRight,
  Scale,
  Footprints,
  Plus,
  X,
  Camera,
  Dumbbell,
  Calendar,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Droplets,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { clientsService } from '@/features/clients/services/clients.service';
import { mealsService } from '@/features/meals/services/meals.service';
import { routinesService } from '@/features/routines/services/routines.service';
import type { Meal } from '@/features/meals/types/meals.types';
import type { Routine, WorkoutLog, Exercise } from '@/features/routines/types/routines.types';
import { analyzeExerciseProgression } from '@/features/routines/utils/vital-fit-labs-engine';
import { toast } from 'react-hot-toast';
import { cn, getLocalDateString } from '@/shared/lib/utils';

interface WeighInEntry {
  weight: number;
  unit?: 'kg' | 'lbs';
  date: string;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  bodyFatPct?: number;
  notes?: string;
}

const WEEKDAY_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function getCurrentWeekIsoDates() {
  const now = new Date();
  const todayIso = getLocalDateString(now);
  const jsDay = now.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const isoDate = getLocalDateString(d);
    return {
      dayIndex: idx,
      label: WEEKDAY_SHORT[idx],
      fullName: WEEKDAY_NAMES[idx],
      isoDate,
      isToday: isoDate === todayIso,
      isFuture: isoDate > todayIso,
    };
  });
}

export default function ProgressPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Datos reales del usuario
  const [meals, setMeals] = useState<Meal[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [freshUserAnamnesis, setFreshUserAnamnesis] = useState<Record<string, unknown> | null>(null);

  // Banner de sincronización
  const [showSyncBanner, setShowSyncBanner] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modales e interacciones
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showGymDetailModal, setShowGymDetailModal] = useState(false);
  const [activeMethodId, setActiveMethodId] = useState<'deficit' | 'hypertrophy' | 'neat' | 'hormonal'>('deficit');

  // Formulario de actualización de progreso y meta
  const [weightInput, setWeightInput] = useState<string>('');
  const [targetWeightInput, setTargetWeightInput] = useState<string>('');
  const [waistInput, setWaistInput] = useState<string>('');
  const [bodyFatInput, setBodyFatInput] = useState<string>('');
  const [weeklyPace, setWeeklyPace] = useState<number>(0.6);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [savingProgress, setSavingProgress] = useState(false);

  const loadRealUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [userRes, mealsRes, routinesRes] = await Promise.allSettled([
        clientsService.getById(user.id),
        mealsService.getByUser(user.id),
        routinesService.getByClient(user.id),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value?.data) {
        const freshUser = userRes.value.data;
        const anam = (freshUser.anamnesisData as Record<string, unknown>) || {};
        setFreshUserAnamnesis(anam);

        const history = Array.isArray(anam.weighInHistory)
          ? (anam.weighInHistory as WeighInEntry[])
          : [];
        const latestEntry = history.length > 0 ? history[history.length - 1] : null;

        setWeightInput(String(freshUser.weight ?? latestEntry?.weight ?? 85.5));
        setTargetWeightInput(String(anam.targetWeight ?? 74));
        setWaistInput(String(latestEntry?.waistCm ?? anam.waistCm ?? 84));
        setBodyFatInput(
          String(latestEntry?.bodyFatPct ?? anam.bodyFatPercentage ?? 18.5),
        );
      } else {
        const anam = (user.anamnesisData as Record<string, unknown>) || {};
        setFreshUserAnamnesis(anam);
        setWeightInput(String(user.weight ?? 85.5));
        setTargetWeightInput(String(anam.targetWeight ?? 74));
        setWaistInput('84');
        setBodyFatInput('18.5');
      }

      if (mealsRes.status === 'fulfilled' && Array.isArray(mealsRes.value?.data)) {
        setMeals(mealsRes.value.data);
      }

      if (routinesRes.status === 'fulfilled' && Array.isArray(routinesRes.value?.data)) {
        const clientRoutines = routinesRes.value.data;
        setRoutines(clientRoutines);

        const active =
          clientRoutines.find((r) => r.isActive) || clientRoutines[0] || null;
        if (active) {
          try {
            const logsRes = await routinesService.getWorkoutLogs(active.id, user.id);
            if (Array.isArray(logsRes?.data)) {
              setWorkoutLogs(logsRes.data);
            }
          } catch {
            // Sin logs aún
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }, [user?.id, user?.weight, user?.anamnesisData]);

  useEffect(() => {
    loadRealUserData();
  }, [loadRealUserData]);

  // ══════════════════════════════════════════════════════════════════
  // 1. CÁLCULOS BIOMÉTRICOS DEL USUARIO
  // ══════════════════════════════════════════════════════════════════
  const anamnesis = useMemo(
    () => freshUserAnamnesis || (user?.anamnesisData as Record<string, unknown>) || {},
    [freshUserAnamnesis, user?.anamnesisData],
  );

  const weighInHistory: WeighInEntry[] = useMemo(() => {
    const raw = anamnesis.weighInHistory;
    if (!Array.isArray(raw)) return [];
    return raw as WeighInEntry[];
  }, [anamnesis]);

  const currentWeight = Number(user?.weight || weightInput || 85.5);
  const targetWeight = Number(anamnesis.targetWeight || targetWeightInput || 74);
  const startWeight = useMemo(() => {
    if (weighInHistory.length > 0 && weighInHistory[0].weight) {
      return Number(weighInHistory[0].weight);
    }
    if (anamnesis.initialWeight) return Number(anamnesis.initialWeight);
    return currentWeight;
  }, [weighInHistory, anamnesis.initialWeight, currentWeight]);

  const isFatLossGoal = currentWeight >= targetWeight;
  const totalWeightToChange = Math.abs(startWeight - targetWeight);
  const remainingKg = Number(Math.abs(currentWeight - targetWeight).toFixed(1));

  const goalProgressPct = useMemo(() => {
    if (remainingKg <= 0.2) return 100;
    if (totalWeightToChange <= 0.1) {
      const activeSteps = workoutLogs.length + meals.length;
      return Math.min(28, Math.max(12, activeSteps * 3));
    }
    const covered = isFatLossGoal
      ? startWeight - currentWeight
      : currentWeight - startWeight;
    const pct = Math.round((covered / totalWeightToChange) * 100);
    return Math.min(100, Math.max(10, pct));
  }, [remainingKg, totalWeightToChange, isFatLossGoal, startWeight, currentWeight, workoutLogs.length, meals.length]);

  const estimatedWeeks = useMemo(() => {
    if (remainingKg <= 0) return 0;
    return Math.max(1, Math.ceil(remainingKg / weeklyPace));
  }, [remainingKg, weeklyPace]);

  const targetCalories = user?.targetCalories || Math.round(currentWeight * 26);
  const targetProtein = user?.targetProtein || Math.round(currentWeight * 2.1);
  const targetCarbs = user?.targetCarbs || Math.round((targetCalories * 0.4) / 4);
  const targetFat = user?.targetFats || Math.round((targetCalories * 0.25) / 9);
  const estimatedTdee = Math.round(targetCalories + (isFatLossGoal ? 500 : -300));
  const dailyDeficitKcal = Math.max(300, estimatedTdee - targetCalories);
  const waterLitersTarget = Number((currentWeight * 0.04).toFixed(1));

  const latestBodyFat = useMemo(() => {
    const lastWithBf = [...weighInHistory].reverse().find((w) => w.bodyFatPct);
    if (lastWithBf?.bodyFatPct) return Number(lastWithBf.bodyFatPct);
    if (bodyFatInput && !Number.isNaN(Number(bodyFatInput))) return Number(bodyFatInput);
    const heightM = (user?.height || 175) / 100;
    const bmi = currentWeight / (heightM * heightM);
    return Number(Math.max(10, Math.min(35, bmi * 0.75 - 1.5)).toFixed(1));
  }, [weighInHistory, bodyFatInput, user?.height, currentWeight]);

  const latestWaist = useMemo(() => {
    const lastWithWaist = [...weighInHistory].reverse().find((w) => w.waistCm);
    return lastWithWaist?.waistCm || Number(waistInput) || 84;
  }, [weighInHistory, waistInput]);

  // ══════════════════════════════════════════════════════════════════
  // 2. SCORE NUTRICIONAL SEMANAL REAL
  // ══════════════════════════════════════════════════════════════════
  const weekDays = useMemo(() => getCurrentWeekIsoDates(), []);

  const weeklyNutritionStats = useMemo(() => {
    const dayStats = weekDays.map((wd) => {
      const dayMeals = meals.filter((m) => {
        const mDate = getLocalDateString(new Date(m.date || m.createdAt));
        return mDate === wd.isoDate;
      });

      const calories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const protein = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);

      let score: number | null = null;
      if (dayMeals.length > 0 && calories > 0) {
        const calRatio = Math.min(1.2, calories / Math.max(1, targetCalories));
        const calAccuracy = Math.max(0, 1 - Math.abs(1 - calRatio));
        const protRatio = Math.min(1.1, protein / Math.max(1, targetProtein));
        const rawScore = (calAccuracy * 0.6 + Math.min(1, protRatio) * 0.4) * 10;
        score = Number(Math.max(5.0, Math.min(10.0, rawScore)).toFixed(1));
      }

      return {
        ...wd,
        mealsCount: dayMeals.length,
        calories,
        protein,
        score,
      };
    });

    const loggedDays = dayStats.filter((d) => d.mealsCount > 0);
    const avgCalories =
      loggedDays.length > 0
        ? Math.round(loggedDays.reduce((s, d) => s + d.calories, 0) / loggedDays.length)
        : 0;
    const avgProtein =
      loggedDays.length > 0
        ? Math.round(loggedDays.reduce((s, d) => s + d.protein, 0) / loggedDays.length)
        : 0;
    const avgScore =
      loggedDays.length > 0
        ? Number(
            (loggedDays.reduce((s, d) => s + (d.score || 0), 0) / loggedDays.length).toFixed(1),
          )
        : null;

    return {
      dayStats,
      loggedDaysCount: loggedDays.length,
      avgCalories,
      avgProtein,
      avgScore,
    };
  }, [weekDays, meals, targetCalories, targetProtein]);

  // ══════════════════════════════════════════════════════════════════
  // 3. PROGRESO REAL EN EL GYM (RUTINA ACTIVA + LOGS)
  // ══════════════════════════════════════════════════════════════════
  const activeRoutine = useMemo(
    () => routines.find((r) => r.isActive) || routines[0] || null,
    [routines],
  );

  const gymProgress = useMemo(() => {
    if (!activeRoutine) {
      return {
        hasRoutine: false,
        routineName: 'Sin rutina asignada',
        currentWeek: 1,
        weekCount: 4,
        trainingDaysCount: 0,
        plannedSetsWeek: 0,
        completedSetsWeek: 0,
        adherencePct: 0,
        weeklyTonnageKg: 0,
        tonnageDiffKg: 0,
        totalCompletedExercises: 0,
        totalRoutineExercises: 0,
        cycleProgressPct: 0,
        topExercises: [] as {
          id: string;
          name: string;
          muscleGroup: string;
          prescription: string;
          bestWeight: number;
          bestReps: number;
          targetWeight: number;
          deltaKg: number;
          hasLog: boolean;
          nextChallenge: string;
          badgeLabel: string;
        }[],
      };
    }

    const trainingDays = activeRoutine.days.filter((d) => !d.isRestDay);
    const allExercises: Exercise[] = [];
    trainingDays.forEach((d) => {
      d.exercises.forEach((ex) => allExercises.push(ex));
    });

    const plannedSetsWeek = allExercises.reduce((s, ex) => s + (ex.sets || 1), 0);

    const highestLoggedWeek =
      workoutLogs.length > 0
        ? Math.max(...workoutLogs.map((l) => l.weekNumber || 1))
        : 1;
    const currentWeek = Math.min(activeRoutine.weekCount || 4, highestLoggedWeek);

    const currentWeekLogs = workoutLogs.filter((l) => l.weekNumber === currentWeek);
    const prevWeekLogs = workoutLogs.filter((l) => l.weekNumber === currentWeek - 1);

    const calcTonnage = (logsList: WorkoutLog[]) => {
      let total = 0;
      logsList.forEach((log) => {
        if (Array.isArray(log.setsData) && log.setsData.length > 0) {
          log.setsData.forEach((s) => {
            if (s.completed || (s.weight && s.reps)) {
              total += (Number(s.weight) || 0) * (Number(s.reps) || 0);
            }
          });
        } else if (log.weight) {
          const repsMatch = log.repsDone?.match(/(\d+)/);
          const reps = repsMatch ? parseInt(repsMatch[1], 10) : 8;
          total += Number(log.weight) * reps;
        }
      });
      return Math.round(total);
    };

    const weeklyTonnageKg = calcTonnage(currentWeekLogs);
    const prevTonnageKg = calcTonnage(prevWeekLogs);
    const tonnageDiffKg =
      prevTonnageKg > 0 ? weeklyTonnageKg - prevTonnageKg : weeklyTonnageKg;

    let completedSetsWeek = 0;
    currentWeekLogs.forEach((log) => {
      if (Array.isArray(log.setsData) && log.setsData.length > 0) {
        completedSetsWeek += log.setsData.filter(
          (s) => s.completed || s.weight !== null || s.reps !== null,
        ).length;
      } else {
        completedSetsWeek += 1;
      }
    });

    const adherencePct =
      plannedSetsWeek > 0
        ? Math.min(100, Math.round((completedSetsWeek / plannedSetsWeek) * 100))
        : 0;

    const totalCycleTargetLogs = allExercises.length * (activeRoutine.weekCount || 4);
    const cycleProgressPct =
      totalCycleTargetLogs > 0
        ? Math.min(100, Math.round((workoutLogs.length / totalCycleTargetLogs) * 100))
        : 0;

    const exerciseInsights = allExercises.map((ex) => {
      const exLogs = workoutLogs.filter((l) => l.exerciseId === ex.id);
      const insight = analyzeExerciseProgression(ex, workoutLogs, currentWeek);

      let bestWeight = ex.targetWeight || 0;
      let bestReps = parseInt(ex.reps?.match(/\d+/)?.[0] || '8', 10);

      exLogs.forEach((l) => {
        if (Array.isArray(l.setsData) && l.setsData.length > 0) {
          l.setsData.forEach((s) => {
            if ((s.weight || 0) >= bestWeight && (s.weight || 0) > 0) {
              bestWeight = Number(s.weight);
              bestReps = Number(s.reps) || bestReps;
            }
          });
        } else if ((l.weight || 0) >= bestWeight && (l.weight || 0) > 0) {
          bestWeight = Number(l.weight);
        }
      });

      const baseWeight = ex.targetWeight || bestWeight;
      const deltaKg =
        exLogs.length > 0 && baseWeight > 0
          ? Number((bestWeight - baseWeight).toFixed(1))
          : 0;

      return {
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        prescription: `${ex.sets} × ${ex.reps}`,
        bestWeight,
        bestReps,
        targetWeight: ex.targetWeight || 0,
        deltaKg,
        hasLog: exLogs.length > 0,
        nextChallenge: insight.missionText,
        badgeLabel: insight.badgeLabel,
      };
    });

    const sortedTop = [...exerciseInsights].sort((a, b) => {
      if (a.hasLog !== b.hasLog) return a.hasLog ? -1 : 1;
      return b.bestWeight - a.bestWeight;
    });

    return {
      hasRoutine: true,
      routineName: activeRoutine.name,
      currentWeek,
      weekCount: activeRoutine.weekCount || 4,
      trainingDaysCount: trainingDays.length,
      plannedSetsWeek,
      completedSetsWeek,
      adherencePct,
      weeklyTonnageKg,
      tonnageDiffKg,
      totalCompletedExercises: workoutLogs.length,
      totalRoutineExercises: allExercises.length,
      cycleProgressPct,
      topExercises: sortedTop,
    };
  }, [activeRoutine, workoutLogs]);

  // ══════════════════════════════════════════════════════════════════
  // 4. MÉTODOS INTELIGENTES INTERACTIVOS (EN UN SOLO WIDGET GUSTOSO)
  // ══════════════════════════════════════════════════════════════════
  const fatLossMethods = useMemo(
    () => ({
      deficit: {
        id: 'deficit' as const,
        pillLabel: '🔥 Déficit',
        icon: Flame,
        accent: 'text-amber-400',
        border: 'border-amber-400/30',
        bgBadge: 'bg-amber-400/15 text-amber-300',
        kpi: `${targetCalories.toLocaleString('es')} kcal/día`,
        subKpi: `Déficit limpio de -${dailyDeficitKcal} kcal`,
        title: 'Termodinámica de Precisión',
        description: `Para bajar de ${currentWeight} kg a ${targetWeight} kg sin rebote, tu techo calórico diario es ${targetCalories.toLocaleString('es')} kcal (tu cuerpo gasta ~${estimatedTdee.toLocaleString('es')} kcal).`,
        macros: [
          { label: 'Proteína', value: `${targetProtein}g`, color: 'text-cyan-300' },
          { label: 'Carbs', value: `${targetCarbs}g`, color: 'text-amber-300' },
          { label: 'Grasas', value: `${targetFat}g`, color: 'text-rose-300' },
        ],
        tip: 'Prioriza tus carbohidratos antes y después de tu rutina en Vital Fit Labs.',
      },
      hypertrophy: {
        id: 'hypertrophy' as const,
        pillLabel: '🥩 Músculo',
        icon: Dumbbell,
        accent: 'text-cyan-400',
        border: 'border-cyan-400/30',
        bgBadge: 'bg-cyan-400/15 text-cyan-300',
        kpi: `${targetProtein}g Proteína`,
        subKpi: `${(targetProtein / currentWeight).toFixed(1)}g por kg de peso`,
        title: 'Blindaje Muscular + Sobrecarga',
        description: `Al combinar ${targetProtein}g de proteína diarios con tensión mecánica en "${gymProgress.routineName}", obligas a tu cuerpo a quemar 100% grasa visceral y subcutánea sin tocar tu masa muscular.`,
        macros: [
          { label: 'Por comida', value: '~42g P', color: 'text-cyan-300' },
          { label: 'Frecuencia', value: `${gymProgress.trainingDaysCount || 4} días/sem`, color: 'text-emerald-300' },
          { label: 'Intensidad', value: 'RIR 0-2', color: 'text-amber-300' },
        ],
        tip: `Sostener o superar tus marcas en ${gymProgress.topExercises[0]?.name || 'tus básicos'} mantiene tu metabolismo acelerado.`,
      },
      neat: {
        id: 'neat' as const,
        pillLabel: '👟 Cardio Z2',
        icon: Footprints,
        accent: 'text-emerald-400',
        border: 'border-emerald-400/30',
        bgBadge: 'bg-emerald-400/15 text-emerald-300',
        kpi: '20 min Post-Pesas',
        subKpi: '+ 8,500 pasos diarios',
        title: 'Oxidación Mitocondrial (Zona 2)',
        description:
          'Justo al terminar las pesas tus reservas de glucógeno están vacías y los ácidos grasos libres están listos para oxidarse como energía.',
        macros: [
          { label: 'Inclinación', value: '10% - 12%', color: 'text-emerald-300' },
          { label: 'Velocidad', value: '4.5 km/h', color: 'text-cyan-300' },
          { label: 'Quema extra', value: '+220 kcal', color: 'text-amber-300' },
        ],
        tip: 'Camina en la banda sin colgarte de los brazos para activar el core y glúteos.',
      },
      hormonal: {
        id: 'hormonal' as const,
        pillLabel: '💧 Agua & Sueño',
        icon: Droplets,
        accent: 'text-violet-400',
        border: 'border-violet-400/30',
        bgBadge: 'bg-violet-400/15 text-violet-300',
        kpi: `${waterLitersTarget} L Agua/día`,
        subKpi: '+ 7.5h sueño profundo',
        title: 'Control de Cortisol y Retención',
        description: `La oxidación de grasa requiere agua celular (hidrólisis). Para tus ${currentWeight} kg necesitas ${waterLitersTarget} litros diarios y dormir 7.5h para bajar el cortisol abdominal.`,
        macros: [
          { label: 'En ayunas', value: '500 ml', color: 'text-cyan-300' },
          { label: 'Entrenando', value: '1.0 L', color: 'text-violet-300' },
          { label: 'Cintura actual', value: `${latestWaist} cm`, color: 'text-emerald-300' },
        ],
        tip: 'Dormir bien reduce la hormona grelina (antojos nocturnos) en un 40%.',
      },
    }),
    [
      targetCalories,
      dailyDeficitKcal,
      currentWeight,
      targetWeight,
      estimatedTdee,
      targetProtein,
      targetCarbs,
      targetFat,
      gymProgress.routineName,
      gymProgress.trainingDaysCount,
      gymProgress.topExercises,
      waterLitersTarget,
      latestWaist,
    ],
  );

  const selectedMethod = fatLossMethods[activeMethodId];

  const handleSyncHealth = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success(
        `Sincronizado con el perfil de ${user?.name?.split(' ')[0] || 'Atleta'} (${currentWeight} kg)`,
      );
    }, 700);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !weightInput) return;

    setSavingProgress(true);
    try {
      const numWeight = parseFloat(weightInput);
      const numTargetWeight = targetWeightInput ? parseFloat(targetWeightInput) : targetWeight;
      const numWaist = waistInput ? parseFloat(waistInput) : undefined;
      const numBodyFat = bodyFatInput ? parseFloat(bodyFatInput) : undefined;

      await clientsService.logWeeklyWeighIn(user.id, {
        weight: numWeight,
        unit: 'kg',
        waistCm: numWaist,
        bodyFatPct: numBodyFat,
        notes: progressNotes,
        date: getLocalDateString(),
      });

      if (numTargetWeight !== targetWeight) {
        const updatedAnamnesis = {
          ...anamnesis,
          targetWeight: numTargetWeight,
          bodyFatPercentage: numBodyFat ?? anamnesis.bodyFatPercentage,
        };
        await clientsService.updateProfile(user.id, {
          weight: numWeight,
          anamnesisData: updatedAnamnesis,
        });
        setFreshUserAnamnesis(updatedAnamnesis);
      }

      updateUser({ weight: numWeight });
      await loadRealUserData();
      setShowUpdateModal(false);
      toast.success('¡Progreso y métricas actualizadas! 🎯');
    } catch {
      toast.error('No se pudo guardar el progreso');
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white pb-32 pt-3 select-none overflow-x-hidden font-sans">
      <div className="max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-8 space-y-5">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl lg:text-3xl tracking-tight text-white">
                Progreso
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/12 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                {user?.name?.split(' ')[0] || 'Atleta'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inteligencia biométrica conectada a tu plan nutricional y rutina
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_16px_rgba(251,191,36,0.35)] cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Registrar Peso</span>
          </button>
        </div>

        {/* ── RESPONSIVE BENTO GRID (1 col en móvil, 12 cols en PC) ── */}
        <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          {/* ═════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA (5 cols en PC):
              1. Objetivo + Selector de Ritmo
              2. Score Nutricional Semanal
              3. Sincronización Salud
             ═════════════════════════════════════════════════════════════ */}
          <div className="space-y-5 lg:col-span-5">
            {/* 1. HERO CARD: OBJETIVO FÍSICO CONECTADO AL USUARIO */}
            <div className="rounded-[28px] bg-[#12141a] border border-white/[0.08] p-5 shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-lg shrink-0">
                    🔥
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                      Meta Activa · Vital Fit Labs
                    </span>
                    <h3 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                      {isFatLossGoal
                        ? 'Pérdida de Grasa & Músculo'
                        : 'Hipertrofia Limpia'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUpdateModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[11px] font-bold text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  Editar
                </button>
              </div>

              {/* Medidor Grande de Peso Actual -> Meta */}
              <div className="grid grid-cols-3 items-center bg-[#0b0d12] rounded-2xl p-3.5 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Peso Actual
                  </span>
                  <span className="font-display font-black text-xl sm:text-2xl text-white tabular-nums">
                    {currentWeight} <small className="text-xs font-normal text-neutral-400">kg</small>
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-[11px] font-mono font-black text-cyan-300">
                    -{remainingKg} kg
                  </span>
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">
                    Restantes
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                    Peso Meta
                  </span>
                  <span className="font-display font-black text-xl sm:text-2xl text-emerald-400 tabular-nums">
                    {targetWeight} <small className="text-xs font-normal text-emerald-400/70">kg</small>
                  </span>
                </div>
              </div>

              {/* Barra de Progreso con Glow */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">
                    Avance de transformación
                  </span>
                  <span className="font-mono font-black text-cyan-300">
                    {goalProgressPct}% completado
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all duration-700"
                    style={{ width: `${goalProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Selector Gustoso de Ritmo Semanal */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Llegarás en{' '}
                    <strong className="text-white font-black">
                      {estimatedWeeks} semanas
                    </strong>
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    -{weeklyPace} kg / semana
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-[#0b0d12] p-1 rounded-2xl border border-white/[0.06]">
                  {[
                    { pace: 0.4, label: 'Suave', sub: '0.4 kg/s' },
                    { pace: 0.6, label: 'Óptimo', sub: '0.6 kg/s' },
                    { pace: 0.8, label: 'Intenso', sub: '0.8 kg/s' },
                  ].map((opt) => {
                    const active = weeklyPace === opt.pace;
                    return (
                      <button
                        key={opt.pace}
                        type="button"
                        onClick={() => setWeeklyPace(opt.pace)}
                        className={cn(
                          'py-2 rounded-xl text-center transition-all cursor-pointer',
                          active
                            ? 'bg-white text-black font-black shadow-sm'
                            : 'text-neutral-400 hover:text-white',
                        )}
                      >
                        <span className="block text-[11px] leading-none">
                          {opt.label}
                        </span>
                        <span
                          className={cn(
                            'block text-[9px] font-mono mt-0.5',
                            active ? 'text-neutral-700 font-bold' : 'text-neutral-500',
                          )}
                        >
                          {opt.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUpdateModal(true)}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-98 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Actualizar Peso y Medidas</span>
              </button>
            </div>

            {/* 2. SCORE NUTRICIONAL SEMANAL (FITIA STYLE) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-white">
                    Score Nutricional
                  </h3>
                  {weeklyNutritionStats.avgScore && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-black text-emerald-400 tabular-nums">
                      ★ {weeklyNutritionStats.avgScore}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Ir a Comidas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-[26px] bg-[#12141a] border border-white/[0.08] p-5 shadow-lg space-y-4">
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weeklyNutritionStats.dayStats.map((d) => {
                    const hasScore = d.score !== null;
                    return (
                      <div key={d.isoDate} className="flex flex-col items-center">
                        <span
                          className={cn(
                            'text-[11px] font-bold mb-1.5',
                            d.isToday
                              ? 'text-cyan-400 font-black'
                              : 'text-neutral-400',
                          )}
                        >
                          {d.label}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-mono font-bold mb-1.5 tabular-nums',
                            hasScore
                              ? d.score! >= 8
                                ? 'text-emerald-400'
                                : 'text-amber-300'
                              : 'text-neutral-500',
                          )}
                        >
                          {hasScore ? d.score : '-'}
                        </span>
                        <div
                          className={cn(
                            'w-full h-1.5 rounded-full transition-all',
                            hasScore
                              ? d.score! >= 8
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                : 'bg-amber-400'
                              : d.isToday
                                ? 'bg-amber-400/80'
                                : 'bg-white/10',
                          )}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-white/[0.06] text-xs text-neutral-300">
                  <span className="text-base shrink-0">💡</span>
                  {weeklyNutritionStats.loggedDaysCount > 0 ? (
                    <p className="leading-relaxed">
                      Promedio semanal:{' '}
                      <strong className="text-amber-300">
                        {weeklyNutritionStats.avgCalories} kcal
                      </strong>{' '}
                      y{' '}
                      <strong className="text-cyan-300">
                        {weeklyNutritionStats.avgProtein}g proteína
                      </strong>{' '}
                      en {weeklyNutritionStats.loggedDaysCount} día(s) registrados.
                    </p>
                  ) : (
                    <p className="leading-relaxed">
                      Cumple tu meta de{' '}
                      <strong className="text-amber-300">
                        {targetCalories} kcal
                      </strong>{' '}
                      y{' '}
                      <strong className="text-cyan-300">
                        {targetProtein}g de proteína
                      </strong>{' '}
                      registrando tus comidas de hoy.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. BANNER SINCRONIZACIÓN APPLE SALUD / BALANZA */}
            {showSyncBanner && (
              <div className="relative rounded-[26px] bg-gradient-to-r from-[#2c2207] via-[#201905] to-[#121008] border border-amber-500/30 p-5 shadow-xl overflow-hidden">
                <button
                  onClick={() => setShowSyncBanner(false)}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start justify-between gap-3">
                  <div className="max-w-[220px]">
                    <h3 className="font-display font-black text-base text-white leading-tight">
                      Sincroniza con Apple Salud
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 leading-snug">
                      Conecta tu balanza inteligente y pasos diarios ({currentWeight} kg).
                    </p>

                    <button
                      type="button"
                      onClick={handleSyncHealth}
                      disabled={syncing}
                      className="mt-3 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_16px_rgba(251,191,36,0.4)] cursor-pointer"
                    >
                      {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                  </div>

                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-lg transform -rotate-6">
                      <Scale className="w-6 h-6 text-amber-300" />
                      <span className="text-[10px] font-mono font-black text-white mt-1">
                        {currentWeight} kg
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-orange-500/30 border border-orange-400/40 flex items-center justify-center shadow-md">
                      <Footprints className="w-5 h-5 text-orange-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════
              COLUMNA DERECHA (7 cols en PC):
              4. Métodos Inteligentes Quema Grasa (Interactive Pill Card)
              5. Avance con tu Rutina en el Gym
              6. Estadísticas Biométricas (2x2)
             ═════════════════════════════════════════════════════════════ */}
          <div className="space-y-5 lg:col-span-7">
            {/* 4. MÉTODOS INTELIGENTES PARA PERDER GRASA (WIDGET INTERACTIVO SUPER GUSTOSO) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Tu Fórmula para Bajar a {targetWeight} kg</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  4 Pilares Clínicos
                </span>
              </div>

              <div className="rounded-[28px] bg-[#12141a] border border-white/[0.08] p-5 shadow-xl space-y-4">
                {/* Píldoras Interactivas de Selección */}
                <div className="grid grid-cols-4 gap-1.5 bg-[#0b0d12] p-1 rounded-2xl border border-white/[0.06]">
                  {(
                    ['deficit', 'hypertrophy', 'neat', 'hormonal'] as const
                  ).map((id) => {
                    const m = fatLossMethods[id];
                    const isSelected = activeMethodId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveMethodId(id)}
                        className={cn(
                          'py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate',
                          isSelected
                            ? 'bg-white text-black font-black shadow-sm'
                            : 'text-neutral-400 hover:text-white',
                        )}
                      >
                        {m.pillLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Contenido Dinámico del Método Seleccionado */}
                <div className="rounded-2xl bg-[#0b0d12] border border-white/[0.06] p-4 space-y-3.5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={cn(
                          'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-1',
                          selectedMethod.bgBadge,
                        )}
                      >
                        {selectedMethod.subKpi}
                      </span>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        {selectedMethod.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display font-black text-base sm:text-lg text-cyan-300 tabular-nums block">
                        {selectedMethod.kpi}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Meta Diaria
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {selectedMethod.description}
                  </p>

                  {/* 3 Mini Cajas con las Cifras Exactas del Método */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {selectedMethod.macros.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'font-display font-black text-sm mt-0.5 block tabular-nums',
                            item.color,
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedMethod.tip}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. AVANCE CON TU RUTINA EN EL GYM */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                  <span>Avance con tu Rutina</span>
                </h3>
                <button
                  type="button"
                  onClick={() => router.push('/routines')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Entrenar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="rounded-[28px] bg-[#12141a] border border-cyan-400/25 p-5 shadow-xl space-y-4">
                {/* Cabecera de la Rutina + Anillo de Progreso */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                        Semana {gymProgress.currentWeek} de {gymProgress.weekCount}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        • {gymProgress.trainingDaysCount} días/sem
                      </span>
                    </div>
                    <h4 className="font-display font-black text-base sm:text-lg text-white truncate mt-1">
                      {gymProgress.routineName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                        Cumplimiento
                      </span>
                      <span className="font-display font-black text-base text-emerald-400 tabular-nums">
                        {gymProgress.adherencePct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 KPIs Reales */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-[#0b0d12] border border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-neutral-400">
                      Tonelaje Sem.
                    </p>
                    <p className="font-display font-black text-base sm:text-lg text-white mt-0.5 tabular-nums">
                      {gymProgress.weeklyTonnageKg.toLocaleString('es')} kg
                    </p>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {gymProgress.weeklyTonnageKg > 0 ? 'Activo' : 'Por iniciar'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0b0d12] border border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-neutral-400">
                      Series Sem.
                    </p>
                    <p className="font-display font-black text-base sm:text-lg text-cyan-300 mt-0.5 tabular-nums">
                      {gymProgress.completedSetsWeek}/{gymProgress.plannedSetsWeek || '—'}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      Semana {gymProgress.currentWeek}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0b0d12] border border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-neutral-400">
                      Ejercicios
                    </p>
                    <p className="font-display font-black text-base sm:text-lg text-amber-300 mt-0.5 tabular-nums">
                      {gymProgress.totalRoutineExercises}
                    </p>
                    <span className="text-[10px] text-amber-400 font-bold">
                      Programados
                    </span>
                  </div>
                </div>

                {/* Top 3 Ejercicios de tu Rutina con su Meta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 px-1">
                    <span>CARGAS DE TU RUTINA</span>
                    {gymProgress.topExercises.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowGymDetailModal(true)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Ver los {gymProgress.topExercises.length} ejercicios →
                      </button>
                    )}
                  </div>

                  {gymProgress.topExercises.slice(0, 3).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => router.push('/routines')}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#0b0d12] hover:bg-white/[0.04] border border-white/[0.06] transition cursor-pointer"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs sm:text-sm text-white truncate capitalize">
                            {ex.name}
                          </p>
                          {ex.hasLog && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                          {ex.prescription} ·{' '}
                          <span className="text-cyan-300/90">{ex.nextChallenge}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-xs sm:text-sm text-cyan-300 tabular-nums">
                          {ex.bestWeight > 0 ? `${ex.bestWeight} kg` : 'Corporal'}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] font-bold',
                            ex.hasLog ? 'text-emerald-400' : 'text-neutral-400',
                          )}
                        >
                          {ex.hasLog
                            ? ex.deltaKg > 0
                              ? `+${ex.deltaKg} kg récord`
                              : 'Completado'
                            : 'Meta base'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. ESTADÍSTICAS BIOMÉTRICAS (2x2 BENTO) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="font-display font-bold text-lg text-white">
                  Estadísticas
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Conectado a tu cuenta
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Calorías */}
                <div
                  onClick={() => router.push('/dashboard')}
                  className="rounded-[24px] bg-[#12141a] border border-white/[0.08] p-4 flex flex-col justify-between min-h-[150px] hover:border-amber-400/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Calorías</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {targetCalories} kcal
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-1.5 h-12 my-2 px-2">
                    {weeklyNutritionStats.dayStats.map((d) => {
                      const heightPct =
                        d.calories > 0
                          ? Math.min(
                              100,
                              Math.max(22, Math.round((d.calories / targetCalories) * 100)),
                            )
                          : 20;
                      return (
                        <div
                          key={d.isoDate}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                        >
                          <div
                            className={cn(
                              'w-2 rounded-full transition-all',
                              d.calories > 0
                                ? 'bg-amber-400'
                                : d.isToday
                                  ? 'bg-amber-400/50'
                                  : 'bg-white/15',
                            )}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-neutral-300 text-center leading-tight">
                    {weeklyNutritionStats.avgCalories > 0
                      ? `Promedio: ${weeklyNutritionStats.avgCalories} kcal`
                      : `Déficit: -${dailyDeficitKcal} kcal/día`}
                  </p>
                </div>

                {/* Card 2: Peso Balanza */}
                <div
                  onClick={() => setShowUpdateModal(true)}
                  className="rounded-[24px] bg-[#12141a] border border-white/[0.08] p-4 flex flex-col justify-between min-h-[150px] hover:border-cyan-400/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Peso Balanza</span>
                    </div>
                    <span className="text-xs font-mono font-black text-white">
                      {currentWeight} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-center h-12 my-2">
                    <svg
                      width="110"
                      height="38"
                      viewBox="0 0 110 38"
                      className="overflow-visible"
                    >
                      <path
                        d={
                          isFatLossGoal
                            ? 'M 6 8 Q 42 12 70 24 T 104 32'
                            : 'M 6 32 Q 42 26 70 16 T 104 8'
                        }
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="6" cy={isFatLossGoal ? 8 : 32} r="3.5" fill="#ffffff" />
                      <circle cx="104" cy={isFatLossGoal ? 32 : 8} r="4" fill="#10B981" />
                    </svg>
                  </div>

                  <p className="text-[11px] text-neutral-300 text-center leading-tight">
                    Meta: <strong className="text-emerald-400">{targetWeight} kg</strong>
                  </p>
                </div>

                {/* Card 3: % Grasa & Cintura */}
                <div
                  onClick={() => setShowUpdateModal(true)}
                  className="rounded-[24px] bg-[#12141a] border border-white/[0.08] p-4 flex flex-col justify-between min-h-[150px] hover:border-purple-400/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>% Grasa</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {latestWaist} cm
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-2">
                    <span className="font-display font-black text-2xl text-white tabular-nums">
                      {latestBodyFat}%
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center leading-tight">
                    Cintura: {latestWaist} cm · Toca para editar
                  </p>
                </div>

                {/* Card 4: Check-in Semanal */}
                <div
                  onClick={() => setShowUpdateModal(true)}
                  className="rounded-[24px] bg-[#12141a] border border-white/[0.08] p-4 flex flex-col justify-between min-h-[150px] hover:border-cyan-400/30 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 group-hover:text-cyan-300 transition">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Check-in</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {weighInHistory.length} reg.
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-2">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center group-hover:scale-105 transition">
                      <Plus className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center leading-tight">
                    Registrar pesaje y evolución
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: DESGLOSE COMPLETO DE EJERCICIOS DE LA RUTINA ── */}
      <Modal
        isOpen={showGymDetailModal}
        onClose={() => setShowGymDetailModal(false)}
        title={`Ejercicios · ${gymProgress.routineName}`}
        description={`Semana ${gymProgress.currentWeek} de ${gymProgress.weekCount} · Sobrecarga progresiva`}
        size="lg"
      >
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {gymProgress.topExercises.map((ex, i) => (
            <div
              key={ex.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-white capitalize">
                  #{i + 1} · {ex.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {ex.prescription} · <span className="text-cyan-300">{ex.nextChallenge}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-bold text-sm text-cyan-300">
                  {ex.bestWeight > 0 ? `${ex.bestWeight} kg` : 'Corporal'}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {ex.badgeLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── MODAL 2: ACTUALIZAR PESO, MEDIDAS Y META ── */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Actualizar Peso, Medidas y Meta"
        description="Se sincronizará en tiempo real con tu perfil y el panel de tu Coach en Vital Fit Labs"
        size="md"
      >
        <form onSubmit={handleSaveProgress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                Peso Actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base focus:border-cyan-400 focus:outline-none"
                placeholder="Ej: 85.5"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-emerald-400 mb-1">
                Peso Meta (kg)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={targetWeightInput}
                onChange={(e) => setTargetWeightInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-base font-bold focus:border-emerald-400 focus:outline-none"
                placeholder="Ej: 74"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                Cintura (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="Ej: 84"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                % Grasa Estimado
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFatInput}
                onChange={(e) => setBodyFatInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="Ej: 18.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
              Notas para tu Coach
            </label>
            <textarea
              rows={2}
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              placeholder="¿Cómo sentiste la energía, fuerza y descanso esta semana?"
            />
          </div>

          <button
            type="submit"
            disabled={savingProgress}
            className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {savingProgress ? 'Guardando...' : 'Guardar y Actualizar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
