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
    } catch (_error) {
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
    } catch (error) {
      toast.error("Error al eliminar el ejercicio");
    }
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <Input
            placeholder="🔍 Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 w-full md:w-auto"
        >
          + Nuevo Ejercicio
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">
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
              <Card key={ex.id} className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white leading-tight">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                    <span>{mg?.icon || "💪"}</span>
                    <span>{mg?.label || ex.muscleGroup}</span>
                  </div>
                  {ex.videoUrl && (
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Ver video
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  aria-label="Eliminar"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre del ejercicio"
            placeholder="Ej: Press de banca con mancuernas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Grupo muscular principal
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {(
                Object.entries(MUSCLE_GROUPS) as [
                  string,
                  { icon: string; label: string },
                ][]
              ).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.icon} {val.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Enlace a video (Opcional)"
            placeholder="https://youtube.com/..."
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />

          <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              Guardar ejercicio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
