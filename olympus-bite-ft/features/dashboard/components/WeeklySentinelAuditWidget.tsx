'use client';

import { useMemo, useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Users,
  Droplets,
  Moon,
  Dumbbell,
  Scale,
  FileText,
  Lock,
} from 'lucide-react';
import type { User } from '@/shared/types/common.types';
import type { ClientOverview } from '../types/dashboard.types';
import { cn, getLocalDateString } from '@/shared/lib/utils';

interface WeeklySentinelAuditWidgetProps {
  athletes: User[];
  overviews: ClientOverview[];
  trainerId?: string;
  onOpenFicha: (
    athlete: User,
    tab: 'profile' | 'compliance' | 'assessments' | 'progress' | 'ai',
  ) => void;
}

interface SentinelAlertItem {
  athlete: User;
  score: number;
  status: 'critical' | 'warning' | 'optimal';
  missingPillars: string[];
  waterTodayLiters: number;
  waterTargetLiters: number;
  mealsToday: number;
  lastSleepText: string;
  sleepOk: boolean;
  lastWeighInText: string;
  hasActiveRoutine: boolean;
}

export function WeeklySentinelAuditWidget({
  athletes,
  overviews,
  trainerId,
  onOpenFicha,
}: WeeklySentinelAuditWidgetProps) {
  const [filter, setFilter] = useState<'issues' | 'all'>('issues');
  const todayStr = getLocalDateString();

  const auditItems = useMemo<SentinelAlertItem[]>(() => {
    const nowMs = Date.now();
    return athletes.map((athlete) => {
      const ov = overviews.find((o) => o.id === athlete.id);
      const anamnesis =
        athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
          ? (athlete.anamnesisData as any)
          : {};
      const pact = anamnesis.heroPact || {};
      const missing: string[] = [];
      let points = 100;

      // 1. Pacto de 120 Días y Rutina Activa
      const hasPact = Boolean(pact?.objectives?.biometric);
      if (!hasPact) {
        missing.push('Sin Pacto de 4 Metas configurado');
        points -= 25;
      }

      const hasRoutine = ov ? ov.hasActiveRoutine : true;
      if (!hasRoutine && athlete.id !== trainerId) {
        missing.push('Sin rutina activa asignada');
        points -= 30;
      }

      // 2. Pilar Agua y Comidas de Hoy
      const waterTargetLiters =
        Number(pact?.pillars?.nutrition?.waterLitersTarget) || 3.0;
      const waterLogs = Array.isArray(anamnesis.waterLogs)
        ? anamnesis.waterLogs
        : [];
      const todayWater = waterLogs.find((w: any) => w.date === todayStr);
      const waterTodayLiters = todayWater ? Number(todayWater.liters) : 0;
      const mealsToday = ov?.mealsToday ?? 0;

      if (waterTodayLiters === 0 && mealsToday === 0) {
        missing.push('Sin registro de agua ni comidas hoy');
        points -= 20;
      } else if (waterTodayLiters < waterTargetLiters * 0.5) {
        missing.push(
          `Agua baja hoy (${waterTodayLiters}L de ${waterTargetLiters}L)`,
        );
        points -= 10;
      }

      // 3. Pilar Sueño y Regularidad (±1h)
      const sleepLogs = Array.isArray(anamnesis.sleepLogs)
        ? anamnesis.sleepLogs
        : [];
      const lastSleep =
        sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : null;
      let lastSleepText = 'Sin registro';
      let sleepOk = false;

      if (!lastSleep) {
        missing.push('Sin registro de horario de sueño (±1h)');
        points -= 15;
      } else {
        lastSleepText = `${lastSleep.hoursSlept}h (${lastSleep.bedtime}-${lastSleep.wakeTime})`;
        sleepOk = Boolean(lastSleep.withinOneHourWindow);
        if (!lastSleep.withinOneHourWindow) {
          missing.push(
            `Desfase circadiano >1h en sueño (${lastSleep.bedtime}-${lastSleep.wakeTime})`,
          );
          points -= 15;
        }
      }

      // 4. Pesaje Semanal en Ayunas (+0.25 / -0.50 kg/sem)
      const weighIns = Array.isArray(anamnesis.fastedWeighIns)
        ? anamnesis.fastedWeighIns
        : [];
      const lastWeighIn =
        weighIns.length > 0 ? weighIns[weighIns.length - 1] : null;
      let lastWeighInText = athlete.weight ? `${athlete.weight} kg` : '—';

      if (!lastWeighIn) {
        missing.push('Falta pesaje semanal en ayunas');
        points -= 15;
      } else {
        lastWeighInText = `${lastWeighIn.weightKg} kg (${lastWeighIn.date})`;
        const daysSinceWeighIn = Math.floor(
          (nowMs - new Date(lastWeighIn.date).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceWeighIn > 7) {
          missing.push(`Hace ${daysSinceWeighIn} días no registra peso en ayunas`);
          points -= 15;
        }
      }

      const finalScore = Math.max(0, points);
      const status: 'critical' | 'warning' | 'optimal' =
        finalScore < 65 ? 'critical' : finalScore < 85 ? 'warning' : 'optimal';

      return {
        athlete,
        score: finalScore,
        status,
        missingPillars: missing,
        waterTodayLiters,
        waterTargetLiters,
        mealsToday,
        lastSleepText,
        sleepOk,
        lastWeighInText,
        hasActiveRoutine: hasRoutine,
      };
    });
  }, [athletes, overviews, todayStr, trainerId]);

  const flaggedItems = useMemo(
    () => auditItems.filter((i) => i.status !== 'optimal'),
    [auditItems],
  );
  const optimalCount = auditItems.length - flaggedItems.length;
  const visibleItems = filter === 'issues' ? flaggedItems : auditItems;

  const createWhatsAppLink = (item: SentinelAlertItem) => {
    const rawPhone = item.athlete.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const alertSummary =
      item.missingPillars.slice(0, 2).join(' y ') || 'revisar tus 3 pilares';
    const msg = `¡Hola ${item.athlete.name.split(' ')[0]}! Te escribo desde Punto de Inflexión ⚡. Vi en nuestro Centinela de hoy que tenemos pendiente: ${alertSummary}. Recuerda que cada día cuenta en tus 120 días. ¿Cómo vas hoy con tu agua, entreno y hora de sueño?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#11131a] p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15 text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                Centinela en Vivo · 3 Pilares y 120 Días
              </span>
            </div>
            <h3 className="mt-0.5 text-base sm:text-lg font-condensed font-black uppercase tracking-wide text-white">
              Detector de Huecos en Entreno, Agua, Sueño (±1h) y Pesaje
            </h3>
          </div>
        </div>

        {/* Selector de filtro */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setFilter('issues')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              filter === 'issues'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white',
            )}
          >
            Requieren Atención ({flaggedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              filter === 'all'
                ? 'bg-white/15 text-white'
                : 'text-neutral-400 hover:text-white',
            )}
          >
            Todos ({auditItems.length})
          </button>
        </div>
      </div>

      {/* Resumen Rápido en 3 Cajas */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block">
            Fichas Auditadas
          </span>
          <span className="text-xl font-black text-white">
            {auditItems.length}
          </span>
        </div>
        <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block">
            3 Pilares al Día (≥85%)
          </span>
          <span className="text-xl font-black text-emerald-400">
            {optimalCount}
          </span>
        </div>
        <div className="rounded-2xl bg-red-500/[0.06] border border-red-500/25 p-3">
          <span className="text-[10px] font-bold uppercase text-red-400 block">
            Con Huecos Hoy
          </span>
          <span className="text-xl font-black text-red-400">
            {flaggedItems.length}
          </span>
        </div>
      </div>

      {/* Lista de Alertas Accionables */}
      <div className="mt-4 space-y-2.5">
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold uppercase text-white">
              ¡Todos tus atletas están al día con sus 3 Pilares!
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Agua, comidas, regularidad de sueño (±1h) y pesaje en ayunas en orden.
            </p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const isSelf = item.athlete.id === trainerId;
            return (
              <div
                key={item.athlete.id}
                className={cn(
                  'flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all',
                  item.status === 'critical'
                    ? 'border-red-500/30 bg-red-500/[0.04]'
                    : item.status === 'warning'
                      ? 'border-amber-500/25 bg-amber-500/[0.04]'
                      : 'border-emerald-500/20 bg-emerald-500/[0.03]',
                )}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {item.athlete.name}
                    </span>
                    {isSelf && (
                      <span className="rounded-md bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-300">
                        🏋️ Tu Ficha
                      </span>
                    )}
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[10px] font-black uppercase',
                        item.status === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300',
                      )}
                    >
                      Cumplimiento: {item.score}%
                    </span>
                  </div>

                  {/* Huecos detectados */}
                  {item.missingPillars.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.missingPillars.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg bg-black/40 border border-white/10 px-2 py-0.5 text-[11px] text-amber-200"
                        >
                          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mini telemetría de los 3 pilares */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      Agua hoy: {item.waterTodayLiters}L / {item.waterTargetLiters}L
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      Sueño: {item.lastSleepText}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-400" />
                      Ayunas: {item.lastWeighInText}
                    </span>
                  </div>
                </div>

                {/* Acciones Directas a 1 Clic */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenFicha(item.athlete, 'profile')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-2 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>Ficha Técnica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenFicha(item.athlete, 'ai')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-200 transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Memoria IA</span>
                  </button>

                  {item.athlete.phone && !isSelf && (
                    <a
                      href={createWhatsAppLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-300 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
