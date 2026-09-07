'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ClinicalAgentTerminal } from '@/features/clinical-agent/components/ClinicalAgentTerminal';
import { ShieldAlert, Sparkles } from 'lucide-react';

export default function ClinicalAgentPage() {
  const { user, isTrainer, isSuperAdmin } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Restrict to Trainer or SuperAdmin
  if (!isTrainer && !isSuperAdmin) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Acceso Clínico Restringido
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          La terminal del Director Clínico IA está reservada para entrenadores acreditados y directores de VitalFit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Director Clínico IA"
        subtitle="Terminal médica, metabólica y biomecánica con supervisión activa de tus atletas"
      />

      {/* Top Banner with high-ticket badges */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500 dark:text-primary-400">
                Red Neuronal Omnisciente Activa
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Sincronizada con registros de adherencia, bio-readiness de 4 pilares, pesos y alertas biomecánicas en vivo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ● Motor 1 & 3 Enlazados
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-primary-500/30 bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </div>

      {/* Main Terminal Widget */}
      <ClinicalAgentTerminal
        trainerId={user.id}
        trainerName={user.name}
      />
    </div>
  );
}
