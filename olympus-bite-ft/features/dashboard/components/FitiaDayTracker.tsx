'use client';

import { useMemo } from 'react';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { cn, getLocalDateString } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface FitiaDayTrackerProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  streakDays?: number;
  rightAction?: React.ReactNode;
}

export function FitiaDayTracker({
  selectedDate,
  onSelectDate,
  streakDays = 4,
  rightAction,
}: FitiaDayTrackerProps) {
  const { user } = useAuth();
  const today = getLocalDateString();
  const activeDate = selectedDate || today;

  // Generate the current Monday-to-Sunday week
  const weekDays = useMemo(() => {
    const now = new Date(activeDate + 'T12:00:00');
    // Get Monday of the week
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

      return {
        dateStr,
        dayNum: d.getDate(),
        dayLetter: dayLetters[idx],
        isSelected,
        isToday,
        isPast,
        // Status: completed if past, in-progress if today, upcoming if future
        isCompleted: isPast,
      };
    });
  }, [activeDate, today]);

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

  return (
    <div className="w-full bg-white dark:bg-[#101318] rounded-3xl border border-slate-200/80 dark:border-white/8 p-4 sm:p-5 shadow-sm">
      {/* ── Top Bar: Date hint & Streak 🔥 ── */}
      <div className="flex items-center justify-between px-2 mb-4">
        {/* Left: Selected Day label */}
        <div className="text-xs font-condensed font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {formatHeaderDate(activeDate)}
        </div>

        {/* Right: 🔥 Streak + User Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-condensed font-black text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streakDays}</span>
          </div>

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

      {/* ── Week Days Track (Fitia Connected Circles) ── */}
      <div className="flex items-center justify-between max-w-xl mx-auto relative px-2">
        {weekDays.map((d) => {
          return (
            <div key={d.dateStr} className="flex-1 flex items-center justify-center relative">
              <button
                type="button"
                onClick={() => onSelectDate?.(d.dateStr)}
                className="flex flex-col items-center group cursor-pointer relative z-10"
              >
                {/* Day Letter */}
                <span className={cn(
                  'text-[11px] font-bold uppercase mb-1.5',
                  d.isSelected ? 'text-white' : 'text-slate-500'
                )}>
                  {d.dayLetter}
                </span>

                {/* Day Circle / Number */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] transition-all duration-200',
                    d.isSelected
                      ? 'border-2 border-white text-amber-500'
                      : 'text-slate-300'
                  )}
                >
                  {d.dayNum}
                </div>
                
                {/* Tiny completed dot */}
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5",
                  d.isCompleted && !d.isSelected ? "bg-slate-700" : "bg-transparent"
                )} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
