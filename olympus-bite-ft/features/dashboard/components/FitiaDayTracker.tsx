'use client';

import { useState, useMemo } from 'react';
import { Flame, Check, X, Trophy } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { cn, getLocalDateString } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface FitiaDayTrackerProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  streakDays?: number;
  rightAction?: React.ReactNode;
  completionMap?: Record<string, number>; // dateStr -> percentage (0 to 100)
  isTodayCompleted?: boolean;
}

export function FitiaDayTracker({
  selectedDate,
  onSelectDate,
  streakDays = 4,
  rightAction,
  completionMap,
  isTodayCompleted,
}: FitiaDayTrackerProps) {
  const { user } = useAuth();
  const today = getLocalDateString();
  const activeDate = selectedDate || today;
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Generate the current Monday-to-Sunday week
  const weekDays = useMemo(() => {
    const now = new Date(activeDate + 'T12:00:00');
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = getLocalDateString(d);
      const dayLetters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      const isSelected = dateStr === activeDate;
      const isToday = dateStr === today;
      const isPast = dateStr < today;

      // Completion calculation
      let pct = 0;
      if (completionMap && completionMap[dateStr] !== undefined) {
        pct = completionMap[dateStr];
      } else if (isPast) {
        // Mock fallback for past days in active streak
        pct = 100;
      } else if (isToday) {
        pct = isTodayCompleted ? 100 : 0;
      }

      const isFull = pct >= 85;
      const isPartial = pct > 0 && pct < 85;

      return {
        dateStr,
        dayNum: d.getDate(),
        dayLetter: dayLetters[idx],
        isSelected,
        isToday,
        isPast,
        pct,
        isFull,
        isPartial,
      };
    });
  }, [activeDate, today, completionMap, isTodayCompleted]);

  // Check if today is completed full to unlock Duolingo flame
  const todayData = weekDays.find((d) => d.isToday);
  const flameUnlocked = isTodayCompleted || (todayData ? todayData.isFull : false);

  const formatHeaderDate = (dateStr: string) => {
    if (dateStr === today) return 'Hoy';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === getLocalDateString(yesterday)) return 'Ayer';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // SVG parameters for each day's circular ring ("ruedita")
  const circleSize = 42;
  const strokeWidth = 3.2;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
      <div className="w-full bg-white dark:bg-[#101318] rounded-3xl border border-slate-200/80 dark:border-white/8 p-4 sm:p-5 shadow-sm relative overflow-hidden">
        {/* Glow ambient background when flame is unlocked */}
        {flameUnlocked && (
          <div className="absolute -top-10 right-4 w-40 h-24 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
        )}

        {/* ── Top Bar: Date hint & Streak Fueguito 🔥 ── */}
        <div className="flex items-center justify-between px-2 mb-3.5">
          {/* Left: Selected Day label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-condensed font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {formatHeaderDate(activeDate)}
            </span>
            {todayData?.isFull && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3 stroke-[3]" /> Completado
              </span>
            )}
            {todayData?.isPartial && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                En progreso
              </span>
            )}
          </div>

          {/* Right: 🔥 Streak Button (Desbloqueado estilo Duolingo) + User Avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              className={cn(
                'group relative flex items-center gap-1.5 font-condensed font-black text-sm px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer select-none active:scale-95',
                flameUnlocked
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-red-500/20 border-amber-400/50 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)] animate-pulse'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
              )}
              title={flameUnlocked ? '¡Racha activa desbloqueada!' : 'Completa tu día para encender tu racha'}
            >
              <Flame
                className={cn(
                  'w-4 h-4 transition-transform duration-300 group-hover:scale-125',
                  flameUnlocked
                    ? 'fill-amber-400 text-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-bounce'
                    : 'text-amber-500/50 fill-amber-500/20'
                )}
              />
              <span className={cn(flameUnlocked ? 'text-amber-300' : 'text-slate-400')}>
                {streakDays}
              </span>
              {flameUnlocked && (
                <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase text-amber-400/90 pl-0.5">
                  Racha
                </span>
              )}
            </button>

            {rightAction ? (
              rightAction
            ) : (
              <Avatar
                name={user?.name || 'Atleta'}
                size="sm"
                className="ring-2 ring-primary-500/40 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* ── Week Days Track (Rueditas Circulares de Progreso) ── */}
        <div className="flex items-center justify-between max-w-xl mx-auto relative px-1 sm:px-2">
          {weekDays.map((d) => {
            // Circle offset based on pct (0 to 100)
            const strokeDashoffset = circumference - (Math.min(d.pct, 100) / 100) * circumference;

            return (
              <div key={d.dateStr} className="flex-1 flex items-center justify-center relative">
                <button
                  type="button"
                  onClick={() => onSelectDate?.(d.dateStr)}
                  className="flex flex-col items-center group cursor-pointer relative z-10 py-1"
                >
                  {/* Day Letter */}
                  <span
                    className={cn(
                      'text-[11px] font-bold uppercase mb-1.5 transition-colors',
                      d.isSelected
                        ? 'text-white font-black'
                        : d.isToday
                        ? 'text-primary-400'
                        : 'text-slate-500'
                    )}
                  >
                    {d.dayLetter}
                  </span>

                  {/* Circular Ring ("Ruedita") Container */}
                  <div
                    className={cn(
                      'relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                      d.isSelected && 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#101318] rounded-full'
                    )}
                    style={{ width: circleSize, height: circleSize }}
                  >
                    <svg
                      width={circleSize}
                      height={circleSize}
                      viewBox={`0 0 ${circleSize} ${circleSize}`}
                      className="absolute inset-0 -rotate-90 pointer-events-none"
                    >
                      {/* Background track circle */}
                      <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-slate-200 dark:text-white/[0.08]"
                      />

                      {/* Foreground Progress Ring */}
                      {d.pct > 0 && (
                        <circle
                          cx={circleSize / 2}
                          cy={circleSize / 2}
                          r={radius}
                          fill={d.isFull ? 'rgba(16, 185, 129, 0.14)' : 'transparent'}
                          stroke={d.isFull ? '#10b981' : '#f97316'}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={d.isFull ? 0 : strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                          style={{
                            filter: d.isFull
                              ? 'drop-shadow(0 0 4px rgba(16,185,129,0.6))'
                              : 'drop-shadow(0 0 3px rgba(249,115,22,0.5))',
                          }}
                        />
                      )}
                    </svg>

                    {/* Day Number in Center */}
                    <span
                      className={cn(
                        'relative z-10 text-[13px] sm:text-[14px] font-bold transition-all',
                        d.isFull
                          ? 'text-emerald-400 font-black'
                          : d.isPartial
                          ? 'text-orange-400 font-bold'
                          : d.isSelected
                          ? 'text-white'
                          : 'text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {d.dayNum}
                    </span>
                  </div>

                  {/* Status Indicator Dot below */}
                  <div className="h-2 flex items-center justify-center mt-1">
                    {d.isFull ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
                    ) : d.isPartial ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_4px_#f97316]" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal Celebración de Racha (Estilo Duolingo) ── */}
      <AnimatePresence>
        {showStreakModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[32px] border border-amber-500/30 bg-[#12151c] p-6 shadow-2xl text-center overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/20 rounded-full blur-[50px] pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowStreakModal(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Huge Duolingo Animated Flame */}
              <div className="relative mx-auto my-4 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-60 pointer-events-none" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  <Flame className="w-12 h-12 fill-white text-white animate-bounce" />
                </div>
              </div>

              {/* Streak Title & Days */}
              <h3 className="text-3xl font-black text-white tracking-tight">
                {streakDays} {streakDays === 1 ? 'DÍA' : 'DÍAS'} DE RACHA
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-300 px-2">
                {flameUnlocked
                  ? '¡Objetivo del día completado con éxito! Tu disciplina está en llamas. Mantén la constancia mañana para seguir batiendo tu récord.'
                  : '¡Tu fuego está esperando! Registra tus comidas y hábitos para completar la ruedita verde de hoy y encender tu racha.'}
              </p>

              {/* Mini Week Progress Rings inside modal */}
              <div className="my-5 flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-white/5 border border-white/5">
                {weekDays.map((d) => (
                  <div key={d.dateStr} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white/40 mb-1">{d.dayLetter}</span>
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border',
                        d.isFull
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : d.isPartial
                          ? 'border-orange-400 bg-orange-500/20 text-orange-300'
                          : 'border-white/10 bg-white/5 text-white/30'
                      )}
                    >
                      {d.isFull ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : d.dayNum}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                {flameUnlocked ? 'Fuego desbloqueado hoy' : 'Racha pendiente de hoy'}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowStreakModal(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              >
                ¡A Romperla!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
