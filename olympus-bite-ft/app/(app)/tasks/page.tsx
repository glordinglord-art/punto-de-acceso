"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/layout/Header";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { cn, getLocalDateString } from "@/shared/lib/utils";
import { tasksService } from "@/features/tasks/services/tasks.service";
import type { DailyTask, TaskLog } from "@/features/tasks/types/tasks.types";
import {
  Flame,
  Zap,
  Trophy,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
} from "lucide-react";

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
function getMotivation(pct: number, streak: number): { emoji: string; message: string; color: string; desc: string } {
  if (streak >= 7) return { emoji: "🔥", message: `¡${streak} Días! Racha Legendaria`, color: "text-amber-500", desc: "La consistencia de los verdaderos atletas." };
  if (streak >= 3) return { emoji: "⚡", message: `${streak} Días Imparable`, color: "text-amber-400", desc: "Mantén el ritmo y no aflojes." };
  if (pct === 100) return { emoji: "🏆", message: "¡Día Perfecto! Cumpliste todo", color: "text-primary-500", desc: "Objetivos de hoy completados al 100%." };
  if (pct >= 75) return { emoji: "💪", message: "¡Casi Listo! Último Esfuerzo", color: "text-blue-500", desc: "Solo te faltan pocos hábitos para cerrar el día." };
  if (pct >= 50) return { emoji: "👍", message: "A Mitad de Camino", color: "text-amber-500", desc: "Sigue sumando victorias hoy." };
  if (pct > 0) return { emoji: "🌱", message: "En Movimiento", color: "text-primary-500", desc: "Cada hábito completado cuenta." };
  return { emoji: "🎯", message: "Inicia Tu Día con Todo", color: "text-slate-400 dark:text-slate-500", desc: "Marca tu primer hábito para arrancar la racha." };
}

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

  // Streak: consecutive days with > 0 or 100%
  const streak = useMemo(() => {
    let count = 0;
    for (let i = dailyStats.length - 1; i >= 0; i--) {
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
  const chartW = 100;
  const chartH = 38;
  const maxPct = 100;

  const chartPoints = dailyStats.map((d, i) => {
    const x = (i / (dailyStats.length - 1)) * chartW;
    const y = chartH - (d.pct / maxPct) * chartH;
    return `${x},${y}`;
  });
  const polyline = chartPoints.join(" ");
  const areaPath = `M0,${chartH} ${chartPoints.join(" ")} ${chartW},${chartH} Z`;

  if (loading) {
    return (
      <>
        <Header title="Mis Hábitos" subtitle="Cargando tu progreso..." />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[28px] bg-white/40 border border-slate-200/50 dark:bg-white/[0.03] dark:border-white/5" />
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
          <Button
            size="md"
            onClick={() => setShowAdd(true)}
            className="shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Nuevo Hábito
          </Button>
        }
      />

      <div className="space-y-6">
        {/* ── Motivational Hero Card ── */}
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10 text-3xl shadow-inner border border-slate-200 dark:border-white/10">
                {motivation.emoji}
              </div>
              <div>
                <h3 className={cn("text-2xl font-condensed font-bold uppercase tracking-wide", motivation.color)}>
                  {motivation.message}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {motivation.desc}
                </p>
              </div>
            </div>

            {/* Progress pill */}
            <div className="w-full md:w-72 bg-slate-100 dark:bg-white/5 rounded-2xl p-4 border border-slate-200/80 dark:border-white/5">
              <div className="flex justify-between items-center text-xs font-condensed font-bold uppercase tracking-wider mb-2">
                <span className="text-slate-500 dark:text-slate-400">Progreso Diario</span>
                <span className="text-primary-500 text-sm">{todayPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-amber-400 transition-all duration-700 ease-out"
                  style={{ width: `${todayPct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ── 3 Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                Completados Hoy
              </p>
              <p className="text-3xl font-condensed font-bold text-slate-900 dark:text-white leading-tight">
                {todayLogs.length} <span className="text-base text-slate-400 font-normal">/ {tasks.length}</span>
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                Racha Actual
              </p>
              <p className="text-3xl font-condensed font-bold text-amber-500 leading-tight">
                {streak} <span className="text-base text-slate-400 font-normal">días</span>
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                Promedio (7 Días)
              </p>
              <p className="text-3xl font-condensed font-bold text-slate-900 dark:text-white leading-tight">
                {avgLast7}%
              </p>
            </div>
          </Card>
        </div>

        {/* ── Checklist Section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-condensed font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-500" /> Checklist Diario de Hábitos
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {todayLogs.length} de {tasks.length} completados
            </span>
          </div>

          {tasks.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 text-2xl">
                📋
              </div>
              <h4 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                No tienes hábitos creados
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Crea hábitos como tomar agua, entrenar, cumplir tus macros o dormir 8 horas para construir disciplina diaria.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4 mr-1" /> Crear Mi Primer Hábito
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => {
                const done = isTaskDone(task.id);
                const isToggling = toggling === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => !isToggling && handleToggle(task.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-md select-none",
                      done
                        ? "bg-primary-500/10 border-primary-500/30 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                        : "bg-white/80 border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.03] dark:border-white/5 dark:hover:border-white/15",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox button */}
                      <div
                        className={cn(
                          "h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 shrink-0",
                          done
                            ? "bg-primary-500 border-primary-500 text-slate-950 shadow-md shadow-primary-500/30"
                            : "border-slate-300 bg-slate-100/50 dark:border-white/20 dark:bg-white/5 group-hover:border-primary-500",
                        )}
                      >
                        {done && <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />}
                      </div>

                      {/* Icon */}
                      <span className="text-2xl shrink-0 drop-shadow-sm">{task.icon}</span>

                      {/* Title */}
                      <div>
                        <p
                          className={cn(
                            "text-base font-condensed font-bold uppercase tracking-wide transition-colors",
                            done
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-2 rounded-xl hover:bg-rose-500/10"
                      title="Eliminar hábito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Performance Chart & Heatmap Grid ── */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 14-day Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-condensed font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary-500" /> Curva de Cumplimiento (14 Días)
                </h4>
                <span className="text-xs text-primary-500 font-bold font-condensed uppercase tracking-wider">
                  {avgLast7}% Promedio
                </span>
              </div>

              <div className="relative h-44 w-full pt-2">
                <svg
                  viewBox={`-2 -2 ${chartW + 4} ${chartH + 4}`}
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  {[0, 50, 100].map((pct) => (
                    <line
                      key={pct}
                      x1={0}
                      y1={chartH - (pct / 100) * chartH}
                      x2={chartW}
                      y2={chartH - (pct / 100) * chartH}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-white/8"
                      strokeWidth={0.3}
                      strokeDasharray={pct === 0 || pct === 100 ? "0" : "2 2"}
                    />
                  ))}
                  {/* Area fill */}
                  <path
                    d={areaPath}
                    className="fill-primary-500/15 dark:fill-primary-500/10"
                  />
                  {/* Polyline */}
                  <polyline
                    points={polyline}
                    fill="none"
                    className="stroke-primary-500"
                    strokeWidth={1.8}
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
                        cx={x}
                        cy={y}
                        r={d.date === today ? 2.5 : 1.8}
                        className={cn(
                          d.pct === 100
                            ? "fill-emerald-400 stroke-slate-900 dark:stroke-black stroke-[0.8px]"
                            : d.pct > 0
                              ? "fill-primary-500 stroke-slate-900 dark:stroke-black stroke-[0.5px]"
                              : "fill-slate-300 dark:fill-slate-700",
                        )}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Day Labels */}
              <div className="flex justify-between mt-3 text-[10px] font-condensed font-bold text-slate-400 uppercase">
                {dailyStats.map((d, i) => (
                  <span
                    key={d.date}
                    className={cn(
                      "text-center w-5",
                      d.date === today ? "text-primary-500 font-extrabold" : "",
                    )}
                  >
                    {i % 2 === 0 ? getDayLabel(d.date) : ""}
                  </span>
                ))}
              </div>
            </Card>

            {/* Activity Heatmap */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-condensed font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" /> Mapa de Actividad (30 Días)
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-condensed uppercase font-bold">
                  <span>Menos</span>
                  <div className="h-2.5 w-2.5 rounded bg-slate-200 dark:bg-white/5" />
                  <div className="h-2.5 w-2.5 rounded bg-primary-500/40" />
                  <div className="h-2.5 w-2.5 rounded bg-primary-500" />
                  <span>Más</span>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-2 pt-2">
                {getLastNDays(30).map((dayStr) => {
                  const dayLogs = logs.filter((l) => l.date === dayStr);
                  const isCurrentDay = dayStr === today;
                  const pct = tasks.length > 0 ? (dayLogs.length / tasks.length) * 100 : 0;

                  return (
                    <div
                      key={dayStr}
                      title={`${dayStr}: ${dayLogs.length}/${tasks.length} completados`}
                      className={cn(
                        "aspect-square rounded-xl flex items-center justify-center text-[10px] font-condensed font-bold transition-all",
                        isCurrentDay && "ring-2 ring-primary-500 ring-offset-2 ring-offset-slate-900",
                        pct === 100
                          ? "bg-primary-500 text-slate-950 font-black shadow-sm"
                          : pct >= 50
                            ? "bg-primary-500/40 text-slate-900 dark:text-white"
                            : pct > 0
                              ? "bg-primary-500/20 text-slate-700 dark:text-slate-300"
                              : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600",
                      )}
                    >
                      {getShortDate(dayStr)}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Modal Nuevo Hábito ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" /> Nuevo Hábito
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Selecciona un Ícono
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {TASK_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={cn(
                        "h-11 rounded-xl text-2xl flex items-center justify-center transition-all border",
                        newIcon === icon
                          ? "bg-primary-500/20 border-primary-500 scale-110 shadow-sm"
                          : "bg-slate-100 border-slate-200 dark:bg-white/5 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10",
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre del Hábito
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tomar 3L de agua, Dormir 8h, Estirar..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  autoFocus
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowAdd(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={adding}
                  disabled={!newTitle.trim()}
                  onClick={handleAddTask}
                >
                  Crear Hábito
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
