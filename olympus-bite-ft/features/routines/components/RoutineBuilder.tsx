'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { MUSCLE_GROUPS } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import type { User } from '@/shared/types/common.types';
import type { Routine } from '@/features/routines/types/routines.types';

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
}

const emptyExercise = (): ExerciseForm => ({
  name: '',
  muscleGroup: 'chest',
  sets: 3,
  reps: '10-12',
  restSeconds: 60,
  observations: '',
});

const emptyDay = (dayNumber: number): DayForm => ({
  dayNumber,
  focusArea: '',
  isRestDay: false,
  restDayNote: '',
  exercises: [emptyExercise()],
});

/* ─── Component ───────────────────────────────── */

export function RoutineBuilder({ clients, onSubmit, onCancel, initialData }: RoutineBuilderProps) {
  const isEditing = !!initialData;

  const buildInitialForm = (): RoutineForm => {
    if (!initialData) {
      return { name: '', description: '', clientId: '', weekCount: 4, days: [emptyDay(1)] };
    }
    return {
      name: initialData.name,
      description: initialData.description ?? '',
      clientId: initialData.clientId,
      weekCount: initialData.weekCount,
      days: initialData.days
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((d) => ({
          dayNumber: d.dayNumber,
          focusArea: d.focusArea ?? '',
          isRestDay: d.isRestDay,
          restDayNote: d.restDayNote ?? '',
          exercises: d.exercises.length > 0
            ? d.exercises
                .sort((a, b) => a.order - b.order)
                .map((e) => ({
                  name: e.name,
                  muscleGroup: e.muscleGroup,
                  sets: e.sets,
                  reps: e.reps,
                  restSeconds: e.restSeconds,
                  observations: e.observations ?? '',
                }))
            : [emptyExercise()],
        })),
    };
  };

  const [form, setForm] = useState<RoutineForm>(buildInitialForm);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'info' | 'days'>(isEditing ? 'days' : 'info');
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  /* ─── Helpers ─────────────────────────────── */

  const updateField = <K extends keyof RoutineForm>(key: K, value: RoutineForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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
      days: f.days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 })),
    }));

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<ExerciseForm>) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx
          ? { ...d, exercises: d.exercises.map((e, ei) => (ei === exIdx ? { ...e, ...patch } : e)) }
          : d,
      ),
    }));

  const addExercise = (dayIdx: number) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d,
      ),
    }));

  const removeExercise = (dayIdx: number, exIdx: number) =>
    setForm((f) => ({
      ...f,
      days: f.days.map((d, di) =>
        di === dayIdx ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) } : d,
      ),
    }));

  const canProceed =
    form.name.trim().length > 0 && form.clientId.length > 0;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  /* ─── STEP 1: Información base ─────────── */

  if (step === 'info') {
    return (
      <div className="space-y-6">
        <Card>
          <CardTitle>{isEditing ? 'Editar rutina' : 'Nueva rutina'}</CardTitle>
          <div className="mt-4 space-y-4">
            <Input
              label="Nombre de la rutina"
              placeholder="Ej: Programa de Fuerza — 5 Días"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Descripción de la rutina (opcional)"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cliente
              </label>
              <select
                value={form.clientId}
                onChange={(e) => updateField('clientId', e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.email}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  No hay clientes registrados. Genera un código de invitación primero.
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
                    onClick={() => updateField('weekCount', w)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                      form.weekCount === w
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400',
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
          <Button disabled={!canProceed} onClick={() => setStep('days')}>
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
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              activeDayIdx === i
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : d.isRestDay
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
            )}
          >
            Día {d.dayNumber}
            {d.isRestDay && ' 😴'}
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
                  onChange={(e) => updateDay(activeDayIdx, { isRestDay: e.target.checked })}
                  className="rounded"
                />
                <span className="text-neutral-600 dark:text-neutral-400">Día de descanso</span>
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
              onChange={(e) => updateDay(activeDayIdx, { restDayNote: e.target.value })}
            />
          ) : (
            <div className="space-y-4">
              <Input
                label="Enfoque del día"
                placeholder="Ej: Pecho y Tríceps, Piernas – Cuádriceps"
                value={day.focusArea}
                onChange={(e) => updateDay(activeDayIdx, { focusArea: e.target.value })}
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
                        onChange={(e) =>
                          updateExercise(activeDayIdx, exIdx, { name: e.target.value })
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Grupo muscular
                        </label>
                        <select
                          value={ex.muscleGroup}
                          onChange={(e) =>
                            updateExercise(activeDayIdx, exIdx, { muscleGroup: e.target.value })
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                        >
                          {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                            <option key={key} value={key}>
                              {val.icon} {val.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Series"
                        type="number"
                        min={1}
                        value={String(ex.sets)}
                        onChange={(e) =>
                          updateExercise(activeDayIdx, exIdx, { sets: Number(e.target.value) || 1 })
                        }
                      />
                      <Input
                        label="Reps"
                        placeholder="8-12"
                        value={ex.reps}
                        onChange={(e) =>
                          updateExercise(activeDayIdx, exIdx, { reps: e.target.value })
                        }
                      />
                      <Input
                        label="Descanso (s)"
                        type="number"
                        min={0}
                        step={15}
                        value={String(ex.restSeconds)}
                        onChange={(e) =>
                          updateExercise(activeDayIdx, exIdx, {
                            restSeconds: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <Input
                      label="Observaciones"
                      placeholder="Técnica, notas, variaciones..."
                      value={ex.observations}
                      onChange={(e) =>
                        updateExercise(activeDayIdx, exIdx, { observations: e.target.value })
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
        <Button variant="ghost" onClick={() => setStep('info')}>
          ← Volver
        </Button>
        <Button loading={saving} onClick={handleSubmit}>
          💾 {isEditing ? 'Actualizar rutina' : 'Guardar rutina'}
        </Button>
      </div>
    </div>
  );
}
