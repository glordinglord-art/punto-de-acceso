'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { assessmentService } from '../services/assessment.service';
import type { PhysicalAssessment } from '../types/assessment.types';
import { toast } from 'react-hot-toast';
import {
  Ruler,
  Activity,
  FileText,
  Calendar,
  Flame,
  Dumbbell,
  Droplets,
  Bone,
  Scale,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientId: string;
  trainerId: string;
  assessmentToEdit?: PhysicalAssessment | null;
}

type FormTab = 'perimeters' | 'composition' | 'notes';

export function AssessmentFormModal({
  isOpen,
  onClose,
  onSaved,
  clientId,
  trainerId,
  assessmentToEdit,
}: AssessmentFormModalProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('perimeters');
  const [date, setDate] = useState<string>('');

  // Perímetros (cm)
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

  // Composición
  const [weight, setWeight] = useState<string>('');
  const [fatPercentage, setFatPercentage] = useState<string>('');
  const [musclePercentage, setMusclePercentage] = useState<string>('');
  const [waterPercentage, setWaterPercentage] = useState<string>('');
  const [bonePercentage, setBonePercentage] = useState<string>('');

  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (assessmentToEdit) {
      setDate(new Date(assessmentToEdit.date).toISOString().split('T')[0]);
      setNeck(assessmentToEdit.neck?.toString() || '');
      setBack(assessmentToEdit.back?.toString() || '');
      setRightArm(assessmentToEdit.rightArm?.toString() || '');
      setLeftArm(assessmentToEdit.leftArm?.toString() || '');
      setWaist(assessmentToEdit.waist?.toString() || '');
      setHip(assessmentToEdit.hip?.toString() || '');
      setRightThigh(assessmentToEdit.rightThigh?.toString() || '');
      setLeftThigh(assessmentToEdit.leftThigh?.toString() || '');
      setRightKnee(assessmentToEdit.rightKnee?.toString() || '');
      setLeftKnee(assessmentToEdit.leftKnee?.toString() || '');
      setRightCalf(assessmentToEdit.rightCalf?.toString() || '');
      setLeftCalf(assessmentToEdit.leftCalf?.toString() || '');

      setWeight(assessmentToEdit.weight?.toString() || '');
      setFatPercentage(assessmentToEdit.fatPercentage?.toString() || '');
      setMusclePercentage(assessmentToEdit.musclePercentage?.toString() || '');
      setWaterPercentage(assessmentToEdit.waterPercentage?.toString() || '');
      setBonePercentage(assessmentToEdit.bonePercentage?.toString() || '');
      setNotes(assessmentToEdit.notes || '');
    } else {
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
    }
    setActiveTab('perimeters');
  }, [assessmentToEdit, isOpen]);

  const toNumOrNull = (val: string): number | null => {
    const trimmed = val.trim();
    return trimmed === '' ? null : Number(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Partial<PhysicalAssessment> = {
      clientId,
      trainerId,
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
      if (assessmentToEdit?.id) {
        await assessmentService.updateAssessment(assessmentToEdit.id, payload);
        toast.success('Valoración actualizada con éxito');
      } else {
        await assessmentService.createAssessment(payload);
        toast.success('Valoración registrada exitosamente');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        'Error guardando valoración: ' +
          (err instanceof Error ? err.message : 'Error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assessmentToEdit ? 'Editar Valoración Corporal' : 'Nueva Valoración Antropométrica'}
      size="lg"
      className="p-0 bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
        {/* Top Segmented Tabs for Clean Mobile Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-white/10 bg-black/40">
          <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('perimeters')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-condensed font-bold uppercase tracking-wider transition-all',
                activeTab === 'perimeters'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Perímetros (cm)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('composition')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-condensed font-bold uppercase tracking-wider transition-all',
                activeTab === 'composition'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Composición & Peso</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-condensed font-bold uppercase tracking-wider transition-all',
                activeTab === 'notes'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notas</span>
            </button>
          </div>

          {/* Date Picker Bar */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-condensed font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>Fecha de toma:</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ──── TAB 1: PERÍMETROS CORPORALES ──── */}
          {activeTab === 'perimeters' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Torso & Cuello */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-400 block">
                  Tronco Superior & Espalda
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Cuello
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={neck}
                        onChange={(e) => setNeck(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Espalda
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brazos */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-400 block">
                  Brazos (Bíceps)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Brazo Derecho
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={rightArm}
                        onChange={(e) => setRightArm(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Brazo Izquierdo
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={leftArm}
                        onChange={(e) => setLeftArm(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cintura & Cadera */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-400 block">
                  Tronco Medio (Zona Core)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Cintura
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Cadera
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={hip}
                        onChange={(e) => setHip(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Piernas & Rodillas & Pantorrillas */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-red-400 block">
                  Tren Inferior (Piernas)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Pierna Derecha
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={rightThigh}
                        onChange={(e) => setRightThigh(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Pierna Izquierda
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={leftThigh}
                        onChange={(e) => setLeftThigh(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Rodilla D.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={rightKnee}
                        onChange={(e) => setRightKnee(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Rodilla I.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={leftKnee}
                        onChange={(e) => setLeftKnee(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Pantorrilla D.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={rightCalf}
                        onChange={(e) => setRightCalf(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 block mb-1">
                      Pantorrilla I.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={leftCalf}
                        onChange={(e) => setLeftCalf(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900/90 py-2.5 pl-3 pr-8 text-sm font-bold text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──── TAB 2: COMPOSICIÓN CORPORAL ──── */}
          {activeTab === 'composition' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Scale className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider">
                    Peso de Báscula
                  </span>
                </div>

                <div>
                  <label className="text-xs font-condensed font-bold uppercase text-neutral-300 block mb-1.5">
                    Peso Total (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ej. 74.5"
                      className="w-full rounded-2xl border-2 border-white/15 bg-neutral-900 py-3 pl-4 pr-12 text-lg font-bold text-white font-mono focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-neutral-600"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono bg-white/5 px-2 py-1 rounded-md">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider">
                    Bioimpedancia / Composición (%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 flex items-center gap-1.5 mb-1">
                      <Flame className="w-3 h-3 text-amber-400" /> % Grasa
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={fatPercentage}
                        onChange={(e) => setFatPercentage(e.target.value)}
                        placeholder="Ej. 18.2"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pl-3 pr-8 text-sm font-bold text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 flex items-center gap-1.5 mb-1">
                      <Dumbbell className="w-3 h-3 text-emerald-400" /> % Muscular
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={musclePercentage}
                        onChange={(e) => setMusclePercentage(e.target.value)}
                        placeholder="Ej. 42.5"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pl-3 pr-8 text-sm font-bold text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 flex items-center gap-1.5 mb-1">
                      <Droplets className="w-3 h-3 text-blue-400" /> % Líquido
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={waterPercentage}
                        onChange={(e) => setWaterPercentage(e.target.value)}
                        placeholder="Ej. 55.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pl-3 pr-8 text-sm font-bold text-blue-400 font-mono focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-condensed font-bold uppercase text-neutral-300 flex items-center gap-1.5 mb-1">
                      <Bone className="w-3 h-3 text-purple-400" /> % Masa Ósea
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={bonePercentage}
                        onChange={(e) => setBonePercentage(e.target.value)}
                        placeholder="Ej. 12.0"
                        className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pl-3 pr-8 text-sm font-bold text-purple-400 font-mono focus:border-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 font-mono">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──── TAB 3: NOTAS Y OBSERVACIONES ──── */}
          {activeTab === 'notes' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-2">
                <label className="text-xs font-condensed font-bold uppercase text-neutral-300 block">
                  Observaciones y Recomendaciones del Entrenador
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Escribe aquí notas sobre la evolución, técnica de entrenamiento o ajustes nutricionales para este período..."
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 p-3 text-xs text-white placeholder:text-neutral-600 focus:border-red-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          {activeTab === 'perimeters' ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="font-condensed uppercase font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('composition')}
                className="font-condensed uppercase font-bold text-xs shadow-md shadow-red-500/20"
              >
                Siguiente: Composición <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </>
          ) : activeTab === 'composition' ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('perimeters')}
                className="font-condensed uppercase font-bold text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Perímetros
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('notes')}
                className="font-condensed uppercase font-bold text-xs shadow-md shadow-red-500/20"
              >
                Siguiente: Notas <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('composition')}
                className="font-condensed uppercase font-bold text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Composición
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
                className="font-condensed uppercase font-bold text-xs shadow-lg shadow-red-500/25"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Guardar Valoración
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
