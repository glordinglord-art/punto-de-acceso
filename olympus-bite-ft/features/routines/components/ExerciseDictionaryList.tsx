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
import toast from "react-hot-toast";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Search, Plus, Trash2, Video, PlayCircle } from "lucide-react";

export function ExerciseDictionaryList() {
  const [exercises, setExercises] = useState<ExerciseDict[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
    try {
      await exerciseDictionaryService.delete(id);
      toast.success("Ejercicio eliminado");
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch {
      toast.error("Error al eliminar el ejercicio");
    }
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <Input
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 w-full md:w-auto font-condensed uppercase tracking-wider font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Ejercicio
        </Button>
      </div>

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
              <Card key={ex.id} hover className="flex justify-between items-start group">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base leading-tight font-condensed uppercase tracking-wide">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-primary-400 font-bold uppercase tracking-wider font-condensed">
                    <span>{mg?.icon || "💪"}</span>
                    <span>{mg?.label || ex.muscleGroup}</span>
                  </div>
                  {ex.videoUrl && (
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Ver video
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
