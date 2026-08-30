/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import { Card } from "@/shared/components/ui/Card";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import {
  exerciseDictionaryService,
  ExerciseDict,
} from "@/features/routines/services/exercise-dictionary.service";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import toast from "react-hot-toast";
import { Spinner } from "@/shared/components/ui/Spinner";
import { useConfirm } from "@/shared/contexts/ConfirmContext";
import {
  Search,
  Plus,
  Trash2,
  Video,
  Filter,
  Dumbbell,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/* ─── Equipment options (from the dataset) ─── */
const EQUIPMENT_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "body weight", label: "Peso corporal" },
  { value: "dumbbell", label: "Mancuerna" },
  { value: "barbell", label: "Barra" },
  { value: "cable", label: "Cable" },
  { value: "leverage machine", label: "Máquina" },
  { value: "band", label: "Banda" },
  { value: "smith machine", label: "Smith" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "stability ball", label: "Pelota" },
  { value: "ez barbell", label: "Barra EZ" },
];

export function ExerciseDictionaryList() {
  const [exercises, setExercises] = useState<ExerciseDict[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDict | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState(Object.keys(MUSCLE_GROUPS)[0]);
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseDictionaryService.getAll();
      setExercises(data);
    } catch {
      toast.error("Error al cargar los ejercicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      await exerciseDictionaryService.create({
        name,
        muscleGroup,
        videoUrl: videoUrl || undefined,
      });
      toast.success("Ejercicio guardado correctamente");
      setIsModalOpen(false);
      setName("");
      setVideoUrl("");
      fetchExercises();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Ocurrió un error al guardar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const { confirm } = useConfirm();

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: '¿Eliminar ejercicio?',
      description: 'El ejercicio será eliminado de la biblioteca.',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await exerciseDictionaryService.delete(id);
      toast.success("Ejercicio eliminado");
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch {
      toast.error("Error al eliminar el ejercicio");
    }
  };

  const filtered = exercises.filter((ex) => {
    const matchSearch = search
      ? ex.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchMuscle = muscleFilter
      ? ex.muscleGroup === muscleFilter
      : true;
    const matchEquipment = equipmentFilter
      ? ex.equipment?.toLowerCase() === equipmentFilter.toLowerCase()
      : true;
    return matchSearch && matchMuscle && matchEquipment;
  });

  const activeFilterCount =
    (muscleFilter ? 1 : 0) + (equipmentFilter ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search + Filter bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96 relative">
            <Input
              placeholder="Buscar entre 1,324 ejercicios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-3 shrink-0 w-full md:w-auto">
            <Button
              variant={showFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              className="font-condensed uppercase tracking-wider font-bold relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 w-full md:w-auto font-condensed uppercase tracking-wider font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo
            </Button>
          </div>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="flex flex-col gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Grupo muscular
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMuscleFilter("")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                    !muscleFilter
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10",
                  )}
                >
                  Todos
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
                      setMuscleFilter(muscleFilter === key ? "" : key)
                    }
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                      muscleFilter === key
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10",
                    )}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Equipo
              </p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setEquipmentFilter(
                        equipmentFilter === opt.value ? "" : opt.value,
                      )
                    }
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all",
                      equipmentFilter === opt.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMuscleFilter("");
                  setEquipmentFilter("");
                }}
                className="self-start inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {filtered.length.toLocaleString()} ejercicio
          {filtered.length !== 1 ? "s" : ""}
          {(search || muscleFilter || equipmentFilter) &&
            ` de ${exercises.length.toLocaleString()}`}
        </p>
      </div>

      {/* Exercise grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-md">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-lg font-condensed font-bold uppercase tracking-wide text-white mb-2">
            Sin resultados
          </p>
          <p className="text-neutral-400">
            {search
              ? "No se encontraron ejercicios con esa búsqueda."
              : "No hay ejercicios registrados en el diccionario aún."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => {
            const mg =
              MUSCLE_GROUPS[ex.muscleGroup as keyof typeof MUSCLE_GROUPS];
            return (
              <Card
                key={ex.id}
                hover
                className="flex gap-3 items-start group cursor-pointer"
                onClick={() => setPreviewExercise(ex)}
              >
                {/* Thumbnail */}
                {ex.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ex.imageUrl}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover bg-black/30 border border-white/5 shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-slate-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-white text-sm leading-tight font-condensed uppercase tracking-wide truncate">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-primary-400 font-bold uppercase tracking-wider font-condensed">
                    <span>{mg?.icon || "💪"}</span>
                    <span>{mg?.label || ex.muscleGroup}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ex.equipment && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {ex.equipment}
                      </span>
                    )}
                    {ex.gifUrl && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        GIF
                      </span>
                    )}
                    {ex.instructionsEs && (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        ES
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ex.id);
                  }}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create exercise modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Ejercicio Global"
      >
        <form onSubmit={handleCreate} className="space-y-5 p-1">
          <Input
            label="Nombre del ejercicio"
            placeholder="Ej: Press de banca con mancuernas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">
              Grupo muscular principal
            </label>
            <div className="relative">
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-[#1a1a1a] px-4 py-3 text-sm text-white appearance-none transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {(
                  Object.entries(MUSCLE_GROUPS) as [
                    string,
                    { icon: string; label: string },
                  ][]
                ).map(([key, val]) => (
                  <option key={key} value={key} className="bg-[#1a1a1a]">
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <Input
            label="Enlace a video (Opcional)"
            placeholder="https://youtube.com/..."
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            icon={<Video className="w-4 h-4" />}
          />

          <div className="flex gap-3 pt-6 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsModalOpen(false)}
              className="font-condensed uppercase font-bold tracking-wider"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              fullWidth 
              loading={saving}
              className="font-condensed uppercase font-bold tracking-wider"
            >
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Exercise preview modal */}
      <ExerciseInfoModal
        exercise={previewExercise}
        isOpen={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
      />
    </div>
  );
}
