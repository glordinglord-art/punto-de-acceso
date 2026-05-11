"use client";

import { useState, useEffect } from "react";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/types/common.types";
import type { Routine } from "@/features/routines/types/routines.types";

/* ─── Types ───────────────────────────────────── */

export interface ExerciseForm {
  name: string;
  muscleGroup: string;
  sets: number | string;
  reps: string;
  restSeconds: number | string;
  observations: string;
}

export interface DayForm {
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string;
  exercises: ExerciseForm[];
}

export interface RoutineForm {
  name: string;
  description: string;
  clientId: string;
  weekCount: number;
  days: DayForm[];
}

interface RoutineBuilderProps {
  clients: User[];
  onSubmit: (data: RoutineForm) => Promise<void>;
  onCancel: () => void;
  /** Pass an existing routine to pre-fill the form (edit mode) */
  initialData?: Routine;
  /** Trainer's user id — adds "Para mí" option in client select */
  trainerId?: string;
}

const emptyExercise = (): ExerciseForm => ({
  name: "",
  muscleGroup: "chest",
  sets: 3,
  reps: "10-12",
  restSeconds: 60,
  observations: "",
});

const emptyDay = (dayNumber: number): DayForm => ({
  dayNumber,
  focusArea: "",
  isRestDay: false,
  restDayNote: "",
  exercises: [emptyExercise()],
});

/* ─── Component ───────────────────────────────── */

