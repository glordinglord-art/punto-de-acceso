'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { financesService } from '@/features/finances/services/finances.service';
import type { TrainerFinancesResponse } from '@/features/finances/types/finances.types';
import { RecordPaymentModal } from '@/features/finances/components/RecordPaymentModal';
import { formatDate, cn } from '@/shared/lib/utils';
import {
  DollarSign,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrainerFinancesPage() {
  const { user } = useAuth();

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState<TrainerFinancesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Modal
  const [selectedClient, setSelectedClient] = useState<TrainerFinancesResponse['clients'][0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await financesService.getTrainerPayments(user.id, currentMonth);
      setData(res);
    } catch (err) {
      toast.error('Error cargando finanzas: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Month navigation
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const formattedMonthLabel = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    return data.clients.filter((item) => {
      const matchesSearch =
        item.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || item.payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const summary = data?.summary || {
    totalRevenue: 0,
    totalClients: 0,
    paidCount: 0,
    pendingCount: 0,
    collectionRate: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Mis Cuentas & Cobros"
          subtitle="Seguimiento financiero de tus atletas: quién ha pagado este mes, montos y recordatorios rápidos"
        />

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl p-1.5 shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-condensed font-bold uppercase tracking-wider text-white px-3 min-w-[140px] text-center capitalize">
            {formattedMonthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: My Total Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Mi Recaudo ({formattedMonthLabel})
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-white mt-3 font-mono">
            ${summary.totalRevenue.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Total recaudado de tus asesorías
          </p>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-emerald-500 opacity-60" />
        </div>

        {/* Card 2: Paid Athletes */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Atletas al Día
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-3">
            {summary.paidCount}{' '}
            <span className="text-sm font-normal text-neutral-400">/ {summary.totalClients}</span>
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {summary.pendingCount} atletas pendientes de pago
          </p>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-green-500 opacity-60" />
        </div>

        {/* Card 3: Collection Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Tasa de Cobro
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-white mt-3">
            {summary.collectionRate}%
          </p>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${summary.collectionRate}%` }}
            />
          </div>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-red-500 opacity-60" />
        </div>
      </div>

      {/* Athlete List & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-condensed font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-500" />
            Atletas Asignados ({filteredClients.length})
          </h3>

          {/* Search and Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar atleta..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-1 text-xs font-condensed font-bold uppercase">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  statusFilter === 'ALL' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('PAID')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  statusFilter === 'PAID' ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:text-white'
                )}
              >
                Pagados
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  statusFilter === 'PENDING' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                )}
              >
                Pendientes
              </button>
            </div>
          </div>
        </div>

        {/* Client Cards (Mobile-First) */}
        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-condensed uppercase tracking-wider">
            Cargando tus atletas...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-neutral-400 font-condensed uppercase tracking-wider">
              No hay atletas para mostrar con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredClients.map((item) => {
              const isPaid = item.payment.status === 'PAID';

              // WhatsApp Reminder Link
              const waLink = item.client.phone
                ? `https://wa.me/${item.client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola ${item.client.name}, ¿cómo estás? Te escribo para recordarte amablemente la cuota mensual de tu asesoría de ${formattedMonthLabel} en VITALFIT. ¡Quedo muy atento!`
                  )}`
                : null;

              return (
                <div
                  key={item.client.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:border-red-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Athlete Details */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <Avatar name={item.client.name} size="lg" className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-neutral-800" />
                      <div className="absolute bottom-0 right-0">
                        <div
                          className={cn(
                            'w-3.5 h-3.5 rounded-full border-2 border-neutral-900',
                            isPaid ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-500'
                          )}
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-condensed font-bold uppercase tracking-wide text-white truncate">
                          {item.client.name}
                        </h4>
                        <Badge variant={isPaid ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
                          {isPaid ? 'PAGADO' : 'PENDIENTE'}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{item.client.email}</p>
                      {item.client.phone && (
                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          Tel: {item.client.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Payment Info */}
                  <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-black/20 p-3 sm:p-0 rounded-2xl sm:bg-transparent">
                    <div>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                        Monto
                      </span>
                      <p className="text-base font-mono font-bold text-white">
                        ${item.payment.amount.toLocaleString('es-CO')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                        Método
                      </span>
                      <p className="text-xs font-medium text-neutral-300">
                        {item.payment.paymentMethod || 'Sin registrar'}
                      </p>
                    </div>

                    {item.payment.paymentDate && (
                      <div>
                        <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                          Fecha
                        </span>
                        <p className="text-xs text-neutral-400 font-mono">
                          {formatDate(item.payment.paymentDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 justify-end">
                    {!isPaid && waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-condensed font-bold uppercase hover:bg-emerald-500/20 transition-all"
                        title="Enviar recordatorio de pago por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Recordar
                      </a>
                    )}

                    <Button
                      size="sm"
                      variant={isPaid ? 'secondary' : 'primary'}
                      onClick={() => {
                        setSelectedClient(item);
                        setIsModalOpen(true);
                      }}
                      className="font-condensed uppercase font-bold text-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      {isPaid ? 'Editar Pago' : 'Registrar Pago'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedClient && (
        <RecordPaymentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          onSaved={loadData}
          client={selectedClient.client}
          trainerId={user?.id}
          month={currentMonth}
          existingPayment={selectedClient.payment}
        />
      )}
    </div>
  );
}
