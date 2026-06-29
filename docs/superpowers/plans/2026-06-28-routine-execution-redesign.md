# Routine Execution Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 2844-line `ClientRoutinesView.tsx` into focused components and add an auto rest timer + calorie tracker to the guided workout session.

**Architecture:** `ClientRoutinesView` becomes a thin data-fetching shell that routes between `RoutineListView` (list/calendar) and `GuidedSessionView` (fullscreen session). Session logic is handled by focused sub-components: `RestTimer`, `SetLogger`, `ExerciseCard`, and `CaloriesBurnedTracker`.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind v4 (`bg-primary-*` maps to CSS vars set by `SettingsContext`), Web Audio API for beep, no new dependencies.

---

## File Map

| Action | File |
|--------|------|
| Create | `features/routines/components/RestTimer.tsx` |
| Create | `features/routines/components/CaloriesBurnedTracker.tsx` |
| Create | `features/routines/components/SetLogger.tsx` |
| Create | `features/routines/components/ExerciseCard.tsx` |
| Create | `features/routines/components/GuidedSessionView.tsx` |
| Create | `features/routines/components/RoutineListView.tsx` |
| Modify | `features/routines/components/ClientRoutinesView.tsx` |

All files live under `olympus-bite-ft/`.

---

## Task 1: RestTimer component

**Files:**
- Create: `features/routines/components/RestTimer.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `RestTimer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add olympus-bite-ft/features/routines/components/RestTimer.tsx
git commit -m "feat(routines): add RestTimer component with SVG ring and auto-beep"
```

---

## Task 2: CaloriesBurnedTracker component

**Files:**
- Create: `features/routines/components/CaloriesBurnedTracker.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, useEffect } from "react";

// Standard MET values by muscle group key (from Exercise.muscleGroup)
const MET: Record<string, number> = {
  chest: 7,
  back: 7,
  shoulders: 6,
  biceps: 5,
  triceps: 5,
  legs: 8,
  glutes: 8,
  abs: 5,
  cardio: 10,
  full_body: 7,
  other: 6,
};

export function calcCalories(
  muscleGroups: string[],
  weightKg: number,
  durationSeconds: number,
): number {
  if (!muscleGroups.length || weightKg <= 0 || durationSeconds <= 0) return 0;
  const avgMet =
    muscleGroups.reduce((sum, g) => sum + (MET[g] ?? 6), 0) / muscleGroups.length;
  return Math.round(avgMet * weightKg * (durationSeconds / 3600));
}

