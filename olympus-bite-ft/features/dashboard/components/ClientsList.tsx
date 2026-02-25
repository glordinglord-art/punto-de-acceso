import { Card, CardTitle } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { formatCalories } from '@/shared/lib/utils';
import type { ClientOverview } from '../types/dashboard.types';

interface ClientsListProps {
  clients: ClientOverview[];
}

export function ClientsList({ clients }: ClientsListProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardTitle>Clientes</CardTitle>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-4xl mb-3">👥</span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No tienes clientes aún
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Comparte tu código de invitación para empezar
          </p>
        </div>
      </Card>
    );
  }

  // Ordenar: más comidas hoy primero
  const sorted = [...clients].sort((a, b) => b.mealsToday - a.mealsToday || b.caloriesToday - a.caloriesToday);

  return (
    <Card padding="sm">
      <div className="px-2 pt-2 pb-1 flex items-center justify-between">
        <CardTitle>Resumen de clientes</CardTitle>
        <span className="text-xs text-neutral-400 font-medium shrink-0">{clients.length} activos</span>
      </div>

      <div className="mt-2 divide-y divide-neutral-50 dark:divide-neutral-800">
        {sorted.map((client) => {
          const hasActivity = client.mealsToday > 0;
          const timeSinceLastMeal = client.lastMealTime
            ? getTimeAgo(new Date(client.lastMealTime))
            : null;

          return (
            <div
              key={client.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800/50"
            >
              <div className="relative">
                <Avatar name={client.name} src={client.avatarUrl} />
                {/* Activity indicator dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 ${
                    hasActivity ? 'bg-primary-400' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {client.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {hasActivity ? (
                    <>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {client.mealsToday} comida{client.mealsToday > 1 ? 's' : ''}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-600">·</span>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {formatCalories(client.caloriesToday)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      {timeSinceLastMeal ? `Última ${timeSinceLastMeal}` : 'Sin actividad'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {client.hasActiveRoutine ? (
                  <Badge variant="success">Rutina ✓</Badge>
                ) : (
                  <Badge variant="warning">Sin rutina</Badge>
                )}
                <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                  {client.mealsThisWeek} sem.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `hace ${diffDays}d`;
  if (diffHours > 0) return `hace ${diffHours}h`;
  const diffMin = Math.floor(diffMs / 60000);
  return diffMin > 0 ? `hace ${diffMin}min` : 'ahora';
}
