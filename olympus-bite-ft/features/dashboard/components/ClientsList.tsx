'use client';

import { motion } from 'framer-motion';
import { Card, CardTitle } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { formatCalories } from '@/shared/lib/utils';
import type { ClientOverview } from '../types/dashboard.types';

interface ClientsListProps {
  clients: ClientOverview[];
}

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
  if (clients.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardTitle>Clientes</CardTitle>
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="font-display text-3xl uppercase text-white/30">0 clientes</p>
          <p className="mt-3 text-sm text-slate-400">Comparte tu código de invitación para empezar</p>
        </div>
      </Card>
    );
  }

  const sorted = [...clients].sort(
    (a, b) => b.mealsToday - a.mealsToday || b.caloriesToday - a.caloriesToday,
  );

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-4">
        <CardTitle>Resumen de clientes</CardTitle>
        <span className="shrink-0 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {clients.length} activos
        </span>
      </div>

      <div className="mt-2 divide-y divide-white/5 overflow-y-auto max-h-[420px] pr-2">
        {sorted.map((client, i) => {
          const hasActivity = client.mealsToday > 0;
          const timeAgo = client.lastMealTime ? getTimeAgo(new Date(client.lastMealTime)) : null;

          return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-[20px] px-3 py-3 transition-colors hover:bg-white/4 border border-transparent hover:border-white/8"
              >
              {/* Avatar + activity dot */}
              <div className="relative shrink-0">
                <Avatar name={client.name} src={client.avatarUrl} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                    hasActivity ? 'bg-primary-400' : 'bg-slate-600'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">{client.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  {hasActivity ? (
                    <>
                      <span className="text-xs text-slate-400">
                        {client.mealsToday} comida{client.mealsToday > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-semibold text-amber-300">
                        {formatCalories(client.caloriesToday)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {timeAgo ? `Última actividad ${timeAgo}` : 'Sin actividad hoy'}
                    </span>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {client.hasActiveRoutine ? (
                  <Badge variant="success">Rutina ✓</Badge>
                ) : (
                  <Badge variant="warning">Sin rutina</Badge>
                )}
                <span className="text-[10px] text-slate-500">{client.mealsThisWeek} esta sem.</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
