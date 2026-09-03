"use client";

import { useState, useEffect, useRef } from "react";
import {
  exerciseDictionaryService,
  type ExerciseDict,
} from "../services/exercise-dictionary.service";
import { findPreciseDictEntry } from "../utils/exercise-matching";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/types/common.types";
import type { Routine } from "@/features/routines/types/routines.types";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { RoutineTemplateModal } from "./RoutineTemplateModal";
import type { RoutinePreset } from "../data/preset-routines";
import { Dumbbell, Eye, Search, Sparkles, Bookmark } from "lucide-react";

/* ─── Types ───────────────────────────────────── */

export interface ExerciseForm {
  name: string;
  muscleGroup: string;
  sets: number | string;
  reps: string;
  restSeconds: number | string;
  observations: string;
  targetWeight?: number | string | null;
  intensity?: "relax" | "medium" | "failure";
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
  /** Pass a preset routine to pre-fill the form */
  initialPreset?: RoutinePreset | null;
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

/* ─── Autocomplete Dropdown ──────────────────── */

function ExerciseAutocomplete({
  value,
  dictionary,
  onChange,
  onOpenPicker,
}: {
  value: string;
  dictionary: ExerciseDict[];
  onChange: (name: string, match: ExerciseDict | null) => void;
  onOpenPicker: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const filtered = inputVal.length >= 2
    ? dictionary
        .filter((d) =>
          d.name.toLowerCase().includes(inputVal.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
          Nombre del ejercicio
        </label>
        <button
          type="button"
          onClick={onOpenPicker}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300 uppercase tracking-wider transition-colors"
        >
          <Search className="w-3.5 h-3.5" /> Catálogo (1,324 GIFs)
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Ej: Press de banca plano..."
          value={inputVal}
          onChange={(e) => {
            const v = e.target.value;
            setInputVal(v);
            setIsOpen(v.length >= 2);
            const match = dictionary.find(
              (d) => d.name.toLowerCase() === v.toLowerCase(),
            );
            onChange(v, match ?? null);
          }}
          onFocus={() => {
            if (inputVal.length >= 2) setIsOpen(true);
          }}
          className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[320px] overflow-y-auto rounded-2xl border border-white/15 bg-[#1a1c23]/98 backdrop-blur-xl shadow-2xl shadow-black/50">
          {filtered.map((ex) => {
            const mg =
              MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS];
            return (
              <button
                key={ex.id}
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/8 transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                onClick={() => {
                  setInputVal(ex.name);
                  setIsOpen(false);
                  onChange(ex.name, ex);
                }}
              >
                {ex.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ex.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover bg-black/30 border border-white/5 shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-slate-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-tight">
                    {ex.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-400">
                      {mg?.icon} {mg?.label || ex.muscleGroup}
                    </span>
                    {ex.equipment && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {ex.equipment}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {ex.gifUrl && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    GIF
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */

export function RoutineBuilder({
  clients,
  onSubmit,
  onCancel,
  initialData,
  initialPreset,
  trainerId,
}: RoutineBuilderProps) {
  const isEditing = !!initialData;

  const buildInitialForm = (): RoutineForm => {
    if (initialPreset && !initialData) {
      return {
        name: initialPreset.name,
        description: initialPreset.description,
        clientId: "",
        weekCount: initialPreset.weekCount,
        days: initialPreset.days,
      };
    }
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
                    targetWeight: e.targetWeight ?? "",
                    intensity: (e.intensity as ExerciseForm["intensity"]) || "medium",
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
  const [previewExercise, setPreviewExercise] = useState<ExerciseDict | null>(
    null,
  );
  const [pickerTarget, setPickerTarget] = useState<{
    dayIdx: number;
    exIdx: number;
  } | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSelectPreset = (preset: RoutinePreset) => {
    setForm((prev) => ({
      ...prev,
      name: prev.name ? prev.name : preset.name,
      description: prev.description ? prev.description : preset.description,
      weekCount: preset.weekCount,
      days: preset.days,
    }));
    setActiveDayIdx(0);
    if (form.clientId) {
      setStep("days");
    }
  };

  const handleSaveAsCustomPreset = () => {
    if (!form.name || form.days.length === 0) {
      alert("Por favor asigna un nombre a la rutina antes de guardarla como plantilla.");
      return;
    }
    try {
      const stored = localStorage.getItem("ob_custom_routine_presets");
      const list: RoutinePreset[] = stored ? JSON.parse(stored) : [];
      const newPreset: RoutinePreset = {
        id: `custom-${Date.now()}`,
        name: form.name,
        category: "hipertrofia",
        difficulty: "Intermedio",
        description: form.description || `Plantilla personalizada creada por coach`,
        weekCount: form.weekCount,
        daysPerWeek: form.days.filter((d) => !d.isRestDay).length,
        tags: ["Personalizada", "Coach"],
        days: form.days,
      };
      localStorage.setItem("ob_custom_routine_presets", JSON.stringify([...list, newPreset]));
      alert(`¡"${form.name}" se guardó con éxito como Plantilla Predeterminada! Ahora podrás seleccionarla para cualquier cliente.`);
    } catch {
      alert("Error guardando plantilla");
    }
  };

  useEffect(() => {
    exerciseDictionaryService.getAll().then(setDictionary).catch(console.error);
  }, []);

  const dictByName = new Map<string, ExerciseDict>();
  dictionary.forEach((d) => dictByName.set(d.name.toLowerCase(), d));

  const findDictEntry = (name: string): ExerciseDict | null => {
    return findPreciseDictEntry(name, dictByName, dictionary);
  };

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
            targetWeight:
              typeof e.targetWeight === "string" && e.targetWeight === ""
                ? null
                : Number(e.targetWeight),
            intensity: e.intensity || "medium",
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
        {/* Preset Routine Banner for Coaches */}
        {!isEditing && (
          <div className="p-4 sm:p-5 rounded-3xl bg-red-600/10 border border-red-500/30 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-red-600/30">
                ⚡
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  ¿Quieres ahorrar tiempo? Usa una Rutina Predeterminada
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Plantillas de élite (PPL 6 Días, Torso/Pierna 4 Días, Full Body) con ejercicios, GIFs, series y descansos listos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Ver Plantillas Predeterminadas</span>
            </button>
          </div>
        )}

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

        <RoutineTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectPreset={handleSelectPreset}
        />
      </div>
    );
  }

  /* ─── STEP 2: Días y ejercicios ─────────── */

  const day = form.days[activeDayIdx];

  return (
    <div className="space-y-6">
      {/* Template Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 hidden sm:inline">
            ⚡ Plantillas:
          </span>
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar Plantilla Predeterminada</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveAsCustomPreset}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          title="Guardar esta rutina para reutilizarla con otros clientes"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Guardar como Plantilla</span>
        </button>
      </div>

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

                {day.exercises.map((ex, exIdx) => {
                  const matchedEntry = findDictEntry(ex.name);

                  return (
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

                      {/* Live GIF & Technique Preview Banner */}
                      {matchedEntry && (
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={matchedEntry.gifUrl || matchedEntry.imageUrl || ''}
                              alt={matchedEntry.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {matchedEntry.gifUrl && (
                              <span className="absolute bottom-1 right-1 text-[8px] font-extrabold text-emerald-400 bg-black/80 px-1 py-0.5 rounded border border-emerald-500/30">
                                GIF
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-primary-400">
                                {MUSCLE_GROUPS[matchedEntry.muscleGroup as keyof typeof MUSCLE_GROUPS]?.icon}{" "}
                                {MUSCLE_GROUPS[matchedEntry.muscleGroup as keyof typeof MUSCLE_GROUPS]?.label || matchedEntry.muscleGroup}
                              </span>
                              {matchedEntry.equipment && (
                                <span className="text-[10px] text-slate-300 capitalize bg-white/10 px-2 py-0.5 rounded border border-white/10">
                                  {matchedEntry.equipment}
                                </span>
                              )}
                            </div>
                            {matchedEntry.instructionsEs ? (
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {matchedEntry.instructionsEs}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                Ejercicio del catálogo vinculado correctamente con GIF.
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewExercise(matchedEntry)}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
                            title="Ver técnica completa en pantalla grande"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ExerciseAutocomplete
                          value={ex.name}
                          dictionary={dictionary}
                          onChange={(newName, match) => {
                            updateExercise(activeDayIdx, exIdx, {
                              name: newName,
                              ...(match
                                ? { muscleGroup: match.muscleGroup }
                                : {}),
                            });
                          }}
                          onOpenPicker={() =>
                            setPickerTarget({ dayIdx: activeDayIdx, exIdx })
                          }
                        />

                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="block text-sm font-semibold uppercase tracking-wider text-slate-300">
                            Grupo muscular
                          </label>
                          <select
                            value={ex.muscleGroup}
                            onChange={(e) =>
                              updateExercise(activeDayIdx, exIdx, {
                                muscleGroup: e.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-white/12 bg-[#1a1c23] px-4 py-3 text-sm text-white transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none font-semibold tracking-wide"
                          >
                            {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                              <option key={key} value={key}>
                                {val.icon} {val.label}
                              </option>
                            ))}
                          </select>
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

                      {/* Peso Asignado y Semáforo de Intensidad */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                        {/* Peso Asignado por el Coach */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            🔒 Peso Fijo Asignado (kg)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="Ej. 40 (0 = corporal)"
                              value={ex.targetWeight ?? ""}
                              onChange={(e) =>
                                updateExercise(activeDayIdx, exIdx, {
                                  targetWeight: e.target.value,
                                })
                              }
                              className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-bold"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                              kg
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            El alumno no podrá modificar este peso en su rutina.
                          </p>
                        </div>

                        {/* Semáforo de Intensidad / Estrictez */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            🚦 Semáforo de Intensidad
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
                            {/* Verde Relax */}
                            <button
                              type="button"
                              onClick={() => updateExercise(activeDayIdx, exIdx, { intensity: "relax" })}
                              className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border text-center",
                                ex.intensity === "relax"
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20 font-black"
                                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                              )}
                            >
                              <span className="text-xs">🟢 Relax</span>
                              <span className="text-[9px] opacity-75">Calentamiento</span>
                            </button>

                            {/* Amarillo Media */}
                            <button
                              type="button"
                              onClick={() => updateExercise(activeDayIdx, exIdx, { intensity: "medium" })}
                              className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border text-center",
                                (!ex.intensity || ex.intensity === "medium")
                                  ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20 font-black"
                                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                              )}
                            >
                              <span className="text-xs">🟡 Media</span>
                              <span className="text-[9px] opacity-75">Estricto</span>
                            </button>

                            {/* Rojo Al Fallo */}
                            <button
                              type="button"
                              onClick={() => updateExercise(activeDayIdx, exIdx, { intensity: "failure" })}
                              className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border text-center",
                                ex.intensity === "failure"
                                  ? "bg-red-500/25 border-red-500 text-red-400 shadow-md shadow-red-500/30 font-black"
                                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                              )}
                            >
                              <span className="text-xs">🔴 Al Fallo</span>
                              <span className="text-[9px] opacity-75">Máx. esfuerzo</span>
                            </button>
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
                  );
                })}

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

      {/* Exercise Picker Modal for Trainers */}
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

      {/* Routine Preset Template Modal */}
      <RoutineTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
