"use client";

import { useState, useEffect, useMemo } from "react";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { formatRest } from "@/shared/lib/utils";
import type { Exercise, RoutineDay } from "../types/routines.types";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { findPreciseDictEntry } from "../utils/exercise-matching";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { Eye, Dumbbell, Lock } from "lucide-react";

interface RoutineDayDetailProps {
  day: RoutineDay;
}

function ExerciseRow({
  exercise,
  index,
  dictEntry,
  onPreview,
}: {
  exercise: Exercise;
  index: number;
  dictEntry?: ExerciseDict | null;
  onPreview: (exercise: ExerciseDict) => void;
}) {
  const muscleInfo =
    MUSCLE_GROUPS[exercise.muscleGroup as keyof typeof MUSCLE_GROUPS];
  const thumbUrl = dictEntry?.imageUrl || dictEntry?.gifUrl || undefined;

  return (
    <tr className="border-b border-white/6 last:border-0 transition-colors hover:bg-white/[0.02]">
      <td className="py-3.5 pr-3 text-xs text-slate-400 tabular-nums text-center font-bold">
        {index + 1}
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3">
          {thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbUrl}
              alt=""
              className="h-10 w-10 rounded-xl object-contain bg-black/50 border border-white/10 shrink-0 hidden sm:block p-0.5"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/8 items-center justify-center shrink-0 hidden sm:flex">
              <Dumbbell className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{muscleInfo?.icon ?? "💪"}</span>
            <span className="text-sm font-black tracking-wide text-white truncate">
              {exercise.name}
            </span>
            {dictEntry && (
              <button
                type="button"
                onClick={() => onPreview(dictEntry)}
                className="p-1 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all cursor-pointer shrink-0"
                title="Ver GIF y técnica"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-3">
        <span className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300 border border-white/8">
          {muscleInfo?.label ?? exercise.muscleGroup}
        </span>
      </td>
      <td className="py-3.5 pr-3 text-center text-xs font-black tabular-nums text-white">
        {exercise.sets} × {exercise.reps}
      </td>
      <td className="py-3.5 pr-3 text-center text-xs font-bold text-amber-400 tabular-nums">
        <span className="inline-flex items-center gap-1">
          <Lock className="w-3 h-3 text-amber-400" />
          {exercise.targetWeight && exercise.targetWeight > 0
            ? `${exercise.targetWeight} kg`
            : "Corporal"}
        </span>
      </td>
      <td className="py-3.5 pr-3 text-center">
        {exercise.intensity === "failure" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40 shadow-xs">
            🔴 Fallo
          </span>
        )}
        {exercise.intensity === "relax" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            🟢 Relax
          </span>
        )}
        {(!exercise.intensity || exercise.intensity === "medium") && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            🟡 Media
          </span>
        )}
      </td>
      <td className="py-3.5 pr-3 text-center text-xs tabular-nums text-slate-400 font-bold">
        {formatRest(exercise.restSeconds)}
      </td>
      <td className="py-3.5 text-xs text-slate-400 max-w-44 truncate italic">
        {exercise.observations || "—"}
      </td>
    </tr>
  );
}

export function RoutineDayDetail({ day }: RoutineDayDetailProps) {
  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDict | null>(
    null,
  );

  useEffect(() => {
    exerciseDictionaryService.getAll().then(setDictionary).catch(console.error);
  }, []);

  const dictByName = useMemo(() => {
    const map = new Map<string, ExerciseDict>();
    dictionary.forEach((d) => map.set(d.name.toLowerCase(), d));
    return map;
  }, [dictionary]);

  if (day.isRestDay) {
    return (
      <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-xl font-black text-cyan-300 border border-cyan-500/30 shadow-md">
            D{day.dayNumber}
          </span>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-cyan-400">
              Día de Descanso y Recuperación
            </h3>
            {day.restDayNote && (
              <p className="text-xs text-slate-300 mt-1">
                {day.restDayNote}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0e17] p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/20 text-base font-black text-primary-300 border border-primary-500/30">
            D{day.dayNumber}
          </span>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white">
              {day.focusArea || "Entrenamiento"}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {day.exercises.length} ejercicio{day.exercises.length !== 1 ? "s" : ""} asignado{day.exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[720px] text-left px-2">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">#</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ejercicio</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Músculo</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Series × Reps</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Peso Fijo</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Intensidad</th>
              <th className="pb-3 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Descanso</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Instrucciones</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.map((exercise, idx) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                index={idx}
                dictEntry={findPreciseDictEntry(exercise.name, dictByName, dictionary)}
                onPreview={setPreviewExercise}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ExerciseInfoModal
        exercise={previewExercise}
        isOpen={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
      />
    </div>
  );
}
