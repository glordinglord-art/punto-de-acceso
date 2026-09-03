"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { tasksService } from "../services/tasks.service";
import { Brain, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface DailyStressModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  date: string;
  onSaved?: () => void;
}

const MOODS = [
  { id: "calm", label: "En paz", icon: "🧘", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { id: "focused", label: "Enfocado", icon: "🎯", color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { id: "tired", label: "Cansado", icon: "🥱", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  { id: "stressed", label: "Agobiado", icon: "⚡", color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
  { id: "critical", label: "Muy Alto", icon: "🔥", color: "border-red-500/40 bg-red-500/10 text-red-400" },
];

export function DailyStressModal({
  isOpen,
  onClose,
  userId,
  date,
  onSaved,
}: DailyStressModalProps) {
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [selectedMood, setSelectedMood] = useState<string>("calm");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const getStressLabel = (val: number) => {
    if (val <= 2) return { text: "Muy Bajo / Total Relajación", color: "text-emerald-400" };
    if (val <= 4) return { text: "Bajo / Controlado", color: "text-teal-400" };
    if (val <= 6) return { text: "Moderado / Manejable", color: "text-amber-400" };
    if (val <= 8) return { text: "Alto / Tensión Notoria", color: "text-orange-400" };
    return { text: "Crítico / Sobrecarga Intensa", color: "text-red-500" };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tasksService.saveDailyStress(userId, {
        date,
        stressLevel,
        energyLevel,
        mood: selectedMood,
        notes: notes.trim() || undefined,
      });

      toast.success("¡Formulario de estrés completado y tarea marcada!");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar estrés");
    } finally {
      setSaving(false);
    }
  };

  const stressInfo = getStressLabel(stressLevel);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registro Diario de Estrés">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Indicator */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-condensed text-neutral-900 dark:text-white">
              ¿Cómo manejaste el estrés hoy?
            </h4>
            <p className="text-xs text-neutral-500">
              Fecha: <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">{date}</span>
            </p>
          </div>
        </div>

        {/* Stress Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-condensed uppercase tracking-wider text-neutral-400">
              Nivel de Estrés: <span className="text-base text-white font-bold">{stressLevel}/10</span>
            </label>
            <span className={`text-xs font-bold font-condensed uppercase tracking-wider ${stressInfo.color}`}>
              {stressInfo.text}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1 (Zen)</span>
            <span>5 (Normal)</span>
            <span>10 (Sobrecarga)</span>
          </div>
        </div>

        {/* Energy Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-condensed uppercase tracking-wider text-neutral-400">
              Nivel de Energía: <span className="text-base text-white font-bold">{energyLevel}/10</span>
            </label>
            <span className="text-xs font-bold text-amber-400 font-condensed uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Vitalidad
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-neutral-400">
            Estado Anímico Predominante
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? `${m.color} ring-2 ring-red-500/50 scale-105`
                      : "border-neutral-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-xl mb-1">{m.icon}</span>
                  <span className="text-[10px] font-bold font-condensed uppercase tracking-wider">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-neutral-400">
            Notas o Sensaciones (Opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Buena concentración en el entrenamiento, descansé bien."
            className="w-full py-2 px-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-800 dark:text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            className="font-condensed uppercase tracking-wider font-bold shadow-lg shadow-red-500/25"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Guardar y Completar Tarea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
