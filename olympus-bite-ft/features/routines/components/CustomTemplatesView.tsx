"use client";

import { useState, useMemo } from "react";
import { routineTemplatesService } from "../services/routine-templates.service";
import { type RoutinePreset } from "../data/preset-routines";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { AssignTemplateModal } from "./AssignTemplateModal";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/types/common.types";
import {
  Sparkles,
  Plus,
  Edit,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Calendar,
  Lock,
  Search,
} from "lucide-react";

interface CustomTemplatesViewProps {
  clients: User[];
  trainerId?: string;
  onAssignTemplate: (
    clientId: string,
    routineName: string,
    template: RoutinePreset,
  ) => Promise<void>;
}

export function CustomTemplatesView({
  clients,
  trainerId,
  onAssignTemplate,
}: CustomTemplatesViewProps) {
  const [templates, setTemplates] = useState<RoutinePreset[]>(() =>
    routineTemplatesService.getAll(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoutinePreset | null>(
    null,
  );
  const [assigningTemplate, setAssigningTemplate] =
    useState<RoutinePreset | null>(null);

  const reloadTemplates = () => {
    setTemplates(routineTemplatesService.getAll());
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCat =
        selectedCategory === "all"
          ? true
          : selectedCategory === "custom"
            ? t.id.startsWith("template-") || t.tags.includes("Personalizada")
            : t.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.days.some((d) =>
          d.exercises.some((e) => e.name.toLowerCase().includes(q)),
        );

      return matchCat && matchSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: RoutinePreset) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleDuplicate = (id: string) => {
    routineTemplatesService.duplicate(id);
    reloadTemplates();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la plantilla "${name}"?`)) {
      routineTemplatesService.delete(id);
      reloadTemplates();
    }
  };

  const handleSaveTemplate = (
    templateData: Omit<RoutinePreset, "id">,
    existingId?: string,
  ) => {
    if (existingId) {
      routineTemplatesService.update(existingId, templateData);
    } else {
      routineTemplatesService.create(templateData);
    }
    reloadTemplates();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0c0e17] border border-white/12 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Rutinas Personalizadas &amp; Plantillas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Crea, edita y administra tu banco de entrenamientos predeterminados.
            Así no tendrás que volver a armar rutinas desde cero: asígnalas a
            tus alumnos en 1 clic.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Plantilla Personalizada</span>
        </button>
      </div>

      {/* Controls: Search & Category Pills */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de rutina, ejercicio o técnica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0c0e17] pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "Todas las Plantillas" },
            { id: "heavy-duty", label: "⚡ Heavy Duty (Mentzer)" },
            { id: "hipertrofia", label: "🔥 Hipertrofia (PPL)" },
            { id: "fuerza", label: "💥 Torso / Pierna" },
            { id: "principiante", label: "⚡ Full Body" },
            { id: "gluteos", label: "🍑 Glúteos & Pierna" },
            { id: "custom", label: "⭐ Creadas por Mí" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border transition-all cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-[#0c0e17] space-y-3">
          <span className="text-4xl">🏋️</span>
          <h3 className="text-base font-black text-white">
            No se encontraron plantillas
          </h3>
          <p className="text-xs text-slate-400">
            Intenta cambiar el filtro o crea una nueva plantilla personalizada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const isExpanded = expandedId === template.id;
            const totalExercises = template.days.reduce(
              (acc, d) => acc + d.exercises.length,
              0,
            );

            return (
              <div
                key={template.id}
                className="rounded-3xl border border-white/10 bg-[#0c0e17] p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                      {template.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {template.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-black text-white leading-snug">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300 mt-3 pt-3 border-t border-white/6">
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-red-400" />
                      {template.daysPerWeek} días/sem
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {template.weekCount} semanas
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">
                      {totalExercises} ejercicios
                    </span>
                  </div>

                  {/* Expand/Collapse preview of days */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : template.id)
                      }
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between border border-white/8 transition-colors cursor-pointer"
                    >
                      <span>
                        {isExpanded
                          ? "Ocultar detalles de la rutina"
                          : `Ver estructura y ejercicios (${template.days.length} Días)`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {template.days.map((day) => (
                          <div
                            key={day.dayNumber}
                            className="p-3 rounded-2xl bg-black/40 border border-white/6 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white">
                                Día {day.dayNumber}:{" "}
                                {day.isRestDay
                                  ? "🧘 Descanso"
                                  : day.focusArea || "Entrenamiento"}
                              </span>
                              {!day.isRestDay && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {day.exercises.length} ej.
                                </span>
                              )}
                            </div>

                            {!day.isRestDay && day.exercises.length > 0 && (
                              <div className="space-y-1.5 pt-1 border-t border-white/6">
                                {day.exercises.map((ex, exIdx) => {
                                  const muscleInfo =
                                    MUSCLE_GROUPS[
                                      ex.muscleGroup as keyof typeof MUSCLE_GROUPS
                                    ];
                                  return (
                                    <div
                                      key={exIdx}
                                      className="flex items-center justify-between text-xs text-slate-300"
                                    >
                                      <span className="flex items-center gap-1.5 truncate">
                                        <span>{muscleInfo?.icon || "🏋️"}</span>
                                        <span className="font-bold truncate">
                                          {ex.name}
                                        </span>
                                      </span>
                                      <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-[11px] font-bold text-slate-400">
                                          {ex.sets}×{ex.reps}
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                          <Lock className="w-2.5 h-2.5" />
                                          {ex.targetWeight &&
                                          Number(ex.targetWeight) > 0
                                            ? `${ex.targetWeight}kg`
                                            : "Corp"}
                                        </span>
                                        <span>
                                          {ex.intensity === "failure"
                                            ? "🔴"
                                            : ex.intensity === "relax"
                                              ? "🟢"
                                              : "🟡"}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-white/6 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigningTemplate(template)}
                    className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Asignar a Alumno</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(template)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8 transition-colors cursor-pointer"
                      title="Editar plantilla"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(template.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8 transition-colors cursor-pointer"
                      title="Duplicar plantilla"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(template.id, template.name)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/8 transition-colors cursor-pointer"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Editor Modal */}
      {editorOpen && (
        <TemplateEditorModal
          key={editingTemplate?.id ?? "new"}
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditingTemplate(null);
          }}
          onSave={handleSaveTemplate}
          initialTemplate={editingTemplate}
        />
      )}

      {/* Assign Template Modal */}
      {assigningTemplate && (
        <AssignTemplateModal
          isOpen={!!assigningTemplate}
          onClose={() => setAssigningTemplate(null)}
          template={assigningTemplate}
          clients={clients}
          trainerId={trainerId}
          onAssign={async (clientId, routineName, t) => {
            await onAssignTemplate(clientId, routineName, t);
            setAssigningTemplate(null);
          }}
        />
      )}
    </div>
  );
}
