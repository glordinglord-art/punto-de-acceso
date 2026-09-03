'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { assessmentService } from '../services/assessment.service';
import type {
  PhysicalAssessment,
  AssessmentProgressSummary,
} from '../types/assessment.types';
import { formatDate } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConfirm } from '@/shared/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Ruler,
  TrendingUp,
  Edit2,
  Trash2,
  Activity,
  Flame,
  Dumbbell,
  Sparkles,
  ArrowLeft,
  Calendar,
  Scale,
  Droplets,
  Bone,
  Check,
  FileText,
} from 'lucide-react';

interface ClientAssessmentsTabProps {
  clientId: string;
  isTrainer?: boolean;
}

export function ClientAssessmentsTab({
  clientId,
  isTrainer = true,
}: ClientAssessmentsTabProps) {
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<AssessmentProgressSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // View state: 'history' or 'form' (Inline sub-view to prevent modal-in-modal bugs!)
  const [viewMode, setViewMode] = useState<'history' | 'form'>('history');
  const [editingAssessment, setEditingAssessment] =
    useState<PhysicalAssessment | null>(null);

  // Form State
  const [date, setDate] = useState<string>('');
  const [neck, setNeck] = useState<string>('');
  const [back, setBack] = useState<string>('');
  const [rightArm, setRightArm] = useState<string>('');
  const [leftArm, setLeftArm] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hip, setHip] = useState<string>('');
  const [rightThigh, setRightThigh] = useState<string>('');
  const [leftThigh, setLeftThigh] = useState<string>('');
  const [rightKnee, setRightKnee] = useState<string>('');
  const [leftKnee, setLeftKnee] = useState<string>('');
  const [rightCalf, setRightCalf] = useState<string>('');
  const [leftCalf, setLeftCalf] = useState<string>('');

  const [weight, setWeight] = useState<string>('');
  const [fatPercentage, setFatPercentage] = useState<string>('');
  const [musclePercentage, setMusclePercentage] = useState<string>('');
  const [waterPercentage, setWaterPercentage] = useState<string>('');
  const [bonePercentage, setBonePercentage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assessmentService.getClientAssessments(clientId);
      setAssessments(res.assessments || []);
      setProgressSummary(res.progressSummary || null);
    } catch (err) {
      toast.error(
        'Error cargando valoraciones: ' +
          (err instanceof Error ? err.message : 'Error')
      );
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingAssessment(null);
    setDate(new Date().toISOString().split('T')[0]);
    setNeck('');
    setBack('');
    setRightArm('');
    setLeftArm('');
    setWaist('');
    setHip('');
    setRightThigh('');
    setLeftThigh('');
    setRightKnee('');
    setLeftKnee('');
    setRightCalf('');
    setLeftCalf('');

    setWeight('');
    setFatPercentage('');
    setMusclePercentage('');
    setWaterPercentage('');
    setBonePercentage('');
    setNotes('');
    setViewMode('form');
  };

  const handleOpenEdit = (item: PhysicalAssessment) => {
    setEditingAssessment(item);
    setDate(new Date(item.date).toISOString().split('T')[0]);
    setNeck(item.neck?.toString() || '');
    setBack(item.back?.toString() || '');
    setRightArm(item.rightArm?.toString() || '');
    setLeftArm(item.leftArm?.toString() || '');
    setWaist(item.waist?.toString() || '');
    setHip(item.hip?.toString() || '');
    setRightThigh(item.rightThigh?.toString() || '');
    setLeftThigh(item.leftThigh?.toString() || '');
    setRightKnee(item.rightKnee?.toString() || '');
    setLeftKnee(item.leftKnee?.toString() || '');
    setRightCalf(item.rightCalf?.toString() || '');
    setLeftCalf(item.leftCalf?.toString() || '');

    setWeight(item.weight?.toString() || '');
    setFatPercentage(item.fatPercentage?.toString() || '');
    setMusclePercentage(item.musclePercentage?.toString() || '');
    setWaterPercentage(item.waterPercentage?.toString() || '');
    setBonePercentage(item.bonePercentage?.toString() || '');
    setNotes(item.notes || '');
    setViewMode('form');
  };

  const toNumOrNull = (val: string): number | null => {
    const trimmed = val.trim();
    return trimmed === '' ? null : Number(trimmed);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Partial<PhysicalAssessment> = {
      clientId,
      trainerId: user?.id || '',
      date: date || new Date().toISOString(),
      neck: toNumOrNull(neck),
      back: toNumOrNull(back),
      rightArm: toNumOrNull(rightArm),
      leftArm: toNumOrNull(leftArm),
      waist: toNumOrNull(waist),
      hip: toNumOrNull(hip),
      rightThigh: toNumOrNull(rightThigh),
      leftThigh: toNumOrNull(leftThigh),
      rightKnee: toNumOrNull(rightKnee),
      leftKnee: toNumOrNull(leftKnee),
      rightCalf: toNumOrNull(rightCalf),
      leftCalf: toNumOrNull(leftCalf),
      weight: toNumOrNull(weight),
      fatPercentage: toNumOrNull(fatPercentage),
      musclePercentage: toNumOrNull(musclePercentage),
      waterPercentage: toNumOrNull(waterPercentage),
      bonePercentage: toNumOrNull(bonePercentage),
      notes: notes.trim() || null,
    };

    try {
      if (editingAssessment?.id) {
        await assessmentService.updateAssessment(editingAssessment.id, payload);
        toast.success('Valoración actualizada con éxito');
      } else {
        await assessmentService.createAssessment(payload);
        toast.success('Valoración guardada con éxito');
      }
      setViewMode('history');
      loadData();
    } catch (err) {
      toast.error(
        'Error guardando valoración: ' +
          (err instanceof Error ? err.message : 'Error')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: '¿Eliminar valoración?',
      description:
        'Esta acción eliminará el registro de medidas de forma permanente.',
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await assessmentService.deleteAssessment(id);
      toast.success('Valoración eliminada');
      loadData();
    } catch (err) {
      toast.error(
        'Error eliminando valoración: ' +
          (err instanceof Error ? err.message : 'Error')
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // VIEW MODE: FORMULARIO (INLINE SIN MODAL ANIDADO)
  // ═══════════════════════════════════════════════════════════════
  if (viewMode === 'form') {
    return (
      <form onSubmit={handleSaveForm} className="space-y-6 animate-in fade-in duration-200">
        {/* Sub-Header Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setViewMode('history')}
              className="font-condensed uppercase font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver al Historial
            </Button>
            <div>
              <h3 className="text-base sm:text-lg font-condensed font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                {editingAssessment ? 'Editar Valoración Corporal' : 'Nueva Valoración Antropométrica'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ingresa perímetros musculares en cm y porcentajes de bioimpedancia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Fecha:
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-transparent text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Perímetros Corporales en cm (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-white/10">
              <Ruler className="w-4 h-4 text-red-500" />
              <h4 className="text-sm font-condensed font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                1. Perímetros Corporales (cm)
              </h4>
            </div>

            {/* Tronco Superior */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-500 block">
                Tronco Superior & Espalda
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Cuello
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={neck}
                      onChange={(e) => setNeck(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Espalda
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brazos */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-500 block">
                Brazos (Bíceps)
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Brazo Derecho
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={rightArm}
                      onChange={(e) => setRightArm(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Brazo Izquierdo
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={leftArm}
                      onChange={(e) => setLeftArm(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zona Core: Cintura & Cadera */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-500 block">
                Tronco Medio (Zona Core)
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Cintura
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Cadera
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={hip}
                      onChange={(e) => setHip(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Piernas & Rodillas & Pantorrillas */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-500 block">
                Tren Inferior (Piernas)
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Pierna Derecha
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={rightThigh}
                      onChange={(e) => setRightThigh(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Pierna Izquierda
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={leftThigh}
                      onChange={(e) => setLeftThigh(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Rodilla Derecha
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={rightKnee}
                      onChange={(e) => setRightKnee(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Rodilla Izquierda
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={leftKnee}
                      onChange={(e) => setLeftKnee(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Pantorrilla Derecha
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={rightCalf}
                      onChange={(e) => setRightCalf(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1">
                    Pantorrilla Izquierda
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={leftCalf}
                      onChange={(e) => setLeftCalf(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Composición Corporal & Notas (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-white/10">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-condensed font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                2. Peso & Composición Física
              </h4>
            </div>

            {/* Peso de Báscula */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                <Scale className="w-4 h-4 text-red-500" />
                <span className="text-xs font-condensed font-bold uppercase tracking-wider">
                  Báscula
                </span>
              </div>
              <div>
                <label className="text-xs font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  Peso Corporal Actual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 75.0"
                    className="w-full rounded-2xl border-2 border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-black/40 py-3 pl-4 pr-12 text-xl font-bold text-neutral-900 dark:text-white font-mono focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500 dark:text-neutral-300 font-mono bg-neutral-200 dark:bg-white/10 px-2 py-1 rounded-md">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Bioimpedancia */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-4">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-emerald-500 block">
                Porcentajes de Bioimpedancia (%)
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mb-1">
                    <Flame className="w-3 h-3 text-amber-500" /> % Grasa
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={fatPercentage}
                      onChange={(e) => setFatPercentage(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-amber-500 font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mb-1">
                    <Dumbbell className="w-3 h-3 text-emerald-500" /> % Muscular
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={musclePercentage}
                      onChange={(e) => setMusclePercentage(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-emerald-500 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-blue-500" /> % Líquido
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={waterPercentage}
                      onChange={(e) => setWaterPercentage(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-blue-500 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-condensed font-bold uppercase text-neutral-600 dark:text-neutral-300 flex items-center gap-1 mb-1">
                    <Bone className="w-3 h-3 text-purple-500" /> % Óseo
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={bonePercentage}
                      onChange={(e) => setBonePercentage(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 py-2.5 pl-3 pr-8 text-sm font-bold text-purple-500 font-mono focus:border-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 font-mono">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                <FileText className="w-4 h-4 text-neutral-400" />
                <label className="text-xs font-condensed font-bold uppercase tracking-wider block">
                  Observaciones del Entrenador
                </label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anotaciones sobre técnica, sensaciones o ajustes de plan..."
                className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/30 p-3 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-red-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setViewMode('history')}
                className="w-1/3 font-condensed uppercase font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                className="w-2/3 font-condensed uppercase font-bold text-xs shadow-lg shadow-red-500/25"
              >
                <Check className="w-4 h-4 mr-1.5" /> Guardar Valoración
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VIEW MODE: HISTORIAL & TABLA DE MEDIDAS
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-condensed font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Historial de Valoraciones Antropométricas
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {assessments.length} {assessments.length === 1 ? 'registro' : 'registros'} de medidas y evolución física
            </p>
          </div>
        </div>

        {isTrainer && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenCreate}
            className="font-condensed uppercase font-bold text-xs shadow-md shadow-red-500/20 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nueva Valoración
          </Button>
        )}
      </div>

      {/* Smart Evolution & Progress Diagnostic Card */}
      {progressSummary?.hasComparison && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-red-500/[0.06] via-neutral-900/60 to-black/80 border border-red-500/30 space-y-4 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-condensed text-white">
                Diagnóstico de Evolución Corporal del Sistema
              </h4>
            </div>
            <span className="text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-md">
              Progreso acumulado
            </span>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {progressSummary.deltaMuscle !== null && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                  Masa Muscular
                </span>
                <p className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {progressSummary.deltaMuscle > 0
                    ? `+${progressSummary.deltaMuscle}%`
                    : `${progressSummary.deltaMuscle}%`}
                </p>
              </div>
            )}

            {progressSummary.deltaFat !== null && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                  Grasa Corporal
                </span>
                <p className="text-base font-bold font-mono text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {progressSummary.deltaFat > 0
                    ? `+${progressSummary.deltaFat}%`
                    : `${progressSummary.deltaFat}%`}
                </p>
              </div>
            )}

            {progressSummary.deltaWaist !== null && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                  Cintura
                </span>
                <p className="text-base font-bold font-mono text-white flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  {progressSummary.deltaWaist > 0
                    ? `+${progressSummary.deltaWaist} cm`
                    : `${progressSummary.deltaWaist} cm`}
                </p>
              </div>
            )}

            {progressSummary.deltaWeight !== null && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                  Peso Corporal
                </span>
                <p className="text-base font-bold font-mono text-white flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                  {progressSummary.deltaWeight > 0
                    ? `+${progressSummary.deltaWeight} kg`
                    : `${progressSummary.deltaWeight} kg`}
                </p>
              </div>
            )}
          </div>

          {/* Smart Insights Bullets */}
          {progressSummary.smartInsights.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-300">
                {progressSummary.smartInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* History Table Replica */}
      {loading ? (
        <div className="p-8 text-center text-neutral-400 font-condensed uppercase tracking-wider text-xs">
          Cargando valoraciones...
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl border border-dashed border-red-500/25 text-center bg-gradient-to-b from-red-500/[0.04] via-neutral-900/40 to-black/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500 shadow-inner">
            <Ruler className="w-8 h-8" />
          </div>
          <h4 className="text-base font-condensed font-bold uppercase tracking-wider text-white">
            Sin valoraciones registradas
          </h4>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Registra la primera valoración antropométrica para comenzar a graficar y medir los perímetros corporales y avances del alumno.
          </p>
          {isTrainer && (
            <Button
              size="md"
              variant="primary"
              onClick={handleOpenCreate}
              className="mt-5 font-condensed uppercase font-bold text-xs shadow-xl shadow-red-500/25 px-6"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tomar Primera Valoración
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-condensed uppercase tracking-wider px-1">
            <span>Registro Cronológico de Medidas</span>
            <span className="sm:hidden text-red-400 font-bold">↔ Desliza para ver más columnas</span>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-white dark:bg-neutral-900/60 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-black/40 text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
                    <th className="p-3 pl-4">Fecha</th>
                    <th className="p-3">Cuello</th>
                    <th className="p-3">Espalda</th>
                    <th className="p-3">Brazo D</th>
                    <th className="p-3">Brazo I</th>
                    <th className="p-3">Cintura</th>
                    <th className="p-3">Cadera</th>
                    <th className="p-3">Pierna D</th>
                    <th className="p-3">Pierna I</th>
                    <th className="p-3">Rodilla D</th>
                    <th className="p-3">Rodilla I</th>
                    <th className="p-3">Pantorrilla D</th>
                    <th className="p-3">Pantorrilla I</th>
                    <th className="p-3 font-bold text-white">Peso</th>
                    <th className="p-3 text-amber-400">% Grasa</th>
                    <th className="p-3 text-blue-400">% Líquido</th>
                    <th className="p-3 text-emerald-400">% Muscular</th>
                    <th className="p-3 text-purple-400">% Óseo</th>
                    {isTrainer && <th className="p-3 pr-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5 font-mono text-xs whitespace-nowrap">
                  {assessments.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-3 pl-4 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                        {formatDate(item.date)}
                      </td>
                      <td className="p-3 text-neutral-400">{item.neck ?? '--'}</td>
                      <td className="p-3 text-neutral-400">{item.back ?? '--'}</td>
                      <td className="p-3 text-white font-bold">{item.rightArm ?? '--'}</td>
                      <td className="p-3 text-white">{item.leftArm ?? '--'}</td>
                      <td className="p-3 text-white font-bold">{item.waist ?? '--'}</td>
                      <td className="p-3 text-white">{item.hip ?? '--'}</td>
                      <td className="p-3 text-white">{item.rightThigh ?? '--'}</td>
                      <td className="p-3 text-white">{item.leftThigh ?? '--'}</td>
                      <td className="p-3 text-neutral-400">{item.rightKnee ?? '--'}</td>
                      <td className="p-3 text-neutral-400">{item.leftKnee ?? '--'}</td>
                      <td className="p-3 text-neutral-400">{item.rightCalf ?? '--'}</td>
                      <td className="p-3 text-neutral-400">{item.leftCalf ?? '--'}</td>
                      <td className="p-3 font-bold text-white">
                        {item.weight ? `${item.weight} kg` : '--'}
                      </td>
                      <td className="p-3 text-amber-400 font-bold">
                        {item.fatPercentage ? `${item.fatPercentage}%` : '--'}
                      </td>
                      <td className="p-3 text-blue-400">
                        {item.waterPercentage ? `${item.waterPercentage}%` : '--'}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        {item.musclePercentage ? `${item.musclePercentage}%` : '--'}
                      </td>
                      <td className="p-3 text-purple-400">
                        {item.bonePercentage ? `${item.bonePercentage}%` : '--'}
                      </td>
                      {isTrainer && (
                        <td className="p-3 pr-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Editar valoración"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Eliminar valoración"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
