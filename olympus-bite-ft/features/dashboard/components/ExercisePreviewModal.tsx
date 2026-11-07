'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Exercise, Routine } from '@/features/routines/types/routines.types';
import { 
  X, 
  Dumbbell, 
  Clock, 
  Repeat, 
  Flame, 
  Eye, 
  ChevronRight, 
  Play, 
  Info, 
  CheckCircle2, 
  Target 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExercisePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: Routine | null;
  dayIndex?: number;
}

export function ExercisePreviewModal({
  isOpen,
  onClose,
  routine,
  dayIndex = 0,
}: ExercisePreviewModalProps) {
  const router = useRouter();
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);

  if (!isOpen || !routine) return null;

  const currentDay = routine.days?.[dayIndex] || routine.days?.[0];
  const exercises = currentDay?.exercises || [];
  const activeEx = exercises[selectedExerciseIndex] || exercises[0];

  const handleStartWorkout = () => {
    onClose();
    router.push('/routines');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        className="relative w-full max-w-lg bg-[#0a0d14] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-white overflow-hidden my-auto"
      >
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              {currentDay?.focusArea || 'Rutina del Día'}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {exercises.length} ejercicios
            </span>
          </div>
          <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
            {routine.name}
          </h3>
          <p className="text-xs text-cyan-400/80 font-mono flex items-center gap-1.5 mt-0.5">
            <Eye className="w-3.5 h-3.5" /> Modo Consulta — No inicia cronómetro
          </p>
        </div>

        {/* Horizontal Exercise Selector Tabs */}
        {exercises.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {exercises.map((ex, idx) => {
              const isSelected = idx === selectedExerciseIndex;
              return (
                <button
                  key={ex.id || idx}
                  onClick={() => setSelectedExerciseIndex(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] font-mono">#{idx + 1}</span>
                  <span>{ex.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Exercise Detailed Preview Card */}
        {activeEx ? (
          <div className="space-y-4">
            {/* Visual Header / GIF or Machine Representation */}
            <div className="relative rounded-2xl bg-[#111520] border border-white/10 p-4 overflow-hidden flex flex-col items-center justify-center text-center">
              {activeEx.gifUrl || activeEx.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeEx.gifUrl || activeEx.imageUrl || ''}
                  alt={activeEx.name}
                  className="w-full max-h-48 object-contain rounded-xl mb-3 bg-black/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <Dumbbell className="w-10 h-10 text-cyan-400" />
                </div>
              )}

              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-400/10 mb-1">
                {activeEx.muscleGroup || 'Músculo Principal'}
              </span>
              <h4 className="font-display font-black text-lg text-white">
                {activeEx.name}
              </h4>

              {/* Prescribed Stats Badges */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-white/10">
                <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Series</p>
                  <p className="font-display font-black text-base text-white">{activeEx.sets || 3}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Reps Meta</p>
                  <p className="font-display font-black text-base text-cyan-300">{activeEx.reps || '10-12'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Descanso</p>
                  <p className="font-display font-black text-base text-white">{activeEx.restSeconds || 90}s</p>
                </div>
              </div>
            </div>

            {/* Coach & Biomechanical Guidance */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Instrucciones Técnicas de Vital Fit Labs</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed pl-6">
                {activeEx.instructionsEs || 
                  activeEx.observations || 
                  'Mantén la tensión continua durante la fase excéntrica (3 segundos). No bloquees bruscamente las articulaciones en la extensión.'}
              </p>
              <div className="flex items-center gap-2 pl-6 pt-1 text-[11px] font-mono text-cyan-400">
                <Target className="w-3.5 h-3.5" />
                <span>RIR sugerido: 2 en recámara (RPE 7.5 - 8)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400">
            No hay ejercicios registrados para este día.
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
          <button
            onClick={handleStartWorkout}
            className="py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Entrenar Ahora
          </button>
        </div>
      </motion.div>
    </div>
  );
}
