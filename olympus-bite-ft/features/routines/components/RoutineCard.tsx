'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { MUSCLE_GROUPS } from '@/shared/lib/constants';
import type { Routine, RoutineDay } from '../types/routines.types';

interface RoutineCardProps {
  routine: Routine;
  onClick?: () => void;
}

function DayPreview({ day }: { day: RoutineDay }) {
  if (day.isRestDay) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
          {day.dayNumber}
        </span>
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Descanso
          </p>
          {day.restDayNote && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">{day.restDayNote}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
        {day.dayNumber}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {day.focusArea}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

export function RoutineCard({ routine, onClick }: RoutineCardProps) {
  const trainingDays = routine.days.filter((d) => !d.isRestDay);
  const restDays = routine.days.filter((d) => d.isRestDay);

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {routine.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {trainingDays.length} días · {routine.weekCount} semana{routine.weekCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant={routine.isActive ? 'success' : 'default'}>
          {routine.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>

      {routine.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2">
          {routine.description}
        </p>
      )}

      <div className="space-y-2">
        {routine.days.slice(0, 5).map((day) => (
          <DayPreview key={day.id} day={day} />
        ))}
        {routine.days.length > 5 && (
          <p className="text-xs text-neutral-400 text-center pt-1">
            +{routine.days.length - 5} día{routine.days.length - 5 !== 1 ? 's' : ''} más
          </p>
        )}
      </div>
    </Card>
  );
}
