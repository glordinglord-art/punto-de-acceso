"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { tasksService } from "@/features/tasks/services/tasks.service";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
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
  isMandatory = false,
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

      toast.success("¡Check-In Semanal enviado a tu entrenador! Métricas desbloqueadas.", {
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
      onClose={() => {
        // Safe dismiss: lets user close if needed so it never blocks the app
        onClose();
      }}
      title="Check-In Semanal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-neutral-900/60 to-black border border-red-500/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-condensed uppercase tracking-wider text-sm">
                Evaluación de Cada 7 Días (Lunes)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold uppercase text-red-400">
                Requerido
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Tu entrenador revisará estas respuestas para calibrar tu plan nutricional y rutinas de la semana entrante.
            </p>
          </div>
        </div>

        {submittedError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submittedError}</span>
          </div>
        )}

        {/* ─── PREGUNTA 1 (Escala 1 al 10) ─── */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <label className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
              ¿Cómo evalúas tu semana del 1 al 10 en términos de disciplina y sensaciones generales?{" "}
              <span className="text-red-500 font-black">*</span>
            </label>
            <span className="text-sm font-display font-black text-red-500 shrink-0">
              {disciplineRating} / 10
            </span>
          </div>

          <p className={cn("text-xs font-condensed font-bold uppercase tracking-wider", descriptor.color)}>
            {descriptor.text}
          </p>

          {/* 1 to 10 Interactive Number Buttons */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = disciplineRating === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDisciplineRating(num)}
                  className={cn(
                    "h-11 rounded-xl font-display font-bold text-sm transition-all flex flex-col items-center justify-center border",
                    isSelected
                      ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-red-500/50 hover:text-white"
                  )}
                >
                  <span>{num}</span>
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-0.5",
                      isSelected ? "bg-white" : "bg-transparent"
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-neutral-500 px-1 pt-1 font-mono">
            <span>1 (Mínima)</span>
            <span>5 (Media)</span>
            <span>10 (Óptima)</span>
          </div>
        </div>

        {/* ─── PREGUNTA 2 (Texto breve) ─── */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 space-y-2">
          <label className="block text-sm font-bold text-neutral-900 dark:text-white leading-snug">
            ¿Qué fue lo mejor que te salió esta semana?{" "}
            <span className="text-red-500 font-black">*</span>
          </label>
          <p className="text-[11px] text-neutral-500">Texto de respuesta breve</p>
          <input
            type="text"
            required
            value={bestMoment}
            onChange={(e) => setBestMoment(e.target.value)}
            placeholder="Ej: Cumplí mis 4 comidas al 100% y logré récord en sentadilla..."
            className="w-full py-2.5 px-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-medium"
          />
        </div>

        {/* ─── PREGUNTA 3 (Texto largo) ─── */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 space-y-2">
          <label className="block text-sm font-bold text-neutral-900 dark:text-white leading-snug">
            ¿Cuál fue tu mayor obstáculo y en qué necesitas ayuda específica para la próxima semana?{" "}
            <span className="text-red-500 font-black">*</span>
          </label>
          <p className="text-[11px] text-neutral-500">Texto de respuesta largo</p>
          <textarea
            rows={4}
            required
            value={biggestObstacle}
            onChange={(e) => setBiggestObstacle(e.target.value)}
            placeholder="Ej: Se me dificultó preparar los snacks por viajes de trabajo y sentí fatiga muscular los jueves. Necesito ajustar los tiempos de comida..."
            className="w-full py-2.5 px-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-medium leading-relaxed resize-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
          {!isMandatory ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto text-xs"
            >
              Cerrar por ahora
            </Button>
          ) : (
            <span className="text-[11px] text-neutral-500 italic text-center sm:text-left">
              * Todas las preguntas son obligatorias
            </span>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={!isFormValid}
            className="w-full sm:w-auto font-condensed uppercase tracking-wider font-bold py-3 px-6 shadow-lg shadow-red-500/30 text-sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Enviar Check-In y Desbloquear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
