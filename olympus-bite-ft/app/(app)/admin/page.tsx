'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Spinner } from '@/shared/components/ui/Spinner';
import { adminService } from '@/features/admin/services/admin.service';
import type { AdminOverview } from '@/features/admin/types/admin.types';
import {
  Building2,
  Users,
  Dumbbell,
  ShieldCheck,
  MapPin,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOverview();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando panel de control');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await adminService.seedDefault();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error inicializando sedes');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Centro de Mando" subtitle="Cargando métricas de la organización..." />
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Centro de Mando" subtitle="Error de conexión" />
        <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/[0.06] backdrop-blur-md p-8 text-center max-w-lg mx-auto">
          <span className="mb-3 block text-4xl">⚠️</span>
          <p className="font-medium text-rose-500">{error}</p>
          <Button onClick={loadData} className="mt-4" size="sm">
            Reintentar
          </Button>
        </div>
      </>
    );
  }

  const {
    totalGyms = 0,
    totalBranches = 0,
    totalTrainers = 0,
    totalClients = 0,
    activeRoutines = 0,
    trainersOverview = [],
    branchDistribution = [],
  } = data || {};

  return (
    <>
      <Header
        title="Centro de Mando"
        subtitle={`Organización Punto de Inflexión • ${totalBranches} Sedes • ${totalTrainers} Entrenadores • ${totalClients} Atletas`}
        action={
          <div className="flex items-center gap-3">
            {totalBranches === 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSeed}
                disabled={seeding}
                className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                {seeding ? 'Configurando...' : 'Inicializar Sedes'}
              </Button>
            )}
            <Link href="/admin/branches">
              <Button variant="secondary" size="sm">
                <Building2 className="w-4 h-4 mr-1.5" /> Gestionar Sedes
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-8 max-w-full overflow-hidden">
        {/* ══════════ KPI Stat Cards ══════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Sedes Operativas"
            value={totalBranches}
            sub={`${totalGyms} Organización(es)`}
            icon={<Building2 className="w-5 h-5 text-amber-500" />}
            color="amber"
          />
          <KpiCard
            label="Entrenadores"
            value={totalTrainers}
            sub="Socios & Coaches"
            icon={<ShieldCheck className="w-5 h-5 text-primary-500" />}
            color="emerald"
          />
          <KpiCard
            label="Atletas Totales"
            value={totalClients}
            sub="Clientes Activos"
            icon={<Users className="w-5 h-5 text-blue-500" />}
            color="blue"
          />
          <KpiCard
            label="Rutinas Activas"
            value={activeRoutines}
            sub="En Ejecución"
            icon={<Dumbbell className="w-5 h-5 text-purple-500" />}
            color="purple"
          />
        </div>

        {/* ══════════ Distribution by Branch ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                    Distribución por Sede
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Capacidad y atletas distribuidos en cada sede
                  </p>
                </div>
                <Link
                  href="/admin/branches"
                  className="text-xs font-bold text-primary-500 hover:text-primary-600 font-condensed uppercase tracking-wider flex items-center gap-1"
                >
                  Ver Todo <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {branchDistribution.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl dark:border-white/10">
                  <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-40" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 font-condensed uppercase">
                    Aún no hay sedes registradas
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSeed}
                    disabled={seeding}
                    className="mt-4"
                  >
                    Crear Sedes por Defecto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branchDistribution.map((b) => (
                    <div
                      key={b.branchId}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-base font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                              {b.branchName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {b.city || 'Medellín'} • {b.gymName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                        <div className="rounded-xl bg-white p-2.5 text-center border border-slate-200/80 dark:bg-[#1a1a1a] dark:border-white/5">
                          <p className="text-xl font-condensed font-bold text-slate-900 dark:text-white">
                            {b.trainersCount}
                          </p>
                          <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                            Entrenadores
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 text-center border border-slate-200/80 dark:bg-[#1a1a1a] dark:border-white/5">
                          <p className="text-xl font-condensed font-bold text-primary-500 dark:text-primary-400">
                            {b.clientsCount}
                          </p>
                          <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                            Atletas
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ══════════ Quick Insights ══════════ */}
          <div>
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                    Resumen de Negocio
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Ratio Clientes / Entrenador
                    </span>
                    <span className="font-condensed font-bold text-slate-900 dark:text-white text-base">
                      {totalTrainers > 0
                        ? (totalClients / totalTrainers).toFixed(1)
                        : '0'}{' '}
                      <span className="text-xs text-slate-400">at./coach</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Cobertura de Rutinas
                    </span>
                    <span className="font-condensed font-bold text-primary-500 text-base">
                      {totalClients > 0
                        ? Math.min(
                            100,
                            Math.round((activeRoutines / totalClients) * 100)
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Estado del Sistema
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 font-condensed uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      100% En Línea
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <Link href="/admin/trainers" className="block">
                  <Button variant="secondary" className="w-full justify-between">
                    <span>Gestionar Entrenadores</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* ══════════ Trainers Roster Overview ══════════ */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-condensed font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                Entrenadores & Socios
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Supervisión del equipo de entrenadores y distribución de clientes
              </p>
            </div>
            <Link
              href="/admin/trainers"
              className="text-xs font-bold text-primary-500 hover:text-primary-600 font-condensed uppercase tracking-wider flex items-center gap-1"
            >
              Ver Detalle Completo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {trainersOverview.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl dark:border-white/10">
              <Users className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-40" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 font-condensed uppercase">
                No hay entrenadores registrados aún
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainersOverview.map((trainer) => (
                <div
                  key={trainer.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-500/30 hover:shadow-lg dark:border-white/5 dark:bg-[#1a1a1a] dark:hover:border-primary-500/20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      name={trainer.name}
                      src={trainer.avatarUrl}
                      size="lg"
                      className="ring-2 ring-primary-500/30"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-condensed font-bold uppercase tracking-wide text-slate-900 truncate dark:text-white">
                          {trainer.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {trainer.email}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-500 font-condensed uppercase tracking-wider mt-1">
                        <MapPin className="w-3 h-3" /> {trainer.branchName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/5">
                      <p className="text-2xl font-condensed font-bold text-slate-900 dark:text-white">
                        {trainer.clientsCount}
                      </p>
                      <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                        Atletas Asignados
                      </p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/5">
                      <p className="text-2xl font-condensed font-bold text-primary-500 dark:text-primary-400">
                        {trainer.activeRoutinesCount}
                      </p>
                      <p className="text-[10px] font-condensed font-bold uppercase tracking-widest text-slate-400">
                        Rutinas Activas
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

/* ── KPI Helper Card ── */
function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  color: 'amber' | 'emerald' | 'blue' | 'purple';
}) {
  const colorStyles = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    emerald: 'bg-primary-500/10 border-primary-500/20 text-primary-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  }[color];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 relative overflow-hidden transition-all hover:shadow-md dark:border-white/5 dark:bg-[#16181d]">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${colorStyles}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-condensed font-bold text-slate-900 tracking-tight leading-none mb-1 dark:text-white">
          {value}
        </p>
        <p className="text-xs font-bold text-slate-600 font-condensed tracking-wider uppercase dark:text-slate-300">
          {label}
        </p>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
          {sub}
        </p>
      </div>
    </div>
  );
}
