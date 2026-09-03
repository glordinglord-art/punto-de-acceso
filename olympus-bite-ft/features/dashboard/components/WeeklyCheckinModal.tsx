"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { tasksService } from "@/features/tasks/services/tasks.service";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  weekDate: string; // YYYY-MM-DD
  onSuccess?: () => void;
  isMandatory?: boolean;
}

export function WeeklyCheckinModal({
  isOpen,
  onClose,
  userId,
  weekDate,
  onSuccess,
}: WeeklyCheckinModalProps) {
  // Exact 3 Google Form questions from Trainer
  const [disciplineRating, setDisciplineRating] = useState<number>(8);
  const [bestMoment, setBestMoment] = useState<string>("");
  const [biggestObstacle, setBiggestObstacle] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedError, setSubmittedError] = useState<string | null>(null);

  const getRatingDescriptor = (val: number) => {
    if (val <= 3) return { text: "Semana difícil / Baja disciplina", color: "text-red-400" };
    if (val <= 6) return { text: "Moderada / Cumplimiento regular", color: "text-amber-400" };
    if (val <= 8) return { text: "Buena / Constante y enfocado", color: "text-emerald-400" };
    return { text: "Impecable / Máximo rendimiento", color: "text-red-500 font-black" };
  };

  const descriptor = getRatingDescriptor(disciplineRating);

  const isFormValid = bestMoment.trim().length > 0 && biggestObstacle.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedError(null);

    if (!bestMoment.trim()) {
      toast.error("Por favor responde qué fue lo mejor que te salió esta semana");
      return;
    }

    if (!biggestObstacle.trim()) {
      toast.error("Por favor describe cuál fue tu mayor obstáculo y en qué necesitas ayuda");
      return;
    }

    setSubmitting(true);
    try {
      await tasksService.saveWeeklyCheckin(userId, {
        weekDate,
        stressRating: disciplineRating,
        energyRating: disciplineRating,
        recoveryRating: disciplineRating >= 7 ? "buena" : "regular",
        dietPerception: bestMoment.trim(),
        notes: `Obstáculo y ayuda: ${biggestObstacle.trim()} | Lo mejor: ${bestMoment.trim()}`,
        rawAnswers: {
          submittedAt: new Date().toISOString(),
          question1_disciplineRating: disciplineRating,
          question2_bestMoment: bestMoment.trim(),
          question3_biggestObstacle: biggestObstacle.trim(),
        },
      });

      toast.success("¡Check-In Semanal enviado a tu entrenador!", {
        duration: 4500,
        icon: "🔥",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al enviar el chequeo semanal";
      setSubmittedError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-In Semanal"
      size="md"
      className="p-0 bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
        {/* Banner */}
        <div className="p-4 bg-gradient-to-r from-red-600/20 via-neutral-900/60 to-black border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white font-condensed uppercase tracking-wider text-xs block">
                Evaluación Semanal (Lunes)
              </span>
              <p className="text-[11px] text-neutral-400">
                3 preguntas para calibrar tu plan
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold uppercase text-red-400">
            Requerido
          </span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {submittedError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submittedError}</span>
            </div>
          )}

          {/* ─── PREGUNTA 1 (Escala 1 al 10) ─── */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <label className="text-xs font-bold text-white leading-snug">
                1. ¿Cómo evalúas tu semana del 1 al 10 en disciplina y sensaciones?{" "}
                <span className="text-red-500 font-black">*</span>
              </label>
              <span className="text-xs font-bold text-red-500 shrink-0 font-mono">
                {disciplineRating} / 10
              </span>
            </div>

            <p className={cn("text-[11px] font-condensed font-bold uppercase tracking-wider", descriptor.color)}>
              {descriptor.text}
            </p>

            {/* 1 to 10 Number Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = disciplineRating === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDisciplineRating(num)}
                    className={cn(
                      "h-9 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center border",
                      isSelected
                        ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-500/30 scale-105"
                        : "bg-neutral-900 border-white/10 text-neutral-400 hover:border-red-500/50 hover:text-white"
                    )}
                  >
                    <span>{num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── PREGUNTA 2 (Texto breve) ─── */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1.5">
            <label className="block text-xs font-bold text-white leading-snug">
              2. ¿Qué fue lo mejor que te salió esta semana?{" "}
              <span className="text-red-500 font-black">*</span>
            </label>
            <input
              type="text"
              required
              value={bestMoment}
              onChange={(e) => setBestMoment(e.target.value)}
              placeholder="Ej: Cumplí mis 4 comidas al 100% y logré récord en sentadilla..."
              className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-red-500 transition-all font-medium"
            />
          </div>

          {/* ─── PREGUNTA 3 (Texto largo) ─── */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1.5">
            <label className="block text-xs font-bold text-white leading-snug">
              3. ¿Cuál fue tu mayor obstáculo y en qué necesitas ayuda para la próxima semana?{" "}
              <span className="text-red-500 font-black">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={biggestObstacle}
              onChange={(e) => setBiggestObstacle(e.target.value)}
              placeholder="Ej: Se me dificultó preparar snacks por trabajo..."
              className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-red-500 transition-all font-medium leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-condensed uppercase font-bold text-neutral-400 hover:text-white"
          >
            Responder más tarde
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!isFormValid}
            className="font-condensed uppercase tracking-wider font-bold shadow-lg shadow-red-500/30 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Enviar Respuestas
          </Button>
        </div>
      </form>
    </Modal>
  );
}
