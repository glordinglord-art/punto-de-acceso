const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'olympus-bite-ft/app/(app)/tasks/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The exact replacement we want for getMotivation and the entire return statement.
// We will do a full replace of the file to ensure no truncation and proper styling.

const newContent = `"use client";

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
function getMotivation(pct: number, streak: number): { emoji: string; message: string; color: string } {
  if (streak >= 7) return { emoji: "🔥", message: \`¡\${streak} Días! Racha Legendaria\`, color: "text-orange-500" };
  if (streak >= 3) return { emoji: "⚡", message: \`\${streak} Días. Energía a Tope\`, color: "text-yellow-500" };
  if (pct === 100) return { emoji: "🏆", message: "¡Día Perfecto! Leyenda", color: "text-primary-500" };
  if (pct >= 75) return { emoji: "💪", message: "¡Casi Listo! Último Esfuerzo", color: "text-blue-500" };
  if (pct >= 50) return { emoji: "👍", message: "A Mitad de Camino", color: "text-amber-500" };
  if (pct > 0) return { emoji: "🌱", message: "En Movimiento", color: "text-green-500" };
  return { emoji: "🎯", message: "Inicia Tu Día con Todo", color: "text-neutral-500" };
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
    return \`\${x},\${y}\`;
  });
  const polyline = chartPoints.join(" ");
  const areaPath = \`M0,\${chartH} \${chartPoints.join(" ")} \${chartW},\${chartH} Z\`;

  /* ════════════════════════════ RENDER ════════════════════════════ */

  if (loading) {
    return (
      <>
        <Header title="Mis Hábitos" subtitle="Cargando..." />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Mis Hábitos"
        subtitle={new Date().toLocaleDateString("es", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).toUpperCase()}
        action={
          <Button size="md" onClick={() => setShowAdd(true)} className="font-condensed uppercase tracking-wider font-bold shadow-lg shadow-primary-500/20">
            + Nuevo Hábito
          </Button>
        }
      />

      {/* ── Motivational Banner ── */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="relative p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 dark:bg-white/10 text-4xl shadow-inner border border-white/20">
              {motivation.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-lg font-condensed font-bold uppercase tracking-wide", motivation.color)}>
                {motivation.message}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 h-3 rounded-full bg-neutral-200/50 dark:bg-black/40 overflow-hidden border border-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                      todayPct === 100
                        ? "bg-gradient-to-r from-green-500 to-emerald-400"
                        : todayPct >= 50
                          ? "bg-gradient-to-r from-primary-600 to-primary-400"
                          : "bg-gradient-to-r from-amber-500 to-amber-400",
                    )}
                    style={{ width: \`\${todayPct}%\` }}
                  />
                </div>
                <span className="text-base font-extrabold text-neutral-800 dark:text-white shrink-0">
                  {todayPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl p-4 border border-neutral-100 dark:border-white/5 bg-white dark:bg-white/5 text-center backdrop-blur-sm shadow-sm hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
          <p className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Hoy</p>
          <p className="text-3xl font-condensed font-extrabold text-neutral-900 dark:text-white mt-1">
            {todayLogs.length}<span className="text-lg font-medium text-neutral-400">/{tasks.length}</span>
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-neutral-100 dark:border-white/5 bg-white dark:bg-white/5 text-center backdrop-blur-sm shadow-sm hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
          <p className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Racha</p>
          <p className="text-3xl font-condensed font-extrabold text-neutral-900 dark:text-white mt-1">
            {streak} <span className="text-lg font-medium text-neutral-400">d</span>
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-neutral-100 dark:border-white/5 bg-white dark:bg-white/5 text-center backdrop-blur-sm shadow-sm hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors">
          <p className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Promedio 7d</p>
          <p className="text-3xl font-condensed font-extrabold text-neutral-900 dark:text-white mt-1">
            {avgLast7}%
          </p>
        </div>
      </div>

      {/* ── Checklist ── */}
      <div className="mb-8">
        <h2 className="text-sm font-condensed font-bold text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-widest">
          Checklist Diario
        </h2>
        {tasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 p-10 text-center bg-white/50 dark:bg-black/20">
            <div className="text-5xl mb-4 opacity-80">📋</div>
            <h3 className="text-lg font-condensed font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Sin Hábitos</h3>
            <p className="text-sm text-neutral-500 mt-2">Construye tu disciplina agregando tu primer hábito.</p>
            <Button size="md" className="mt-6 font-condensed uppercase tracking-wider font-bold" onClick={() => setShowAdd(true)}>
              + Iniciar Hábito
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const done = isTaskDone(task.id);
              const isToggling = toggling === task.id;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md",
                    done
                      ? "bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800/50"
                      : "bg-white border-neutral-200 hover:border-primary-300 dark:bg-white/5 dark:border-white/10 dark:hover:border-primary-500/50",
                  )}
                  onClick={() => !isToggling && handleToggle(task.id)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all duration-300 flex-shrink-0 shadow-inner",
                      isToggling && "opacity-50 scale-95",
                      done
                        ? "bg-green-500 border-green-500 text-white scale-105"
                        : "bg-neutral-50 border-neutral-300 dark:bg-black/20 dark:border-white/20 group-hover:border-primary-400 dark:group-hover:border-primary-500",
                    )}
                  >
                    {done && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Icon + Title */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/10 text-xl flex-shrink-0">
                    {task.icon}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-lg font-medium transition-all duration-300",
                      done
                        ? "text-neutral-400 line-through decoration-2 decoration-green-500/40 dark:text-neutral-500 dark:decoration-green-500/30"
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
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Eliminar tarea"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
        <div className="mb-8">
          <h2 className="text-sm font-condensed font-bold text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-widest">
            Rendimiento ({statsRange} días)
          </h2>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm backdrop-blur-sm">
            {/* SVG Chart */}
            <div className="relative h-48 w-full">
              <svg
                viewBox={\`-2 -2 \${chartW + 4} \${chartH + 4}\`}
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((pct) => (
                  <line
                    key={pct}
                    x1={0} y1={chartH - (pct / 100) * chartH}
                    x2={chartW} y2={chartH - (pct / 100) * chartH}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-white/10"
                    strokeWidth={0.2}
                    strokeDasharray={pct === 0 || pct === 100 ? "0" : "1 1"}
                  />
                ))}
                {/* Area fill */}
                <path
                  d={areaPath}
                  className="fill-primary-500/20 dark:fill-primary-500/10"
                />
                {/* Line */}
                <polyline
                  points={polyline}
                  fill="none"
                  className="stroke-primary-500 dark:stroke-primary-400"
                  strokeWidth={1.5}
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
                      cx={x} cy={y} r={1.5}
                      className={cn(
                        "transition-all duration-300",
                        d.pct === 100
                          ? "fill-green-500 stroke-white dark:stroke-neutral-900 stroke-[0.5px]"
                          : d.pct > 0
                            ? "fill-primary-500 dark:fill-primary-400"
                            : "fill-neutral-300 dark:fill-neutral-600",
                      )}
                    />
                  );
                })}
              </svg>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none py-1">
                {[100, 50, 0].map((v) => (
                  <span key={v} className="text-[10px] font-medium text-neutral-400 -ml-1 bg-white/80 dark:bg-neutral-900/80 px-1 rounded">{v}%</span>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-4 px-1">
              {dailyStats.map((d, i) => (
                // Show every other label to avoid clutter
                i % 2 === 0 || i === dailyStats.length - 1 ? (
                  <div key={d.date} className="text-center">
                    <p className="text-[10px] font-condensed font-bold uppercase text-neutral-400">{getDayLabel(d.date)}</p>
                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300">{getShortDate(d.date)}</p>
                  </div>
                ) : <div key={d.date} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Heatmap (mini) ── */}
      {tasks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-condensed font-bold text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-widest">
            Mapa de Actividad
          </h2>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              {dailyStats.map((d) => {
                const isToday = d.date === today;
                return (
                  <div
                    key={d.date}
                    title={\`\${d.date}: \${d.pct}% (\${d.count}/\${tasks.length})\`}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-inner",
                      isToday && "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-neutral-900 scale-110 z-10",
                      d.pct === 100
                        ? "bg-green-500 text-white shadow-green-500/20"
                        : d.pct >= 75
                          ? "bg-green-400/80 text-white"
                          : d.pct >= 50
                            ? "bg-amber-400/80 text-white"
                            : d.pct > 0
                              ? "bg-amber-300/60 text-amber-800 dark:text-amber-200"
                              : "bg-neutral-100 text-neutral-400 dark:bg-white/5 dark:text-neutral-500",
                    )}
                  >
                    {getShortDate(d.date)}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
              <span className="text-xs font-condensed uppercase tracking-wider text-neutral-400">Menos</span>
              <div className="flex gap-1.5">
                <div className="h-4 w-4 rounded-md bg-neutral-100 dark:bg-white/5" />
                <div className="h-4 w-4 rounded-md bg-amber-300/60" />
                <div className="h-4 w-4 rounded-md bg-amber-400/80" />
                <div className="h-4 w-4 rounded-md bg-green-400/80" />
                <div className="h-4 w-4 rounded-md bg-green-500" />
              </div>
              <span className="text-xs font-condensed uppercase tracking-wider text-neutral-400">Más</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Task Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-neutral-900 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-condensed font-bold text-neutral-900 dark:text-white mb-6 uppercase tracking-wide">
              Nuevo Hábito
            </h3>

            {/* Icon selector */}
            <div className="mb-6">
              <label className="block text-sm font-condensed font-bold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
                Selecciona un Ícono
              </label>
              <div className="flex gap-3 flex-wrap">
                {TASK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    className={cn(
                      "h-12 w-12 rounded-xl text-2xl flex items-center justify-center transition-all duration-200 hover:scale-110",
                      newIcon === icon
                        ? "bg-primary-100 ring-2 ring-primary-500 dark:bg-primary-900/40 shadow-lg shadow-primary-500/20"
                        : "bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10",
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-8">
              <label className="block text-sm font-condensed font-bold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
                Nombre del Hábito
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Entrenar, Tomar 2L de agua..."
                className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-primary-500 dark:focus:bg-black/40 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="lg" onClick={() => { setShowAdd(false); setNewTitle(""); }} className="font-condensed font-bold uppercase tracking-wider">
                Cancelar
              </Button>
              <Button
                size="lg"
                onClick={handleAddTask}
                loading={adding}
                disabled={!newTitle.trim()}
                className="font-condensed font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20"
              >
                Crear Hábito
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync(filePath, newContent);
console.log('Done replacing page.tsx');
