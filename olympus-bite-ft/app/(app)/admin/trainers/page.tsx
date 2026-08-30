'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { adminService } from '@/features/admin/services/admin.service';
import { gymsService } from '@/features/gyms/services/gyms.service';
import type { TrainerRosterItem } from '@/features/admin/types/admin.types';
import type { Gym } from '@/features/gyms/types/gyms.types';
import {
  Users,
  MapPin,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Mail,
  Phone,
  Target,
  Flame,
  ShieldCheck,
  Shield,
  Trash2,
} from 'lucide-react';
import { useConfirm } from '@/shared/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<TrainerRosterItem[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Sede filter
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Expanded client roster state
  const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>(null);

  // Assign Sede Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerRosterItem | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [targetGymId, setTargetGymId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [trainersRes, gymsRes] = await Promise.all([
        adminService.getTrainers(),
        gymsService.getAll(),
      ]);

      if (trainersRes?.data) setTrainers(trainersRes.data);
      if (gymsRes?.data) setGyms(gymsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando entrenadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAssignModal = (trainer: TrainerRosterItem) => {
    setSelectedTrainer(trainer);
    setTargetGymId(trainer.gymId || (gyms[0]?.id ?? ''));
    setTargetBranchId(trainer.branchId || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    setAssigning(true);
    try {
      await adminService.assignUser(selectedTrainer.id, {
        gymId: targetGymId || null,
        branchId: targetBranchId || null,
      });
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al asignar la sede');
    } finally {
      setAssigning(false);
    }
  };

  const { confirm } = useConfirm();

  const handleToggleRole = async (trainer: TrainerRosterItem) => {
    const newRole = trainer.role === 'super_admin' ? 'trainer' : 'super_admin';
    const confirmMsg =
      newRole === 'super_admin'
        ? `¿Deseas otorgar permisos de Super Admin a ${trainer.name}? Podrá gestionar sedes y entrenadores.`
        : `¿Deseas revocar permisos de Super Admin a ${trainer.name}? Pasará a ser entrenador estándar.`;

    const ok = await confirm({
      title: 'Cambiar Rol de Usuario',
      description: confirmMsg,
      confirmText: newRole === 'super_admin' ? 'Otorgar Super Admin' : 'Revocar Permisos',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await adminService.updateUserRole(trainer.id, newRole);
      await loadData();
      toast.success('Rol actualizado con éxito');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar el rol');
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    const ok = await confirm({
      title: '¿Eliminar entrenador?',
      description: 'Se perderán sus datos y los clientes quedarán sin entrenador asignado. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar entrenador',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await adminService.deleteUser(trainerId);
      await loadData();
      toast.success('Entrenador eliminado con éxito');
    } catch (err) {
      toast.error('Error eliminando entrenador: ' + (err instanceof Error ? err.message : 'Error'));
    }
  };

  const allBranches = gyms.flatMap((g) => g.branches || []);

  const filteredTrainers = trainers.filter((t) => {
    if (selectedBranchFilter === 'all') return true;
    if (selectedBranchFilter === 'unassigned') return !t.branchId;
    return t.branchId === selectedBranchFilter;
  });

  return (
    <>
      <Header
        title="Gestión de Entrenadores"
        subtitle="Supervisa la cartera de atletas de cada coach y asigna sedes operativas"
        action={
          <Link href="/admin">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al Centro de Mando
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/[0.06] backdrop-blur-md p-8 text-center max-w-lg mx-auto">
          <p className="font-medium text-rose-500">{error}</p>
          <Button onClick={loadData} className="mt-4" size="sm">
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Filter Bar ── */}
          <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl bg-white/70 border border-slate-200 backdrop-blur-md dark:bg-white/[0.03] dark:border-white/5">
            <span className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-500 px-3">
              Filtrar Sede:
            </span>
            <button
              onClick={() => setSelectedBranchFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider transition-all ${
                selectedBranchFilter === 'all'
                  ? 'bg-primary-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              Todas ({trainers.length})
            </button>
            {allBranches.map((branch) => {
              const count = trainers.filter((t) => t.branchId === branch.id).length;
              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchFilter(branch.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider transition-all ${
                    selectedBranchFilter === branch.id
                      ? 'bg-primary-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                  }`}
                >
                  {branch.name} ({count})
                </button>
              );
            })}
          </div>

          {/* ── Trainers List ── */}
          <div className="space-y-4">
            {filteredTrainers.map((trainer) => {
              const isExpanded = expandedTrainerId === trainer.id;
              return (
                <Card key={trainer.id} className="p-0 overflow-hidden">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                      <Avatar
                        name={trainer.name}
                        src={trainer.avatarUrl}
                        size="xl"
                        className="h-16 w-16 ring-2 ring-primary-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                            {trainer.name}
                          </h3>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                              trainer.role === 'super_admin'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400'
                                : 'bg-primary-500/15 border-primary-500/30 text-primary-600 dark:text-primary-400'
                            }`}
                          >
                            {trainer.role === 'super_admin' ? '👑 Super Admin' : '🏋️ Entrenador Socio'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {trainer.email}
                          </span>
                          {trainer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> {trainer.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-primary-500 font-bold font-condensed uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5" />{' '}
                            {trainer.branchName
                              ? `${trainer.branchName} (${trainer.branchCity || 'Medellín'})`
                              : 'Sin Sede Asignada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-center dark:bg-white/[0.03] dark:border-white/5">
                          <p className="text-xl font-condensed font-bold text-slate-900 leading-none dark:text-white">
                            {trainer.clients.length}
                          </p>
                          <p className="text-[9px] font-condensed font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            Atletas
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-center dark:bg-white/[0.03] dark:border-white/5">
                          <p className="text-xl font-condensed font-bold text-primary-500 leading-none">
                            {trainer.activeRoutinesCount}
                          </p>
                          <p className="text-[9px] font-condensed font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            Rutinas
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAssignModal(trainer)}
                      >
                        <Settings className="w-4 h-4 mr-1.5" /> Sede
                      </Button>

                      <Button
                        variant={trainer.role === 'super_admin' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleRole(trainer)}
                        title={
                          trainer.role === 'super_admin'
                            ? 'Quitar permisos de Super Admin'
                            : 'Hacer Super Admin'
                        }
                      >
                        {trainer.role === 'super_admin' ? 'Revocar Admin' : 'Hacer Super Admin'}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20"
                        onClick={() => handleDeleteTrainer(trainer.id)}
                        title="Eliminar Entrenador"
                      >
                        Eliminar
                      </Button>

                      <Button
                        variant={isExpanded ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() =>
                          setExpandedTrainerId(isExpanded ? null : trainer.id)
                        }
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        {isExpanded ? 'Ocultar' : 'Ver Atletas'}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* ── Expanded Clients Accordion ── */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-50/50 dark:bg-black/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-condensed font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-500" /> Cartera
                          de Atletas de {trainer.name} ({trainer.clients.length})
                        </h4>
                      </div>

                      {trainer.clients.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4">
                          Este entrenador aún no tiene atletas asignados.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {trainer.clients.map((client) => (
                            <div
                              key={client.id}
                              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-primary-500/30 dark:border-white/5 dark:bg-[#1a1a1a]"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={client.name}
                                  src={client.avatarUrl}
                                  size="md"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-condensed font-bold uppercase tracking-wide text-slate-900 truncate dark:text-white">
                                    {client.name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate font-medium">
                                    {client.email}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                                  <Target className="w-3 h-3 text-primary-500" />
                                  {client.dietaryGoal || 'General'}
                                </span>

                                {client.targetCalories ? (
                                  <span className="inline-flex items-center gap-1 font-condensed font-bold text-amber-500">
                                    <Flame className="w-3 h-3" />
                                    {client.targetCalories} kcal
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 uppercase font-condensed">
                                    Sin Meta Cal.
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ Modal Asignar Sede ══════════ */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Asignar Sede a ${selectedTrainer?.name || 'Entrenador'}`}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Organización / Gimnasio
            </label>
            <select
              value={targetGymId}
              onChange={(e) => {
                setTargetGymId(e.target.value);
                setTargetBranchId('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-primary-500 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white"
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Sede Operativa *
            </label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-primary-500 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white"
            >
              <option value="">-- Seleccionar Sede --</option>
              {gyms
                .find((g) => g.id === targetGymId)
                ?.branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city || 'Medellín'})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={assigning}>
              {assigning ? 'Asignando...' : 'Confirmar Sede'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
