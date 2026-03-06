'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { MealDetail } from './MealDetail';
import { mealsService } from '../services/meals.service';
import { MEAL_TYPES } from '@/shared/lib/constants';
import { formatCalories, formatTime, cn, getLocalDateString, localDateToRange } from '@/shared/lib/utils';
import type { Meal, ClientMealsGroup } from '../types/meals.types';

interface ClientMealsViewProps {
  trainerId: string;
}

export function ClientMealsView({ trainerId }: ClientMealsViewProps) {
  const [groups, setGroups] = useState<ClientMealsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = localDateToRange(selectedDate);
      const res = await mealsService.getByTrainerClients(trainerId, start, end);
      setGroups(res.data ?? []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [trainerId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ─── Date nav ─── */
  const today = getLocalDateString();
  const isToday = selectedDate === today;

  const changeDate = (offset: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + offset);
    setSelectedDate(getLocalDateString(dt));
  };

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === today) return 'Hoy';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === getLocalDateString(yesterday)) return 'Ayer';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const clientsWithMeals = groups.filter((g) => g.meals.length > 0).length;
    const totalMeals = groups.reduce((s, g) => s + g.meals.length, 0);
    const totalCals = groups.reduce((s, g) => s + g.totals.calories, 0);
    return { clientsWithMeals, totalMeals, totalCals };
  }, [groups]);

  const handleViewMeal = (meal: Meal, clientName: string) => {
    setSelectedMeal(meal);
    setSelectedClientName(clientName);
  };

  return (
    <>
      {/* Date nav */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button
          onClick={() => changeDate(-1)}
          className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setSelectedDate(today)}
          className={cn(
            'rounded-xl px-4 py-1.5 text-sm font-semibold transition-all',
            isToday
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300',
          )}
        >
          {formatDateLabel(selectedDate)}
        </button>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30"
        >
          <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <Card className="mb-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{stats.clientsWithMeals}</p>
            <p className="text-xs text-neutral-500">Clientes activos</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{stats.totalMeals}</p>
            <p className="text-xs text-neutral-500">Comidas</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{stats.totalCals.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">kcal totales</p>
          </div>
        </div>
      </Card>

      {/* Client list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
          <span className="text-3xl">👥</span>
          <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white">Sin clientes</h3>
          <p className="mt-1 text-sm text-neutral-500">No tienes clientes asignados aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const hasMeals = group.meals.length > 0;
            const isExpanded = expandedClient === group.clientId;

            return (
              <div key={group.clientId}>
                <Card
                  hover
                  className={cn('cursor-pointer', !hasMeals && 'opacity-60')}
                  onClick={() => setExpandedClient(isExpanded ? null : group.clientId)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      {group.clientAvatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={group.clientAvatarUrl} alt={group.clientName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-neutral-400">
                          {group.clientName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {group.clientName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {hasMeals ? (
                          <>
                            <span>{group.meals.length} comida{group.meals.length > 1 ? 's' : ''}</span>
                            <span>{formatCalories(group.totals.calories)}</span>
                            <span className="text-blue-600">P: {group.totals.protein}g</span>
                          </>
                        ) : (
                          <span>Sin registros hoy</span>
                        )}
                      </div>
                    </div>

                    {hasMeals && (
                      <svg
                        className={cn('h-5 w-5 text-neutral-400 transition-transform', isExpanded && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </Card>

                {/* Expanded meals */}
                {isExpanded && hasMeals && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-neutral-100 pl-4 dark:border-neutral-800">
                    {group.meals.map((meal) => {
                      const mealTypeInfo = MEAL_TYPES[meal.mealType];
                      return (
                        <Card
                          key={meal.id}
                          hover
                          padding="sm"
                          className="cursor-pointer"
                          onClick={() => handleViewMeal(meal, group.clientName)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-lg dark:bg-neutral-800 overflow-hidden">
                              {meal.imageUrl && meal.imageUrl !== 'uploaded' ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={meal.imageUrl} alt={meal.name} className="h-full w-full object-cover" />
                              ) : (
                                <span>{mealTypeInfo.icon}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {meal.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-neutral-500">
                                <span>{formatCalories(meal.calories)}</span>
                                <span className="text-blue-600">P: {meal.protein}g</span>
                                <span className="text-amber-600">C: {meal.carbs}g</span>
                                <span className="text-rose-600">G: {meal.fat}g</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge>{mealTypeInfo.label}</Badge>
                              <p className="text-[11px] text-neutral-400 mt-0.5">{formatTime(meal.date)}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Meal Detail Modal */}
      <Modal
        isOpen={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        title={`${selectedClientName} · ${selectedMeal?.name || ''}`}
        size="lg"
        footer={
          <Button variant="ghost" fullWidth onClick={() => setSelectedMeal(null)}>
            Cerrar
          </Button>
        }
      >
        {selectedMeal && (
          <MealDetail
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
            onDelete={() => {}}
          />
        )}
      </Modal>
    </>
  );
}
