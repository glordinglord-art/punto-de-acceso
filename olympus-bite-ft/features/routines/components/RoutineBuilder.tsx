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

interface ExerciseForm {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  observations: string;
}

interface DayForm {
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string;
  exercises: ExerciseForm[];
}

interface RoutineForm {
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
          <CardTitle>{isEditing ? "Editar rutina" : "Nueva rutina"}</CardTitle>
          <div className="mt-4 space-y-4">
            <Input
              label="Nombre de la rutina"
              placeholder="Ej: Programa de Fuerza — 5 Días"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Descripción de la rutina (opcional)"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cliente
              </label>
              <select
                value={form.clientId}
                onChange={(e) => updateField("clientId", e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
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
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  No hay clientes registrados. Genera un código de invitación
                  primero.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Semanas de duración
              </label>
              <div className="flex items-center gap-3">
                {[4, 6, 8, 12].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateField("weekCount", w)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                      form.weekCount === w
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400",
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
          <Button variant="ghost" onClick={onCancel}>
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
    <div className="space-y-4">
      {/* Day pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {form.days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveDayIdx(i)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              activeDayIdx === i
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : d.isRestDay
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
            )}
          >
            Día {d.dayNumber}
            {d.isRestDay && " 😴"}
          </button>
        ))}
        <button
          type="button"
          onClick={addDay}
          className="shrink-0 rounded-full border-2 border-dashed border-neutral-300 px-4 py-1.5 text-sm text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 dark:border-neutral-600 dark:hover:border-neutral-500"
        >
          + Día
        </button>
      </div>

      {/* Active day config */}
      {day && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Día {day.dayNumber}</CardTitle>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={day.isRestDay}
                  onChange={(e) =>
                    updateDay(activeDayIdx, { isRestDay: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-neutral-600 dark:text-neutral-400">
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
            <div className="space-y-4">
              <Input
                label="Enfoque del día"
                placeholder="Ej: Pecho y Tríceps, Piernas – Cuádriceps"
                value={day.focusArea}
                onChange={(e) =>
                  updateDay(activeDayIdx, { focusArea: e.target.value })
                }
              />

              {/* Exercises */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Ejercicios ({day.exercises.length})
                  </h4>
                </div>

                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-xl border border-neutral-100 p-4 space-y-3 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="default">#{exIdx + 1}</Badge>
                      {day.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(activeDayIdx, exIdx)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Grupo muscular
                        </label>
                        {dictionary.some(
                          (d) => d.name.toLowerCase() === ex.name.toLowerCase(),
                        ) ? (
                          <div
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 flex items-center justify-between"
                            title="El grupo muscular se asigna automáticamente al seleccionar un ejercicio del diccionario."
                          >
                            <span>
                              {
                                MUSCLE_GROUPS[
                                  ex.muscleGroup as keyof typeof MUSCLE_GROUPS
                                ]?.icon
                              }{" "}
                              {MUSCLE_GROUPS[
                                ex.muscleGroup as keyof typeof MUSCLE_GROUPS
                              ]?.label || "No definido"}
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
                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
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

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Series"
                        type="number"
                        min={1}
                        value={ex.sets as any}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateExercise(activeDayIdx, exIdx, {
                            sets: val === "" ? ("" as any) : Number(val),
                          });
                        }}
                        onBlur={() => {
                          if (ex.sets === ("" as any)) {
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
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Descanso
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            value={
                              ex.restSeconds === ("" as any)
                                ? ""
                                : Math.floor(Number(ex.restSeconds) / 60) || ""
                            }
                            onChange={(e) => {
                              const mins =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value, 10);
                              const currentSecs =
                                ex.restSeconds === ("" as any)
                                  ? 0
                                  : Number(ex.restSeconds) % 60;
                              updateExercise(activeDayIdx, exIdx, {
                                restSeconds: mins * 60 + currentSecs,
                              });
                            }}
                          />
                          <span className="text-sm text-neutral-400 shrink-0">
                            min
                          </span>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            value={
                              ex.restSeconds === ("" as any)
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
                                ex.restSeconds === ("" as any)
                                  ? 0
                                  : Math.floor(Number(ex.restSeconds) / 60);
                              updateExercise(activeDayIdx, exIdx, {
                                restSeconds: currentMins * 60 + secs,
                              });
                            }}
                            onBlur={() => {
                              if (ex.restSeconds === ("" as any)) {
                                updateExercise(activeDayIdx, exIdx, {
                                  restSeconds: 0,
                                });
                              }
                            }}
                          />
                          <span className="text-sm text-neutral-400 shrink-0">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors dark:border-neutral-700 dark:hover:border-neutral-500"
                >
                  + Agregar ejercicio
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep("info")}>
          ← Volver
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          💾 {isEditing ? "Actualizar rutina" : "Guardar rutina"}
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
