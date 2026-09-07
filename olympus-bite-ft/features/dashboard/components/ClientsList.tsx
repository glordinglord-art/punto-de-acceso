'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { formatCalories, cn } from '@/shared/lib/utils';
import type { ClientOverview } from '../types/dashboard.types';
import { AlertCircle, CheckCircle2, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface ClientsListProps {
  clients: ClientOverview[];
}

type TriageFilter = 'all' | 'urgent' | 'following' | 'optimal';

function getTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `hace ${diffDays}d`;
  if (diffHours > 0) return `hace ${diffHours}h`;
  return diffMin > 0 ? `hace ${diffMin}min` : 'ahora';
}

export function ClientsList({ clients }: ClientsListProps) {
  const [filter, setFilter] = useState<TriageFilter>('all');

  // Categorize clients into Triage levels
  const { urgent, following, optimal } = useMemo(() => {
    const u: ClientOverview[] = [];
    const f: ClientOverview[] = [];
    const o: ClientOverview[] = [];

    clients.forEach((c) => {
      if (!c.hasActiveRoutine || c.mealsToday === 0) {
        u.push(c);
      } else if (c.mealsToday === 1) {
        f.push(c);
      } else {
        o.push(c);
      }
    });

    return { urgent: u, following: f, optimal: o };
  }, [clients]);

  const filteredClients = useMemo(() => {
    switch (filter) {
      case 'urgent':
        return urgent;
      case 'following':
        return following;
      case 'optimal':
        return optimal;
      case 'all':
      default:
        return clients;
    }
  }, [filter, clients, urgent, following, optimal]);

  if (clients.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardTitle>Triage de Atletas</CardTitle>
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="font-display text-3xl uppercase text-white/30">0 clientes</p>
          <p className="mt-3 text-sm text-slate-400">Comparte tu código de invitación para empezar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Triage Clínico & Táctico</CardTitle>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              En Vivo
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Priorización automática por semáforos de adherencia
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 self-start sm:self-auto">
          {clients.length} atletas
        </span>
      </div>

      {/* ── Triage Filter Tabs (Semáforos) ── */}
      <div className="mt-3.5 flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            filter === 'all'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <span>Todos</span>
          <span className="rounded-md bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums">
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('urgent')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            filter === 'urgent'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10'
          )}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Atención Urgente</span>
          <span className="rounded-md bg-rose-500/20 px-1.5 py-0.2 text-[10px] tabular-nums font-black text-rose-200">
            {urgent.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('following')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            filter === 'following'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
          )}
        >
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>En Seguimiento</span>
          <span className="rounded-md bg-amber-500/20 px-1.5 py-0.2 text-[10px] tabular-nums">
            {following.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('optimal')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            filter === 'optimal'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10'
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>En Órbita</span>
          <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[10px] tabular-nums">
            {optimal.length}
          </span>
        </button>
      </div>

      {/* ── Client Cards List ── */}
      <div className="mt-3 divide-y divide-white/5 overflow-y-auto max-h-[420px] pr-1">
        {filteredClients.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40">
            Ningún atleta en este estado de triage
          </div>
        ) : (
          filteredClients.map((client, i) => {
            const hasActivity = client.mealsToday > 0;
            const isUrgent = !client.hasActiveRoutine || client.mealsToday === 0;
            const isOptimal = client.hasActiveRoutine && client.mealsToday >= 2;
            const timeAgo = client.lastMealTime ? getTimeAgo(new Date(client.lastMealTime)) : null;

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'flex items-center gap-3 rounded-[20px] px-3.5 py-3 transition-colors border',
                  isUrgent
                    ? 'border-rose-500/15 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                    : isOptimal
                    ? 'border-emerald-500/10 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]'
                    : 'border-transparent hover:bg-white/4'
                )}
              >
                {/* Avatar + activity dot */}
                <div className="relative shrink-0">
                  <Avatar name={client.name} src={client.avatarUrl} />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950',
                      isUrgent
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : isOptimal
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : hasActivity
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                    )}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">{client.name}</p>
                    {isUrgent && (
                      <span className="shrink-0 rounded-md bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-black text-rose-300 uppercase">
                        {client.mealsToday === 0 ? 'Sin comidas' : 'Sin rutina'}
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                    {hasActivity ? (
                      <>
                        <span className="text-white/60">
                          {client.mealsToday} comida{client.mealsToday > 1 ? 's' : ''}
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="font-semibold text-amber-300">
                          {formatCalories(client.caloriesToday)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        {timeAgo ? `Última actividad ${timeAgo}` : 'Sin actividad hoy'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side status badges */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {client.hasActiveRoutine ? (
                    <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Rutina ✓
                    </span>
                  ) : (
                    <span className="rounded-lg bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Sin rutina
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                    {client.mealsThisWeek} meals/sem.
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