export function CaloriesBurnedTracker({
  muscleGroups,
  weightKg,
  sessionStartTime,
}: {
  muscleGroups: string[];
  weightKg: number;
  sessionStartTime: number;
}) {
  const [kcal, setKcal] = useState(0);

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      setKcal(calcCalories(muscleGroups, weightKg, elapsed));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [muscleGroups, weightKg, sessionStartTime]);

  if (kcal === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-primary-500/10 border-t border-primary-500/20">
      <span className="text-base" aria-hidden>🔥</span>
      <span className="text-sm font-bold text-primary-400">{kcal} kcal</span>
      <span className="text-xs text-slate-400">quemadas (estimado)</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify calc logic manually**

Run in browser console (or node):
```js
// avgMet=7, weight=70kg, 3600s = 1hr → 7*70*1 = 490 kcal
// 10 minutes = 600s → 7*70*(600/3600) ≈ 81.6 → round = 82
console.assert(
  Math.round(7 * 70 * (600 / 3600)) === 82,
  "MET calc wrong"
);
```

- [ ] **Step 3: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add olympus-bite-ft/features/routines/components/CaloriesBurnedTracker.tsx
git commit -m "feat(routines): add CaloriesBurnedTracker with MET-based estimate"
```

---

## Task 3: SetLogger component

**Files:**
- Create: `features/routines/components/SetLogger.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";

export function SetLogger({
  setNumber,
  totalSets,
  previousWeight,
  previousReps,
  disabled,
  onComplete,
}: {
  setNumber: number;
  totalSets: number;
  previousWeight: number | null;
  previousReps: number | null;
  disabled: boolean;
  onComplete: (weight: number | null, reps: number | null) => void;
}) {
  const [weight, setWeight] = useState(previousWeight?.toString() ?? "");
  const [reps, setReps] = useState(previousReps?.toString() ?? "");

  const handleComplete = () => {
    onComplete(
      weight !== "" ? parseFloat(weight) : null,
      reps !== "" ? parseInt(reps, 10) : null,
    );
  };

  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
      <span className="w-12 text-xs font-bold text-slate-400 shrink-0">
        S{setNumber}/{totalSets}
      </span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        disabled={disabled}
        className="w-16 rounded-xl bg-slate-800 border border-slate-600 px-2 py-2 text-center text-sm font-bold text-white focus:border-primary-500 focus:outline-none disabled:opacity-40"
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        disabled={disabled}
        className="w-16 rounded-xl bg-slate-800 border border-slate-600 px-2 py-2 text-center text-sm font-bold text-white focus:border-primary-500 focus:outline-none disabled:opacity-40"
      />
      <button
        type="button"
        onClick={handleComplete}
        disabled={disabled}
        className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 disabled:opacity-40 active:scale-95 transition-transform"
        aria-label="Marcar serie completada"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add olympus-bite-ft/features/routines/components/SetLogger.tsx
git commit -m "feat(routines): add SetLogger component for weight/reps input"
```

---

## Task 4: ExerciseCard component

This component shows one exercise during a session: name, set dots, the active `SetLogger`, and rest state. It is display-only — parent owns all state.

**Files:**
- Create: `features/routines/components/ExerciseCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { cn } from "@/shared/lib/utils";
import { SetLogger } from "./SetLogger";
import { RestTimer } from "./RestTimer";
import type { Exercise } from "../types/routines.types";

export function ExerciseCard({
  exercise,
  activeSetIndex,
  completedSetCount,
  restRemaining,
  isSaving,
  onSetComplete,
  onRestFinish,
  onRestSkip,
}: {
  exercise: Exercise;
  activeSetIndex: number;
  completedSetCount: number;
  restRemaining: number;
  isSaving: boolean;
  onSetComplete: (setIndex: number, weight: number | null, reps: number | null) => void;
  onRestFinish: () => void;
  onRestSkip: () => void;
}) {
  const isResting = restRemaining > 0;
  const allDone = completedSetCount >= exercise.sets;

  return (
    <div className="flex flex-col gap-5 px-4 animate-in fade-in duration-300">
      {/* Exercise header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
          {exercise.name}
        </h2>
        <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest">
          {exercise.sets} series · {exercise.reps} reps
          {exercise.observations ? ` · ${exercise.observations}` : ""}
        </p>
      </div>

      {/* Set dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-full transition-all duration-300",
              i < completedSetCount
                ? "bg-primary-500 scale-110"
                : i === activeSetIndex
                  ? "bg-primary-500/40 ring-2 ring-primary-500"
                  : "bg-slate-700",
            )}
          />
        ))}
        <span className="ml-3 text-xs font-bold text-slate-400 tabular-nums">
          {completedSetCount}/{exercise.sets}
        </span>
      </div>

      {/* Rest timer or SetLogger */}
      {isResting ? (
        <RestTimer
          duration={exercise.restSeconds}
          remaining={restRemaining}
          onFinish={onRestFinish}
          onSkip={onRestSkip}
        />
      ) : allDone ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-bold text-primary-400 uppercase tracking-wider">
            Ejercicio completado
          </p>
        </div>
      ) : (
        <SetLogger
          setNumber={activeSetIndex + 1}
          totalSets={exercise.sets}
          previousWeight={null}
          previousReps={null}
          disabled={isSaving}
          onComplete={(w, r) => onSetComplete(activeSetIndex, w, r)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add olympus-bite-ft/features/routines/components/ExerciseCard.tsx
git commit -m "feat(routines): add ExerciseCard with set dots, SetLogger, RestTimer"
```

---

## Task 5: GuidedSessionView component

Extracts `GuidedRoutineSession` (lines 514–956 of `ClientRoutinesView.tsx`) into its own file, rewired to use the new components and with auto-timer on set save.

**Files:**
- Create: `features/routines/components/GuidedSessionView.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { CaloriesBurnedTracker } from "./CaloriesBurnedTracker";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

export function GuidedSessionView({
  routine,
  day,
  weekNumber,
  logs,
  isSaving,
  userWeightKg,
  onBack,
  onSaveSet,
}: {
  routine: Routine;
  day: RoutineDay;
  weekNumber: number;
  logs: WorkoutLog[];
  isSaving: boolean;
  userWeightKg: number;
  onBack: () => void;
  onSaveSet: (
    exercise: Exercise,
    setNumber: number,
    weight: number | null,
    reps: number | null,
  ) => Promise<void>;
}) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [sessionStart] = useState(() => Date.now());
  const [showSuccess, setShowSuccess] = useState(false);

  const exercises = day.exercises;
  const exercise = exercises[exerciseIndex];

  // Count completed sets for current exercise from logs
  const getCompletedCount = useCallback(
    (exId: string) => {
      const log = logs.find(
        (l) => l.exerciseId === exId && l.weekNumber === weekNumber,
      );
      return log?.setsData?.filter((s) => s.completed).length ?? 0;
    },
    [logs, weekNumber],
  );

  // Total steps for progress bar
  const totalSteps = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSteps = exercises.reduce(
    (sum, ex) => sum + getCompletedCount(ex.id),
    0,
  );
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Muscle groups for calorie estimate
  const muscleGroups = [...new Set(exercises.map((ex) => ex.muscleGroup))];

  // Rest countdown tick
  useEffect(() => {
    if (restRemaining <= 0) return;
    const id = window.setInterval(
      () => setRestRemaining((n) => Math.max(n - 1, 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [restRemaining]);

  const handleSetComplete = async (
    sIdx: number,
    weight: number | null,
    reps: number | null,
  ) => {
    if (!exercise) return;
    const setNumber = sIdx + 1;
    await onSaveSet(exercise, setNumber, weight, reps);

    const nextSetIdx = sIdx + 1;

    if (nextSetIdx < exercise.sets) {
      // More sets in this exercise — start rest timer then advance set
      setRestRemaining(exercise.restSeconds);
      setSetIndex(nextSetIdx);
    } else {
      // Exercise done — advance to next exercise
      const nextExIdx = exerciseIndex + 1;
      if (nextExIdx < exercises.length) {
        setRestRemaining(exercise.restSeconds);
        setExerciseIndex(nextExIdx);
        setSetIndex(0);
      } else {
        // All done
        setShowSuccess(true);
      }
    }
  };

  const handleRestFinish = () => setRestRemaining(0);
  const handleRestSkip = () => setRestRemaining(0);

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-8 text-center animate-in fade-in duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500 shadow-2xl shadow-primary-500/40">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">¡Rutina completada!</h2>
          <p className="mt-2 text-sm text-slate-400">{day.focusArea} · Semana {weekNumber}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-2xl bg-primary-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/30"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  const completedSetCount = getCompletedCount(exercise.id);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/10">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/60 text-slate-300"
          aria-label="Volver"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {day.focusArea} · Sem. {weekNumber}
          </p>
          {/* Progress bar */}
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700/50">
            <div
              className="h-1.5 rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-bold tabular-nums text-primary-400">{progress}%</span>
      </div>

      {/* Exercise tabs — scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {exercises.map((ex, idx) => {
          const done = getCompletedCount(ex.id) >= ex.sets;
          const active = idx === exerciseIndex;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => { setExerciseIndex(idx); setSetIndex(0); setRestRemaining(0); }}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                active
                  ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : done
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400",
              )}
            >
              {done && <span className="mr-1">✓</span>}
              {ex.name}
            </button>
          );
        })}
      </div>

      {/* Main exercise area */}
      <div className="flex-1 py-4">
        <ExerciseCard
          exercise={exercise}
          activeSetIndex={setIndex}
          completedSetCount={completedSetCount}
          restRemaining={restRemaining}
          isSaving={isSaving}
          onSetComplete={handleSetComplete}
          onRestFinish={handleRestFinish}
          onRestSkip={handleRestSkip}
        />
      </div>

      {/* Calories footer */}
      <CaloriesBurnedTracker
        muscleGroups={muscleGroups}
        weightKg={userWeightKg}
        sessionStartTime={sessionStart}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add olympus-bite-ft/features/routines/components/GuidedSessionView.tsx
git commit -m "feat(routines): add GuidedSessionView with auto rest timer and calories"
```

---

## Task 6: RoutineListView component

Extract everything except the session view from `ClientRoutinesView.tsx` into `RoutineListView.tsx`. This includes the routine list, week selector, calendar, day detail, and history tab.

**Files:**
- Create: `features/routines/components/RoutineListView.tsx`

- [ ] **Step 1: Read the existing file sections to extract**

Read `ClientRoutinesView.tsx` lines 1033–2844 to understand all state and rendering. The view renders:
- Routine selector dropdown (lines ~1280–1340)
- Week selector (lines ~1340–1380)
- Tab bar Rutina/Historial (lines ~1385–1410)
- Day cards list (lines ~1410–1600)
- Calendar view (lines ~1600–1750)
- History tab (lines ~1750–2000)
- PR modal (lines ~2000–2200)

- [ ] **Step 2: Create `RoutineListView.tsx`**

Move all rendering from `ClientRoutinesView` `return (...)` block (minus the `session` view branch) into this component. The component signature is:

```tsx
"use client";

// All existing imports from ClientRoutinesView that relate to list/detail/history

export function RoutineListView({
  routines,
  selectedRoutine,
  logs,
  logsLoading,
  currentWeek,
  savingLog,
  onSelectRoutine,
  onActivateRoutine,
  onStartSession,
  onWeekChange,
  onSaveLog,
  onRemoveLog,
  userId,
}: RoutineListViewProps) {
  // Move all local UI state here: calMonth, calYear, calSelectedDate,
  // routineView, showInfo, showWeekDropdown, showRoutineDropdown,
  // weekCompletedToast, activeTab, historySearchQuery,
  // historyRoutineFilter, historyWeekFilter, showPrsModal,
  // personalRecords, filteredHistoryLogs, weekLogs, completedDays,
  // weekProgress, allExercisesComplete, isTodayDay

  // Copy all helper functions: getCalendarDays, isSameDay, MONTH_NAMES,
  // WEEKDAY_LABELS, DAY_NAMES, MUSCLE_LABELS

  // Return all the JSX that currently lives in ClientRoutinesView's
  // return() for views: "list", "detail", "tracking"
}
```

> **Implementation note:** Copy the JSX from `ClientRoutinesView.tsx` lines ~1270 to ~2844 (all `view !== "session"` branches). Lift `onStartSession` as a prop (replaces `setView("session")` + `setSessionDay(day)` calls).

- [ ] **Step 3: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before committing.

- [ ] **Step 4: Commit**

```bash
git add olympus-bite-ft/features/routines/components/RoutineListView.tsx
git commit -m "feat(routines): extract RoutineListView from ClientRoutinesView"
```

---

## Task 7: Slim ClientRoutinesView to shell

Replace the body of `ClientRoutinesView.tsx` with a thin data-fetching shell that routes between `RoutineListView` and `GuidedSessionView`.

**Files:**
- Modify: `features/routines/components/ClientRoutinesView.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { routinesService } from "@/features/routines/services/routines.service";
import { GuidedSessionView } from "./GuidedSessionView";
import { RoutineListView } from "./RoutineListView";
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

export function ClientRoutinesView() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "session">("list");
  const [sessionDay, setSessionDay] = useState<RoutineDay | null>(null);

  const lastRoutineId = useRef<string | null>(null);

  const refreshLogs = useCallback(async (currentRoutinesList: Routine[]) => {
    if (!user) return;
    setLogsLoading(true);
    try {
      const responses = await Promise.all(
        currentRoutinesList.map((r) =>
          routinesService.getWorkoutLogs(r.id, user.id).catch(() => ({ data: [] })),
        ),
      );
      const combined = responses.flatMap((res) => res.data ?? []);
      setLogs(combined);
      return combined;
    } finally {
      setLogsLoading(false);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await routinesService.getByClient(user.id);
      const data = res.data ?? [];
      setRoutines(data);
      const active = data.find((r) => r.isActive) ?? data[0];
      if (active) {
        setSelectedRoutine(active);
        await refreshLogs(data);
      }
    } finally {
      setLoading(false);
    }
  }, [user, refreshLogs]);

  useEffect(() => { loadData(); }, [loadData]);

  // Re-fetch logs when routine changes
  useEffect(() => {
    if (!selectedRoutine || selectedRoutine.id === lastRoutineId.current) return;
    lastRoutineId.current = selectedRoutine.id;
    refreshLogs(routines);
  }, [selectedRoutine, routines, refreshLogs]);

  const handleSaveSet = useCallback(
    async (
      exercise: Exercise,
      setNumber: number,
      weight: number | null,
      reps: number | null,
    ) => {
      if (!user || !selectedRoutine) return;
      const key = `${exercise.id}-${setNumber}`;
      setSavingLog(key);
      try {
        const existingLog = logs.find(
          (l) => l.exerciseId === exercise.id && l.weekNumber === currentWeek,
        );
        const prevSets = existingLog?.setsData ?? [];
        const updatedSets = [
          ...prevSets.filter((s) => s.set !== setNumber),
          { set: setNumber, weight, reps, rest: null, completed: true },
        ].sort((a, b) => a.set - b.set);

        await routinesService.saveWorkoutLog({
          routineId: selectedRoutine.id,
          exerciseId: exercise.id,
          userId: user.id,
          weekNumber: currentWeek,
          weight,
          repsDone: reps?.toString() ?? null,
          observations: null,
          setsData: updatedSets,
          duration: null,
          completedAt: new Date().toISOString(),
        });
        await refreshLogs(routines);
      } finally {
        setSavingLog(null);
      }
    },
    [user, selectedRoutine, logs, currentWeek, routines, refreshLogs],
  );

  const handleRemoveLog = useCallback(
    async (exerciseId: string) => {
      if (!user || !selectedRoutine) return;
      await routinesService.removeWorkoutLog(selectedRoutine.id, exerciseId, user.id, currentWeek);
      await refreshLogs(routines);
    },
    [user, selectedRoutine, currentWeek, routines, refreshLogs],
  );

  const handleActivateRoutine = useCallback(async (routineId: string) => {
    try {
      await routinesService.activate(routineId);
      if (user) {
        const res = await routinesService.getByClient(user.id);
        const data = res.data ?? [];
        setRoutines(data);
        setSelectedRoutine(data.find((r) => r.id === routineId) ?? null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al activar la rutina");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (view === "session" && sessionDay && selectedRoutine) {
    return (
      <GuidedSessionView
        routine={selectedRoutine}
        day={sessionDay}
        weekNumber={currentWeek}
        logs={logs}
        isSaving={savingLog !== null}
        userWeightKg={user?.weight ?? 70}
        onBack={() => setView("list")}
        onSaveSet={handleSaveSet}
      />
    );
  }

  return (
    <>
      <Header title="Rutinas" />
      <RoutineListView
        routines={routines}
        selectedRoutine={selectedRoutine}
        logs={logs}
        logsLoading={logsLoading}
        currentWeek={currentWeek}
        savingLog={savingLog}
        userId={user?.id ?? ""}
        onSelectRoutine={(r) => { setSelectedRoutine(r); }}
        onActivateRoutine={handleActivateRoutine}
        onStartSession={(day) => { setSessionDay(day); setView("session"); }}
        onWeekChange={setCurrentWeek}
        onSaveLog={handleSaveSet}
        onRemoveLog={handleRemoveLog}
      />
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -40
```

Fix all errors. Common ones:
- `RoutineListViewProps` type must match what you defined in `RoutineListView.tsx`
- `routinesService.saveWorkoutLog` signature — check `routines.service.ts` for exact params
- `user?.weight` — exists in `AuthResponse['user']` (line 22 of `auth.types.ts`)

- [ ] **Step 3: Verify in browser**

Start dev server: `cd olympus-bite-ft && npm run dev`

Navigate to `/routines`. Verify:
1. Routine list loads
2. "Iniciar" opens session view
3. Completing a set starts the rest timer automatically
4. Timer ring visually counts down
5. Calories appear after ~1 minute (or check immediately with a short elapsed override)
6. Completing all sets shows success screen

- [ ] **Step 4: Commit**

```bash
git add olympus-bite-ft/features/routines/components/ClientRoutinesView.tsx
git commit -m "refactor(routines): slim ClientRoutinesView to data-fetching shell"
```

---

## Task 8: Wire RoutineListView type interface

After Tasks 6 and 7 both exist, finalize the `RoutineListViewProps` interface to match what `ClientRoutinesView` passes.

**Files:**
- Modify: `features/routines/components/RoutineListView.tsx` (top of file)

- [ ] **Step 1: Add props interface at top of RoutineListView**

```tsx
import type { Exercise, Routine, RoutineDay, WorkoutLog } from "../types/routines.types";

interface RoutineListViewProps {
  routines: Routine[];
  selectedRoutine: Routine | null;
  logs: WorkoutLog[];
  logsLoading: boolean;
  currentWeek: number;
  savingLog: string | null;
  userId: string;
  onSelectRoutine: (routine: Routine) => void;
  onActivateRoutine: (routineId: string) => void;
  onStartSession: (day: RoutineDay) => void;
  onWeekChange: (week: number) => void;
  onSaveLog: (exercise: Exercise, setNumber: number, weight: number | null, reps: number | null) => Promise<void>;
  onRemoveLog: (exerciseId: string) => Promise<void>;
}
```

- [ ] **Step 2: Replace all `setView("session")` / `setSessionDay(day)` calls inside RoutineListView with `onStartSession(day)`**

Search for `setView` inside `RoutineListView.tsx`:
```bash
grep -n "setView\|setSessionDay" olympus-bite-ft/features/routines/components/RoutineListView.tsx
```

Replace each occurrence with `onStartSession(day)` where `day` is the `RoutineDay` being passed.

- [ ] **Step 3: Type-check**

```bash
cd olympus-bite-ft && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Final browser smoke test**

1. Open `/routines`
2. Start a session → session view opens (GuidedSessionView)
3. Log a set → rest timer auto-starts with ring animation
4. Skip rest → next set form appears
5. Complete all sets in an exercise → moves to next exercise
6. Complete all exercises → success screen appears
7. Back button → returns to list

- [ ] **Step 5: Commit**

```bash
git add olympus-bite-ft/features/routines/components/RoutineListView.tsx
git commit -m "feat(routines): complete routine execution redesign with auto timer and calories"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Split 2844-line file → Tasks 6+7+8
- ✅ Fullscreen session layout → GuidedSessionView (Task 5)
- ✅ Auto rest timer → `handleSetComplete` sets `restRemaining` automatically (Task 5)
- ✅ SVG ring countdown → RestTimer (Task 1)
- ✅ Vibrate + beep on finish → `beep()` + `navigator.vibrate` in RestTimer (Task 1)
- ✅ Calories burned estimate → CaloriesBurnedTracker with MET table (Task 2)
- ✅ `user.weight` used for calories → `user?.weight ?? 70` fallback (Task 7)
- ✅ All colors via `bg-primary-*` Tailwind classes → respond to SettingsContext theme presets
- ✅ No new dependencies

**Type consistency:**
- `onSaveSet(exercise, setNumber, weight, reps)` used in GuidedSessionView ✅ matches `handleSaveSet` in ClientRoutinesView ✅
- `RestTimer` props `{ duration, remaining, onFinish, onSkip }` ✅ called correctly from ExerciseCard ✅
- `CaloriesBurnedTracker` props `{ muscleGroups, weightKg, sessionStartTime }` ✅ all provided in GuidedSessionView ✅
