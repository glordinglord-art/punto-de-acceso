'use client';

import { useState } from 'react';
import {
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Dumbbell,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  Calendar,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  clinicalAgentService,
  type RoutineAction,
  type RoutineProposal,
  type ExerciseSpec,
} from '../services/clinical-agent.service';

interface ClinicalRoutineProposalCardProps {
  actionData?: RoutineAction | RoutineProposal;
  proposal?: RoutineProposal; // legacy prop compatibility
  trainerId: string;
  onApplied?: (followUpMessage?: string) => void;
}

export function ClinicalRoutineProposalCard({
  actionData: rawActionData,
  proposal: rawProposal,
  trainerId,
  onApplied,
}: ClinicalRoutineProposalCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Normalize data into RoutineAction format
  const action: RoutineAction = (() => {
    const data = rawActionData || rawProposal;
    if (!data) {
      return {
        action: 'sustituir_ejercicio',
        clientName: 'Atleta',
        currentExercise: { name: 'Ejercicio' },
        proposedExercise: { name: 'Ejercicio Propuesto' },
      };
    }
    // If legacy proposal without action tag
    if (!('action' in data)) {
      return {
        action: 'sustituir_ejercicio',
        clientName: data.clientName,
        routineName: data.routineName,
        dayFocus: data.dayFocus,
        currentExercise: data.currentExercise,
        proposedExercise: data.proposedExercise,
        rationale: data.rationale,
      };
    }
    return data as RoutineAction;
  })();

  const handleApply = async () => {
    if (applying || applied || !trainerId) return;

    setApplying(true);
    try {
      const res = await clinicalAgentService.executeAction(trainerId, action);

      if (res?.data?.success) {
        setApplied(true);
        const followUp =
          res.data.followUpMessage ||
          res.data.message ||
          `¡Acción de rutina para ${action.clientName} aplicada con éxito!`;
        toast.success(res.data.message || '¡Acción aplicada con éxito!', {
          duration: 5000,
          icon: '🩺',
        });
        onApplied?.(followUp);
      } else {
        toast.error('No se pudo aplicar la acción a la rutina.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al conectar con la base de datos de rutinas.';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (dismissed) {
    return (
      <div className="my-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center text-xs font-semibold text-white/40">
        Acción descartada por el entrenador
      </div>
    );
  }

  // Visual header meta depending on action type
  const getActionMeta = () => {
    switch (action.action) {
      case 'sustituir_ejercicio':
        return {
          title: 'Sustitución de Ejercicio',
          badge: 'Sustitución IA',
          color: 'cyan',
          icon: <RefreshCw className="h-4 w-4 text-cyan-300" />,
          borderColor: 'border-cyan-500/30',
          gradient: 'from-cyan-950/40 via-cyan-900/20 to-transparent',
        };
      case 'reemplazar_dia':
        return {
          title: 'Rediseño Completo de Día',
          badge: 'Reemplazo de Día',
          color: 'amber',
          icon: <Sparkles className="h-4 w-4 text-amber-300" />,
          borderColor: 'border-amber-500/30',
          gradient: 'from-amber-950/40 via-amber-900/20 to-transparent',
        };
      case 'agregar_ejercicio':
        return {
          title: 'Agregar Nuevos Ejercicios',
          badge: 'Expansión de Rutina',
          color: 'emerald',
          icon: <Plus className="h-4 w-4 text-emerald-300" />,
          borderColor: 'border-emerald-500/30',
          gradient: 'from-emerald-950/40 via-emerald-900/20 to-transparent',
        };
      case 'eliminar_ejercicio':
        return {
          title: 'Retirar Ejercicios de Rutina',
          badge: 'Eliminación',
          color: 'rose',
          icon: <Trash2 className="h-4 w-4 text-rose-300" />,
          borderColor: 'border-rose-500/30',
          gradient: 'from-rose-950/40 via-rose-900/20 to-transparent',
        };
      case 'crear_rutina':
        return {
          title: 'Creación de Rutina Completa',
          badge: 'Nueva Rutina Integral',
          color: 'purple',
          icon: <Dumbbell className="h-4 w-4 text-purple-300" />,
          borderColor: 'border-purple-500/30',
          gradient: 'from-purple-950/40 via-purple-900/20 to-transparent',
        };
      case 'eliminar_rutina':
        return {
          title: 'Desactivación de Rutina',
          badge: 'Desactivar',
          color: 'rose',
          icon: <AlertTriangle className="h-4 w-4 text-rose-300" />,
          borderColor: 'border-rose-500/30',
          gradient: 'from-rose-950/40 via-rose-900/20 to-transparent',
        };
      default:
        return {
          title: 'Ajuste de Rutina',
          badge: 'Propuesta IA',
          color: 'cyan',
          icon: <Stethoscope className="h-4 w-4 text-cyan-300" />,
          borderColor: 'border-cyan-500/30',
          gradient: 'from-cyan-950/40 via-cyan-900/20 to-transparent',
        };
    }
  };

  const meta = getActionMeta();

  return (
    <div
      className={`my-4 overflow-hidden rounded-3xl border ${
        applied ? 'border-emerald-500/40' : meta.borderColor
      } bg-[#0f131a] shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all`}
    >
      {/* ── Top Header Badge ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r ${
          applied ? 'from-emerald-950/40 via-emerald-900/20 to-transparent' : meta.gradient
        } px-5 py-3.5`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15">
            {applied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {applied ? '✓ Ajuste Sincronizado' : meta.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                  applied
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/10 text-white/80 border-white/20'
                }`}
              >
                {applied ? 'En Base de Datos' : meta.badge}
              </span>
            </div>
            <p className="text-xs font-black text-white mt-0.5">
              Atleta: <span className="text-cyan-400">{action.clientName}</span>
              {action.routineName && (
                <span className="text-white/40 font-normal">
                  {' '}
                  · {action.routineName}
                </span>
              )}
            </p>
          </div>
        </div>

        {('dayFocus' in action && action.dayFocus) && (
          <span className="rounded-xl bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/10">
            {action.dayFocus}
          </span>
        )}
      </div>

      {/* ── Body: Comparative ANTES (SALE) vs DESPUÉS (ENTRA) ── */}
      <div className="p-5 space-y-4">
        {/* 1. SUSTITUIR EJERCICIO */}
        {action.action === 'sustituir_ejercicio' && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" /> Sale: Ejercicio Actual
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  En Rutina
                </span>
              </div>
              <p className="text-sm font-black text-white leading-tight">
                {action.currentExercise?.name}
              </p>
              <p className="text-xs font-semibold text-rose-200/70 mt-1">
                Series: {action.currentExercise?.setsReps || 'Configurado en rutina'}
              </p>
            </div>

            <div className="flex justify-center items-center py-1 md:py-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-cyan-400 shadow-md rotate-90 md:rotate-0">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Entra: Sustitución Propuesta
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Objetivo
                </span>
              </div>
              <p className="text-sm font-black text-white leading-tight">
                {action.proposedExercise?.name}
              </p>
              <p className="text-xs font-semibold text-emerald-300/80 mt-1">
                Series: {action.proposedExercise?.setsReps || 'Según mesociclo'}
              </p>
            </div>
          </div>
        )}

        {/* 2. REEMPLAZAR DÍA COMPLETO */}
        {action.action === 'reemplazar_dia' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SALE */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-2">
                  🔴 Sale: Esquema anterior Día {action.dayNumber || ''} ({action.currentExercises?.length || 0} ejercicios)
                </span>
                {action.currentExercises && action.currentExercises.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {action.currentExercises.map((ex, idx) => (
                      <span
                        key={idx}
                        className="line-through text-rose-300/70 text-xs bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Ejercicios anteriores configurados en el día.</p>
                )}
              </div>

              {/* ENTRA */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-2">
                  🟢 Entra: Nuevo Enfoque ({action.dayFocus || 'Día Renovado'})
                </span>
                <p className="text-xs font-bold text-white">
                  {action.newExercises?.length || 0} ejercicios biomecánicamente optimizados
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-black/40 p-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-2.5">
                Detalle de los nuevos ejercicios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {action.newExercises?.map((ex: ExerciseSpec, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-black/50 border border-emerald-500/20 px-3 py-2 text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {idx + 1}.
                      </span>
                      {ex.name}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                      {ex.sets || 3}x{ex.reps || '8-12'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. AGREGAR EJERCICIO(S) */}
        {action.action === 'agregar_ejercicio' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs flex items-center justify-between">
              <span className="text-cyan-300 font-bold">
                Destino: Día {action.dayNumber || ''} ({action.dayFocus || 'Enfoque del Día'})
              </span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                +{action.exercises?.length || 0} Ejercicios
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
                <Plus className="h-3.5 w-3.5" />
                🟢 Entra: Ejercicios que se incorporan a la rutina:
              </span>
              <div className="space-y-2">
                {action.exercises?.map((ex: ExerciseSpec, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-black/40 border border-emerald-500/20 px-3 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                        +
                      </span>
                      <span className="font-bold text-white">{ex.name}</span>
                      {ex.muscleGroup && (
                        <span className="text-[10px] uppercase text-white/50 bg-white/5 px-2 py-0.5 rounded">
                          {ex.muscleGroup}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-md">
                      {ex.sets || 3}x{ex.reps || '8-12'} · {ex.restSeconds || 60}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ELIMINAR EJERCICIO(S) */}
        {action.action === 'eliminar_ejercicio' && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
              <Trash2 className="h-3.5 w-3.5" />
              🔴 Sale: Ejercicios que serán eliminados de la rutina:
            </span>
            <div className="space-y-2">
              {action.exercisesToRemove?.map((name: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-black/40 border border-rose-500/20 px-3 py-2.5 text-xs"
                >
                  <span className="font-bold text-rose-200 line-through">
                    {name}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                    Retirar
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CREAR RUTINA COMPLETA (COMPARACIÓN ANTES VS DESPUÉS) */}
        {action.action === 'crear_rutina' && (
          <div className="space-y-3">
            {/* ANTES (SALE) vs DESPUÉS (ENTRA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* SALE */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 block">
                    🔴 Sale: Rutina Anterior
                  </span>
                  <p className="text-xs font-bold text-white line-through opacity-80 mt-0.5">
                    {action.previousRoutineName || 'Rutina activa previa'}
                  </p>
                  <p className="text-[10px] text-rose-200/60 mt-0.5">
                    Quedará desactivada y guardada en el historial
                  </p>
                </div>
              </div>

              {/* ENTRA */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
                    🟢 Entra: Nueva Rutina
                  </span>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {action.routineName || 'Nueva Rutina Integral'}
                  </p>
                  <p className="text-[10px] text-emerald-300/80 mt-0.5">
                    {action.days?.length || 0} Días de estímulo · {action.weekCount || 4} Semanas
                  </p>
                </div>
              </div>
            </div>

            {/* Day by Day Plan Breakdown */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Estructura del Nuevo Mesociclo:
                </span>
                <span className="text-[9px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  {action.weekCount || 4} Semanas
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {action.days?.map((day, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-cyan-300 text-[11px] uppercase tracking-wide">
                        Día {day.dayNumber}: {day.focusArea}
                      </span>
                      {day.isRestDay && (
                        <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                          Descanso
                        </span>
                      )}
                    </div>
                    {day.exercises && day.exercises.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
                        {day.exercises.map((ex, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1 text-[11px]"
                          >
                            <span className="text-slate-200 font-medium truncate">
                              {ex.name}
                            </span>
                            <span className="text-[10px] text-purple-300 shrink-0 ml-1 font-mono">
                              {ex.sets}x{ex.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/40 italic mt-0.5">
                        {day.restDayNote || 'Día de recuperación activa y descanso.'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. ELIMINAR RUTINA */}
        {action.action === 'eliminar_rutina' && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              🔴 Módulo que se desactivará:
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed font-semibold">
              Rutina: &quot;{action.routineName || 'Rutina Activa'}&quot; de {action.clientName}
            </p>
            <p className="text-[11px] text-rose-200/60 mt-1 leading-relaxed">
              La rutina quedará archivada de forma segura para preservar todos los registros y progresos históricos del atleta.
            </p>
          </div>
        )}

        {/* ── Biomechanical / Clinical Rationale ── */}
        {action.rationale && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 flex items-start gap-2.5">
            <span className="text-base shrink-0">🧠</span>
            <div className="text-xs leading-relaxed text-cyan-100/90 font-medium">
              <strong className="text-cyan-300 block mb-0.5">
                Criterio Fisiológico & Biomecánico:
              </strong>
              {action.rationale}
            </div>
          </div>
        )}

        {/* ── Action Confirmation Bar ── */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold text-white/70 text-center sm:text-left">
            {applied
              ? '✓ Módulo actualizado y sincronizado en tiempo real con la base de datos.'
              : '¿Deseas aplicar estos cambios a la rutina del atleta ahora?'}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {applied ? (
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Acción Aplicada
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  disabled={applying}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Descartar
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${
                    action.action === 'eliminar_rutina'
                      ? 'from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white'
                      : 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950'
                  } text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50`}
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Aplicar Acción
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
