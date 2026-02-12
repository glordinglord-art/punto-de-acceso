'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { RoutineCard } from '@/features/routines/components/RoutineCard';
import { RoutineDayDetail } from '@/features/routines/components/RoutineDayDetail';
import { WeeklyTracker } from '@/features/routines/components/WeeklyTracker';
import { RoutineBuilder } from '@/features/routines/components/RoutineBuilder';
import { RoutineCalendar } from '@/features/routines/components/RoutineCalendar';
import { ClientRoutinesView } from '@/features/routines/components/ClientRoutinesView';
import { routinesService } from '@/features/routines/services/routines.service';
import { clientsService } from '@/features/clients/services/clients.service';
import type { Routine, WorkoutLog } from '@/features/routines/types/routines.types';
import type { User } from '@/shared/types/common.types';
import { cn } from '@/shared/lib/utils';

type ViewMode = 'overview' | 'detail' | 'tracking' | 'create' | 'edit';
type OverviewTab = 'cards' | 'calendar';

export default function RoutinesPage() {
  const { user, isTrainer } = useAuth();

  if (!isTrainer) {
    return <ClientRoutinesView />;
  }

  return <TrainerRoutinesPage />;
}

function TrainerRoutinesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>('overview');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewTab, setOverviewTab] = useState<OverviewTab>('calendar');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [routinesRes, clientsRes] = await Promise.all([
        routinesService.getByTrainer(user.id).catch(() => null),
        clientsService.getByTrainer(user.id).catch(() => null),
      ]);
      setRoutines(routinesRes?.data ?? []);
      setClients(clientsRes?.data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoutineClick = async (routine: Routine) => {
    setSelectedRoutine(routine);
    setView('detail');
    // Load workout logs for this routine
    if (user) {
      try {
        const res = await routinesService.getWorkoutLogs(routine.id, routine.clientId);
        setLogs(res.data ?? []);
      } catch {
        setLogs([]);
      }
    }
  };

  const handleCreateRoutine = async (data: {
    name: string;
    description: string;
    clientId: string;
    weekCount: number;
    days: {
      dayNumber: number;
      focusArea: string;
      isRestDay: boolean;
      restDayNote: string;
      exercises: {
        name: string;
        muscleGroup: string;
        sets: number;
        reps: string;
        restSeconds: number;
        observations: string;
      }[];
    }[];
  }) => {
    if (!user) return;
    try {
      await routinesService.create(user.id, data);
      await loadData();
      setView('overview');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creando rutina');
    }
  };

  const handleUpdateRoutine = async (data: {
    name: string;
    description: string;
    clientId: string;
    weekCount: number;
    days: {
      dayNumber: number;
      focusArea: string;
      isRestDay: boolean;
      restDayNote: string;
      exercises: {
        name: string;
        muscleGroup: string;
        sets: number;
        reps: string;
        restSeconds: number;
        observations: string;
      }[];
    }[];
  }) => {
    if (!selectedRoutine) return;
    try {
      await routinesService.update(selectedRoutine.id, data);
      await loadData();
      setView('overview');
      setSelectedRoutine(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error actualizando rutina');
    }
  };

  const handleDeleteRoutine = async () => {
    if (!selectedRoutine) return;
    setDeleting(true);
    try {
      await routinesService.remove(selectedRoutine.id);
      await loadData();
      setShowDeleteModal(false);
      setView('overview');
      setSelectedRoutine(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando rutina');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogSave = async (exerciseId: string, weekNumber: number, weight: number, repsDone: string) => {
    if (!user || !selectedRoutine) return;
    try {
      await routinesService.logWorkout(selectedRoutine.id, selectedRoutine.clientId, {
        exerciseId,
        weekNumber,
        weight,
        repsDone,
      });
      // Reload logs
      const res = await routinesService.getWorkoutLogs(selectedRoutine.id, selectedRoutine.clientId);
      setLogs(res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error guardando registro');
    }
  };

  const handleBack = () => {
    if (view === 'tracking') {
      setView('detail');
    } else {
      setView('overview');
      setSelectedRoutine(null);
      setLogs([]);
    }
  };

  // Resolve client name for a routine
  const getClientName = (clientId: string) => {
    const c = clients.find((cl) => cl.id === clientId);
    return c?.name ?? 'Cliente';
  };

  const clientNames = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [clients]);

  /* ─── Create view ─────────────────────────── */
  if (view === 'create') {
    return (
      <>
        <Header
          title="Nueva Rutina"
          subtitle="Crea una rutina personalizada para tu cliente"
        />
        <RoutineBuilder
          clients={clients}
          onSubmit={handleCreateRoutine}
          onCancel={() => setView('overview')}
        />
      </>
    );
  }

  /* ─── Edit view ───────────────────────────── */
  if (view === 'edit' && selectedRoutine) {
    return (
      <>
        <Header
          title="Editar Rutina"
          subtitle={`Editando: ${selectedRoutine.name}`}
        />
        <RoutineBuilder
          clients={clients}
          onSubmit={handleUpdateRoutine}
          onCancel={() => setView('detail')}
          initialData={selectedRoutine}
        />
      </>
    );
  }

  /* ─── Overview ────────────────────────────── */
  if (view === 'overview') {
    return (
      <>
        <Header
          title="Rutinas"
          subtitle={loading ? 'Cargando...' : `${routines.length} rutinas creadas`}
          action={
            <Button size="md" onClick={() => setView('create')}>
              + Nueva rutina
            </Button>
          }
        />

        {/* Tab toggle: Calendario / Tarjetas */}
        {!loading && routines.length > 0 && (
          <div className="mb-5 flex items-center gap-1 rounded-xl bg-neutral-100 p-1 w-fit dark:bg-neutral-800">
            {[
              { key: 'calendar' as OverviewTab, label: '📅 Calendario' },
              { key: 'cards' as OverviewTab, label: '🗂️ Tarjetas' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setOverviewTab(tab.key)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
                  overviewTab === tab.key
                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : routines.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <span className="text-3xl">💪</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Sin rutinas aún
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Crea la primera rutina personalizada para uno de tus clientes.
            </p>
            <Button onClick={() => setView('create')} className="mt-6">
              + Crear primera rutina
            </Button>
          </div>
        ) : overviewTab === 'calendar' ? (
          <RoutineCalendar routines={routines} clientNames={clientNames} trainerId={user?.id} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine) => (
              <div key={routine.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {getClientName(routine.clientId)}
                  </span>
                </div>
                <RoutineCard
                  routine={routine}
                  onClick={() => handleRoutineClick(routine)}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  /* ─── Detail ──────────────────────────────── */
  if (view === 'detail' && selectedRoutine) {
    return (
      <>
        <Header
          title={selectedRoutine.name}
          subtitle={`${selectedRoutine.days.filter((d) => !d.isRestDay).length} días de entrenamiento · ${selectedRoutine.weekCount} semanas · ${getClientName(selectedRoutine.clientId)}`}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" size="md" onClick={handleBack}>
                ← Volver
              </Button>
              <Button size="md" onClick={() => setView('tracking')}>
                📊 Seguimiento
              </Button>
            </div>
          }
        />

        {selectedRoutine.description && (
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 -mt-4">
            {selectedRoutine.description}
          </p>
        )}

        {/* Edit / Delete action bar */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setView('edit')}
          >
            ✏️ Editar rutina
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Eliminar
          </Button>
        </div>

        <div className="space-y-4">
          {selectedRoutine.days.map((day) => (
            <RoutineDayDetail key={day.id} day={day} />
          ))}
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                ¿Eliminar rutina?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Se eliminará <strong>&quot;{selectedRoutine.name}&quot;</strong> con todos sus días y ejercicios. Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  loading={deleting}
                  onClick={handleDeleteRoutine}
                >
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ─── Tracking ────────────────────────────── */
  if (view === 'tracking' && selectedRoutine) {
    return (
      <>
        <Header
          title="Seguimiento"
          subtitle={`${selectedRoutine.name} · ${getClientName(selectedRoutine.clientId)}`}
          action={
            <Button variant="ghost" size="md" onClick={handleBack}>
              ← Volver a rutina
            </Button>
          }
        />
        <WeeklyTracker
          days={selectedRoutine.days}
          weekCount={selectedRoutine.weekCount}
          logs={logs}
          onLogSave={handleLogSave}
        />
      </>
    );
  }

  return null;
}
