"use client";

import type { Routine, RoutineDay } from "../types/routines.types";
import { ChevronRight, Dumbbell, Calendar } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface RoutineCardProps {
  routine: Routine;
  onClick?: () => void;
}

function DayPreview({ day }: { day: RoutineDay }) {
  if (day.isRestDay) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.02] px-3.5 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-black text-cyan-300">
          D{day.dayNumber}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-400">Descanso y Recuperación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3.5 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 border border-primary-500/30 text-xs font-black text-primary-300">
        D{day.dayNumber}
      </span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <p className="text-xs font-black text-white truncate">
          {day.focusArea || "Entrenamiento"}
        </p>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
          {day.exercises.length} ej.
        </span>
      </div>
    </div>
  );
}

export function RoutineCard({ routine, onClick }: RoutineCardProps) {
  const trainingDays = routine.days.filter((d) => !d.isRestDay);

  return (
    <div
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-[#0c0e17] p-5 shadow-xl hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-primary-400 transition-colors truncate">
              {routine.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-primary-400" />
                {trainingDays.length} días de entreno
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {routine.weekCount} semanas
              </span>
            </div>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 border",
              routine.isActive
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-white/5 text-slate-400 border-white/10",
            )}
          >
            {routine.isActive ? "● Activa" : "Inactiva"}
          </span>
        </div>

        {routine.description && (
          <p className="mb-4 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {routine.description}
          </p>
        )}

        {/* Days previews */}
        <div className="space-y-1.5 pt-1">
          {routine.days.slice(0, 4).map((day) => (
            <DayPreview key={day.id} day={day} />
          ))}
          {routine.days.length > 4 && (
            <p className="pt-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              +{routine.days.length - 4} días más...
            </p>
          )}
        </div>
      </div>

      {/* Footer action */}
      <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs font-black uppercase tracking-wider text-primary-400 group-hover:text-primary-300">
        <span>Gestionar Rutina</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
