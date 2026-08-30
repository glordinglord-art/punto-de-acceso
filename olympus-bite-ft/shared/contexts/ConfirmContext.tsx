'use client';

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/utils';

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      if (typeof opts === 'string') {
        setOptions({
          title: '¿Estás seguro?',
          description: opts,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          variant: 'danger',
        });
      } else {
        setOptions({
          title: opts.title || '¿Estás seguro?',
          description: opts.description || '',
          confirmText: opts.confirmText || 'Confirmar',
          cancelText: opts.cancelText || 'Cancelar',
          variant: opts.variant || 'danger',
        });
      }
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current(false);
  };

  const isDanger = options.variant !== 'primary' && options.variant !== 'warning';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[28px] bg-[#14151a] border border-white/10 p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-150">
            {/* Top Icon */}
            <div
              className={cn(
                'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border',
                isDanger
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10',
              )}
            >
              {isDanger ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>

            {/* Title */}
            <h3 className="text-lg font-black tracking-tight text-white font-condensed uppercase mb-2">
              {options.title}
            </h3>

            {/* Description */}
            {options.description && (
              <p className="text-xs text-white/60 leading-relaxed mb-6">
                {options.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                {options.cancelText}
              </Button>
              <Button
                variant={isDanger ? 'danger' : 'primary'}
                onClick={handleConfirm}
                className={cn(
                  'rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider',
                  isDanger && 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25',
                )}
              >
                {options.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
