"use client";

import { useState, useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { RoutineDayDetail } from "./RoutineDayDetail";
import type { Routine, RoutineDay } from "../types/routines.types";

interface RoutineCalendarProps {
  routines: Routine[];
  /** Map clientId → client name */
  clientNames: Record<string, string>;
  /** The logged-in trainer's userId */
  trainerId?: string;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
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

export function RoutineCalendar({
  routines,
  clientNames,
  trainerId,
}: RoutineCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterClient, setFilterClient] = useState<string>("all"); // 'all' | 'me' | clientId

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
    if (filterClient === "all") return routines;
    if (filterClient === "me")
      return routines.filter((r) => r.clientId === trainerId);
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
      <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToday}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Client filter */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterClient("all")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all border border-white/8",
              filterClient === "all"
                ? "bg-white/10 text-white"
                : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            Todos
          </button>
          {trainerId && hasOwnRoutines && (
            <button
              type="button"
              onClick={() => setFilterClient("me")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all border border-white/8",
                filterClient === "me"
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
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
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all border border-white/8",
                filterClient === cid
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
              )}
            >
              {clientNames[cid] ?? "Cliente"}
            </button>
          ))}
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500"
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
                  "relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all mb-2",
                  isSelected
                    ? hasTraining
                      ? "bg-primary-500 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                      : hasRest
                        ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                        : "bg-white text-slate-950"
                    : isTodayDate
                      ? hasTraining
                        ? "bg-primary-500/20 text-primary-300 border border-primary-500/50"
                        : "bg-white/10 text-white border border-white/20"
                      : hasTraining
                        ? "bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/20"
                        : hasRest
                          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                          : "text-slate-400 hover:bg-white/5",
                )}
              >
                <span className="leading-none">{date.getDate()}</span>
                {!isSelected && (hasTraining || hasRest) && (
                  <span className="absolute -bottom-0.5 mt-0.5 text-[6px] leading-none opacity-60">
                    {hasTraining ? "💪" : "😴"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 border-t border-white/8 pt-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            <span className="h-3 w-3 rounded-[4px] border border-primary-500/30 bg-primary-500/15" />
            Entrenamiento
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            <span className="h-3 w-3 rounded-[4px] border border-amber-500/30 bg-amber-500/15" />
            Descanso
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white capitalize">
              {selectedDate.toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            {selectedDayInfos.length === 0 && (
              <span className="text-sm text-slate-500">
                — Sin actividad
              </span>
            )}
          </div>

          {selectedDayInfos.length > 0 ? (
            selectedDayInfos.map(({ routine, day }) => (
              <div key={`${routine.id}-${day.id}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {routine.name}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {clientNames[routine.clientId] ?? "Cliente"}
                  </span>
                </div>
                <RoutineDayDetail day={day} />
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-8 text-center">
              <span className="text-3xl">🏖️</span>
              <p className="mt-2 text-sm text-slate-400">
                No hay rutinas programadas para este día
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
