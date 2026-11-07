'use client';

import { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Flame, 
  Droplets, 
  Footprints, 
  ChevronRight, 
  RefreshCw, 
  Pencil, 
  Activity as ActivityIcon 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';

interface FitiaHabitCardsProps {
  waterGlasses: number;
  targetWaterLiters?: number;
  onWaterDelta: (delta: number) => void;
  updatingWater?: boolean;
  exerciseKcal?: number;
  neatKcal?: number;
  steps?: number;
  targetSteps?: number;
}

export function FitiaHabitCards({
  waterGlasses = 0,
  targetWaterLiters = 3.5,
  onWaterDelta,
  updatingWater = false,
  exerciseKcal = 350,
  neatKcal = 280,
  steps = 6240,
  targetSteps = 10000,
}: FitiaHabitCardsProps) {
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [syncingSteps, setSyncingSteps] = useState(false);

  // Water calculations (250ml per glass)
  const currentWaterLiters = Number(((waterGlasses * 250) / 1000).toFixed(1));
  const targetGlasses = Math.max(8, Math.round(targetWaterLiters * 4));
  const waterPct = Math.min(100, Math.round((currentWaterLiters / Math.max(targetWaterLiters, 1)) * 100));

  const totalActivityKcal = exerciseKcal + neatKcal;

  const handleSyncSteps = () => {
    setSyncingSteps(true);
    setTimeout(() => {
      setSyncingSteps(false);
      toast.success('Pasos sincronizados con podómetro');
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* ── CARD 1: ACTIVIDAD ─────────────────────────────── */}
      <div className="w-full rounded-[26px] bg-[#12141a] border border-white/[0.08] p-4 sm:p-5 shadow-lg relative overflow-hidden transition hover:border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 font-display font-bold text-lg sm:text-xl text-white">
            <span>Actividad</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-400 font-mono">
            <Flame className="w-4 h-4 fill-amber-400/40" />
            {totalActivityKcal} kcal
          </span>
        </div>

        {/* Rows */}
        <div className="space-y-2.5 mb-3 text-xs">
          {/* Row 1: Ejercicio */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <div>
                <p className="font-bold text-white">Ejercicio</p>
                <p className="text-[11px] text-neutral-400 font-medium">3-4 días por semana</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-white">{exerciseKcal} kcal</p>
              <p className="text-[10px] text-neutral-400">Promedio sesión</p>
            </div>
          </div>

          {/* Row 2: NEAT */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-base">🚶</span>
              <div>
                <p className="font-bold text-white">Estilo de vida (NEAT)</p>
                <p className="text-[11px] text-neutral-400 font-medium">Actividad cotidiana</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-white">{neatKcal} kcal</p>
              <p className="text-[10px] text-neutral-400">Gasto basal extra</p>
            </div>
          </div>
        </div>

        {/* Tactile + Button */}
        <button
          type="button"
          onClick={() => toast.success('Gasto de actividad registrado')}
          className="w-full h-11 rounded-2xl bg-[#21242d] hover:bg-[#282d38] border border-white/[0.05] text-white hover:text-cyan-300 flex items-center justify-center font-bold text-lg transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* ── CARD 2: AGUA (Fitia Style) ────────────────────── */}
      <div className="w-full rounded-[26px] bg-[#12141a] border border-white/[0.08] p-4 sm:p-5 shadow-lg relative overflow-hidden transition hover:border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 font-display font-bold text-lg sm:text-xl text-white">
            <span>Agua</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        {/* Subheader: Liters on left, Glasses on right */}
        <div className="flex items-center justify-between text-xs text-neutral-300 mb-2.5 font-mono">
          <span className="flex items-center gap-1 font-bold text-white">
            <span className="text-base">🥛</span> {currentWaterLiters} / {targetWaterLiters} L
          </span>
          <span className="text-neutral-400">
            {waterGlasses} de {targetGlasses} vasos
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.6)]"
            style={{ width: `${waterPct}%` }}
          />
        </div>

        {/* Two Big Tactile Pill Buttons: [ — ]  and  [ + ] */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={waterGlasses <= 0 || updatingWater}
            onClick={() => onWaterDelta(-1)}
            className="h-12 rounded-2xl bg-[#21242d] hover:bg-[#282d38] disabled:opacity-30 border border-white/[0.05] text-white flex items-center justify-center font-bold text-xl transition active:scale-95 cursor-pointer"
            title="Quitar un vaso (250 ml)"
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={updatingWater}
            onClick={() => onWaterDelta(1)}
            className="h-12 rounded-2xl bg-[#21242d] hover:bg-[#282d38] border border-white/[0.05] text-white hover:text-cyan-300 flex items-center justify-center font-bold text-xl transition active:scale-95 cursor-pointer"
            title="Agregar un vaso (250 ml)"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── CARD 3: PASOS ─────────────────────────────────── */}
      <div className="w-full rounded-[26px] bg-[#12141a] border border-white/[0.08] p-4 sm:p-5 shadow-lg relative overflow-hidden transition hover:border-white/15">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-lg sm:text-xl text-white">
            Pasos
          </h3>
          <button
            type="button"
            onClick={handleSyncSteps}
            disabled={syncingSteps}
            className="px-3 py-1 rounded-full bg-[#21242d] hover:bg-[#2a2f3d] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className={cn('w-3 h-3', syncingSteps && 'animate-spin')} />
            <span>Sincronizar</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👟</span>
            <div>
              <p className="font-display font-bold text-base text-white tabular-nums">
                {currentSteps.toLocaleString('es-ES')} <span className="text-xs text-neutral-400 font-normal">/ {targetSteps.toLocaleString('es-ES')} pasos</span>
              </p>
              <div className="w-36 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentSteps / targetSteps) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const val = prompt('Ingresa tus pasos actuales:', String(currentSteps));
              if (val && !isNaN(Number(val))) {
                setCurrentSteps(Number(val));
                toast.success('Pasos actualizados');
              }
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Editar pasos manualmente"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
