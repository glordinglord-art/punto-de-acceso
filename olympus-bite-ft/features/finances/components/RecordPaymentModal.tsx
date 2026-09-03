'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { financesService } from '../services/finances.service';
import type { PaymentStatus } from '../types/finances.types';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock, DollarSign, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
  trainerId?: string;
  month: string;
  existingPayment?: {
    id: string | null;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string | null;
    paymentDate: string | null;
    notes: string | null;
  } | null;
}

const COMMON_AMOUNTS = [80000, 100000, 120000, 150000, 180000, 200000];
const PAYMENT_METHODS = [
  { id: 'Nequi', label: 'Nequi', icon: '⚡' },
  { id: 'Bancolombia', label: 'Bancolombia', icon: '🏦' },
  { id: 'Daviplata', label: 'Daviplata', icon: '📱' },
  { id: 'Efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'Tarjeta', label: 'Tarjeta', icon: '💳' },
  { id: 'Transferencia', label: 'Transferencia', icon: '📝' },
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSaved,
  client,
  trainerId,
  month,
  existingPayment,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(120000);
  const [status, setStatus] = useState<PaymentStatus>('PAID');
  const [method, setMethod] = useState<string>('Nequi');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (existingPayment && existingPayment.id) {
      setAmount(existingPayment.amount || 120000);
      setStatus(existingPayment.status || 'PAID');
      setMethod(existingPayment.paymentMethod || 'Nequi');
      setPaymentDate(
        existingPayment.paymentDate
          ? new Date(existingPayment.paymentDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setNotes(existingPayment.notes || '');
    } else {
      setAmount(120000);
      setStatus('PAID');
      setMethod('Nequi');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [existingPayment, isOpen]);

  if (!client) return null;

  const handleSave = async () => {
    if (amount <= 0 && status === 'PAID') {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      await financesService.recordPayment({
        clientId: client.id,
        trainerId,
        periodMonth: month,
        amount: Number(amount),
        status,
        paymentMethod: method,
        paymentDate: paymentDate || new Date().toISOString(),
        notes: notes.trim() || undefined,
      });

      toast.success('Pago registrado correctamente');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Error guardando pago: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPayment?.id) return;
    setDeleting(true);
    try {
      await financesService.deletePayment(existingPayment.id);
      toast.success('Registro de pago eliminado');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Error eliminando pago: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      className="p-6 bg-neutral-900 border border-white/10 rounded-3xl"
    >
      <div className="space-y-6">
        {/* Header with Client Info */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <Avatar name={client.name} size="lg" className="w-14 h-14 ring-2 ring-red-500/50 shadow-lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-white truncate">
              {client.name}
            </h3>
            <p className="text-xs text-neutral-400 truncate">{client.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-condensed font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                Periodo: {month}
              </span>
              {existingPayment?.id && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Ya registrado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Selector: Pagado vs Pendiente */}
        <div>
          <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Estado del Pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('PAID')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-condensed font-bold uppercase tracking-wider transition-all',
                status === 'PAID'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
              )}
            >
              <CheckCircle2 className="w-4 h-4" /> Pagado
            </button>
            <button
              type="button"
              onClick={() => setStatus('PENDING')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-condensed font-bold uppercase tracking-wider transition-all',
                status === 'PENDING'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
              )}
            >
              <Clock className="w-4 h-4" /> Pendiente
            </button>
          </div>
        </div>

        {/* Amount Input & Quick Chips */}
        <div>
          <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Monto Pagado (COP)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="120000"
              className="w-full rounded-2xl border border-white/10 bg-black/40 pl-11 pr-4 py-3.5 text-lg font-bold font-mono text-white placeholder:text-neutral-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all',
                  amount === val
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                )}
              >
                ${val.toLocaleString('es-CO')}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        {status === 'PAID' && (
          <div>
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-condensed font-bold uppercase tracking-wider transition-all',
                    method === m.id
                      ? 'bg-red-500/15 border-red-500/50 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                  )}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Date */}
        {status === 'PAID' && (
          <div>
            <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Fecha de Pago
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Notas / Referencia (Opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Transferencia #892182 - Plan trimestral"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white placeholder:text-neutral-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          {existingPayment?.id ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              className="font-condensed uppercase font-bold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Revertir
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
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
              type="button"
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={loading}
              className="font-condensed uppercase font-bold text-xs shadow-lg shadow-red-500/20"
            >
              Guardar Pago
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
