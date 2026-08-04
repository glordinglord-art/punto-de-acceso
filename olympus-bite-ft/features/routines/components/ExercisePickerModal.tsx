"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import type { ExerciseDict } from "../services/exercise-dictionary.service";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { Search, Eye, Dumbbell, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ExercisePickerModalProps {
  isOpen: boolean;
  dictionary: ExerciseDict[];
  onClose: () => void;
  onSelect: (exercise: ExerciseDict) => void;
}

export function ExercisePickerModal({
  isOpen,
  dictionary,
  onClose,
  onSelect,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [previewExercise, setPreviewExercise] = useState<ExerciseDict | null>(
    null,
  );

  const filtered = dictionary.filter((ex) => {
    const matchSearch = search
      ? ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.target?.toLowerCase().includes(search.toLowerCase()) ||
        ex.instructionsEs?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchMuscle = selectedMuscle
      ? ex.muscleGroup === selectedMuscle
      : true;
    return matchSearch && matchMuscle;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catálogo de 1,324 Ejercicios">
      <div className="space-y-4 -mt-2">
        {/* Search Bar */}
        <Input
          placeholder="Buscar por nombre, técnica o músculo (ej: press, sentadilla, bíceps)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
          autoFocus
        />

        {/* Muscle Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedMuscle("")}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
              !selectedMuscle
                ? "bg-primary-500 border-primary-500 text-slate-950 shadow-md shadow-primary-500/20"
                : "bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white",
            )}
          >
            Todos ({dictionary.length})
          </button>
          {(
            Object.entries(MUSCLE_GROUPS) as [
              string,
              { icon: string; label: string },
            ][]
          ).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setSelectedMuscle(selectedMuscle === key ? "" : key)
              }
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                selectedMuscle === key
                  ? "bg-primary-500 border-primary-500 text-slate-950 shadow-md shadow-primary-500/20"
                  : "bg-white/5 border-white/8 text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {val.icon} {val.label}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold uppercase tracking-wider">
                No se encontraron ejercicios
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Prueba buscando otro término o quitando los filtros
              </p>
            </div>
          ) : (
            filtered.slice(0, 50).map((ex) => {
              const mg =
                MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS];
              return (
                <div
                  key={ex.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 transition-all group"
                >
                  {/* Thumbnail / GIF indicator */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {ex.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ex.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5 text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white uppercase tracking-wide truncate">
                        {ex.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-primary-400 uppercase tracking-wider">
                          {mg?.icon} {mg?.label || ex.muscleGroup}
                        </span>
                        {ex.equipment && (
                          <span className="text-[10px] text-slate-400 capitalize bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {ex.equipment}
                          </span>
                        )}
                        {ex.gifUrl && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            GIF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Preview & Select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewExercise(ex)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Ver GIF e instrucciones"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(ex);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Usar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Preview Modal */}
        <ExerciseInfoModal
          exercise={previewExercise}
          isOpen={!!previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      </div>
    </Modal>
  );
}
