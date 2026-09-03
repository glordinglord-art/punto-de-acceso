"use client";

import { useState, useMemo } from "react";
import { cn, formatRest } from "@/shared/lib/utils";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import type { Routine, RoutineDay } from "../types/routines.types";
import { ChevronLeft, ChevronRight, Dumbbell, Calendar, Lock } from "lucide-react";

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

function getDayInfoForDate(date: Date, routines: Routine[]): DayInfo[] {
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

  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastOfMonth.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [filterClient, setFilterClient] = useState<string>("all");

  // Unique client IDs
  const clientOptions = useMemo(() => {
    const ids = new Set<string>();
    routines.forEach((r) => {
      if (r.clientId && r.clientId !== trainerId) ids.add(r.clientId);
    });
    return Array.from(ids);
  }, [routines, trainerId]);

  const hasOwnRoutines = useMemo(
    () => routines.some((r) => r.clientId === trainerId),
    [routines, trainerId],
  );

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
    <div className="space-y-5">
      {/* Calendar Main Card */}
      <div className="rounded-3xl border border-white/12 bg-[#0c0e17] p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        {/* Month Header & Nav */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider hover:bg-primary-500/30 transition-all cursor-pointer"
            >
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-xl p-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-xl p-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Client filter pills */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterClient("all")}
            className={cn(
              "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
              filterClient === "all"
                ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
            )}
          >
            Todos
          </button>
          {trainerId && hasOwnRoutines && (
            <button
              type="button"
              onClick={() => setFilterClient("me")}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
                filterClient === "me"
                  ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
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
                "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all border cursor-pointer",
                filterClient === cid
                  ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              👤 {clientNames[cid] ?? "Cliente"}
            </button>
          ))}
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-black uppercase tracking-widest text-slate-400"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
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
                  "relative mx-auto flex h-11 w-11 sm:h-13 sm:w-13 flex-col items-center justify-center rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer",
                  isSelected
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-2 ring-white/20 scale-105"
                    : isTodayDate
                      ? "border-2 border-red-500/80 bg-red-500/10 text-white shadow-sm"
                      : hasTraining
                        ? "bg-red-500/15 text-white border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/60"
                        : hasRest
                          ? "bg-white/[0.04] text-slate-300 border border-white/8 hover:bg-white/10"
                          : "text-slate-400 hover:bg-white/10 hover:text-white border border-transparent",
                )}
              >
                <span className="leading-none">{date.getDate()}</span>
                {/* Indicator dot */}
                {!isSelected && (hasTraining || hasRest) && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      hasTraining ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-slate-500",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 border-t border-white/8 pt-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="h-3 w-3 rounded-full bg-red-600 shadow-sm" />
            Entrenamiento
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="h-3 w-3 rounded-full bg-white/10 border border-white/20" />
            Descanso
          </div>
        </div>
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-2">
            <h3 className="text-base font-black text-white capitalize flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </h3>
            {selectedDayInfos.length > 0 && (
              <span className="text-xs font-bold text-slate-400">
                {selectedDayInfos.length} rutina{selectedDayInfos.length !== 1 ? "s" : ""} programada{selectedDayInfos.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {selectedDayInfos.length > 0 ? (
            selectedDayInfos.map(({ routine, day }) => (
              <div
                key={`${routine.id}-${day.id}`}
                className="p-5 rounded-3xl bg-[#0c0e17] border border-white/10 shadow-2xl space-y-3"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3">
                  <div>
                    <span className="text-xs font-bold text-primary-400 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>{routine.name}</span>
                    </span>
                    <h4 className="text-base font-black text-white mt-0.5">
                      {day.isRestDay ? "🧘 Día de Descanso" : day.focusArea}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-white/10 text-slate-300 border border-white/10 text-xs font-bold">
                      👤 {clientNames[routine.clientId] ?? "Cliente"}
                    </span>
                    {!day.isRestDay && (
                      <span className="px-2.5 py-1 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-black uppercase">
                        {day.exercises.length} ej.
                      </span>
                    )}
                  </div>
                </div>

                {/* Day content */}
                {day.isRestDay ? (
                  <p className="text-xs text-slate-400 italic">
                    {day.restDayNote || "Día de recuperación activa y descanso muscular."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {day.exercises.map((ex, idx) => {
                      const muscleInfo = MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS];
                      return (
                        <div
                          key={ex.id || idx}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/6"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xl shrink-0">{muscleInfo?.icon || "🏋️"}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-white truncate">{ex.name}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                                <span className="text-slate-300 font-bold">{ex.sets} × {ex.reps}</span>
                                <span>·</span>
                                <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                  <Lock className="w-3 h-3" />
                                  {ex.targetWeight && ex.targetWeight > 0 ? `${ex.targetWeight} kg` : "Corporal"}
                                </span>
                                <span>·</span>
                                <span>⏱️ {formatRest(ex.restSeconds)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Intensity badge */}
                          <div className="shrink-0">
                            {ex.intensity === "failure" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                                🔴 Fallo
                              </span>
                            )}
                            {ex.intensity === "relax" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                🟢 Relax
                              </span>
                            )}
                            {(!ex.intensity || ex.intensity === "medium") && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                🟡 Media
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0c0e17] p-8 text-center">
              <span className="text-4xl">🏖️</span>
              <p className="mt-2 text-sm font-bold text-white">
                Sin rutinas programadas para este día
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona otro día en el calendario para ver los entrenamientos asignados.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
