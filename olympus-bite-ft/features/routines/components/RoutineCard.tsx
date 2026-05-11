'use client';

import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import type { Routine, RoutineDay } from '../types/routines.types';

interface RoutineCardProps {
  routine: Routine;
  onClick?: () => void;
}

function DayPreview({ day }: { day: RoutineDay }) {
  if (day.isRestDay) {
    return (
      <div className="flex items-center gap-3 rounded-[16px] border border-white/4 bg-white/5 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20 text-sm font-bold text-primary-300">
          {day.dayNumber}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-400">Descanso</p>
          {day.restDayNote && (
            <p className="text-xs text-slate-500">{day.restDayNote}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-white/4 bg-white/5 px-4 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
        {day.dayNumber}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">
          {day.focusArea}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
          {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

export function RoutineCard({ routine, onClick }: RoutineCardProps) {
  const trainingDays = routine.days.filter((d) => !d.isRestDay);
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">
            {routine.name}
          </h3>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {trainingDays.length} días · {routine.weekCount} semana{routine.weekCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant={routine.isActive ? 'success' : 'default'}>
          {routine.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>

      {routine.description && (
        <p className="mb-4 line-clamp-2 text-sm text-slate-400">
          {routine.description}
        </p>
      )}

      <div className="space-y-2">
        {routine.days.slice(0, 5).map((day) => (
          <DayPreview key={day.id} day={day} />
        ))}
        {routine.days.length > 5 && (
          <p className="pt-1 text-center text-xs text-slate-500">
            +{routine.days.length - 5} día{routine.days.length - 5 !== 1 ? 's' : ''} más
          </p>
        )}
      </div>
    </Card>
  );
}
