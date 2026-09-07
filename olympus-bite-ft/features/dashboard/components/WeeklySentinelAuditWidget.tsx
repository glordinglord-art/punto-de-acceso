'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Snowflake,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Users,
  Utensils,
  CheckSquare,
  Dumbbell,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { tasksService } from '@/features/tasks/services/tasks.service';
import type { WeeklyAuditData, FlaggedAthlete } from '@/features/tasks/types/tasks.types';
import { cn } from '@/shared/lib/utils';

interface WeeklySentinelAuditWidgetProps {
  trainerId?: string;
}

export function WeeklySentinelAuditWidget({ trainerId }: WeeklySentinelAuditWidgetProps) {
  const [auditData, setAuditData] = useState<WeeklyAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await tasksService.getWeeklyAudit(trainerId);
      if (res?.data) {
        setAuditData(res.data);
      }
    } catch {
      // Background load fallback
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const handleTriggerAudit = async () => {
    setAuditing(true);
    try {
      const res = await tasksService.triggerWeeklyAudit(trainerId);
      if (res?.data) {
        setAuditData(res.data);
        toast.success(
          `Auditoría completada: ${res.data.flaggedCount} atletas en semáforo rojo`,
          { icon: '🛡️' }
        );
      }
    } catch {
      toast.error('Error ejecutando auditoría del Centinela');
    } finally {
      setAuditing(false);
    }
  };

  const createWhatsAppLink = (athlete: FlaggedAthlete) => {
    const rawPhone = athlete.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const msg = `¡Hola ${athlete.athleteName}! Te escribe tu coach desde Vital Fit 🩺. Nuestro sistema detectó que tu adherencia esta semana estuvo en ${athlete.complianceScore}%. Por seguridad biomecánica y para evitar sobreentrenamiento, pausamos el aumento de cargas esta semana. ¿Cómo te sientes con tus comidas y recuperación? Conversemos para ajustar el plan.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/5 dark:bg-[#12141c]/90 dark:shadow-none">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-[80px]" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 shadow-sm shadow-red-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                Motor 1 · Regla del 80%
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                <Clock className="h-3.5 w-3.5" /> Auditoría Dominical 00:00h
              </span>
            </div>
            <h3 className="mt-0.5 text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              Centinela de Sobrecarga & Recuperación
            </h3>
          </div>
        </div>

        <button
          onClick={handleTriggerAudit}
          disabled={auditing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', auditing && 'animate-spin text-red-500')} />
          <span>{auditing ? 'Auditan...' : 'Re-auditar Ahora'}</span>
        </button>
      </div>

      {/* Summary Stat Pills */}
      {auditData && (
        <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Atletas Auditados
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {auditData.totalAthletes}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/60 text-slate-700 dark:bg-white/5 dark:text-neutral-300">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Sobrecarga Activa (≥80%)
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {auditData.approvedCount}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Sobrecarga Congelada (&lt;80%)
              </p>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">
                {auditData.flaggedCount}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-600 dark:text-red-400">
              <Snowflake className="h-4 w-4 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Flagged Athletes */}
      <div className="relative z-10 mt-6">
        {loading ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">
            Cargando telemetría del Centinela...
          </div>
        ) : !auditData || auditData.flaggedAthletes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Cero Banderas Rojas Esta Semana
            </h4>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-neutral-400">
              Todos tus atletas auditados mantienen una adherencia biológica igual o superior al 80%. Sus sobrecargas progresivas continúan autorizadas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-neutral-400">
                Atletas en Riesgo Biomecánico ({auditData.flaggedAthletes.length})
              </p>
              <span className="text-[11px] font-semibold text-red-500">
                Triage del Lunes 6:00 AM Activo
              </span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {auditData.flaggedAthletes.map((athlete) => (
                  <motion.div
                    key={athlete.athleteId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.03] p-4 transition-all hover:border-red-500/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                          {athlete.athleteName}
                        </h4>
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                          <Snowflake className="h-3 w-3" /> Sobrecarga Congelada ({athlete.complianceScore}%)
                        </span>
                      </div>

                      {/* Reasons */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {athlete.reasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-white/5 dark:text-neutral-300"
                          >
                            <AlertTriangle className="h-3 w-3 text-amber-500" /> {r}
                          </span>
                        ))}
                      </div>

                      {/* Mini breakdown chips */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Utensils className="h-3.5 w-3.5 text-amber-500" /> Dieta: {athlete.nutritionScore}%
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5 text-blue-500" /> Hábitos: {athlete.habitsScore}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5 text-primary-500" /> Entrenos: {athlete.workoutsCount}
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Action */}
                    <div className="flex shrink-0 items-center gap-2">
                      {athlete.phone ? (
                        <a
                          href={createWhatsAppLink(athlete)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-600 transition-all hover:bg-emerald-500/25 active:scale-95 sm:w-auto dark:text-emerald-400"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp Táctico</span>
                        </a>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:bg-white/5">
                          Sin teléfono
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
