'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { gymsService } from '@/features/gyms/services/gyms.service';
import type { Gym, Branch } from '@/features/gyms/types/gyms.types';
import {
  Building2,
  MapPin,
  Plus,
  Edit2,
  Phone,
  ArrowLeft,
  Users,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useConfirm } from '@/shared/contexts/ConfirmContext';
import { toast } from 'react-hot-toast';

export default function AdminBranchesPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string>('');
  const [branchForm, setBranchForm] = useState({
    name: '',
    city: 'Medellín',
    address: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gymsService.getAll();
      if (res?.data) {
        setGyms(res.data);
        if (res.data.length > 0 && !selectedGymId) {
          setSelectedGymId(res.data[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando sedes');
    } finally {
      setLoading(false);
    }
  }, [selectedGymId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = (gymId: string) => {
    setSelectedGymId(gymId);
    setEditingBranch(null);
    setBranchForm({
      name: '',
      city: 'Medellín',
      address: '',
      phone: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (gymId: string, branch: Branch) => {
    setSelectedGymId(gymId);
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      city: branch.city || 'Medellín',
      address: branch.address || '',
      phone: branch.phone || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGymId || !branchForm.name.trim()) return;

    setSaving(true);
    try {
      if (editingBranch) {
        await gymsService.updateBranch(
          selectedGymId,
          editingBranch.id,
          branchForm
        );
      } else {
        await gymsService.createBranch(selectedGymId, branchForm);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar la sede');
    } finally {
      setSaving(false);
    }
  };

  const { confirm } = useConfirm();

  const handleDeleteBranch = async (gymId: string, branchId: string) => {
    const ok = await confirm({
      title: '¿Eliminar sede?',
      description: 'Perderás la sede y todos los usuarios asignados a esta sede quedarán sin sede asignada.',
      confirmText: 'Eliminar sede',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await gymsService.deleteBranch(gymId, branchId);
      await loadData();
      toast.success('Sede eliminada con éxito');
    } catch (err) {
      toast.error('Error eliminando sede: ' + (err instanceof Error ? err.message : 'Error'));
    }
  };

  return (
    <>
      <Header
        title="Gestión de Sedes & Gyms"
        subtitle="Administra tus ubicaciones, ciudades e infraestructura deportiva"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al Centro de Mando
              </Button>
            </Link>
            {gyms.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenCreate(gyms[0].id)}
                className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Nueva Sede
              </Button>
            )}
          </div>
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
      ) : gyms.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[28px] border border-slate-200 bg-white/90 shadow-sm max-w-xl mx-auto dark:border-white/5 dark:bg-[#16181d]">
          <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-4 opacity-40" />
          <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 mb-2 dark:text-white">
            Sin organizaciones creadas
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Inicializa la organización por defecto para comenzar a registrar sedes.
          </p>
          <Link href="/admin">
            <Button variant="primary">Ir al Centro de Mando</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {gyms.map((gym) => (
            <Card key={gym.id} className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-slate-950 shadow-md">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                      {gym.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {gym.description || 'Centro de Alto Rendimiento'} •{' '}
                      {gym.branches?.length ?? 0} Sedes registradas
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenCreate(gym.id)}
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Agregar Sede en {gym.name}
                </Button>
              </div>

              {/* Branches Grid */}
              {!gym.branches || gym.branches.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl dark:border-white/10">
                  <p className="text-sm font-bold text-slate-500 font-condensed uppercase">
                    Esta organización no tiene sedes asignadas
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gym.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white hover:shadow-md dark:border-white/5 dark:bg-[#1a1a1a] dark:hover:bg-[#202020]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-lg font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                              {branch.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {branch.city || 'Medellín'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(gym.id, branch)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                            title="Editar sede"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(gym.id, branch.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                            title="Eliminar sede"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                        {branch.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{branch.address}</span>
                          </p>
                        )}
                        {branch.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{branch.phone}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 font-condensed uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sede Activa
                        </span>

                        <span className="text-xs font-bold font-condensed uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {branch._count?.users ?? 0} Integrantes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ Modal Create / Edit Sede ══════════ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBranch ? 'Editar Sede' : 'Nueva Sede'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre de la Sede *
            </label>
            <Input
              type="text"
              placeholder="Ej: Sede El Poblado, Sede Laureles..."
              value={branchForm.name}
              onChange={(e) =>
                setBranchForm({ ...branchForm, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Ciudad
            </label>
            <Input
              type="text"
              placeholder="Medellín, Envigado, Sabaneta..."
              value={branchForm.city}
              onChange={(e) =>
                setBranchForm({ ...branchForm, city: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Dirección
            </label>
            <Input
              type="text"
              placeholder="Calle / Carrera / Centro Comercial..."
              value={branchForm.address}
              onChange={(e) =>
                setBranchForm({ ...branchForm, address: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-condensed uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Teléfono de Contacto
            </label>
            <Input
              type="text"
              placeholder="+57 300 000 0000"
              value={branchForm.phone}
              onChange={(e) =>
                setBranchForm({ ...branchForm, phone: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving
                ? 'Guardando...'
                : editingBranch
                  ? 'Guardar Cambios'
                  : 'Crear Sede'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
