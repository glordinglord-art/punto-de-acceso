'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { assessmentService } from '../services/assessment.service';
import type { PhysicalAssessment } from '../types/assessment.types';
import { toast } from 'react-hot-toast';
import { Ruler, Activity, FileText } from 'lucide-react';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientId: string;
  trainerId: string;
  assessmentToEdit?: PhysicalAssessment | null;
}

export function AssessmentFormModal({
  isOpen,
  onClose,
  onSaved,
  clientId,
  trainerId,
  assessmentToEdit,
}: AssessmentFormModalProps) {
  const [date, setDate] = useState<string>('');
  
  // Perímetros
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
        toast.success('Valoración actualizada exitosamente');
      } else {
        await assessmentService.createAssessment(payload);
        toast.success('Valoración registrada exitosamente');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Error guardando valoración: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      className="p-6 bg-neutral-900 border border-white/10 rounded-3xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wider text-white">
              {assessmentToEdit ? 'Editar Valoración Corporal' : 'Nueva Valoración Antropométrica'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Registra perímetros musculares y composición física del alumno
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Fecha:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Section 1: Perímetros Corporales (cm) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 border-b border-white/5 pb-2">
            <Ruler className="w-4 h-4" />
            <h4 className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
              1. Medidas y Perímetros Corporales (cm)
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Cuello
              </label>
              <input
                type="number"
                step="0.1"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Espalda
              </label>
              <input
                type="number"
                step="0.1"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Brazo D.
              </label>
              <input
                type="number"
                step="0.1"
                value={rightArm}
                onChange={(e) => setRightArm(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Brazo I.
              </label>
              <input
                type="number"
                step="0.1"
                value={leftArm}
                onChange={(e) => setLeftArm(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Cintura
              </label>
              <input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Cadera
              </label>
              <input
                type="number"
                step="0.1"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Pierna D.
              </label>
              <input
                type="number"
                step="0.1"
                value={rightThigh}
                onChange={(e) => setRightThigh(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Pierna I.
              </label>
              <input
                type="number"
                step="0.1"
                value={leftThigh}
                onChange={(e) => setLeftThigh(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Rodilla D.
              </label>
              <input
                type="number"
                step="0.1"
                value={rightKnee}
                onChange={(e) => setRightKnee(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Rodilla I.
              </label>
              <input
                type="number"
                step="0.1"
                value={leftKnee}
                onChange={(e) => setLeftKnee(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Pantorrilla D.
              </label>
              <input
                type="number"
                step="0.1"
                value={rightCalf}
                onChange={(e) => setRightCalf(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Pantorrilla I.
              </label>
              <input
                type="number"
                step="0.1"
                value={leftCalf}
                onChange={(e) => setLeftCalf(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Composición Corporal */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4" />
            <h4 className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
              2. Composición Física y Peso
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                % Grasa
              </label>
              <input
                type="number"
                step="0.1"
                value={fatPercentage}
                onChange={(e) => setFatPercentage(e.target.value)}
                placeholder="%"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-amber-400 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                % Muscular
              </label>
              <input
                type="number"
                step="0.1"
                value={musclePercentage}
                onChange={(e) => setMusclePercentage(e.target.value)}
                placeholder="%"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                % Líquido
              </label>
              <input
                type="number"
                step="0.1"
                value={waterPercentage}
                onChange={(e) => setWaterPercentage(e.target.value)}
                placeholder="%"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-blue-400 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-condensed font-bold uppercase text-neutral-400 block mb-1">
                % Óseo
              </label>
              <input
                type="number"
                step="0.1"
                value={bonePercentage}
                onChange={(e) => setBonePercentage(e.target.value)}
                placeholder="%"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-purple-400 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notas */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-neutral-400 border-b border-white/5 pb-2">
            <FileText className="w-4 h-4" />
            <h4 className="text-xs font-condensed font-bold uppercase tracking-wider text-white">
              3. Observaciones del Entrenador
            </h4>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anotaciones sobre la técnica, sensaciones o recomendaciones..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            className="font-condensed uppercase font-bold text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="font-condensed uppercase font-bold text-xs shadow-lg shadow-red-500/20"
          >
            Guardar Valoración
          </Button>
        </div>
      </form>
    </Modal>
  );
}
