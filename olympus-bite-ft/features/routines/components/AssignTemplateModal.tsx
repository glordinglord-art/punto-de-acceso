"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import type { RoutinePreset } from "../data/preset-routines";
import type { User } from "@/shared/types/common.types";
import { Dumbbell, Calendar, Sparkles } from "lucide-react";

interface AssignTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: RoutinePreset | null;
  clients: User[];
  trainerId?: string;
  onAssign: (clientId: string, routineName: string, template: RoutinePreset) => Promise<void>;
}

export function AssignTemplateModal({
  isOpen,
  onClose,
  template,
  clients,
  trainerId,
  onAssign,
}: AssignTemplateModalProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (template) {
      setCustomName(template.name);
    }
  }, [template]);

  if (!template) return null;

  const handleSubmit = async () => {
    if (!selectedClient) {
      alert("Por favor selecciona un alumno o asigna para ti mismo");
      return;
    }
    if (!customName.trim()) {
      alert("Ingresa un nombre para la rutina");
      return;
    }

    setAssigning(true);
    try {
      await onAssign(selectedClient, customName.trim(), template);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error asignando rutina");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Plantilla a un Alumno">
      <div className="space-y-4 -mt-2">
        {/* Template Summary Card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Plantilla Seleccionada
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-white">
              {template.difficulty}
            </span>
          </div>

          <h3 className="text-base font-black text-white">
            {template.name}
          </h3>

          <p className="text-xs text-slate-400">
            {template.description}
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs text-slate-300 font-bold border-t border-white/6">
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-red-400" />
              {template.daysPerWeek} días/sem
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {template.weekCount} semanas
            </span>
          </div>
        </div>

        {/* Client Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Seleccionar Alumno
          </label>
          <select
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              const clientObj = clients.find((c) => c.id === e.target.value);
              if (clientObj) {
                setCustomName(`${template.name} — ${clientObj.name}`);
              }
            }}
            className="w-full rounded-2xl border border-white/12 bg-[#121420] px-4 py-3 text-xs text-white focus:border-red-500 focus:outline-none"
          >
            <option value="">Selecciona un alumno...</option>
            {trainerId && (
              <option value={trainerId}>🏋️ Para mí (mi entrenamiento)</option>
            )}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                👤 {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {/* Routine Name Customization */}
        <Input
          label="Nombre de la Rutina Asignada"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Ej: Push Pull Legs — Carlos"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={assigning}
            className="bg-red-600 hover:bg-red-500"
          >
            ✓ Asignar Rutina al Alumno
          </Button>
        </div>
      </div>
    </Modal>
  );
}
