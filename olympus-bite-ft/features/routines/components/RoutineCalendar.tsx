'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { RoutineDayDetail } from './RoutineDayDetail';
import type { Routine, RoutineDay } from '../types/routines.types';

interface RoutineCalendarProps {
  routines: Routine[];
  /** Map clientId → client name */
  clientNames: Record<string, string>;
  /** The logged-in trainer's userId */
  trainerId?: string;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface DayInfo {
  routine: Routine;
  day: RoutineDay;
}

/**
 * Maps routineDays (1-7 = Mon-Sun cycle) onto real calendar dates.
 * We project the routine's weekly cycle onto every week on the calendar.
 */
function getDayInfoForDate(date: Date, routines: Routine[]): DayInfo[] {
  // 0=Sun, 1=Mon... → convert to 1=Mon...7=Sun
  const jsDay = date.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1-7 Mon-Sun

  const infos: DayInfo[] = [];
  for (const routine of routines) {
    if (!routine.isActive) continue;
    const rd = routine.days.find((d) => d.dayNumber === dayOfWeek);
    if (rd) {
      infos.push({ routine, day: rd });
    }
  }
  return infos;
}

function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Monday-based: 0=Mon, 6=Sun
  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastOfMonth.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  // Pad end to fill last row
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function RoutineCalendar({ routines, clientNames, trainerId }: RoutineCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterClient, setFilterClient] = useState<string>('all'); // 'all' | 'me' | clientId

  // Build unique client options from routines
  const clientOptions = useMemo(() => {
    const ids = new Set<string>();
    routines.forEach((r) => {
      if (r.clientId && r.clientId !== trainerId) ids.add(r.clientId);
    });
    return Array.from(ids);
  }, [routines, trainerId]);

  // Has trainer's own routines?
  const hasOwnRoutines = useMemo(
    () => routines.some((r) => r.clientId === trainerId),
    [routines, trainerId],
  );

  // Filtered routines based on selection
  const filteredRoutines = useMemo(() => {
    if (filterClient === 'all') return routines;
    if (filterClient === 'me') return routines.filter((r) => r.clientId === trainerId);
    return routines.filter((r) => r.clientId === filterClient);
  }, [routines, filterClient, trainerId]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const selectedDayInfos = useMemo(() => {
    if (!selectedDate) return [];
    return getDayInfoForDate(selectedDate, filteredRoutines);
  }, [selectedDate, filteredRoutines]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToday}
              className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Client filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterClient('all')}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
              filterClient === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
            )}
          >
            Todos
          </button>
          {trainerId && hasOwnRoutines && (
            <button
              type="button"
              onClick={() => setFilterClient('me')}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
                filterClient === 'me'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
              )}
            >
              🏋️ Yo
            </button>
          )}
          {clientOptions.map((cid) => (
            <button
              key={cid}
              type="button"
              onClick={() => setFilterClient(cid)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
                filterClient === cid
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
              )}
            >
              {clientNames[cid] ?? 'Cliente'}
            </button>
          ))}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium uppercase tracking-wider text-neutral-400"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="p-1" />;
            }

            const infos = getDayInfoForDate(date, filteredRoutines);
            const hasTraining = infos.some((i) => !i.day.isRestDay);
            const hasRest = infos.some((i) => i.day.isRestDay);
            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth();
            const isTodayDate = isToday(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-xl text-sm transition-all',
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                    : isTodayDate
                      ? 'ring-2 ring-neutral-900 dark:ring-white font-semibold text-neutral-900 dark:text-white'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800',
                )}
              >
                {date.getDate()}
                {/* Dots */}
                {(hasTraining || hasRest) && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {hasTraining && (
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isSelected
                            ? 'bg-emerald-400'
                            : 'bg-emerald-500 dark:bg-emerald-400',
                        )}
                      />
                    )}
                    {hasRest && !hasTraining && (
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isSelected
                            ? 'bg-amber-400'
                            : 'bg-amber-400 dark:bg-amber-500',
                        )}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Entrenamiento
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Descanso
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            {selectedDayInfos.length === 0 && (
              <span className="text-sm text-neutral-400">— Sin actividad programada</span>
            )}
          </div>

          {selectedDayInfos.length > 0 ? (
            selectedDayInfos.map(({ routine, day }) => (
              <div key={`${routine.id}-${day.id}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {routine.name}
                  </span>
                  <span className="text-xs text-neutral-300 dark:text-neutral-600">·</span>
                  <span className="text-xs text-neutral-400">
                    {clientNames[routine.clientId] ?? 'Cliente'}
                  </span>
                </div>
                <RoutineDayDetail day={day} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center dark:border-neutral-700">
              <span className="text-3xl">🏖️</span>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                No hay rutinas programadas para este día
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
