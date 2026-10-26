'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ClientDashboardView } from '@/features/dashboard/components/ClientDashboardView';
import { WeeklySentinelAuditWidget } from '@/features/dashboard/components/WeeklySentinelAuditWidget';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import { ClientProfileModal } from '@/features/clients/components/ClientProfileModal';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { clientsService } from '@/features/clients/services/clients.service';
import type { DashboardStats } from '@/features/dashboard/types/dashboard.types';
import type { User } from '@/shared/types/common.types';
import { cn, getLocalDateString } from '@/shared/lib/utils';
import {
  FileText,
  Lock,
  Target,
  Droplets,
  Moon,
  Scale,
  Dumbbell,
  Clock,
  CalendarCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { activeMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (activeMode === 'superadmin') {
      router.push('/admin');
    }
  }, [activeMode, router]);

  if (activeMode === 'superadmin') {
    return null;
  }

  if (activeMode === 'client') {
    return <ClientDashboardView />;
  }

  return <TrainerDashboard />;
}

function TrainerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Ficha Técnica directa desde el Inicio del Entrenador
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    'profile' | 'compliance' | 'assessments' | 'progress' | 'ai'
  >('profile');

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const fallbackSelf: User = {
      ...user,
      avatarUrl: null,
      phone: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    try {
      const [statsRes, clientsRes, selfRes] = await Promise.all([
        dashboardService.getStats(user.id).catch(() => ({ data: null })),
        clientsService.getByTrainer(user.id).catch(() => ({ data: [] as User[] })),
        clientsService.getById(user.id).catch(() => ({ data: fallbackSelf })),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      const selfUser = selfRes?.data ?? fallbackSelf;
      const list = (clientsRes?.data ?? []).filter((c) => c.id !== user.id);
      setAthletes([selfUser, ...list]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenFicha = (
    athlete: User,
    tab: 'profile' | 'compliance' | 'assessments' | 'progress' | 'ai' = 'profile',
  ) => {
    setSelectedAthlete(athlete);
    setSelectedTab(tab);
  };

  const handleSaveProfile = async (
    clientId: string,
    data: {
      dietaryGoal?: string;
      targetCalories?: number | null;
      password?: string;
    },
  ) => {
    await clientsService.updateProfile(clientId, data);
    await loadData();
  };

  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    const q = searchQuery.toLowerCase();
    return athletes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [athletes, searchQuery]);

  if (loading) {
    return (
      <>
        <Header
          title="Centro de Mando del Entrenador"
          subtitle="Sincronizando Fichas Técnicas y 3 Pilares..."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-[28px] bg-white/[0.04] border border-white/10"
            />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Centro de Mando" subtitle="Error" />
        <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/[0.06] p-8 text-center">
          <p className="font-medium text-rose-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-xl bg-rose-500/20 px-5 py-2.5 text-sm font-semibold text-rose-300"
          >
            Reintentar
          </button>
        </div>
      </>
    );
  }

  const todayStr = getLocalDateString();

  return (
    <>
      <Header
        title={`Panel de Entrenador · ${user?.name?.split(' ')[0] ?? 'Coach'}`}
        subtitle="Visualización directa de Fichas Técnicas, 4 Metas de 120 Días, 3 Pilares y Memoria Clínica IA"
        action={
          <Link
            href="/clinical-agent"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Co-Piloto Científico IA</span>
          </Link>
        }
      />

      <div className="space-y-6 max-w-full overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════
            SECCIÓN 1 (PROTAGONISTA): FICHAS TÉCNICAS EN VIVO DE TUS ATLETAS
           ═══════════════════════════════════════════════════════════════════ */}
        <section className="rounded-[28px] border border-white/10 bg-[#0d1017] p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
                Prioridad #1 del Entrenador · Expedientes de 120 Días
              </span>
              <h2 className="text-xl font-condensed font-black uppercase tracking-wide text-white">
                Fichas Técnicas de tus Atletas ({athletes.length})
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Abre en 1 clic las 4 Metas, la Memoria Clínica Privada con IA o sube el Reporte Semanal de cualquier atleta.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar atleta por nombre..."
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid de Tarjetas de Ficha Técnica */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAthletes.map((athlete) => {
              const isSelf = athlete.id === user?.id;
              const ov = stats?.clientsOverview?.find((o) => o.id === athlete.id);
              const anamnesis =
                athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
                  ? (athlete.anamnesisData as any)
                  : {};
              const pact = anamnesis.heroPact || {};
              const bio = pact?.objectives?.biometric || {};
              const str = pact?.objectives?.strength || {};
              const mas = pact?.objectives?.bodyMastery || {};

              // Día del Ciclo de 120 Días
              const startStr =
                pact.startDate ||
                anamnesis.discoveryCompletedAt?.slice(0, 10) ||
                athlete.createdAt?.slice(0, 10);
              const dayNumber = startStr
                ? Math.min(
                    120,
                    Math.max(
                      1,
                      Math.floor(
                        (Date.now() - new Date(startStr).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) + 1,
                    ),
                  )
                : 1;
              const daysRemaining = Math.max(0, 120 - dayNumber);

              // Telemetría de los 3 Pilares
              const waterTarget =
                Number(pact?.pillars?.nutrition?.waterLitersTarget) || 3.0;
              const todayWaterObj = Array.isArray(anamnesis.waterLogs)
                ? anamnesis.waterLogs.find((w: any) => w.date === todayStr)
                : null;
              const waterToday = todayWaterObj ? Number(todayWaterObj.liters) : 0;

              const sleepLogs = Array.isArray(anamnesis.sleepLogs)
                ? anamnesis.sleepLogs
                : [];
              const lastSleep =
                sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : null;

              const weighIns = Array.isArray(anamnesis.fastedWeighIns)
                ? anamnesis.fastedWeighIns
                : [];
              const lastWeighIn =
                weighIns.length > 0 ? weighIns[weighIns.length - 1] : null;

              const currentW =
                lastWeighIn?.weightKg ||
                bio.currentWeightKg ||
                athlete.weight ||
                '—';
              const targetW = bio.targetWeightKg || '—';
              const weeklyRate =
                bio.weeklyDeltaTargetKg !== undefined
                  ? bio.weeklyDeltaTargetKg > 0
                    ? `+${bio.weeklyDeltaTargetKg} kg/sem`
                    : `${bio.weeklyDeltaTargetKg} kg/sem`
                  : '+0.25 kg/sem';

              const hasPrivateMemory = Boolean(anamnesis.trainerPrivateMemory);

              return (
                <div
                  key={athlete.id}
                  className={cn(
                    'flex flex-col justify-between rounded-2xl border p-4 transition-all hover:border-white/25',
                    isSelf
                      ? 'border-red-500/35 bg-gradient-to-br from-red-950/20 via-[#131722] to-[#11131a]'
                      : 'border-white/10 bg-[#131722]',
                  )}
                >
                  <div className="space-y-3">
                    {/* Cabecera del Atleta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={athlete.name} src={athlete.avatarUrl} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate">
                              {athlete.name}
                            </h3>
                            {isSelf && (
                              <span className="rounded-md bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 text-[9px] font-black uppercase text-red-300">
                                🏋️ Mi Propia Ficha
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                            <Clock className="w-3 h-3 text-red-400" />
                            <span>
                              Día {dayNumber}/120 (Quedan {daysRemaining}d)
                            </span>
                          </div>
                        </div>
                      </div>

                      {hasPrivateMemory && (
                        <span
                          title="Tiene notas en su Memoria Clínica Privada"
                          className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[9px] font-bold text-cyan-300 flex items-center gap-1 shrink-0"
                        >
                          <Lock className="w-2.5 h-2.5" /> Memoria
                        </span>
                      )}
                    </div>

                    {/* Resumen de las Metas del Pacto */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/40 border border-white/5 p-2.5 text-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-emerald-400 block">
                          1. Meta Peso ({weeklyRate})
                        </span>
                        <span className="font-bold text-white">
                          {currentW} → {targetW} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-amber-400 block">
                          2. Fuerza / Habilidad
                        </span>
                        <span className="font-bold text-white truncate block">
                          {str.exerciseName || mas.skillName || 'Por definir'}
                        </span>
                      </div>
                    </div>

                    {/* Estado de los 3 Pilares en Vivo */}
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2">
                        <span className="text-[9px] uppercase text-neutral-400 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3 text-emerald-400" />
                          Entreno
                        </span>
                        <p className="font-bold text-white mt-0.5 truncate">
                          {ov?.hasActiveRoutine || isSelf ? 'Rutina Activa' : 'Sin Rutina'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2">
                        <span className="text-[9px] uppercase text-neutral-400 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-sky-400" />
                          Agua Hoy
                        </span>
                        <p className="font-bold text-white mt-0.5">
                          {waterToday} / {waterTarget}L
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2">
                        <span className="text-[9px] uppercase text-neutral-400 flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          Sueño ±1h
                        </span>
                        <p
                          className={cn(
                            'font-bold mt-0.5 truncate',
                            !lastSleep
                              ? 'text-neutral-500'
                              : lastSleep.withinOneHourWindow
                                ? 'text-emerald-400'
                                : 'text-amber-400',
                          )}
                        >
                          {!lastSleep
                            ? 'Pendiente'
                            : `${lastSleep.hoursSlept}h ${lastSleep.withinOneHourWindow ? '✓' : '⚠️'}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botonera de Acción Directa (1 Clic) */}
                  <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenFicha(athlete, 'profile')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-red-600 hover:bg-red-500 px-2.5 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-white transition cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenFicha(athlete, 'ai')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-cyan-200 transition cursor-pointer"
                      title="Memoria Clínica Privada del Entrenador con la IA (Oculta al Atleta)"
                    >
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>Memoria IA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenFicha(athlete, 'compliance')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-200 transition cursor-pointer"
                      title="Emitir Reporte Semanal de Videollamada"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reporte</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECCIÓN 2: CENTINELA EN VIVO DE LOS 3 PILARES Y PESAJE EN AYUNAS
           ═══════════════════════════════════════════════════════════════════ */}
        <WeeklySentinelAuditWidget
          athletes={athletes}
          overviews={stats?.clientsOverview ?? []}
          trainerId={user?.id}
          onOpenFicha={handleOpenFicha}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            SECCIÓN 3: ACTIVIDAD RECIENTE DE COMIDAS EN VIVO
           ═══════════════════════════════════════════════════════════════════ */}
        <RecentActivity meals={stats?.recentMeals ?? []} />
      </div>

      {/* Modal de Ficha Técnica Completa (4 Metas + Cierre Semanal + Memoria Clínica Privada IA) */}
      <ClientProfileModal
        client={selectedAthlete}
        initialTab={selectedTab}
        onClose={() => {
          setSelectedAthlete(null);
          loadData();
        }}
        onSave={handleSaveProfile}
      />
    </>
  );
}
