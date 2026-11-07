"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { findPreciseDictEntry } from "../utils/exercise-matching";
import { ExercisePreviewModal } from "./ExercisePreviewModal";
import {
  Eye,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Check,
  Zap,
  Calendar as CalendarIcon,
  History,
  Dumbbell,
  Trophy,
  Info,
  ArrowLeft,
  Edit3,
  Trash2,
} from "lucide-react";
import { cn, formatRest } from "@/shared/lib/utils";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { analyzeExerciseProgression } from "../utils/vital-fit-labs-engine";
import type {
  Exercise,
  Routine,
  RoutineDay,
  WorkoutLog,
  SetLogData,
} from "../types/routines.types";

const DAY_NAMES = [
  "",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const SHORT_DAY_LETTERS = ["", "L", "M", "M", "J", "V", "S", "D"];

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Piernas",
  glutes: "Glúteos",
  abs: "Abdomen",
  cardio: "Cardio",
  full_body: "Full Body",
  other: "General",
};

const WEEKDAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastOfMonth.getDate();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/** Calcula el número de día del mes para cada día (1=Lun..7=Dom) de la semana actual */
function getCurrentWeekDates(): Record<number, number> {
  const now = new Date();
  const jsDay = now.getDay();
  const currentIsoDay = jsDay === 0 ? 7 : jsDay; // 1..7
  const result: Record<number, number> = {};
  for (let d = 1; d <= 7; d++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() + (d - currentIsoDay));
    result[d] = dt.getDate();
  }
  return result;
}

