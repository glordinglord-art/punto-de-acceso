'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Stethoscope, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { routinesService } from '../services/routines.service';
import {
  ClinicalAdjustmentModal,
  type ClinicalProposal,
} from './ClinicalAdjustmentModal';

interface ExerciseOption {
  id: string;
  name: string;
  dayNumber?: number;
}

interface ClinicalLogBarProps {
  routineId: string;
  exercises: ExerciseOption[];
  onRoutineUpdated: () => void;
  className?: string;
}

export function ClinicalLogBar({
  routineId,
  exercises,
  onRoutineUpdated,
  className,
}: ClinicalLogBarProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || '',
  );
  const [coachNote, setCoachNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<ClinicalProposal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachNote.trim()) {
      toast.error('Por favor escribe la molestia o reporte del atleta');
      return;
    }

    const exId = selectedExerciseId || exercises[0]?.id;
    if (!exId) {
      toast.error('No hay ejercicios disponibles en la rutina');
      return;
    }

    setIsLoading(true);
    try {
      const res = await routinesService.proposeClinicalAdjustment(routineId, {
        exerciseId: exId,
        coachNote: coachNote.trim(),
      });

      if (res?.data) {
        setProposal(res.data);
        setModalOpen(true);
      } else {
        toast.error('No se recibió propuesta del Director Clínico');
      }
    } catch {
      toast.error('Error al generar la propuesta de ajuste biomecánico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-[24px] border border-cyan-500/30 bg-gradient-to-r from-[#0C1420] via-[#0D1625] to-[#0A101A] p-4 shadow-xl backdrop-blur-xl ${className || ''}`}
      >
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-[50px] pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Stethoscope className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
            Bitácora Clínica & Ajuste Biomecánico IA
          </span>
          <span className="text-[10px] rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-cyan-300 font-bold ml-auto">
            1 Clic
          </span>
        </div>

        <form onSubmit={handlePropose} className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Exercise Selector */}
          <div className="w-full sm:w-1/3 shrink-0">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id} className="bg-[#0D1625] text-white">
                  {ex.dayNumber ? `Día ${ex.dayNumber}: ` : ''}{ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Friction Note Input */}
          <div className="w-full flex-1">
            <input
              type="text"
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              placeholder="Reporte en piso: Ej. Dolor en hombro derecho al hacer press militar..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Trigger Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !coachNote.trim()}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-4 py-2 text-xs font-black text-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ajustar IA</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Modal on proposal ready */}
      <ClinicalAdjustmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        routineId={routineId}
        proposal={proposal}
        coachNote={coachNote}
        onApproved={() => {
          setCoachNote('');
          onRoutineUpdated();
        }}
      />
    </>
  );
}
