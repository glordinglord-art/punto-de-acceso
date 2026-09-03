"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { PRESET_ROUTINES, type RoutinePreset } from "../data/preset-routines";
import { MUSCLE_GROUPS } from "@/shared/lib/constants";
import { Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface RoutineTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: RoutinePreset) => void;
}

const CUSTOM_PRESETS_KEY = "ob_custom_routine_presets";

export function RoutineTemplateModal({
  isOpen,
  onClose,
  onSelectPreset,
}: RoutineTemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  const [customPresets] = useState<RoutinePreset[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activePreset, setActivePreset] = useState<RoutinePreset>(
    PRESET_ROUTINES[0],
  );

  const allPresets = [...PRESET_ROUTINES, ...customPresets];

  const filteredPresets = allPresets.filter((p) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "custom")
      return customPresets.some((c) => c.id === p.id);
    return p.category === selectedCategory;
  });

  const handleSelectOnMobile = (preset: RoutinePreset) => {
    setActivePreset(preset);
    setMobileTab("detail");
  };

  const handleApply = (preset: RoutinePreset) => {
    onSelectPreset(preset);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rutinas Predeterminadas para Entrenadores"
      size="xl"
      className="max-h-[94vh] sm:max-h-[90vh]"
    >
      <div className="space-y-4 -mt-2">
        {/* Header subtitle */}
        <p className="text-xs text-slate-400">
          Ahorra tiempo seleccionando una rutina pre-diseñada de nivel élite.
          Carga todos los días, ejercicios, series, descansos e intensidad en 1 clic.
        </p>

        {/* Mobile Tab Switcher (Visible only on mobile screens < md) */}
        <div className="md:hidden flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
              mobileTab === "list"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-white",
            )}
          >
            📋 1. Elegir ({filteredPresets.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("detail")}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5",
              mobileTab === "detail"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-slate-400 hover:text-white",
            )}
          >
            <span>👁️ 2. Ver &amp; Cargar</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className={cn(
          "gap-1.5 overflow-x-auto pb-1 scrollbar-none",
          mobileTab === "detail" ? "hidden md:flex" : "flex"
        )}>
          {[
            { id: "all", label: "Todas" },
            { id: "heavy-duty", label: "⚡ Heavy Duty (Mentzer)" },
            { id: "hipertrofia", label: "🔥 Hipertrofia (PPL)" },
            { id: "fuerza", label: "💥 Torso / Pierna" },
            { id: "principiante", label: "⚡ Full Body" },
            { id: "gluteos", label: "🍑 Glúteos & Pierna" },
            ...(customPresets.length > 0
              ? [
                  {
                    id: "custom",
                    label: `⭐ Mis Plantillas (${customPresets.length})`,
                  },
                ]
              : []),
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider border transition-all cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Master-Detail Grid */}
        <div className="md:grid md:grid-cols-12 md:gap-4">
          {/* Presets List (Left on desktop, Tab 1 on mobile) */}
          <div
            className={cn(
              "space-y-2 md:col-span-5 md:max-h-[60vh] md:overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10",
              mobileTab === "detail" ? "hidden md:block" : "block",
            )}
          >
            {filteredPresets.map((preset) => {
              const isSelected = activePreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    handleSelectOnMobile(preset);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col gap-2 relative overflow-hidden",
                    isSelected
                      ? "bg-red-600/10 border-red-500 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-500/50"
                      : "bg-[#0c0e17] border-white/10 hover:bg-white/5 hover:border-white/20 text-slate-300",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-black text-white truncate">
                      {preset.name}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 shrink-0 uppercase">
                      {preset.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1.5 border-t border-white/6">
                    <span>
                      {preset.daysPerWeek} días/sem · {preset.weekCount} sem
                    </span>
                    <span className="text-red-400 flex items-center gap-0.5 font-black text-xs">
                      Ver ejercicios <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preset Detail Preview (Right on desktop, Tab 2 on mobile) */}
          <div
            className={cn(
              "md:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#0c0e17] border border-white/10 md:max-h-[60vh] md:overflow-y-auto space-y-4 shadow-2xl",
              mobileTab === "list" ? "hidden md:flex" : "flex",
            )}
          >
            <div className="space-y-3">
              {/* Mobile Back Button */}
              <div className="md:hidden flex items-center justify-between border-b border-white/10 pb-2.5">
                <button
                  type="button"
                  onClick={() => setMobileTab("list")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer py-1"
                >
                  <ArrowLeft className="w-4 h-4 text-red-400" />
                  <span>← Elegir otra rutina</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activePreset.category}
                </span>
              </div>

              {/* Title & Difficulty */}
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {activePreset.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {activePreset.description}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                  {activePreset.difficulty}
                </span>
              </div>

              {/* Days List Preview */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Estructura semanal ({activePreset.days.length} días)
                </p>

                {activePreset.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-3 rounded-xl bg-black/40 border border-white/8 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 font-bold text-white text-[10px]">
                          Día {day.dayNumber}
                        </span>
                        <span className="font-bold text-slate-200 truncate">
                          {day.isRestDay
                            ? "🧘 Descanso y Recuperación"
                            : day.focusArea}
                        </span>
                      </div>
                      {!day.isRestDay && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {day.exercises.length} ej.
                        </span>
                      )}
                    </div>

                    {/* Mini Exercises summary */}
                    {!day.isRestDay && day.exercises.length > 0 && (
                      <div className="space-y-1.5 pt-1.5 border-t border-white/6">
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
                                <span className="truncate font-medium">{ex.name}</span>
                              </span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[11px] font-bold text-slate-400">
                                  {ex.sets}×{ex.reps}
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
            </div>

            {/* Apply Action Button */}
            <div className="pt-3 border-t border-white/10 sticky bottom-0 bg-[#0c0e17]/90 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleApply(activePreset)}
                className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Cargar &quot;{activePreset.name}&quot; en la Rutina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
