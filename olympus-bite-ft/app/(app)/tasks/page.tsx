"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { cn, getLocalDateString } from "@/shared/lib/utils";
import { tasksService } from "@/features/tasks/services/tasks.service";
import type { DailyTask, TaskLog } from "@/features/tasks/types/tasks.types";

/* ─── Emoji picker for tasks ─── */
const TASK_ICONS = ["🍳", "🏋️", "🥗", "💼", "📚", "💧", "🧘", "🛌", "💊", "🏃", "🎯", "✅"];

/* ─── Helper: get last N days as YYYY-MM-DD ─── */
function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getLocalDateString(d));
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", { weekday: "short" }).slice(0, 2).toUpperCase();
}

function getShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDate().toString();
}

/* ─── Motivational messages ─── */
function getMotivation(pct: number, streak: number): { emoji: string; message: string } {
  if (streak >= 7) return { emoji: "🔥", message: `¡${streak} días seguidos! Imparable` };
  if (streak >= 3) return { emoji: "⚡", message: `${streak} días de racha. ¡Sigue así!` };
  if (pct === 100) return { emoji: "🏆", message: "¡Día perfecto! Todo completado" };
  if (pct >= 75) return { emoji: "💪", message: "¡Casi perfecto! Un poco más" };
  if (pct >= 50) return { emoji: "👍", message: "Vas por la mitad, ¡tú puedes!" };
  if (pct > 0) return { emoji: "🌱", message: "Buen inicio, ¡sigue avanzando!" };
  return { emoji: "🎯", message: "¡Empieza tu día completando tareas!" };
}

