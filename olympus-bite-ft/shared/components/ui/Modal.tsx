'use client';

import { cn } from '../../lib/utils';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  noPadding?: boolean;
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', className, noPadding = false }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-3xl bg-white/98 backdrop-blur-2xl shadow-[0_-16px_64px_rgba(0,0,0,0.45)] sm:shadow-[0_32px_96px_rgba(15,23,42,0.2)] dark:bg-[#0e1015]/98 dark:shadow-[0_32px_96px_rgba(0,0,0,0.75)] border-t sm:border border-slate-200/60 dark:border-white/10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative pb-[env(safe-area-inset-bottom)]',
          sizeStyles[size],
          className
        )}
      >
        {/* Mobile Bottom-Sheet Pull Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
        </div>

        {/* Close Button always available even if no title */}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-3.5 right-3.5 z-50 rounded-full p-2 bg-black/30 text-white hover:bg-black/50 backdrop-blur-md transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {title && (
          <div className="shrink-0 px-4 sm:px-7 pt-3 sm:pt-6 pb-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-white/8">
            <h2 className="text-lg sm:text-xl font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white truncate pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="rounded-full p-2 text-neutral-400 hover:bg-slate-100 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-white transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className={cn(
          "flex-1 overflow-y-auto overscroll-contain custom-scrollbar",
          !noPadding && "px-4 sm:px-7 pb-6 sm:pb-8 pt-4"
        )}>
          {children}
        </div>
        
        {footer && (
          <div className="shrink-0 border-t border-slate-200/60 bg-slate-50/50 px-4 sm:px-7 py-3.5 dark:border-white/8 dark:bg-white/[0.02] sm:rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
