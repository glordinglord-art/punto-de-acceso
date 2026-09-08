'use client';

import { useState } from 'react';
import {
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Dumbbell,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  clinicalAgentService,
  type RoutineProposal,
} from '../services/clinical-agent.service';

interface ClinicalRoutineProposalCardProps {
  proposal: RoutineProposal;
  trainerId: string;
  onApplied?: () => void;
}

export function ClinicalRoutineProposalCard({
  proposal,
  trainerId,
  onApplied,
}: ClinicalRoutineProposalCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleApply = async () => {
    if (applying || applied || !trainerId) return;

    setApplying(true);
    try {
      const res = await clinicalAgentService.applyAdjustment(trainerId, {
        clientName: proposal.clientName,
        oldExercise: proposal.currentExercise.name,
        newExercise: proposal.proposedExercise.name,
        rationale: proposal.rationale,
        routineName: proposal.routineName,
      });

      if (res?.data?.success) {
        setApplied(true);
        toast.success(
          res.data.message ||
            `¡Rutina de ${proposal.clientName} actualizada con éxito!`,
          {
            duration: 4500,
            icon: '🩺',
          }
        );
        onApplied?.();
      } else {
        toast.error('No se pudo aplicar el cambio a la rutina.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al conectar con la base de datos de rutinas.';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (dismissed) {
    return (
      <div className="my-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center text-xs font-semibold text-white/40">
        Propuesta descartada por el entrenador
      </div>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0f131a] shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
      {/* ── Top Header Badge ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Ajuste Clínico de Rutina
              </span>
              <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
                Propuesta IA
              </span>
            </div>
            <p className="text-xs font-black text-white mt-0.5">
              Atleta: <span className="text-primary-400">{proposal.clientName}</span>
              {proposal.routineName && (
                <span className="text-white/40 font-normal"> · {proposal.routineName}</span>
              )}
            </p>
          </div>
        </div>

        {proposal.dayFocus && (
          <span className="rounded-xl bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/10">
            {proposal.dayFocus}
          </span>
        )}
      </div>

      {/* ── Routine Diff Grid (Actual vs. Propuesta) ── */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Card 1: Rutina Actual */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" /> Ejercicio Actual
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                En Rutina Activa
              </span>
            </div>
            <p className="text-sm font-black text-white leading-tight">
              {proposal.currentExercise.name}
            </p>
            <p className="text-xs font-semibold text-rose-200/70 mt-1">
              Series: {proposal.currentExercise.setsReps || 'Configurado en rutina'}
            </p>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center items-center py-1 md:py-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-cyan-400 shadow-md rotate-90 md:rotate-0">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Sustitución Propuesta */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sustitución Recomendada
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Objetivo
              </span>
            </div>
            <p className="text-sm font-black text-white leading-tight">
              {proposal.proposedExercise.name}
            </p>
            <p className="text-xs font-semibold text-emerald-300/80 mt-1">
              Series: {proposal.proposedExercise.setsReps || 'Según mesociclo'}
            </p>
          </div>
        </div>

        {/* ── Biomechanical Rationale ── */}
        {proposal.rationale && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 flex items-start gap-2.5">
            <span className="text-base shrink-0">🧠</span>
            <div className="text-xs leading-relaxed text-cyan-100/90 font-medium">
              <strong className="text-cyan-300 block mb-0.5">Criterio Fisiológico & Biomecánico:</strong>
              {proposal.rationale}
            </div>
          </div>
        )}

        {/* ── Action Confirmation Bar ── */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold text-white/70 text-center sm:text-left">
            {applied
              ? '✓ Ajuste guardado y aplicado a la rutina del atleta.'
              : '¿Deseas aplicar esta sustitución a la rutina del atleta ahora?'}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {applied ? (
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Rutina Actualizada
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  disabled={applying}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Descartar
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Aplicar a la Rutina
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