/* ════════════════════════════════════════════════════════ */
/*  TasksPage                                              */
/* ════════════════════════════════════════════════════════ */

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  // Add task form
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✅");
  const [adding, setAdding] = useState(false);

  // Stats range
  const [statsRange] = useState(14); // last 14 days

  const today = getLocalDateString();
  const statsDays = useMemo(() => getLastNDays(statsRange), [statsRange]);
  const startDate = statsDays[0];
  const endDate = statsDays[statsDays.length - 1];

  /* ─── Load data ─── */
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tasksRes, logsRes] = await Promise.all([
        tasksService.getTasks(user.id).catch(() => null),
        tasksService.getLogs(user.id, startDate, endDate).catch(() => null),
      ]);
      setTasks(tasksRes?.data ?? []);
      setLogs(logsRes?.data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ─── Derived state ─── */
  const todayLogs = useMemo(
    () => logs.filter((l) => l.date === today),
    [logs, today],
  );

  const isTaskDone = useCallback(
    (taskId: string) => todayLogs.some((l) => l.taskId === taskId),
    [todayLogs],
  );

  const todayPct = tasks.length > 0
    ? Math.round((todayLogs.length / tasks.length) * 100)
    : 0;

  // Daily completion percentages for chart
  const dailyStats = useMemo(() => {
    if (tasks.length === 0) return statsDays.map((d) => ({ date: d, pct: 0, count: 0 }));
    return statsDays.map((date) => {
      const dayLogs = logs.filter((l) => l.date === date);
      const count = dayLogs.length;
      const pct = Math.round((count / tasks.length) * 100);
      return { date, pct, count };
    });
  }, [statsDays, logs, tasks]);

  // Streak: consecutive days with 100%
  const streak = useMemo(() => {
    let count = 0;
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      // For today, check >= current pct threshold
      if (i === dailyStats.length - 1) {
        if (dailyStats[i].count > 0) count++;
        else break;
      } else {
        if (dailyStats[i].pct === 100) count++;
        else break;
      }
    }
    return count;
  }, [dailyStats]);

  // Average completion last 7 days
  const avgLast7 = useMemo(() => {
    const last7 = dailyStats.slice(-7);
    if (last7.length === 0) return 0;
    return Math.round(last7.reduce((s, d) => s + d.pct, 0) / last7.length);
  }, [dailyStats]);

  const motivation = getMotivation(todayPct, streak);

  /* ─── Handlers ─── */
  const handleToggle = async (taskId: string) => {
    if (!user) return;
    setToggling(taskId);
    try {
      await tasksService.toggleLog(taskId, user.id, today);
      // Optimistic update
      const wasCompleted = isTaskDone(taskId);
      if (wasCompleted) {
        setLogs((prev) => prev.filter((l) => !(l.taskId === taskId && l.date === today)));
      } else {
        setLogs((prev) => [
          ...prev,
          { id: crypto.randomUUID(), taskId, userId: user.id, date: today, completed: true, createdAt: new Date().toISOString() },
        ]);
      }
    } catch {
      // Reload to stay in sync
      loadData();
    } finally {
      setToggling(null);
    }
  };

  const handleAddTask = async () => {
    if (!user || !newTitle.trim()) return;
    setAdding(true);
    try {
      await tasksService.createTask(user.id, {
        title: newTitle.trim(),
        icon: newIcon,
        order: tasks.length,
      });
      setNewTitle("");
      setNewIcon("✅");
      setShowAdd(false);
      await loadData();
    } catch {
      alert("Error al crear tarea");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setLogs((prev) => prev.filter((l) => l.taskId !== taskId));
    } catch {
      alert("Error al eliminar tarea");
    }
  };

  /* ─── Chart dimensions ─── */
  const chartW = 100; // viewBox percentage
  const chartH = 40;
  const maxPct = 100;

  const chartPoints = dailyStats.map((d, i) => {
    const x = (i / (dailyStats.length - 1)) * chartW;
    const y = chartH - (d.pct / maxPct) * chartH;
    return `${x},${y}`;
  });
  const polyline = chartPoints.join(" ");
  const areaPath = `M0,${chartH} ${chartPoints.join(" ")} ${chartW},${chartH} Z`;

  /* ════════════════════════════ RENDER ════════════════════════════ */

  if (loading) {
    return (
      <>
        <Header title="Tareas" subtitle="Cargando..." />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Tareas del Día"
        subtitle={new Date().toLocaleDateString("es", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        action={
          <Button size="md" onClick={() => setShowAdd(true)}>
            + Agregar tarea
          </Button>
        }
      />

      {/* ── Motivational Banner ── */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-500/10 to-primary-400/5 border border-primary-200/30 dark:border-primary-700/20 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 dark:bg-neutral-800 text-3xl shadow-sm">
            {motivation.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-900 dark:text-white">
              {motivation.message}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-neutral-200/60 dark:bg-neutral-700 max-w-64">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    todayPct === 100
                      ? "bg-green-500"
                      : todayPct >= 50
                        ? "bg-primary-500"
                        : "bg-amber-400",
                  )}
                  style={{ width: `${todayPct}%` }}
                />
              </div>
              <span className="text-sm font-extrabold text-neutral-700 dark:text-neutral-300">
                {todayPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Hoy</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {todayLogs.length}<span className="text-sm font-medium text-neutral-400">/{tasks.length}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Racha</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {streak} <span className="text-sm font-medium text-neutral-400">días</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Promedio 7d</p>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {avgLast7}%
          </p>
        </div>
      </div>

      {/* ── Checklist ── */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
          Checklist
        </h2>
        {tasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Sin tareas</h3>
            <p className="text-sm text-neutral-500 mt-1">Agrega tu primera tarea diaria para empezar</p>
            <Button size="sm" className="mt-4" onClick={() => setShowAdd(true)}>
              + Agregar tarea
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const done = isTaskDone(task.id);
              const isToggling = toggling === task.id;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
                    done
                      ? "bg-green-50/50 border-green-200/50 dark:bg-green-900/10 dark:border-green-800/30"
                      : "bg-white border-neutral-100 hover:border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700",
                  )}
                  onClick={() => !isToggling && handleToggle(task.id)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all flex-shrink-0",
                      isToggling && "opacity-50",
                      done
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-neutral-300 dark:border-neutral-600 group-hover:border-primary-400",
                    )}
                  >
                    {done && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Icon + Title */}
                  <span className="text-lg flex-shrink-0">{task.icon}</span>
                  <span
                    className={cn(
                      "flex-1 font-medium transition-all",
                      done
                        ? "text-neutral-400 line-through dark:text-neutral-500"
                        : "text-neutral-900 dark:text-white",
                    )}
                  >
                    {task.title}
                  </span>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-1"
                    title="Eliminar tarea"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Performance Chart ── */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
            Rendimiento ({statsRange} días)
          </h2>
          <div className="rounded-2xl bg-white border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 p-5">
            {/* SVG Chart */}
            <div className="relative h-40 w-full">
              <svg
                viewBox={`-2 -2 ${chartW + 4} ${chartH + 4}`}
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((pct) => (
                  <line
                    key={pct}
                    x1={0} y1={chartH - (pct / 100) * chartH}
                    x2={chartW} y2={chartH - (pct / 100) * chartH}
                    stroke="currentColor"
                    className="text-neutral-100 dark:text-neutral-800"
                    strokeWidth={0.3}
                  />
                ))}
                {/* Area fill */}
                <path
                  d={areaPath}
                  className="fill-primary-500/10 dark:fill-primary-400/10"
                />
                {/* Line */}
                <polyline
                  points={polyline}
                  fill="none"
                  className="stroke-primary-500 dark:stroke-primary-400"
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots */}
                {dailyStats.map((d, i) => {
                  const x = (i / (dailyStats.length - 1)) * chartW;
                  const y = chartH - (d.pct / maxPct) * chartH;
                  return (
                    <circle
                      key={d.date}
                      cx={x} cy={y} r={0.8}
                      className={cn(
                        d.pct === 100
                          ? "fill-green-500"
                          : d.pct > 0
                            ? "fill-primary-500 dark:fill-primary-400"
                            : "fill-neutral-300 dark:fill-neutral-600",
                      )}
                    />
                  );
                })}
              </svg>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none py-0.5">
                {[100, 50, 0].map((v) => (
                  <span key={v} className="text-[9px] text-neutral-400 -ml-0.5">{v}%</span>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-1">
              {dailyStats.map((d, i) => (
                // Show every other label to avoid clutter
                i % 2 === 0 || i === dailyStats.length - 1 ? (
                  <div key={d.date} className="text-center">
                    <p className="text-[9px] text-neutral-400">{getDayLabel(d.date)}</p>
                    <p className="text-[9px] font-medium text-neutral-500">{getShortDate(d.date)}</p>
                  </div>
                ) : <div key={d.date} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Heatmap (mini) ── */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
            Actividad Reciente
          </h2>
          <div className="flex gap-1.5 flex-wrap">
            {dailyStats.map((d) => {
              const isToday = d.date === today;
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.pct}% (${d.count}/${tasks.length})`}
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                    isToday && "ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-neutral-950",
                    d.pct === 100
                      ? "bg-green-500 text-white"
                      : d.pct >= 75
                        ? "bg-green-400/80 text-white"
                        : d.pct >= 50
                          ? "bg-amber-400/80 text-white"
                          : d.pct > 0
                            ? "bg-amber-300/60 text-amber-800 dark:text-amber-200"
                            : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
                  )}
                >
                  {getShortDate(d.date)}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-neutral-400">Menos</span>
            <div className="h-3 w-3 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-3 w-3 rounded bg-amber-300/60" />
            <div className="h-3 w-3 rounded bg-amber-400/80" />
            <div className="h-3 w-3 rounded bg-green-400/80" />
            <div className="h-3 w-3 rounded bg-green-500" />
            <span className="text-[10px] text-neutral-400">Más</span>
          </div>
        </div>
      )}

      {/* ── Add Task Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Nueva Tarea
            </h3>

            {/* Icon selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Ícono
              </label>
              <div className="flex gap-2 flex-wrap">
                {TASK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    className={cn(
                      "h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all",
                      newIcon === icon
                        ? "bg-primary-100 ring-2 ring-primary-500 dark:bg-primary-900/30"
                        : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Nombre de la tarea
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Desayunar, Entrenar, Tomar agua..."
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="md" onClick={() => { setShowAdd(false); setNewTitle(""); }}>
                Cancelar
              </Button>
              <Button
                size="md"
                onClick={handleAddTask}
                loading={adding}
                disabled={!newTitle.trim()}
              >
                Crear tarea
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
