'use client';

import { useState } from 'react';
import { VitalFitLogo } from '@/shared/components/ui/VitalFitLogo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Flame,
  Calendar,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export type GymPlanTier = 'basico_gym' | 'pro_hibrido' | 'elite_vip';

interface GymCarnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: GymPlanTier;
  onSelectTier?: (tier: GymPlanTier) => void;
}

export const GYM_PLANS: Record<GymPlanTier, {
  name: string;
  tag: string;
  badge: string;
  color: string;
  borderColor: string;
  glowColor: string;
  features: string[];
  recommended?: boolean;
}> = {
  basico_gym: {
    name: 'Plan Básico Gym',
    tag: 'Acceso Físico',
    badge: 'BÁSICO',
    color: '#00F0FF',
    borderColor: 'border-cyan-500/40',
    glowColor: 'rgba(0,240,255,0.2)',
    features: [
      'Acceso completo a sala de pesas y máquinas',
      'Carnet digital QR para molinetes de entrada',
      'Rutina base guiada en app Vital Fit',
      'Registro de hidratación y peso en ayunas',
    ],
  },
  pro_hibrido: {
    name: 'Plan Pro Híbrido',
    tag: 'Gym + Nutrición IA',
    badge: 'PRO HÍBRIDO',
    color: '#00F0FF',
    borderColor: 'border-cyan-400',
    glowColor: 'rgba(0,240,255,0.35)',
    recommended: true,
    features: [
      'Todo lo del Plan Básico Gym',
      'Reconocimiento nutricional por fotos con IA (Gemini & MiMo)',
      'Rutinas personalizadas diseñadas por tu entrenador',
      'Monitoreo semanal de macros y balance calórico',
      'Ajustes de sobrecarga progresiva',
    ],
  },
  elite_vip: {
    name: 'Plan Élite VIP Clínico',
    tag: 'Director Clínico + Coach 1a1',
    badge: 'ÉLITE VIP',
    color: '#8B5CF6',
    borderColor: 'border-purple-500',
    glowColor: 'rgba(139,92,246,0.35)',
    features: [
      'Todo lo del Plan Pro Híbrido',
      'Co-Piloto Director Clínico IA: Autorregulación del SNC y biomecánica en vivo',
      'Entrenador personal dedicado 1 a 1',
      'Valoraciones antropométricas presenciales mensuales (US Navy & plicometría)',
      'Soporte prioritario 24/7 en Vital Fit Labs',
    ],
  },
};

export function GymCarnetModal({
  isOpen,
  onClose,
  currentTier = 'pro_hibrido',
  onSelectTier,
}: GymCarnetModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<GymPlanTier>(currentTier);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const plan = GYM_PLANS[selectedPlan];
  const athleteCode = `VF-${(user?.id || 'LABS2026').slice(0, 8).toUpperCase()}`;

  const copyCode = () => {
    navigator.clipboard.writeText(athleteCode);
    setCopied(true);
    toast.success('Código de socio copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTierChange = (tier: GymPlanTier) => {
    setSelectedPlan(tier);
    onSelectTier?.(tier);
    toast.success(`Plan seleccionado: ${GYM_PLANS[tier].name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        className="relative w-full max-w-md bg-[#090b10] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-white overflow-hidden my-auto"
      >
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <VitalFitLogo size="sm" showGlow glowIntensity="high" />
          <div>
            <h3 className="font-display font-black text-lg tracking-wide uppercase text-white leading-tight">
              Carnet Digital
            </h3>
            <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Centro de Acondicionamiento Físico
            </p>
          </div>
        </div>

        {/* Digital Gym ID Pass Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#11141e] to-[#0b0e14] border border-cyan-400/30 p-4 shadow-xl overflow-hidden mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Membresía Activa
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              {plan.badge}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* High-Tech Vector QR Pattern */}
            <div className="relative p-2.5 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <svg width="100" height="100" viewBox="0 0 100 100" className="w-24 h-24 text-black">
                {/* 3 Position Detection Boxes */}
                <rect x="5" y="5" width="26" height="26" fill="black" rx="4" />
                <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

                <rect x="69" y="5" width="26" height="26" fill="black" rx="4" />
                <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

                <rect x="5" y="69" width="26" height="26" fill="black" rx="4" />
                <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

                {/* Data Matrix Dots */}
                <rect x="36" y="8" width="6" height="6" fill="black" />
                <rect x="48" y="8" width="6" height="6" fill="black" />
                <rect x="36" y="20" width="6" height="6" fill="black" />
                <rect x="48" y="20" width="6" height="6" fill="black" />
                <rect x="58" y="14" width="6" height="6" fill="black" />

                <rect x="8" y="36" width="6" height="6" fill="black" />
                <rect x="20" y="36" width="6" height="6" fill="black" />
                <rect x="8" y="48" width="6" height="6" fill="black" />
                <rect x="20" y="48" width="6" height="6" fill="black" />

                {/* Central grid */}
                <rect x="36" y="36" width="8" height="8" fill="black" />
                <rect x="56" y="36" width="8" height="8" fill="black" />
                <rect x="46" y="46" width="8" height="8" fill="black" />
                <rect x="36" y="56" width="8" height="8" fill="black" />
                <rect x="56" y="56" width="8" height="8" fill="black" />

                <rect x="69" y="36" width="6" height="6" fill="black" />
                <rect x="85" y="42" width="6" height="6" fill="black" />
                <rect x="72" y="52" width="6" height="6" fill="black" />
                <rect x="88" y="60" width="6" height="6" fill="black" />

                <rect x="36" y="69" width="6" height="6" fill="black" />
                <rect x="48" y="75" width="6" height="6" fill="black" />
                <rect x="58" y="85" width="6" height="6" fill="black" />
                <rect x="42" y="88" width="6" height="6" fill="black" />
                <rect x="72" y="78" width="8" height="8" fill="black" />
                <rect x="84" y="84" width="8" height="8" fill="black" />
              </svg>
            </div>

            {/* Pass details */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                Socio Atleta
              </p>
              <h4 className="font-display font-black text-lg text-white truncate">
                {user?.name || 'Atleta Vital Fit'}
              </h4>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {plan.name}
              </p>

              {/* ID Pill */}
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300 cursor-pointer transition active:scale-95"
                title="Copiar ID de Socio"
              >
                <span>{athleteCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <Building2 className="w-3 h-3" /> Sede Principal Vital Fit
            </span>
            <span>Molinete / Recepción</span>
          </div>
        </div>

        {/* 3 Membership Plans Selector */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Tipos de Planes del Gimnasio
          </p>

          {(Object.keys(GYM_PLANS) as GymPlanTier[]).map((tierKey) => {
            const item = GYM_PLANS[tierKey];
            const isSelected = selectedPlan === tierKey;

            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => handleTierChange(tierKey)}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `${item.borderColor} bg-white/[0.06] shadow-[0_0_20px_${item.glowColor}]`
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {tierKey === 'elite_vip' ? (
                      <Crown className="w-4 h-4 text-purple-400" />
                    ) : tierKey === 'pro_hibrido' ? (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Zap className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-display font-bold text-sm text-white">
                      {item.name}
                    </span>
                    {item.recommended && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400 text-black">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 mb-2 font-medium">
                  {item.tag}
                </p>

                {isSelected && (
                  <ul className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[11px] text-neutral-300">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
        >
          Listo
        </button>
      </motion.div>
    </div>
  );
}
