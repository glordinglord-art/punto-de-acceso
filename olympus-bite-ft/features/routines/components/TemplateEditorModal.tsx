"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import type { RoutinePreset } from "../data/preset-routines";
import type { DayForm, ExerciseForm } from "./RoutineBuilder";
import { Plus, Trash2, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<RoutinePreset, "id">, existingId?: string) => void;
  initialTemplate?: RoutinePreset | null;
}

const emptyExercise = (): ExerciseForm => ({
  name: "",
  muscleGroup: "chest",
  sets: 3,
  reps: "10-12",
  restSeconds: 60,
  observations: "",
  targetWeight: "",
  intensity: "medium",
});

const emptyDay = (dayNumber: number): DayForm => ({
  dayNumber,
  focusArea: "",
  isRestDay: false,
  restDayNote: "",
  exercises: [emptyExercise()],
});

export function TemplateEditorModal({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
}: TemplateEditorModalProps) {
  const isEditing = !!initialTemplate;

  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [description, setDescription] = useState(initialTemplate?.description ?? "");
  const [category, setCategory] = useState<RoutinePreset["category"]>(initialTemplate?.category ?? "hipertrofia");
  const [difficulty, setDifficulty] = useState<RoutinePreset["difficulty"]>(initialTemplate?.difficulty ?? "Intermedio");
  const [weekCount, setWeekCount] = useState<number>(initialTemplate?.weekCount ?? 4);
  const [days, setDays] = useState<DayForm[]>(() => initialTemplate?.days ?? [emptyDay(1)]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);
  const [pickerTarget, setPickerTarget] = useState<{ dayIdx: number; exIdx: number } | null>(null);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDict | null>(null);

  useEffect(() => {
    exerciseDictionaryService.getAll().then(setDictionary).catch(console.error);
  }, []);

  const addDay = () => {
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
    setActiveDayIdx(days.length);
  };

  const removeDay = (idx: number) => {
    if (days.length <= 1) return;
    setDays((prev) =>
      prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 })),
    );
    setActiveDayIdx(Math.max(0, activeDayIdx - 1));
  };

  const updateDay = (idx: number, patch: Partial<DayForm>) => {
    setDays((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  };

  const addExercise = (dayIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d,
      ),
    );
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              exercises: d.exercises.filter((_, ei) => ei !== exIdx),
            }
          : d,
      ),
    );
  };

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<ExerciseForm>) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              exercises: d.exercises.map((e, ei) => (ei === exIdx ? { ...e, ...patch } : e)),
            }
          : d,
      ),
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para la plantilla");
      return;
    }

    const trainingDaysCount = days.filter((d) => !d.isRestDay).length;

    const payload: Omit<RoutinePreset, "id"> = {
      name: name.trim(),
      description: description.trim(),
      category,
      difficulty,
      weekCount,
      daysPerWeek: trainingDaysCount || 1,
      tags: [category, difficulty, `${trainingDaysCount} Días`],
      days: days.map((d) => ({
        ...d,
        exercises: d.exercises.map((e) => ({
          ...e,
          name: e.name.trim() || "Ejercicio sin nombre",
          targetWeight:
            typeof e.targetWeight === "string" && e.targetWeight === ""
              ? null
              : Number(e.targetWeight),
        })),
      })),
    };

    onSave(payload, initialTemplate?.id);
    onClose();
  };

  const currentDay = days[activeDayIdx] || days[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Plantilla: ${name}` : "Crear Nueva Plantilla Personalizada"}
    >
      <div className="space-y-5 -mt-2 max-h-[80vh] overflow-y-auto pr-1">
        {/* Basic Info */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/8">
          <Input
            label="Nombre de la Plantilla"
            placeholder="Ej: Push Pull Legs Especial Hipertrofia"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Descripción del Objetivo
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Diseñada para maximizar volumen muscular en 4 semanas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoutinePreset["category"])}
                className="w-full rounded-xl border border-white/10 bg-[#121420] px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="heavy-duty">⚡ Heavy Duty (HIT)</option>
                <option value="hipertrofia">🔥 Hipertrofia</option>
                <option value="fuerza">💥 Fuerza</option>
                <option value="definicion">⚡ Definición</option>
                <option value="gluteos">🍑 Glúteos & Pierna</option>
                <option value="principiante">🌱 Principiante</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as RoutinePreset["difficulty"])}
                className="w-full rounded-xl border border-white/10 bg-[#121420] px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Semanas
              </label>
              <select
                value={weekCount}
                onChange={(e) => setWeekCount(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#121420] px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value={4}>4 Semanas</option>
                <option value={6}>6 Semanas</option>
                <option value={8}>8 Semanas</option>
                <option value={12}>12 Semanas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Days Navigation Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Estructura Semanal ({days.length} días)
            </h4>
            <button
              type="button"
              onClick={addDay}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>Agregar Día</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDayIdx(i)}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer",
                  activeDayIdx === i
                    ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                    : d.isRestDay
                      ? "bg-white/5 border-white/8 text-slate-400"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
                )}
              >
                Día {d.dayNumber} {d.isRestDay && "(Descanso)"}
              </button>
            ))}
          </div>
        </div>

        {/* Active Day Editor */}
        {currentDay && (
          <div className="p-4 rounded-2xl bg-[#0c0e17] border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-black">
                  Día {currentDay.dayNumber}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentDay.isRestDay}
                    onChange={(e) => updateDay(activeDayIdx, { isRestDay: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-red-600 focus:ring-red-500/30 w-4 h-4 cursor-pointer"
                  />
                  <span>Día de descanso</span>
                </label>
              </div>

              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(activeDayIdx)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Eliminar Día
                </button>
              )}
            </div>

            {currentDay.isRestDay ? (
              <Input
                label="Nota de descanso"
                placeholder="Ej: Recuperación activa, hidratación y caminata..."
                value={currentDay.restDayNote}
                onChange={(e) => updateDay(activeDayIdx, { restDayNote: e.target.value })}
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label="Enfoque del Día"
                  placeholder="Ej: Empuje A (Pecho, Hombro, Tríceps)"
                  value={currentDay.focusArea}
                  onChange={(e) => updateDay(activeDayIdx, { focusArea: e.target.value })}
                />

                {/* Exercises list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ejercicios ({currentDay.exercises.length})
                    </h5>
                    <button
                      type="button"
                      onClick={() => addExercise(activeDayIdx)}
                      className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Ejercicio</span>
                    </button>
                  </div>

                  {currentDay.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3 rounded-xl bg-black/40 border border-white/8 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          #{exIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ dayIdx: activeDayIdx, exIdx })}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-primary-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <Search className="w-3 h-3" />
                            <span>Catálogo 1,318 GIFs</span>
                          </button>
                          {currentDay.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(activeDayIdx, exIdx)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Nombre del ejercicio..."
                          value={ex.name}
                          onChange={(e) =>
                            updateExercise(activeDayIdx, exIdx, { name: e.target.value })
                          }
                        />
                        <select
                          value={ex.muscleGroup}
                          onChange={(e) =>
                            updateExercise(activeDayIdx, exIdx, { muscleGroup: e.target.value })
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#121420] px-3 py-2 text-xs text-white"
                        >
                          {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                            <option key={key} value={key}>
                              {val.icon} {val.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Parameters */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Series
                          </label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, { sets: Number(e.target.value) })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121420] px-2.5 py-1.5 text-xs text-white text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Reps
                          </label>
                          <input
                            type="text"
                            value={ex.reps}
                            placeholder="10-12"
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, { reps: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121420] px-2.5 py-1.5 text-xs text-white text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Peso Base (kg)
                          </label>
                          <input
                            type="text"
                            value={ex.targetWeight ?? ""}
                            placeholder="Vacío = Corporal"
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, { targetWeight: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121420] px-2.5 py-1.5 text-xs text-white text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Semáforo
                          </label>
                          <select
                            value={ex.intensity ?? "medium"}
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, {
                                intensity: e.target.value as ExerciseForm["intensity"],
                              })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121420] px-2 py-1.5 text-xs text-white text-center"
                          >
                            <option value="relax">🟢 Relax</option>
                            <option value="medium">🟡 Media</option>
                            <option value="failure">🔴 Al Fallo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-500">
            {isEditing ? "Guardar Cambios" : "Crear Plantilla Personalizada"}
          </Button>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {pickerTarget && (
        <ExercisePickerModal
          isOpen={!!pickerTarget}
          dictionary={dictionary}
          onClose={() => setPickerTarget(null)}
          onSelect={(selectedEx) => {
            updateExercise(pickerTarget.dayIdx, pickerTarget.exIdx, {
              name: selectedEx.name,
              muscleGroup: selectedEx.muscleGroup,
            });
          }}
        />
      )}

      {/* Exercise Preview Modal */}
      <ExerciseInfoModal
        exercise={previewExercise}
        isOpen={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
      />
    </Modal>
  );
}
