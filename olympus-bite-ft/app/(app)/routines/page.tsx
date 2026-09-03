"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { RoutineCard } from "@/features/routines/components/RoutineCard";
import { RoutineDayDetail } from "@/features/routines/components/RoutineDayDetail";
import { WeeklyTracker } from "@/features/routines/components/WeeklyTracker";
import { RoutineBuilder, RoutineForm } from "@/features/routines/components/RoutineBuilder";
import { RoutineCalendar } from "@/features/routines/components/RoutineCalendar";
import { ClientRoutinesView } from "@/features/routines/components/ClientRoutinesView";
import { RoutineTemplateModal } from "@/features/routines/components/RoutineTemplateModal";
import { CustomTemplatesView } from "@/features/routines/components/CustomTemplatesView";
import type { RoutinePreset } from "@/features/routines/data/preset-routines";
import { routinesService } from "@/features/routines/services/routines.service";
import { clientsService } from "@/features/clients/services/clients.service";
import type {
  Routine,
  WorkoutLog,
} from "@/features/routines/types/routines.types";
import type { User } from "@/shared/types/common.types";
import { cn } from "@/shared/lib/utils";
import { Sparkles } from "lucide-react";

type ViewMode = "overview" | "detail" | "tracking" | "create" | "edit" | "myRoutine";
type OverviewTab = "calendar" | "cards" | "templates";

import { useRouter } from 'next/navigation';

export default function RoutinesPage() {
  const { activeMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (activeMode === 'superadmin') {
      router.push('/admin');
    }
  }, [activeMode, router]);

  if (activeMode === 'superadmin') return null;

  if (activeMode === 'client') {
    return <ClientRoutinesView />;
  }

  return <TrainerRoutinesPage />;
}

function TrainerRoutinesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("overview");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewTab, setOverviewTab] = useState<OverviewTab>("calendar");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showGlobalTemplates, setShowGlobalTemplates] = useState(false);
  const [preselectedPreset, setPreselectedPreset] = useState<RoutinePreset | null>(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "templates") {
        setOverviewTab("templates");
      } else if (tabParam === "cards") {
        setOverviewTab("cards");
      } else if (tabParam === "calendar") {
        setOverviewTab("calendar");
      }
    }
  }, []);

  const handleRoutineClick = async (routine: Routine) => {
    setSelectedRoutine(routine);
    setView("detail");
    // Load workout logs for this routine
    if (user) {
      try {
        const res = await routinesService.getWorkoutLogs(
          routine.id,
          routine.clientId,
        );
        setLogs(res.data ?? []);
      } catch {
        setLogs([]);
      }
    }
  };

  const handleCreateRoutine = async (data: RoutineForm) => {
    if (!user) return;
    try {
      await routinesService.create(user.id, data);
      await loadData();
      setView("overview");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creando rutina");
    }
  };

  const handleUpdateRoutine = async (data: RoutineForm) => {
    if (!selectedRoutine) return;
    try {
      await routinesService.update(selectedRoutine.id, data);
      await loadData();
      setView("overview");
      setSelectedRoutine(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error actualizando rutina");
    }
  };

  const handleDeleteRoutine = async () => {
    if (!selectedRoutine) return;
    setDeleting(true);
    try {
      await routinesService.remove(selectedRoutine.id);
      await loadData();
      setShowDeleteModal(false);
      setView("overview");
      setSelectedRoutine(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error eliminando rutina");
    } finally {
      setDeleting(false);
    }
  };

  const handleEvaluateRoutine = async (isFavorable: boolean) => {
    if (!selectedRoutine) return;
    try {
      await routinesService.evaluateFavorable(selectedRoutine.id, isFavorable);
      setSelectedRoutine({ ...selectedRoutine, isFavorable });
      setRoutines(
        routines.map((r) =>
          r.id === selectedRoutine.id ? { ...r, isFavorable } : r,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error evaluando rutina");
    }
  };

  const handleBack = () => {
    if (view === "tracking") {
      setView("detail");
    } else {
      setView("overview");
      setSelectedRoutine(null);
      setLogs([]);
    }
  };

  // Resolve client name for a routine
  const getClientName = (clientId: string) => {
    if (user && clientId === user.id) return "Yo";
    const c = clients.find((cl) => cl.id === clientId);
    return c?.name ?? "Cliente";
  };

  const clientNames = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => {
      map[c.id] = c.name;
    });
    if (user) map[user.id] = "Yo";
    return map;
  }, [clients, user]);

  /* ─── Create view ─────────────────────────── */
  if (view === "create") {
    return (
      <>
        <Header
          title="Nueva Rutina"
          subtitle="Crea una rutina personalizada para tu cliente o usa una plantilla"
        />
        <RoutineBuilder
          clients={clients}
          trainerId={user?.id}
          onSubmit={handleCreateRoutine}
          onCancel={() => {
            setPreselectedPreset(null);
            setView("overview");
          }}
          initialPreset={preselectedPreset}
        />
      </>
    );
  }

  /* ─── Edit view ───────────────────────────── */
  if (view === "edit" && selectedRoutine) {
    return (
      <>
        <Header
          title="Editar Rutina"
          subtitle={`Editando: ${selectedRoutine.name}`}
        />
        <RoutineBuilder
          clients={clients}
          trainerId={user?.id}
          onSubmit={handleUpdateRoutine}
          onCancel={() => setView("detail")}
          initialData={selectedRoutine}
        />
      </>
    );
  }

  /* ─── Overview ────────────────────────────── */
  if (view === "overview") {
    return (
      <>
        <Header
          title="Rutinas"
          subtitle={
            loading ? "Cargando..." : `${routines.length} rutinas creadas`
          }
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOverviewTab("templates")}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 border",
                  overviewTab === "templates"
                    ? "bg-red-600 text-white border-red-500 shadow-red-600/30"
                    : "bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border-white/10",
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Personalizadas</span>
              </button>
              <Button
                size="md"
                onClick={() => {
                  setPreselectedPreset(null);
                  setView("create");
                }}
              >
                + Nueva rutina
              </Button>
            </div>
          }
        />

        {/* Tab toggle: Calendario / Rutinas Clientes / Personalizadas */}
        <div className="mb-5 flex w-fit items-center gap-1 rounded-full border border-white/8 bg-white/5 p-1 overflow-x-auto max-w-full">
          {[
            { key: "calendar" as OverviewTab, label: "📅 Calendario" },
            { key: "cards" as OverviewTab, label: `🗂️ Rutinas Clientes (${routines.length})` },
            { key: "templates" as OverviewTab, label: "⭐ Personalizadas (Plantillas)" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOverviewTab(tab.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0",
                overviewTab === tab.key
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {overviewTab === "templates" ? (
          <CustomTemplatesView
            clients={clients}
            trainerId={user?.id}
            onAssignTemplate={async (clientId, routineName, template) => {
              if (!user) return;
              const routineForm: RoutineForm = {
                name: routineName,
                description: template.description,
                clientId,
                weekCount: template.weekCount,
                days: template.days,
              };
              await handleCreateRoutine(routineForm);
              setOverviewTab("cards");
            }}
          />
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[24px] bg-white/6"
              />
            ))}
          </div>
        ) : routines.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <span className="text-3xl">💪</span>
            </div>
            <h3 className="text-lg font-semibold text-white">
              Sin rutinas asignadas aún
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Crea una rutina desde cero o asigna una plantilla personalizada a tus alumnos.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setView("create")}>
                + Crear desde cero
              </Button>
              <button
                type="button"
                onClick={() => setOverviewTab("templates")}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                ⭐ Ver Plantillas Personalizadas
              </button>
            </div>
          </div>
        ) : overviewTab === "calendar" ? (
          <RoutineCalendar
            routines={routines}
            clientNames={clientNames}
            trainerId={user?.id}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine) => (
              <div key={routine.id} className="relative">
                <div className="absolute -right-2 -top-2 z-10">
                  <span className="inline-block rounded-full border border-white/8 bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-300 shadow-md">
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

        <RoutineTemplateModal
          isOpen={showGlobalTemplates}
          onClose={() => setShowGlobalTemplates(false)}
          onSelectPreset={(preset) => {
            setPreselectedPreset(preset);
            setShowGlobalTemplates(false);
            setView("create");
          }}
        />
      </>
    );
  }

  /* ─── Detail ──────────────────────────────── */
  if (view === "detail" && selectedRoutine) {
    const isOwnRoutine = user && selectedRoutine.clientId === user.id;
    const totalExercises = selectedRoutine.days.reduce(
      (s, d) => s + d.exercises.length,
      0,
    );
    const totalPossible = totalExercises * selectedRoutine.weekCount;
    const completedLogs = logs.length;
    const progress =
      totalPossible > 0 ? Math.round((completedLogs / totalPossible) * 100) : 0;
    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const lastActivity = sortedLogs[0];

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
              {isOwnRoutine && (
                <Button size="md" onClick={() => setView("myRoutine")}>
                  💪 Hacer entrenamiento
                </Button>
              )}
              <Button size="md" variant={isOwnRoutine ? "ghost" : "primary"} onClick={() => setView("tracking")}>
                📊 Seguimiento
              </Button>
            </div>
          }
        />

        {selectedRoutine.description && (
          <p className="-mt-4 mb-6 text-sm text-slate-400">
            {selectedRoutine.description}
          </p>
        )}

        {/* ── Client Progress Summary ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Progreso
            </p>
            <p className="mt-1 font-display text-4xl font-bold leading-none text-white">
              {progress}%
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-white/8">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress === 100
                    ? "bg-emerald-500"
                    : "bg-linear-to-r from-primary-500 to-primary-400",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Ejercicios
            </p>
            <p className="mt-1 font-display text-4xl font-bold leading-none text-white">
              {completedLogs}
              <span className="ml-1 font-sans text-sm font-medium text-slate-500">
                /{totalPossible}
              </span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">completados</p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Última Actividad
            </p>
            {lastActivity ? (
              <>
                <p className="mt-1.5 text-lg font-bold text-white">
                  {new Date(lastActivity.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Semana {lastActivity.weekNumber}
                </p>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-slate-500">Sin actividad</p>
            )}
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Evaluación
            </p>
            <select
              title="Evaluar rutina"
              value={
                selectedRoutine.isFavorable === true
                  ? "yes"
                  : selectedRoutine.isFavorable === false
                    ? "no"
                    : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "") {
                  handleEvaluateRoutine(val === "yes");
                }
              }}
              className="mt-2 w-full appearance-none rounded-xl border border-white/12 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Pendiente</option>
              <option value="yes">👍 Favorable</option>
              <option value="no">👎 Desfavorable</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button size="sm" variant="ghost" onClick={() => setView("edit")}>
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
          {selectedRoutine.days.map((day) => {
            // Calculate per-day progress
            const dayLogCount = day.isRestDay
              ? 0
              : day.exercises.filter((ex) =>
                  logs.some((l) => l.exerciseId === ex.id),
                ).length;
            const dayTotal = day.isRestDay ? 0 : day.exercises.length * selectedRoutine.weekCount;
            const dayPct = dayTotal > 0 ? Math.round((dayLogCount / dayTotal) * 100) : 0;

            return (
              <div key={day.id}>
                <RoutineDayDetail day={day} />
                {!day.isRestDay && dayTotal > 0 && (
                  <div className="-mt-1 flex items-center gap-3 rounded-b-2xl border border-t-0 border-white/8 bg-white/4 px-6 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Progreso cliente
                    </span>
                    <div className="h-1.5 flex-1 max-w-60 rounded-full bg-white/8">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          dayPct === 100
                            ? "bg-emerald-500"
                            : dayPct > 0
                              ? "bg-primary-500"
                              : "bg-transparent",
                        )}
                        style={{ width: `${dayPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayLogCount}/{dayTotal}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[24px] border border-white/12 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                ¿Eliminar rutina?
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Se eliminará <strong>&quot;{selectedRoutine.name}&quot;</strong>{" "}
                con todos sus días y ejercicios. Esta acción no se puede
                deshacer.
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
  if (view === "tracking" && selectedRoutine) {
    return (
      <>
        <Header
          title={`Progreso de ${getClientName(selectedRoutine.clientId)}`}
          subtitle={`${selectedRoutine.name} · ${selectedRoutine.weekCount} semanas`}
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
        />
      </>
    );
  }

  return null;
}
