'use client';

import { useState } from 'react';
import type { Exercise, RoutineDay, WorkoutLog } from '../types/routines.types';

interface WeeklyTrackerProps {
  days: RoutineDay[];
  weekCount: number;
  logs: WorkoutLog[];
  onLogSave?: (exerciseId: string, weekNumber: number, weight: number | null, repsDone: string | null) => void;
}

function getLogForExercise(
  logs: WorkoutLog[],
  exerciseId: string,
  weekNumber: number,
): WorkoutLog | undefined {
  return logs.find((l) => l.exerciseId === exerciseId && l.weekNumber === weekNumber);
}

interface CellProps {
  log: WorkoutLog | undefined;
  exerciseId: string;
  weekNumber: number;
  onSave?: (exerciseId: string, weekNumber: number, weight: number | null, repsDone: string | null) => void;
}

function TrackingCell({ log, exerciseId, weekNumber, onSave }: CellProps) {
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(log?.weight?.toString() ?? '');
  const [reps, setReps] = useState(log?.repsDone ?? '');

  const handleSave = () => {
    onSave?.(
      exerciseId,
      weekNumber,
      weight ? parseFloat(weight) : null,
      reps || null,
    );
    setEditing(false);
  };

  if (editing) {
    return (
      <td className="p-1">
        <div className="flex flex-col gap-1">
          <input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-center dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            aria-label={`Peso semana ${weekNumber}`}
          />
          <input
            type="text"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-center dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            aria-label={`Reps semana ${weekNumber}`}
          />
          <button
            onClick={handleSave}
            className="rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            aria-label="Guardar registro"
          >
            ✓
          </button>
        </div>
      </td>
    );
  }

  return (
    <td
      className="p-1 cursor-pointer group"
      onClick={() => setEditing(true)}
    >
      <div className="flex flex-col items-center rounded-lg px-2 py-1.5 transition-colors group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800">
        {log ? (
          <>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {log.weight ? `${log.weight}kg` : '—'}
            </span>
            <span className="text-[10px] text-neutral-400">
              {log.repsDone ?? '—'}
            </span>
          </>
        ) : (
          <span className="text-[10px] text-neutral-300 dark:text-neutral-600">—</span>
        )}
      </div>
    </td>
  );
}

export function WeeklyTracker({ days, weekCount, logs, onLogSave }: WeeklyTrackerProps) {
  const [selectedDay, setSelectedDay] = useState(
    days.find((d) => !d.isRestDay)?.dayNumber ?? 1,
  );

  const currentDay = days.find((d) => d.dayNumber === selectedDay);
  const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

  if (!currentDay || currentDay.isRestDay) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Seguimiento Semanal
      </h3>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {days
          .filter((d) => !d.isRestDay)
          .map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedDay === day.dayNumber
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
              aria-label={`Día ${day.dayNumber}: ${day.focusArea}`}
            >
              D{day.dayNumber}
            </button>
          ))}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
        {currentDay.focusArea}
      </p>

      {/* Tracking Grid */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-125 text-left px-2">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="pb-2 pr-2 text-xs font-medium uppercase tracking-wider text-neutral-400 min-w-35">
                Ejercicio
              </th>
              <th className="pb-2 pr-2 text-xs font-medium uppercase tracking-wider text-neutral-400 text-center">
                Reps
              </th>
              {weeks.map((w) => (
                <th
                  key={w}
                  className="pb-2 text-xs font-medium uppercase tracking-wider text-neutral-400 text-center min-w-17.5"
                >
                  S{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentDay.exercises.map((exercise) => (
              <tr
                key={exercise.id}
                className="border-b border-neutral-50 last:border-0 dark:border-neutral-800/50"
              >
                <td className="py-2 pr-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {exercise.name}
                  </span>
                </td>
                <td className="py-2 pr-2 text-center">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {exercise.sets}×{exercise.reps}
                  </span>
                </td>
                {weeks.map((w) => (
                  <TrackingCell
                    key={w}
                    log={getLogForExercise(logs, exercise.id, w)}
                    exerciseId={exercise.id}
                    weekNumber={w}
                    onSave={onLogSave}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
