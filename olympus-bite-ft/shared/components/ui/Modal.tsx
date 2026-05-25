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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-h-[90vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl shadow-[0_32px_96px_rgba(15,23,42,0.2)] dark:bg-[#101118]/95 dark:shadow-[0_32px_96px_rgba(0,0,0,0.6)] border border-slate-200/60 dark:border-white/8 animate-in fade-in zoom-in-95 duration-200 relative',
          sizeStyles[size],
          className
        )}
      >
        {/* Close Button always available even if no title */}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 z-50 rounded-full p-2 bg-black/20 text-white hover:bg-black/40 backdrop-blur-md transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {title && (
          <div className="shrink-0 px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/6">
            <h2 className="text-xl font-condensed font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="rounded-full p-2 text-neutral-400 hover:bg-slate-100 hover:text-neutral-600 dark:hover:bg-white/8 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className={cn(
          "flex-1 overflow-y-auto overscroll-contain custom-scrollbar",
          !noPadding && "px-6 sm:px-8 pb-6 sm:pb-8 pt-4"
        )}>
          {children}
        </div>
        
        {footer && (
          <div className="shrink-0 border-t border-slate-200/60 bg-slate-50/50 px-6 sm:px-8 py-4 dark:border-white/6 dark:bg-white/[0.02] rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
