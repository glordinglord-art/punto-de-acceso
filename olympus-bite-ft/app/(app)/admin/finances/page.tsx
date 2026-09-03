'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { financesService } from '@/features/finances/services/finances.service';
import type {
  FinancesOverviewResponse,
  ClientPaymentRow,
} from '@/features/finances/types/finances.types';
import { RecordPaymentModal } from '@/features/finances/components/RecordPaymentModal';
import { formatDate, cn } from '@/shared/lib/utils';
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminFinancesPage() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [data, setData] = useState<FinancesOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [trainerFilter, setTrainerFilter] = useState<string>('ALL');

  // Modal
  const [selectedRow, setSelectedRow] = useState<ClientPaymentRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financesService.getOverview(currentMonth);
      setData(res);
    } catch (err) {
      toast.error('Error cargando finanzas: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigate month
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

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!data?.payments) return [];
    return data.payments.filter((row) => {
      const matchesSearch =
        row.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.trainer?.name && row.trainer.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || row.payment.status === statusFilter;

      const matchesTrainer =
        trainerFilter === 'ALL' || row.trainer?.id === trainerFilter;

      return matchesSearch && matchesStatus && matchesTrainer;
    });
  }, [data, searchQuery, statusFilter, trainerFilter]);

  const summary = data?.summary || {
    totalRevenue: 0,
    totalClients: 0,
    paidCount: 0,
    pendingCount: 0,
    collectionRate: 0,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Cuentas & Finanzas Globales"
          subtitle="Auditoría de ingresos, control de pagos mensuales y estado de recaudación de atletas"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Total Recaudado
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-white mt-3 font-mono">
            ${summary.totalRevenue.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Ingresos registrados en {formattedMonthLabel}
          </p>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-emerald-500 opacity-60" />
        </div>

        {/* Card 2: Paid Clients */}
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
            Han pagado su cuota este mes
          </p>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-green-500 opacity-60" />
        </div>

        {/* Card 3: Pending Clients */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Por Cobrar / Pendientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-amber-400 mt-3">
            {summary.pendingCount}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Atletas pendientes de pago este mes
          </p>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-amber-500 opacity-60" />
        </div>

        {/* Card 4: Collection Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400">
              Tasa de Cobro
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
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

      {/* Trainers Breakdown Section */}
      {data?.trainersBreakdown && data.trainersBreakdown.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-condensed font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Recaudación por Entrenador
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.trainersBreakdown.map((t) => (
              <div
                key={t.trainerId}
                className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-condensed font-bold uppercase tracking-wide text-white truncate">
                        {t.trainerName}
                      </h4>
                      <p className="text-xs text-neutral-400">{t.branchName}</p>
                    </div>
                    <Badge variant={t.rate >= 75 ? 'success' : t.rate >= 40 ? 'warning' : 'danger'}>
                      {t.rate}% Cobrado
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xl font-mono font-bold text-emerald-400">
                      ${t.totalRevenue.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {t.paidCount} pagados • {t.pendingCount} pendientes • {t.totalClients} atletas
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Progreso</span>
                  <div className="w-28 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${t.rate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Client Payments Table & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-lg font-condensed font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-500" />
            Detalle de Pagos de Atletas
          </h3>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por atleta o coach..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
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

            {/* Trainer Filter */}
            {data?.trainersBreakdown && (
              <select
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs font-condensed font-bold uppercase text-neutral-300 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">Todos los Coaches</option>
                {data.trainersBreakdown.map((t) => (
                  <option key={t.trainerId} value={t.trainerId}>
                    {t.trainerName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Client Rows */}
        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-condensed uppercase tracking-wider">
            Cargando registros contables...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-neutral-400 font-condensed uppercase tracking-wider">
              No se encontraron pagos con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredRows.map((row) => {
              const isPaid = row.payment.status === 'PAID';

              // WhatsApp Reminder Link
              const waLink = row.client.phone
                ? `https://wa.me/${row.client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola ${row.client.name}, te escribimos de VITALFIT para recordarte amablemente tu cuota del mes de ${formattedMonthLabel}. ¡Quedamos atentos!`
                  )}`
                : null;

              return (
                <div
                  key={row.client.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:border-red-500/30 transition-all"
                >
                  {/* Left: Client info */}
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <Avatar name={row.client.name} size="md" className="w-12 h-12 ring-2 ring-neutral-800" />
                    <div className="min-w-0">
                      <h4 className="text-base font-condensed font-bold uppercase tracking-wide text-white truncate">
                        {row.client.name}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate">{row.client.email}</p>
                      {row.trainer && (
                        <p className="text-[11px] text-red-400 font-medium mt-0.5">
                          Coach: {row.trainer.name} ({row.trainer.branchName})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Payment Info */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                        Monto
                      </span>
                      <p className="text-base font-mono font-bold text-white">
                        ${row.payment.amount.toLocaleString('es-CO')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                        Método
                      </span>
                      <p className="text-xs font-medium text-neutral-300">
                        {row.payment.paymentMethod || '--'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                        Estado
                      </span>
                      <Badge variant={isPaid ? 'success' : 'warning'} className="mt-0.5">
                        {isPaid ? 'PAGADO' : 'PENDIENTE'}
                      </Badge>
                    </div>

                    {row.payment.paymentDate && (
                      <div className="hidden md:block">
                        <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-neutral-400 block">
                          Fecha
                        </span>
                        <p className="text-xs text-neutral-400 font-mono">
                          {formatDate(row.payment.paymentDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isPaid && waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-condensed font-bold uppercase hover:bg-emerald-500/20 transition-all"
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
                        setSelectedRow(row);
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
      {selectedRow && (
        <RecordPaymentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
          onSaved={loadData}
          client={selectedRow.client}
          trainerId={selectedRow.trainer?.id}
          month={currentMonth}
          existingPayment={selectedRow.payment}
        />
      )}
    </div>
  );
}
