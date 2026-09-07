'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldAlert,
  Check,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { routinesService } from '../services/routines.service';

export interface ClinicalProposal {
  targetExerciseId: string;
  targetExerciseName: string;
  replacementExercise: {
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    restSeconds: number;
    observations: string;
    intensity: string;
  };
  clinicalRationale: string;
}

interface ClinicalAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineId: string;
  proposal: ClinicalProposal | null;
  coachNote: string;
  onApproved: () => void;
}

export function ClinicalAdjustmentModal({
  isOpen,
  onClose,
  routineId,
  proposal,
  coachNote,
  onApproved,
}: ClinicalAdjustmentModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen || !proposal) return null;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await routinesService.applyClinicalAdjustment(routineId, {
        targetExerciseId: proposal.targetExerciseId,
        replacementExercise: proposal.replacementExercise,
        clinicalRationale: proposal.clinicalRationale,
        coachNote,
      });

      toast.success('¡Ajuste aplicado y sincronizado con el atleta!', {
        icon: '✅',
        style: {
          borderRadius: '16px',
          background: '#12141C',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        },
      });

      onApproved();
      onClose();
    } catch {
      toast.error('No se pudo aplicar el ajuste clínico');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#12141F] via-[#0E1017] to-[#07080B] p-6 sm:p-8 shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  <Sparkles className="h-3 w-3" /> Vital Fit Clinical AI
                </span>
                <span className="text-[10px] font-semibold text-white/40">Fase 1.1</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-1">
                Propuesta de Reemplazo Biomecánico
              </h3>
            </div>
          </div>

          {/* Coach Note Input Context */}
          {coachNote && (
            <div className="mb-5 rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white/80">Reporte del Coach: </span>
                <span className="text-white/60 italic">&ldquo;{coachNote}&rdquo;</span>
              </div>
            </div>
          )}

          {/* Before & After Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* ❌ BEFORE */}
            <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/[0.04] p-4.5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Ejercicio con Molestia
                </span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black text-rose-300">
                  REEMPLAZAR
                </span>
              </div>
              <h4 className="text-base font-bold text-white line-through opacity-80">
                {proposal.targetExerciseName}
              </h4>
              <p className="text-xs text-white/50 mt-1">
                Fricción biomecánica o sobrecarga articular reportada
              </p>
            </div>

            {/* ✅ AFTER (PROPOSAL) */}
            <div className="rounded-[24px] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-cyan-500/[0.04] p-4.5 relative overflow-hidden shadow-[0_0_24px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Sustitución Clínica
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-300 flex items-center gap-1">
                  <Check className="h-2.5 w-2.5" /> ÓPTIMO
                </span>
              </div>
              <h4 className="text-base font-black text-white">
                {proposal.replacementExercise.name}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-400">
                <span className="bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {proposal.replacementExercise.sets} series × {proposal.replacementExercise.reps}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/60">{proposal.replacementExercise.restSeconds}s desc.</span>
              </div>
              {proposal.replacementExercise.observations && (
                <p className="text-[11px] text-white/70 mt-2 italic">
                  💡 {proposal.replacementExercise.observations}
                </p>
              )}
            </div>
          </div>

          {/* Clinical Rationale Box */}
          <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/[0.03] p-4.5 mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                Fundamento Biomecánico & Fisiológico
              </p>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {proposal.clinicalRationale}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer"
            >
              Descartar Propuesta
            </button>

            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isApplying ? (
                <span>Sincronizando...</span>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Aprobar y Sincronizar (1 Clic)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
