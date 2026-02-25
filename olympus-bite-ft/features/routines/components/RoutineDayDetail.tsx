'use client';

import { MUSCLE_GROUPS } from '@/shared/lib/constants';
import type { Exercise, RoutineDay } from '../types/routines.types';

interface RoutineDayDetailProps {
  day: RoutineDay;
}

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const muscleInfo = MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];

  return (
    <tr className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
      <td className="py-3 pr-3 text-xs text-neutral-400 tabular-nums">{index + 1}</td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{muscleInfo?.icon ?? '💪'}</span>
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {exercise.name}
          </span>
        </div>
      </td>
      <td className="py-3 pr-3">
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {muscleInfo?.label ?? exercise.muscleGroup}
        </span>
      </td>
      <td className="py-3 pr-3 text-center text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
        {exercise.sets}
      </td>
      <td className="py-3 pr-3 text-center text-sm text-neutral-700 dark:text-neutral-300">
        {exercise.reps}
      </td>
      <td className="py-3 pr-3 text-center text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
        {exercise.restSeconds}s
      </td>
      <td className="py-3 text-sm text-neutral-500 dark:text-neutral-400 max-w-50 truncate">
        {exercise.observations ?? '—'}
      </td>
    </tr>
  );
}

export function RoutineDayDetail({ day }: RoutineDayDetailProps) {
  if (day.isRestDay) {
    return (
      <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-6 dark:border-primary-900/30 dark:bg-primary-900/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
            {day.dayNumber}
          </span>
          <div>
            <h3 className="font-semibold text-primary-800 dark:text-primary-300">
              Día de Descanso
            </h3>
            {day.restDayNote && (
              <p className="text-sm text-primary-600 dark:text-primary-400/70 mt-0.5">
                {day.restDayNote}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-lg font-bold text-white dark:bg-white dark:text-neutral-900">
          {day.dayNumber}
        </span>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {day.focusArea}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-150 text-left px-2">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400">#</th>
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Ejercicio</th>
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Músculo</th>
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400 text-center">Series</th>
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400 text-center">Reps</th>
              <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wider text-neutral-400 text-center">Descanso</th>
              <th className="pb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.map((exercise, idx) => (
              <ExerciseRow key={exercise.id} exercise={exercise} index={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