export function RoutineBuilder({
  clients,
  onSubmit,
  onCancel,
  initialData,
  trainerId,
}: RoutineBuilderProps) {
  const isEditing = !!initialData;

  const buildInitialForm = (): RoutineForm => {
    if (!initialData) {
      return {
        name: "",
        description: "",
        clientId: "",
        weekCount: 4,
        days: [emptyDay(1)],
      };
    }
    return {
      name: initialData.name,
      description: initialData.description ?? "",
      clientId: initialData.clientId,
      weekCount: initialData.weekCount,
      days: initialData.days
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((d) => ({
          dayNumber: d.dayNumber,
          focusArea: d.focusArea ?? "",
          isRestDay: d.isRestDay,
          restDayNote: d.restDayNote ?? "",
          exercises:
            d.exercises.length > 0
              ? d.exercises
                  .sort((a, b) => a.order - b.order)
                  .map((e) => ({
                    name: e.name,
                    muscleGroup: e.muscleGroup,
                    sets: e.sets,
                    reps: e.reps,
                    restSeconds: e.restSeconds,
                    observations: e.observations ?? "",
                  }))
              : [emptyExercise()],
        })),
    };
  };

  const [form, setForm] = useState<RoutineForm>(buildInitialForm);
  const [dictionary, setDictionary] = useState<ExerciseDict[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"info" | "days">(
    isEditing ? "days" : "info",
  );
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    exerciseDictionaryService.getAll().then(setDictionary).catch(console.error);
  }, []);

  /* ─── Helpers ─────────────────────────────── */

  const updateField = <K extends keyof RoutineForm>(
    key: K,
    value: RoutineForm[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const updateDay = (idx: number, patch: Partial<DayForm>) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    }));

  const addDay = () =>
    setForm((f) => ({
      ...f,
      days: [...f.days, emptyDay(f.days.length + 1)],
    }));

  const removeDay = (idx: number) =>
    setForm((f) => ({
      ...f,
      days: f.days
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, dayNumber: i + 1 })),
    }));

  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    patch: Partial<ExerciseForm>,
  ) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx
          ? {
              ...d,
              exercises: d.exercises.map((e, ei) =>
                ei === exIdx ? { ...e, ...patch } : e,
              ),
            }
          : d,
      ),
    }));

  const addExercise = (dayIdx: number) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx
          ? { ...d, exercises: [...d.exercises, emptyExercise()] }
          : d,
      ),
    }));

  const removeExercise = (dayIdx: number, exIdx: number) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx
          ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
          : d,
      ),
    }));

  const canProceed = form.name.trim().length > 0 && form.clientId.length > 0;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Clean up any empty strings from sets or restSeconds
      const cleanedForm = {
        ...form,
        days: form.days.map((d) => ({
          ...d,
          exercises: d.exercises.map((e) => ({
            ...e,
            sets:
              typeof e.sets === "string" && e.sets === "" ? 1 : Number(e.sets),
            restSeconds:
              typeof e.restSeconds === "string" && e.restSeconds === ""
                ? 0
                : Number(e.restSeconds),
          })),
        })),
      };
      await onSubmit(cleanedForm);
    } finally {
      setSaving(false);
    }
  };

  /* ─── STEP 1: Información base ─────────── */

  if (step === "info") {
    return (
      <div className="space-y-6">
        <Card>
          <CardTitle className="uppercase tracking-wider text-xl mb-4">{isEditing ? "Editar rutina" : "Nueva rutina"}</CardTitle>
          <div className="mt-4 space-y-4">
            <Input
              label="Nombre de la rutina"
              placeholder="Ej: Programa de Fuerza — 5 Días"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Descripción de la rutina (opcional)"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                Cliente
              </label>
              <select
                value={form.clientId}
                onChange={(e) => updateField("clientId", e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-[#1a1c23] px-4 py-3 text-sm text-white transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none"
              >
                <option value="">Selecciona un cliente</option>
                {trainerId && (
                  <option value={trainerId}>📌 Para mí (mi rutina)</option>
                )}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.email}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-500 mt-2 font-medium">
                  No hay clientes registrados. Genera un código de invitación primero.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                Semanas de duración
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[4, 6, 8, 12].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateField("weekCount", w)}
                    className={cn(
                      "rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all border",
                      form.weekCount === w
                        ? "bg-primary-500 text-slate-950 border-primary-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {w} sem
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button disabled={!canProceed} onClick={() => setStep("days")}>
            Siguiente: Configurar días →
          </Button>
        </div>
      </div>
    );
  }

  /* ─── STEP 2: Días y ejercicios ─────────── */

  const day = form.days[activeDayIdx];

  return (
    <div className="space-y-6">
      {/* Day pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {form.days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveDayIdx(i)}
            className={cn(
              "shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all border",
              activeDayIdx === i
                ? "bg-primary-500 text-slate-950 border-primary-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                : d.isRestDay
                  ? "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white",
            )}
          >
            Día {d.dayNumber}
            {d.isRestDay && " 😴"}
          </button>
        ))}
        <button
          type="button"
          onClick={addDay}
          className="shrink-0 rounded-xl border border-dashed border-white/20 bg-transparent px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-400 hover:border-white/40 hover:text-white transition-all"
        >
          + Día
        </button>
      </div>

      {/* Active day config */}
      {day && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <CardTitle className="uppercase tracking-wider text-xl">Día {day.dayNumber}</CardTitle>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={day.isRestDay}
                  onChange={(e) =>
                    updateDay(activeDayIdx, { isRestDay: e.target.checked })
                  }
                  className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/30 w-5 h-5 cursor-pointer"
                />
                <span className="font-semibold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                  Día de descanso
                </span>
              </label>
              {form.days.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    removeDay(activeDayIdx);
                    setActiveDayIdx(Math.max(0, activeDayIdx - 1));
                  }}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>

          {day.isRestDay ? (
            <Input
              label="Nota de descanso"
              placeholder="Ej: Recuperación activa, caminata o estiramientos"
              value={day.restDayNote}
              onChange={(e) =>
                updateDay(activeDayIdx, { restDayNote: e.target.value })
              }
            />
          ) : (
            <div className="space-y-6">
              <Input
                label="Enfoque del día"
                placeholder="Ej: Pecho y Tríceps, Piernas – Cuádriceps"
                value={day.focusArea}
                onChange={(e) =>
                  updateDay(activeDayIdx, { focusArea: e.target.value })
                }
              />

              {/* Exercises */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Ejercicios ({day.exercises.length})
                  </h4>
                </div>

                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-sm px-3 py-1 bg-white/10 text-white">#{exIdx + 1}</Badge>
                      {day.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(activeDayIdx, exIdx)}
                          className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Nombre"
                        placeholder="Ej: Press banca plano"
                        value={ex.name}
                        list="exercise-dictionary"
                        onChange={(e) => {
                          const newName = e.target.value;
                          const match = dictionary.find(
                            (d) => d.name === newName,
                          );
                          updateExercise(activeDayIdx, exIdx, {
                            name: newName,
                            ...(match
                              ? { muscleGroup: match.muscleGroup }
                              : {}),
                          });
                        }}
                      />
                      <div className="space-y-1.5 flex flex-col justify-end">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                          Grupo muscular
                        </label>
                        {dictionary.some(
                          (d) => d.name.toLowerCase() === ex.name.toLowerCase(),
                        ) ? (
                          <div
                            className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-400 cursor-not-allowed flex items-center justify-between"
                            title="El grupo muscular se asigna automáticamente al seleccionar un ejercicio del diccionario."
                          >
                            <span className="flex items-center gap-2 font-semibold tracking-wide">
                              <span className="text-lg">{MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS]?.icon}</span>
                              {MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS]?.label || "No definido"}
                            </span>
                            <svg
                              className="h-4 w-4 opacity-50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        ) : (
                          <select
                            value={ex.muscleGroup}
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, {
                                muscleGroup: e.target.value,
                              })
                            }
                            title="Selecciona el grupo muscular ya que este ejercicio no está en el diccionario."
                            className="w-full rounded-2xl border border-white/12 bg-[#1a1c23] px-4 py-3 text-sm text-white transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none font-semibold tracking-wide"
                          >
                            {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                              <option key={key} value={key}>
                                {val.icon} {val.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Series"
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateExercise(activeDayIdx, exIdx, {
                            sets: val === "" ? "" : Number(val),
                          });
                        }}
                        onBlur={() => {
                          if (ex.sets === "") {
                            updateExercise(activeDayIdx, exIdx, { sets: 1 });
                          }
                        }}
                      />
                      <Input
                        label="Reps"
                        placeholder="8-12"
                        value={ex.reps}
                        onChange={(e) =>
                          updateExercise(activeDayIdx, exIdx, {
                            reps: e.target.value,
                          })
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                          Descanso
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            className="w-16 rounded-2xl border border-white/12 bg-white/6 px-3 py-3 text-center text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                            value={
                              ex.restSeconds === ""
                                ? ""
                                : Math.floor(Number(ex.restSeconds) / 60) || ""
                            }
                            onChange={(e) => {
                              const mins =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value, 10);
                              const currentSecs =
                                ex.restSeconds === ""
                                  ? 0
                                  : Number(ex.restSeconds) % 60;
                              updateExercise(activeDayIdx, exIdx, {
                                restSeconds: mins * 60 + currentSecs,
                              });
                            }}
                          />
                          <span className="text-sm font-bold uppercase tracking-wider text-slate-500 shrink-0">
                            min
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            className="w-16 rounded-2xl border border-white/12 bg-white/6 px-3 py-3 text-center text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                            value={
                              ex.restSeconds === ""
                                ? ""
                                : Number(ex.restSeconds) % 60 || ""
                            }
                            onChange={(e) => {
                              const secs =
                                e.target.value === ""
                                  ? 0
                                  : Math.min(
                                      59,
                                      parseInt(e.target.value, 10),
                                    );
                              const currentMins =
                                ex.restSeconds === ""
                                  ? 0
                                  : Math.floor(Number(ex.restSeconds) / 60);
                              updateExercise(activeDayIdx, exIdx, {
                                restSeconds: currentMins * 60 + secs,
                              });
                            }}
                            onBlur={() => {
                              if (ex.restSeconds === "") {
                                updateExercise(activeDayIdx, exIdx, {
                                  restSeconds: 0,
                                });
                              }
                            }}
                          />
                          <span className="text-sm font-bold uppercase tracking-wider text-slate-500 shrink-0">
                            seg
                          </span>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Observaciones"
                      placeholder="Técnica, notas, variaciones..."
                      value={ex.observations}
                      onChange={(e) =>
                        updateExercise(activeDayIdx, exIdx, {
                          observations: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addExercise(activeDayIdx)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-4 text-sm font-bold uppercase tracking-wider text-slate-400 hover:border-white/40 hover:text-white hover:bg-white/5 transition-all mt-4"
                >
                  + Agregar ejercicio
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4 border-t border-white/10">
        <Button variant="secondary" onClick={() => setStep("info")}>
          ← Volver
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          {isEditing ? "Actualizar rutina" : "Guardar rutina"}
        </Button>
      </div>

      <datalist id="exercise-dictionary">
        {dictionary.map((d) => (
          <option key={d.id} value={d.name} />
        ))}
      </datalist>
    </div>
  );
}