/* ── Inline Quick Set Editor inside Exercise Card ── */
function InlineSetDrawer({
  exercise,
  weekNumber,
  log,
  isSaving,
  weightUnit = "kg",
  onSave,
  onRemove,
  onClose,
}: {
  exercise: Exercise;
  weekNumber: number;
  log: WorkoutLog | undefined;
  isSaving: boolean;
  weightUnit?: "kg" | "lbs";
  onSave: (setsData: SetLogData[]) => Promise<void>;
  onRemove: () => void;
  onClose: () => void;
}) {
  const buildInitialSets = (): SetLogData[] => {
    if (log?.setsData && log.setsData.length > 0) {
      return log.setsData;
    }
    return Array.from({ length: exercise.sets }, (_, i) => ({
      set: i + 1,
      weight: exercise.targetWeight ?? null,
      reps: parseInt(exercise.reps?.match(/\d+/)?.[0] || "10", 10),
      rest: exercise.restSeconds ?? 90,
      completed: false,
    }));
  };

  const [sets, setSets] = useState<SetLogData[]>(buildInitialSets);

  useEffect(() => {
    setSets(buildInitialSets());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekNumber, exercise.id, log?.id]);

  const updateSet = (
    index: number,
    field: "weight" | "reps",
    value: string,
  ) => {
    setSets((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const parsed =
          value === ""
            ? null
            : field === "reps"
              ? parseInt(value, 10)
              : parseFloat(value);
        const updated = { ...s, [field]: parsed };
        updated.completed = updated.weight !== null || updated.reps !== null;
        return updated;
      }),
    );
  };

  const toggleSetComplete = (index: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s)),
    );
  };

  const handleSave = async () => {
    const finalSets = sets.map((s) => ({
      ...s,
      completed: s.completed || s.weight !== null || s.reps !== null,
    }));
    await onSave(finalSets);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 px-1">
        <span className="uppercase tracking-wider text-cyan-400">
          Registro Rápido · Semana {weekNumber}
        </span>
        <span>Unidad: {weightUnit.toUpperCase()}</span>
      </div>

      <div className="space-y-1.5">
        {sets.map((s, i) => {
          const isDone = s.completed || s.weight !== null || s.reps !== null;
          return (
            <div
              key={s.set}
              className={cn(
                "grid grid-cols-12 items-center gap-2 rounded-2xl px-3 py-2 border transition-colors",
                isDone
                  ? "bg-emerald-500/[0.07] border-emerald-500/25"
                  : "bg-[#0b0d12] border-white/[0.06]",
              )}
            >
              <div className="col-span-3 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[10px] font-black text-neutral-300 flex items-center justify-center">
                  {s.set}
                </span>
                <span className="text-xs font-bold text-neutral-300">
                  Serie {s.set}
                </span>
              </div>

              <div className="col-span-4 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="0"
                  value={
                    s.weight == null
                      ? ""
                      : weightUnit === "lbs"
                        ? Math.round(s.weight * 2.20462 * 2) / 2
                        : s.weight
                  }
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      updateSet(i, "weight", "");
                    } else {
                      const num = parseFloat(raw);
                      const kgVal =
                        weightUnit === "lbs"
                          ? Math.round((num / 2.20462) * 2) / 2
                          : num;
                      updateSet(i, "weight", String(kgVal));
                    }
                  }}
                  className="w-full rounded-xl bg-[#161922] border border-white/10 px-2.5 py-1.5 text-xs text-center font-bold text-white focus:border-cyan-400 outline-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 pointer-events-none">
                  {weightUnit}
                </span>
              </div>

              <div className="col-span-3 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="10"
                  value={s.reps ?? ""}
                  onChange={(e) => updateSet(i, "reps", e.target.value)}
                  className="w-full rounded-xl bg-[#161922] border border-white/10 px-2 py-1.5 text-xs text-center font-bold text-white focus:border-cyan-400 outline-none"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 pointer-events-none">
                  reps
                </span>
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleSetComplete(i)}
                  className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer",
                    s.completed
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 font-black"
                      : "bg-white/[0.04] border-white/10 text-neutral-500 hover:text-white",
                  )}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar Series"}
        </button>
        {log && (
          <button
            type="button"
            onClick={() => {
              onRemove();
              onClose();
            }}
            disabled={isSaving}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 transition cursor-pointer"
            title="Borrar registro de esta semana"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-neutral-300 transition cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

interface TrainingSummaryData {
  strengthTitle: string;
  strengthTarget: string;
  masteryTitle: string;
  setsToday: number;
  setsThisWeek: number;
  plannedSetsWeek: number;
  weekPct: number;
  totalSetsMonth: number;
  displayVolume: number;
}

interface RoutineListViewProps {
  routines: Routine[];
  selectedRoutine: Routine | null;
  logs: WorkoutLog[];
  logsLoading: boolean;
  currentWeek: number;
  autoCurrentWeek?: number;
  savingLog: string | null;
  userId: string;
  weightUnit?: "kg" | "lbs";
  onWeightUnitChange?: (unit: "kg" | "lbs") => void;
  onOpenEvolution?: () => void;
  onBack?: () => void;
  trainingSummary?: TrainingSummaryData;
  onSelectRoutine: (routine: Routine) => void;
  onActivateRoutine: (routineId: string) => Promise<void>;
  onStartSession: (day: RoutineDay) => void;
  onWeekChange: (week: number) => void;
  onSaveLog: (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => Promise<void>;
  onRemoveLog: (exerciseId: string) => Promise<void>;
}

export function RoutineListView({
  routines,
  selectedRoutine,
  logs,
  currentWeek,
  autoCurrentWeek,
  savingLog,
  weightUnit = "kg",
  onWeightUnitChange,
  onOpenEvolution,
  onBack,
  trainingSummary,
  onSelectRoutine,
  onActivateRoutine,
  onStartSession,
  onWeekChange,
  onSaveLog,
  onRemoveLog,
}: RoutineListViewProps) {
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"routine" | "calendar" | "history">("routine");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [dayViewMode, setDayViewMode] = useState<"focused" | "all">("focused");
  const [showInfo, setShowInfo] = useState(false);
  const [showRoutineDropdown, setShowRoutineDropdown] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyRoutineFilter, setHistoryRoutineFilter] = useState("all");
  const [historyWeekFilter, setHistoryWeekFilter] = useState("all");
  const [showPrsModal, setShowPrsModal] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for Fitia-style frosted sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 135);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    exerciseDictionaryService
      .getAll()
      .then((data) => setDictionary(Array.isArray(data) ? data : []))
      .catch(() => setDictionary([]));
  }, []);

  const dictByName = useMemo(() => {
    const map = new Map<string, ExerciseDict>();
    dictionary.forEach((d) => map.set(d.name.toLowerCase(), d));
    return map;
  }, [dictionary]);

  const getDictEntry = useCallback(
    (exerciseName: string) => {
      return findPreciseDictEntry(exerciseName, dictByName, dictionary);
    },
    [dictByName, dictionary],
  );

  const findExerciseById = useCallback(
    (exerciseId: string) => {
      for (const r of routines) {
        for (const day of r.days) {
          const ex = day.exercises.find((e) => e.id === exerciseId);
          if (ex) return ex;
        }
      }
      return null;
    },
    [routines],
  );

  const personalRecords = useMemo(() => {
    const prMap: Record<
      string,
      {
        exerciseId: string;
        name: string;
        muscleGroup: string;
        maxWeight: number;
        reps: number;
        date: string;
      }
    > = {};

    logs.forEach((log) => {
      const ex = findExerciseById(log.exerciseId);
      if (!ex) return;

      let logMaxWeight = 0;
      let matchingReps = 0;

      if (log.setsData && log.setsData.length > 0) {
        log.setsData.forEach((s) => {
          if (s.completed && s.weight !== null) {
            if (s.weight > logMaxWeight) {
              logMaxWeight = s.weight;
              matchingReps = s.reps ?? 0;
            }
          }
        });
      } else if (log.weight !== null && log.weight !== undefined) {
        logMaxWeight = log.weight;
        const repsMatch = log.repsDone?.match(/(\d+)\s*reps/);
        if (repsMatch) {
          matchingReps = parseInt(repsMatch[1], 10);
        }
      }

      if (logMaxWeight > 0) {
        const existing = prMap[ex.name];
        if (!existing || logMaxWeight > existing.maxWeight) {
          prMap[ex.name] = {
            exerciseId: log.exerciseId,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            maxWeight: logMaxWeight,
            reps: matchingReps,
            date: log.completedAt || log.createdAt,
          };
        }
      }
    });

    return Object.values(prMap).sort((a, b) => b.maxWeight - a.maxWeight);
  }, [logs, findExerciseById]);

  const groupedSessions = useMemo(() => {
    let filtered = logs;

    if (historyRoutineFilter !== "all") {
      const targetRoutine = routines.find((r) => r.id === historyRoutineFilter);
      const exerciseIds = new Set<string>();
      targetRoutine?.days.forEach((day) =>
        day.exercises.forEach((ex) => exerciseIds.add(ex.id)),
      );
      filtered = filtered.filter((l) => exerciseIds.has(l.exerciseId));
    }

    if (historyWeekFilter !== "all") {
      filtered = filtered.filter(
        (l) => l.weekNumber === Number(historyWeekFilter),
      );
    }

    if (historySearchQuery.trim() !== "") {
      const q = historySearchQuery.toLowerCase();
      filtered = filtered.filter((l) => {
        const ex = findExerciseById(l.exerciseId);
        return ex?.name.toLowerCase().includes(q);
      });
    }

    const groups: Record<
      string,
      {
        dateStr: string;
        date: Date;
        logs: WorkoutLog[];
        routineName: string;
      }
    > = {};

    filtered.forEach((log) => {
      const dateVal = log.completedAt || log.createdAt;
      if (!dateVal) return;
      const d = new Date(dateVal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

      const r = routines.find((routine) =>
        routine.days.some((day) =>
          day.exercises.some((ex) => ex.id === log.exerciseId),
        ),
      );
      const routineName = r ? r.name : "Rutina";

      if (!groups[key]) {
        groups[key] = {
          dateStr: key,
          date: d,
          logs: [],
          routineName,
        };
      }
      groups[key].logs.push(log);
    });

    return Object.values(groups).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [
    logs,
    historyRoutineFilter,
    historyWeekFilter,
    historySearchQuery,
    routines,
    findExerciseById,
  ]);

  const activeRoutineExerciseIds = useMemo(() => {
    if (!selectedRoutine) return new Set<string>();
    const ids = new Set<string>();
    selectedRoutine.days.forEach((d) =>
      d.exercises.forEach((ex) => ids.add(ex.id)),
    );
    return ids;
  }, [selectedRoutine]);

  const activeRoutineLogs = useMemo(() => {
    return logs.filter((l) => activeRoutineExerciseIds.has(l.exerciseId));
  }, [logs, activeRoutineExerciseIds]);

  const getExerciseLog = (exerciseId: string, weekNumber: number) => {
    return logs.find(
      (l) => l.exerciseId === exerciseId && l.weekNumber === weekNumber,
    );
  };

  const handleTrackingSave = async (
    exercise: Exercise,
    setsData: SetLogData[],
  ) => {
    for (const s of setsData) {
      if (s.completed || s.weight !== null || s.reps !== null) {
        await onSaveLog(exercise, s.set, s.weight, s.reps);
      }
    }
  };

  const todayDayNumber = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const weekDates = useMemo(() => getCurrentWeekDates(), []);

  if (!selectedRoutine) {
    return (
      <div className="min-h-screen bg-[#07080b] text-white pb-32 pt-6 px-4 max-w-md mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-display font-black text-white">
          Aún no tienes una rutina asignada
        </h2>
        <p className="text-sm text-neutral-400 mt-1.5 max-w-xs">
          Tu coach de Vital Fit Labs está diseñando tu programación biomecánica personalizada.
        </p>
      </div>
    );
  }

  const totalExercises = selectedRoutine.days.reduce(
    (s, d) => s + d.exercises.length,
    0,
  );
  const totalLogs = totalExercises * selectedRoutine.weekCount;
  const completedLogs = activeRoutineLogs.length;
  const cycleProgress =
    totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  const todayDay = selectedRoutine.days.find(
    (d) => d.dayNumber === todayDayNumber,
  );
  const activeDayNumber =
    selectedDayNumber ??
    todayDay?.dayNumber ??
    selectedRoutine.days.find((d) => !d.isRestDay)?.dayNumber ??
    selectedRoutine.days[0]?.dayNumber ??
    1;

  const activeDay =
    selectedRoutine.days.find((d) => d.dayNumber === activeDayNumber) ||
    todayDay ||
    selectedRoutine.days[0];

  const isSelectedDayTraining = activeDay && !activeDay.isRestDay;
  const dayExercisesDone = activeDay
    ? activeDay.exercises.filter((ex) =>
        activeRoutineLogs.some(
          (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek,
        ),
      ).length
    : 0;
  const dayExercisesTotal = activeDay?.exercises.length || 0;
  const dayProgressPct =
    dayExercisesTotal > 0
      ? Math.round((dayExercisesDone / dayExercisesTotal) * 100)
      : 0;
  const isSelectedDayCompleted =
    !!isSelectedDayTraining &&
    dayExercisesTotal > 0 &&
    dayExercisesDone === dayExercisesTotal;
  const isTodaySelected = activeDay?.dayNumber === todayDayNumber;

  // Sets metrics for the selected day
  const plannedSetsActiveDay = activeDay
    ? activeDay.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)
    : 0;
  const completedSetsActiveDay = activeDay
    ? activeDay.exercises.reduce((sum, ex) => {
        const log = getExerciseLog(ex.id, currentWeek);
        const count =
          log?.setsData?.filter((s) => s.completed || s.weight || s.reps)
            .length ?? (log ? ex.sets : 0);
        return sum + count;
      }, 0)
    : 0;

  const calDays = getCalendarDays(calYear, calMonth);
  const todayDate = new Date();

  const getRoutineDayForDate = (date: Date) => {
    const jsDay = date.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    return selectedRoutine.days.find((d) => d.dayNumber === dayOfWeek);
  };

  const selectedDayInfo = calSelectedDate
    ? getRoutineDayForDate(calSelectedDate)
    : null;

  const formatSessionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      const formatted = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  const formatPrDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white pb-32 pt-2">
      {/* ── FLOATING COLLAPSED STICKY HEADER ON SCROLL (Fitia Style) ── */}
      {isScrolled && activeTab === "routine" && (
        <div className="fixed top-0 left-0 lg:left-72 right-0 z-40 bg-[#090b10]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_14px_34px_rgba(0,0,0,0.75)] rounded-b-[26px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-8 pt-2.5 pb-3">
            {/* Compact 7-Day Strip */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {selectedRoutine.days.map((day) => {
                const isSelected =
                  activeDayNumber === day.dayNumber && dayViewMode === "focused";
                const isDone =
                  !day.isRestDay &&
                  day.exercises.length > 0 &&
                  day.exercises.every((ex) =>
                    activeRoutineLogs.some(
                      (l) =>
                        l.exerciseId === ex.id && l.weekNumber === currentWeek,
                    ),
                  );
                const hasTraining = !day.isRestDay;

                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => {
                      setSelectedDayNumber(day.dayNumber);
                      setDayViewMode("focused");
                    }}
                    className="flex flex-col items-center py-0.5 cursor-pointer group"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                        isSelected
                          ? "bg-white text-black font-black shadow-sm"
                          : "text-neutral-400 group-hover:text-white",
                      )}
                    >
                      {SHORT_DAY_LETTERS[day.dayNumber] || `D${day.dayNumber}`}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold mt-0.5 tabular-nums",
                        isSelected ? "text-cyan-400 font-black" : "text-neutral-300",
                      )}
                    >
                      {weekDates[day.dayNumber] ?? day.dayNumber}
                    </span>
                    <div className="h-2 flex items-center justify-center mt-0.5">
                      {isDone ? (
                        <span className="text-[9px] font-black text-emerald-400 leading-none">
                          ✓
                        </span>
                      ) : hasTraining ? (
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-cyan-400" : "bg-cyan-400/60",
                          )}
                        />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compact Workout Summary + Instant Start CTA */}
            <div className="flex items-center justify-between gap-3 mt-2.5 pt-2 border-t border-white/[0.06]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Sem {currentWeek} · {DAY_NAMES[activeDay?.dayNumber || 1]}
                  </span>
                  <span className="text-[10px] text-neutral-500">•</span>
                  <span className="text-[10px] font-bold text-neutral-400 tabular-nums">
                    {dayExercisesDone}/{dayExercisesTotal} ej.
                  </span>
                </div>
                <p className="text-xs font-bold text-white truncate">
                  {activeDay?.isRestDay
                    ? "🧘 Día de Descanso Activo"
                    : activeDay?.focusArea || "Entrenamiento"}
                </p>
              </div>

              {isSelectedDayTraining && activeDay && (
                <button
                  type="button"
                  onClick={() => onStartSession(activeDay)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-black text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isSelectedDayCompleted ? "Repetir" : "Entrenar"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-8 space-y-4">
        {/* ── 1. TOP FITIA HEADER BAR ── */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-[#14171f] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
                title="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Interactive Routine Selector Title */}
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setShowRoutineDropdown(!showRoutineDropdown)}
                className="flex items-center gap-1.5 text-left group cursor-pointer max-w-full"
              >
                <span className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white truncate max-w-[190px] sm:max-w-[280px]">
                  {selectedRoutine.name}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-neutral-400 group-hover:text-white transition-transform shrink-0",
                    showRoutineDropdown && "rotate-180 text-cyan-400",
                  )}
                />
              </button>

              <div className="flex items-center gap-2 mt-0.5">
                {selectedRoutine.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Rutina Activa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onActivateRoutine(selectedRoutine.id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                  >
                    ⚠️ Activar esta rutina
                  </button>
                )}
                <span className="text-[10px] text-neutral-600">•</span>
                <span className="text-[10px] font-semibold text-neutral-400">
                  {selectedRoutine.days.filter((d) => !d.isRestDay).length} días/sem
                </span>
              </div>

              {/* Routine Selector Dropdown Sheet */}
              {showRoutineDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                    onClick={() => setShowRoutineDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 max-h-[360px] overflow-y-auto rounded-[24px] border border-white/15 bg-[#12141a] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.95)] z-50 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-white/[0.06] flex items-center justify-between">
                      <span>Mis Programas</span>
                      <span>{routines.length} disponibles</span>
                    </div>
                    {routines.map((r) => {
                      const isSelected = selectedRoutine.id === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            onSelectRoutine(r);
                            setShowRoutineDropdown(false);
                          }}
                          className={cn(
                            "flex items-center justify-between w-full rounded-2xl px-3.5 py-3 text-xs font-bold transition-all cursor-pointer text-left",
                            isSelected
                              ? "bg-white text-black font-black shadow-sm"
                              : "text-neutral-300 hover:bg-white/[0.06] hover:text-white",
                          )}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate flex items-center gap-1.5">
                              <span>{r.isActive ? "⚡" : "🏋️"}</span>
                              <span className="truncate">{r.name}</span>
                            </p>
                            <p
                              className={cn(
                                "text-[10px] mt-0.5",
                                isSelected ? "text-neutral-600" : "text-neutral-500",
                              )}
                            >
                              {r.days.filter((d) => !d.isRestDay).length} días ·{" "}
                              {r.weekCount} semanas
                            </p>
                          </div>
                          {r.isActive && (
                            <span
                              className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                                isSelected
                                  ? "bg-emerald-500 text-black"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                              )}
                            >
                              Activa
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Quick Actions: Co-Piloto IA, Evolución, KG/LBS */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-ai-assistant"))
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-[11px] font-bold transition cursor-pointer active:scale-95"
              title="Consultar al Co-Piloto IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">IA</span>
            </button>

            {onOpenEvolution && (
              <button
                type="button"
                onClick={onOpenEvolution}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#14171f] hover:bg-white/10 border border-white/10 text-amber-300 text-[11px] font-bold transition cursor-pointer active:scale-95"
                title="Ver Capas de Evolución de 120 Días"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Evolución</span>
              </button>
            )}

            {onWeightUnitChange && (
              <div className="flex items-center rounded-full bg-[#14171f] p-0.5 border border-white/10">
                {(["kg", "lbs"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => onWeightUnitChange(u)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition cursor-pointer",
                      weightUnit === u
                        ? "bg-white text-black shadow-xs"
                        : "text-neutral-400 hover:text-white",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 2. FITIA 7-DAY CALENDAR STRIP ── */}
        <div className="grid grid-cols-7 gap-1 text-center py-1">
          {selectedRoutine.days.map((day) => {
            const isSelected =
              activeDayNumber === day.dayNumber &&
              dayViewMode === "focused" &&
              activeTab === "routine";
            const isToday = day.dayNumber === todayDayNumber;
            const isDone =
              !day.isRestDay &&
              day.exercises.length > 0 &&
              day.exercises.every((ex) =>
                activeRoutineLogs.some(
                  (l) => l.exerciseId === ex.id && l.weekNumber === currentWeek,
                ),
              );
            const hasTraining = !day.isRestDay;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => {
                  setSelectedDayNumber(day.dayNumber);
                  setDayViewMode("focused");
                  if (activeTab !== "routine") setActiveTab("routine");
                }}
                className={cn(
                  "flex flex-col items-center py-1.5 rounded-2xl transition-all cursor-pointer active:scale-95",
                  isSelected
                    ? "bg-white/[0.05] border border-white/[0.1] shadow-sm"
                    : "hover:bg-white/[0.02] border border-transparent",
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isSelected
                      ? "bg-white text-black font-black shadow-md"
                      : isToday
                        ? "border border-cyan-400/50 text-cyan-300"
                        : "text-neutral-400",
                  )}
                >
                  {SHORT_DAY_LETTERS[day.dayNumber] || `D${day.dayNumber}`}
                </div>

                <span
                  className={cn(
                    "text-sm font-bold mt-1.5 tabular-nums",
                    isSelected
                      ? "text-cyan-400 font-extrabold"
                      : isToday
                        ? "text-white"
                        : "text-neutral-300",
                  )}
                >
                  {weekDates[day.dayNumber] ?? day.dayNumber}
                </span>

                {/* Status Dot */}
                <div className="h-2.5 flex items-center justify-center mt-1">
                  {isDone ? (
                    <span className="text-[10px] font-black text-emerald-400 leading-none">
                      ✓
                    </span>
                  ) : hasTraining ? (
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        isSelected
                          ? "bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.9)]"
                          : "bg-cyan-400/60",
                      )}
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 3. WEEK STEPPER STRIP & VIEW SWITCHER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Week Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {Array.from({ length: selectedRoutine.weekCount }, (_, i) => i + 1).map(
              (w) => {
                const wLogs = activeRoutineLogs.filter((l) => l.weekNumber === w);
                const trainingDays = selectedRoutine.days.filter(
                  (d) => !d.isRestDay,
                );
                const wTotal = trainingDays.reduce(
                  (s, d) => s + d.exercises.length,
                  0,
                );
                const wDone = wLogs.length;
                const isSelected = currentWeek === w;
                const isCompleted = wDone > 0 && wDone >= wTotal;
                const isAutoActive = autoCurrentWeek === w;

                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onWeekChange(w)}
                    className={cn(
                      "px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95",
                      isSelected
                        ? "bg-white text-black border-white font-black shadow-sm"
                        : isAutoActive
                          ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300"
                          : isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                            : "bg-[#12141a] border-white/[0.06] text-neutral-400 hover:text-white",
                    )}
                  >
                    <span>Sem {w}</span>
                    {isAutoActive && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full tabular-nums",
                        isSelected
                          ? "bg-black/10 text-neutral-800 font-black"
                          : isCompleted
                            ? "text-emerald-400"
                            : "text-neutral-500",
                      )}
                    >
                      {isCompleted ? "✓" : `${wDone}/${wTotal}`}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {/* Mode Segmented Control: Rutina | Calendario | Historial */}
          <div className="flex items-center bg-[#12141a] p-1 rounded-2xl border border-white/[0.06] self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("routine")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTab === "routine"
                  ? "bg-white/[0.1] text-white font-black shadow-xs"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTab === "calendar"
                  ? "bg-white/[0.1] text-white font-black shadow-xs"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTab === "history"
                  ? "bg-white/[0.1] text-white font-black shadow-xs"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Historial</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: PLAN DE RUTINA (FITIA + VITAL FIT LABS) ── */}
        {activeTab === "routine" && (
          <>
            {/* ── CENTRAL WORKOUT HERO CARD (#12141a) ── */}
            <div className="rounded-[28px] bg-[#12141a] border border-white/[0.06] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.45)] relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              {/* Top Meta Row */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/12 border border-cyan-500/25 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    {DAY_NAMES[activeDay?.dayNumber || 1]}
                  </span>
                  {isTodaySelected && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      ● Hoy
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Semana {currentWeek} de {selectedRoutine.weekCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDayViewMode(
                        dayViewMode === "focused" ? "all" : "focused",
                      )
                    }
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] font-bold text-neutral-300 transition cursor-pointer"
                  >
                    {dayViewMode === "focused" ? "Ver 7 días" : "Solo este día"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className={cn(
                      "w-7 h-7 rounded-xl border flex items-center justify-center transition cursor-pointer",
                      showInfo
                        ? "bg-cyan-400 text-black border-cyan-400"
                        : "bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white",
                    )}
                    title="Guía de la rutina"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Focus & Progress Gauge */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-snug">
                    {activeDay?.isRestDay
                      ? "Descanso y Recuperación"
                      : activeDay?.focusArea || "Sesión de Fuerza"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {activeDay?.isRestDay
                      ? activeDay.restDayNote ||
                        "Recuperación del sistema nervioso central y síntesis proteica."
                      : isSelectedDayCompleted
                        ? "¡Todas las series de este día fueron completadas! 🏆"
                        : `${dayExercisesTotal} ejercicios programados · ~${Math.max(25, dayExercisesTotal * 12)} min`}
                  </p>
                </div>

                {/* Circular Progress Ring */}
                <div className="relative flex items-center justify-center shrink-0 w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="stroke-white/[0.08] fill-none"
                      strokeWidth="5.5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className={cn(
                        "fill-none transition-all duration-700 ease-out",
                        isSelectedDayCompleted
                          ? "stroke-emerald-400"
                          : "stroke-cyan-400",
                      )}
                      strokeWidth="5.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={
                        163.36 - (163.36 * dayProgressPct) / 100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-black text-white tabular-nums block">
                      {dayProgressPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Fitia-Style Metric Columns with Progress Bars */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                {/* Col 1: Series del Día */}
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 block">
                    Series Día ›
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5 tabular-nums">
                    {completedSetsActiveDay} / {plannedSetsActiveDay || "—"}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.07] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{
                        width: `${
                          plannedSetsActiveDay > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (completedSetsActiveDay /
                                    plannedSetsActiveDay) *
                                    100,
                                ),
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Col 2: Avance Semanal */}
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 block">
                    Semana {currentWeek} ›
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5 tabular-nums">
                    {trainingSummary
                      ? `${trainingSummary.setsThisWeek} / ${trainingSummary.plannedSetsWeek || "—"}`
                      : `${completedLogs} / ${totalLogs}`}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.07] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                      style={{
                        width: `${trainingSummary ? trainingSummary.weekPct : cycleProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Col 3: Volumen / Récords */}
                <div
                  onClick={() => setShowPrsModal(true)}
                  className="cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-400 group-hover:text-amber-300 transition block">
                    Volumen Mes ›
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5 tabular-nums truncate">
                    {trainingSummary
                      ? `${trainingSummary.displayVolume.toLocaleString("es")} ${weightUnit}`
                      : `${personalRecords.length} PRs`}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.07] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, cycleProgress))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Collapsible Info / Cycle Goal */}
              {showInfo && (
                <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-xs text-neutral-300 space-y-2 animate-in fade-in duration-200">
                  {selectedRoutine.description && (
                    <p className="font-medium text-white">
                      {selectedRoutine.description}
                    </p>
                  )}
                  {trainingSummary && (
                    <p className="text-neutral-400 leading-relaxed">
                      🎯 <strong>Meta del Ciclo:</strong>{" "}
                      <span className="text-amber-300 font-semibold">
                        {trainingSummary.strengthTitle}{" "}
                        {trainingSummary.strengthTarget
                          ? `(${trainingSummary.strengthTarget})`
                          : ""}
                      </span>{" "}
                      +{" "}
                      <span className="text-cyan-300 font-semibold">
                        {trainingSummary.masteryTitle}
                      </span>
                      .
                    </p>
                  )}
                </div>
              )}

              {/* Primary CTA Button (Fitia Full-Width Pill) */}
              <div className="mt-5">
                {isSelectedDayTraining && activeDay ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartSession(activeDay)}
                      className={cn(
                        "flex-1 py-3.5 px-5 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]",
                        isSelectedDayCompleted
                          ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                          : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(0,240,255,0.35)]",
                      )}
                    >
                      <Zap
                        className={cn(
                          "w-4 h-4",
                          isSelectedDayCompleted
                            ? "text-emerald-400"
                            : "fill-slate-950 text-slate-950",
                        )}
                      />
                      <span>
                        {isSelectedDayCompleted
                          ? "Sesión Completada · Volver a Abrir"
                          : isTodaySelected
                            ? "Entrenar Hoy"
                            : `Entrenar ${DAY_NAMES[activeDay.dayNumber]}`}
                      </span>
                    </button>

                    {!isTodaySelected && todayDay && (
                      <button
                        type="button"
                        onClick={() => setSelectedDayNumber(todayDay.dayNumber)}
                        className="py-3.5 px-4 rounded-2xl bg-[#1b1e26] hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
                      >
                        Ir a Hoy
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-2xl bg-[#181b22] border border-white/[0.05]">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <span>🧘</span>
                      <span>Día de Recuperación y Movilidad</span>
                    </span>
                    {!isTodaySelected && todayDay && (
                      <button
                        type="button"
                        onClick={() => setSelectedDayNumber(todayDay.dayNumber)}
                        className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        Ir a Hoy →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── EXERCISE CARDS LIST (Fitia Individual Card Style) ── */}
            {(dayViewMode === "focused"
              ? [activeDay].filter(Boolean)
              : selectedRoutine.days
            ).map((day) => {
              if (!day) return null;

              return (
                <div key={day.dayNumber} className="space-y-3">
                  {/* Section Title header when viewing all days or focused */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-display font-bold text-white">
                        {dayViewMode === "all"
                          ? `${DAY_NAMES[day.dayNumber]} · ${day.isRestDay ? "Descanso" : day.focusArea}`
                          : "Ejercicios de la Sesión"}
                      </h3>
                      {!day.isRestDay && (
                        <span className="text-xs font-semibold text-neutral-500">
                          ({day.exercises.length})
                        </span>
                      )}
                    </div>

                    {!day.isRestDay && dayViewMode === "all" && (
                      <button
                        type="button"
                        onClick={() => onStartSession(day)}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Iniciar día</span>
                      </button>
                    )}
                  </div>

                  {day.isRestDay ? (
                    <div className="rounded-[24px] bg-[#12141a] border border-white/[0.06] p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-2xl shrink-0">
                        🧘
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Recuperación Muscular y SNC
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                          {day.restDayNote ||
                            "Aprovecha para cumplir tus pasos NEAT, hidratación (3.5L) y proteína del día."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3.5 items-start">
                      {day.exercises.map((ex, idx) => {
                        const log = getExerciseLog(ex.id, currentWeek);
                        const isExLogged = !!log;
                        const dictEntry = getDictEntry(ex.name);
                        const thumbUrl = dictEntry?.gifUrl || ex.gifUrl || null;
                        const muscleInfo =
                          MUSCLE_GROUPS[
                            ex.muscleGroup as keyof typeof MUSCLE_GROUPS
                          ];
                        const exInsight = analyzeExerciseProgression(
                          ex,
                          activeRoutineLogs,
                          currentWeek,
                        );
                        const isInlineOpen = expandedExerciseId === ex.id;

                        return (
                          <div
                            key={ex.id}
                            onClick={() => setPreviewExercise(ex)}
                            className={cn(
                              "rounded-[24px] bg-[#12141a] border p-4 transition-all cursor-pointer",
                              isExLogged
                                ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.05] to-[#12141a]"
                                : "border-white/[0.06] hover:border-white/15",
                            )}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* 56x56 Thumbnail with 3D/GIF or Muscle Icon */}
                              <div className="relative w-14 h-14 rounded-2xl bg-[#1b1e26] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                                {thumbUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={thumbUrl}
                                    alt={ex.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-2xl">
                                    {muscleInfo?.icon || "🏋️"}
                                  </span>
                                )}
                                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/80 text-[9px] font-black text-cyan-400">
                                  #{idx + 1}
                                </span>
                              </div>

                              {/* Exercise Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[15px] font-bold text-white truncate">
                                    {ex.name}
                                  </p>
                                </div>

                                {/* Prescription Row */}
                                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 flex-wrap">
                                  <span className="font-bold text-white tabular-nums">
                                    {ex.sets} × {ex.reps}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-cyan-300 tabular-nums">
                                    {ex.targetWeight && ex.targetWeight > 0
                                      ? weightUnit === "lbs"
                                        ? `${Math.round(ex.targetWeight * 2.20462 * 2) / 2} lbs`
                                        : `${ex.targetWeight} kg`
                                      : "Corporal"}
                                  </span>
                                  <span>•</span>
                                  <span>⏱️ {formatRest(ex.restSeconds)}</span>
                                </div>

                                {/* Intensity & Muscle Tags */}
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  <span className="text-[10px] font-semibold text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.06]">
                                    {MUSCLE_LABELS[ex.muscleGroup] || "General"}
                                  </span>
                                  {ex.intensity === "failure" ? (
                                    <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-lg border border-rose-500/25">
                                      🔴 Al Fallo
                                    </span>
                                  ) : ex.intensity === "relax" ? (
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/25">
                                      🟢 Relax
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/25">
                                      🟡 Media
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right Actions: 3D Preview + Quick Set Log */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewExercise(ex);
                                  }}
                                  className="w-9 h-9 rounded-xl bg-[#1b1e26] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-cyan-400 transition cursor-pointer"
                                  title="Ver técnica 3D"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedExerciseId(
                                      isInlineOpen ? null : ex.id,
                                    );
                                  }}
                                  className={cn(
                                    "w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer",
                                    isExLogged
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                      : isInlineOpen
                                        ? "bg-cyan-400 border-cyan-400 text-slate-950"
                                        : "bg-[#1b1e26] border-white/[0.08] text-neutral-400 hover:text-white",
                                  )}
                                  title={
                                    isExLogged
                                      ? "Editar series registradas"
                                      : "Registrar series manualmente"
                                  }
                                >
                                  {isExLogged ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <Edit3 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Logged Sets Summary Pills */}
                            {isExLogged &&
                              log?.setsData &&
                              log.setsData.length > 0 &&
                              !isInlineOpen && (
                                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/[0.06]">
                                  {log.setsData
                                    .filter(
                                      (s) => s.completed || s.weight || s.reps,
                                    )
                                    .map((s) => (
                                      <span
                                        key={s.set}
                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-300 tabular-nums"
                                      >
                                        S{s.set}:{" "}
                                        {s.weight && s.weight > 0
                                          ? weightUnit === "lbs"
                                            ? `${Math.round(s.weight * 2.20462 * 2) / 2}lbs`
                                            : `${s.weight}kg`
                                          : "Corp"}{" "}
                                        × {s.reps ?? 0}
                                      </span>
                                    ))}
                                </div>
                              )}

                            {/* Vital Fit Labs Progression Insight Strip */}
                            {exInsight.state !== "first_week" && !isInlineOpen && (
                              <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-white/[0.05] text-[11px]">
                                <span className="text-neutral-400 truncate">
                                  Sem ant:{" "}
                                  <strong className="text-neutral-200">
                                    {exInsight.historyChainText}
                                  </strong>
                                </span>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                                    exInsight.tone === "emerald"
                                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                      : exInsight.tone === "cyan"
                                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                        : exInsight.tone === "amber"
                                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                          : "bg-rose-500/15 text-rose-300 border-rose-500/30",
                                  )}
                                >
                                  {exInsight.badgeLabel}
                                </span>
                              </div>
                            )}

                            {/* Inline Quick Set Logger Drawer */}
                            {isInlineOpen && (
                              <InlineSetDrawer
                                exercise={ex}
                                weekNumber={currentWeek}
                                log={log}
                                isSaving={savingLog?.startsWith(ex.id) ?? false}
                                weightUnit={weightUnit}
                                onSave={(setsData) =>
                                  handleTrackingSave(ex, setsData)
                                }
                                onRemove={() => onRemoveLog(ex.id)}
                                onClose={() => setExpandedExerciseId(null)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── TAB 2: CALENDARIO MENSUAL ── */}
        {activeTab === "calendar" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-[28px] bg-[#12141a] border border-white/[0.06] p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-display font-black text-white">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setCalMonth(todayDate.getMonth());
                      setCalYear(todayDate.getFullYear());
                      setCalSelectedDate(todayDate);
                    }}
                    className="rounded-xl bg-white/[0.06] hover:bg-white/10 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-white/10 transition cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear((y) => y - 1);
                      } else {
                        setCalMonth((m) => m - 1);
                      }
                      setCalSelectedDate(null);
                    }}
                    className="rounded-xl p-2 text-neutral-400 border border-white/10 bg-white/[0.04] hover:text-white cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear((y) => y + 1);
                      } else {
                        setCalMonth((m) => m + 1);
                      }
                      setCalSelectedDate(null);
                    }}
                    className="rounded-xl p-2 text-neutral-400 border border-white/10 bg-white/[0.04] hover:text-white cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {WEEKDAY_LABELS.map((l) => (
                  <div
                    key={l}
                    className="py-1.5 text-center text-[10px] font-black uppercase tracking-wider text-neutral-500"
                  >
                    {l}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calDays.map((date, idx) => {
                  if (!date) return <div key={`e-${idx}`} className="p-1" />;

                  const rd = getRoutineDayForDate(date);
                  const hasTraining = rd && !rd.isRestDay;
                  const isSelected =
                    calSelectedDate && isSameDay(date, calSelectedDate);
                  const isTodayDate = isSameDay(date, todayDate);
                  const isDayDone =
                    hasTraining &&
                    rd.exercises.length > 0 &&
                    rd.exercises.every((ex) =>
                      activeRoutineLogs.some(
                        (l) =>
                          l.exerciseId === ex.id && l.weekNumber === currentWeek,
                      ),
                    );

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setCalSelectedDate(date)}
                      className={cn(
                        "relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-white text-black font-black shadow-md"
                          : isTodayDate
                            ? "border border-cyan-400 bg-cyan-500/10 text-white"
                            : isDayDone
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : hasTraining
                                ? "bg-white/[0.04] text-neutral-200 border border-white/[0.06]"
                                : "text-neutral-500 hover:bg-white/[0.04]",
                      )}
                    >
                      <span>{date.getDate()}</span>
                      {!isSelected && (
                        <div className="mt-0.5">
                          {isDayDone ? (
                            <span className="text-[8px] text-emerald-400 font-black">
                              ✓
                            </span>
                          ) : hasTraining ? (
                            <span className="block h-1 w-1 rounded-full bg-cyan-400" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {calSelectedDate && selectedDayInfo && (
              <div className="rounded-[24px] bg-[#12141a] border border-white/[0.06] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-cyan-400 uppercase">
                      {DAY_NAMES[selectedDayInfo.dayNumber]}
                    </p>
                    <h4 className="text-base font-bold text-white">
                      {selectedDayInfo.isRestDay
                        ? "Día de Descanso"
                        : selectedDayInfo.focusArea}
                    </h4>
                  </div>
                  {!selectedDayInfo.isRestDay && (
                    <button
                      type="button"
                      onClick={() => onStartSession(selectedDayInfo)}
                      className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      ⚡ Entrenar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: HISTORIAL Y RÉCORDS PRs ── */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-[22px] bg-[#12141a] p-4 border border-white/[0.06] text-center">
                <p className="text-2xl font-display font-black text-white tabular-nums">
                  {groupedSessions.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                  Sesiones
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPrsModal(true)}
                className="rounded-[22px] bg-gradient-to-b from-amber-500/15 to-[#12141a] p-4 border border-amber-500/30 text-center cursor-pointer hover:border-amber-400 transition"
              >
                <p className="text-2xl font-display font-black text-amber-400 tabular-nums">
                  🏆 {personalRecords.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mt-0.5">
                  Récords PR
                </p>
              </button>

              <div className="rounded-[22px] bg-[#12141a] p-4 border border-white/[0.06] text-center">
                <p className="text-2xl font-display font-black text-white tabular-nums">
                  {logs.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                  Registros
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="rounded-[24px] bg-[#12141a] border border-white/[0.06] p-3.5 space-y-2.5">
              <input
                type="text"
                placeholder="🔎 Buscar ejercicio en tu historial..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d12] border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={historyRoutineFilter}
                  onChange={(e) => setHistoryRoutineFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0b0d12] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="all">Todas las rutinas</option>
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <select
                  value={historyWeekFilter}
                  onChange={(e) => setHistoryWeekFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0b0d12] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="all">Todas las semanas</option>
                  {Array.from(
                    {
                      length: Math.max(
                        ...routines.map((r) => r.weekCount),
                        4,
                      ),
                    },
                    (_, i) => i + 1,
                  ).map((w) => (
                    <option key={w} value={w}>
                      Semana {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              {groupedSessions.map((session) => (
                <div
                  key={session.dateStr}
                  className="rounded-[24px] bg-[#12141a] border border-white/[0.06] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {formatSessionDate(session.dateStr)}
                      </h4>
                      <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                        {session.routineName}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase">
                      {session.logs.length} ej.
                    </span>
                  </div>

                  <div className="space-y-2">
                    {session.logs.map((log) => {
                      const ex = findExerciseById(log.exerciseId);
                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-2xl bg-[#0b0d12] border border-white/[0.05] space-y-1.5"
                        >
                          <p className="text-xs font-bold text-white">
                            {ex?.name || "Ejercicio"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {log.setsData && log.setsData.length > 0 ? (
                              log.setsData
                                .filter(
                                  (s) =>
                                    s.completed || (s.reps && s.reps > 0),
                                )
                                .map((set, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-bold text-neutral-200 tabular-nums"
                                  >
                                    S{sIdx + 1}:{" "}
                                    {set.weight && set.weight > 0
                                      ? `${set.weight}kg`
                                      : "Corp"}{" "}
                                    ×{" "}
                                    <strong className="text-cyan-300">
                                      {set.reps ?? 0}
                                    </strong>
                                  </span>
                                ))
                            ) : (
                              <span className="text-[11px] text-neutral-400">
                                {log.repsDone || "Completado"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {groupedSessions.length === 0 && (
                <div className="rounded-[24px] bg-[#12141a] border border-white/[0.06] p-8 text-center">
                  <p className="text-sm font-bold text-white">
                    Sin sesiones registradas aún
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Completa tu entrenamiento de hoy para ver tu evolución aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3D / GIF Exercise Technical Preview Modal */}
      <ExercisePreviewModal
        isOpen={!!previewExercise}
        exercise={previewExercise}
        dictEntry={previewExercise ? getDictEntry(previewExercise.name) : null}
        day={
          selectedRoutine?.days.find((d) =>
            d.exercises.some((e) => e.id === previewExercise?.id),
          ) ||
          activeDay ||
          null
        }
        onClose={() => setPreviewExercise(null)}
        onStartSession={onStartSession}
        weightUnit={weightUnit}
      />

      {/* Personal Records (PRs) Modal */}
      {showPrsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowPrsModal(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/12 bg-[#12141a] p-5 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-display font-black uppercase text-white">
                  Récords Personales (PR)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrsModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {personalRecords.length === 0 ? (
                <p className="text-xs text-center text-neutral-400 py-8">
                  Aún no tienes récords con carga externa registrados.
                </p>
              ) : (
                personalRecords.map((pr) => (
                  <div
                    key={pr.exerciseId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b0d12] border border-white/[0.06]"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{pr.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {MUSCLE_LABELS[pr.muscleGroup] || "General"} ·{" "}
                        {formatPrDate(pr.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-400 tabular-nums">
                        {weightUnit === "lbs"
                          ? `${Math.round(pr.maxWeight * 2.20462 * 2) / 2} lbs`
                          : `${pr.maxWeight} kg`}
                      </p>
                      <p className="text-[11px] text-neutral-400 tabular-nums">
                        {pr.reps} reps
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
