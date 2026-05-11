'use client';

import { MUSCLE_GROUPS } from '@/shared/lib/constants';
import { formatRest } from '@/shared/lib/utils';
import type { Exercise, RoutineDay } from '../types/routines.types';
import { Card } from '@/shared/components/ui/Card';

interface RoutineDayDetailProps {
  day: RoutineDay;
}

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const muscleInfo = MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <td className="py-4 pr-3 text-xs text-slate-400 tabular-nums text-center">{index + 1}</td>
      <td className="py-4 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{muscleInfo?.icon ?? '💪'}</span>
          <span className="text-sm font-semibold tracking-wide text-white">
            {exercise.name}
          </span>
        </div>
      </td>
      <td className="py-4 pr-3">
        <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/5">
          {muscleInfo?.label ?? exercise.muscleGroup}
        </span>
      </td>
      <td className="py-4 pr-3 text-center text-sm font-semibold tabular-nums text-primary-400">
        {exercise.sets}
      </td>
      <td className="py-4 pr-3 text-center text-sm font-semibold text-primary-400">
        {exercise.reps}
      </td>
      <td className="py-4 pr-3 text-center text-sm tabular-nums text-slate-400">
        {formatRest(exercise.restSeconds)}
      </td>
      <td className="py-4 text-sm text-slate-400 max-w-50 truncate">
        {exercise.observations ?? '—'}
      </td>
    </tr>
  );
}

export function RoutineDayDetail({ day }: RoutineDayDetailProps) {
  if (day.isRestDay) {
    return (
      <Card className="border-primary-500/30 bg-primary-900/10 p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-xl font-bold text-primary-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            {day.dayNumber}
          </span>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-primary-400">
              Día de Descanso
            </h3>
            {day.restDayNote && (
              <p className="text-sm text-slate-400 mt-1">
                {day.restDayNote}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl font-bold text-white shadow-inner">
          {day.dayNumber}
        </span>
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">
            {day.focusArea}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-0.5 uppercase tracking-widest">
            {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[700px] text-left px-2">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">#</th>
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500">Ejercicio</th>
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500">Músculo</th>
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Series</th>
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Reps</th>
              <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Descanso</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.map((exercise, idx) => (
              <ExerciseRow key={exercise.id} exercise={exercise} index={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
