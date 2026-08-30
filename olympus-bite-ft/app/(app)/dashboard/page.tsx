'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { Header } from '@/shared/components/layout/Header';
import { StatsOverview } from '@/features/dashboard/components/StatsOverview';
import { ClientsList } from '@/features/dashboard/components/ClientsList';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart';
import { MacroChart } from '@/features/dashboard/components/MacroChart';
import { TopFoods } from '@/features/dashboard/components/TopFoods';
import { TrainerHeroCard } from '@/features/dashboard/components/TrainerHeroCard';
import { ClientDashboardView } from '@/features/dashboard/components/ClientDashboardView';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import type { DashboardStats } from '@/features/dashboard/types/dashboard.types';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { activeMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (activeMode === 'superadmin') {
      router.push('/admin');
    }
  }, [activeMode, router]);

  if (activeMode === 'superadmin') {
    return null; // or a loading spinner
  }

  if (activeMode === 'client') {
    return <ClientDashboardView />;
  }

  // Trainer mode
  return <TrainerDashboard />;
}

function TrainerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats(user.id);
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Cargando estadísticas..." />
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-[28px] bg-white/40 border border-slate-200/40 dark:bg-white/[0.04] dark:border-white/6" />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Dashboard" subtitle="Error" />
        <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/[0.06] backdrop-blur-md p-8 text-center shadow-sm">
          <span className="mb-3 block text-4xl">⚠️</span>
          <p className="font-medium text-rose-500 dark:text-rose-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-xl bg-rose-500/15 border border-rose-500/20 px-5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-300 transition-all hover:bg-rose-500/25 hover:border-rose-500/30"
          >
            Reintentar
          </button>
        </div>
      </>
    );
  }

  const now = new Date();
  const greeting = now.getHours() < 12
    ? 'Buenos días'
    : now.getHours() < 18
      ? 'Buenas tardes'
      : 'Buenas noches';

  return (
    <>
      <Header
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Entrenador'}`}
        subtitle={new Intl.DateTimeFormat('es', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now)}
        action={
          <div className="flex items-center gap-3">
            {/* Any other buttons could go here */}
          </div>
        }
      />

      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Row 0: Hero with activity rings & weekly metrics */}
        {stats && <TrainerHeroCard stats={stats} />}

        {/* Row 1: Charts */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div className="min-w-0">
            <WeeklyChart data={stats?.weeklyTrend ?? []} />
          </div>
          <div className="min-w-0">
            <MacroChart
              macros={stats?.macroAverages ?? { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }}
              mealTypes={stats?.mealTypeDistribution ?? []}
            />
          </div>
        </div>

        {/* Row 2: Clients + Activity */}
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0 h-full">
            <ClientsList clients={stats?.clientsOverview ?? []} />
          </div>
          <div className="min-w-0 h-full">
            <RecentActivity meals={stats?.recentMeals ?? []} />
          </div>
        </div>

        {/* Row 3: Top Foods */}
        {(stats?.topFoods?.length ?? 0) > 0 && (
          <div className="max-w-md">
            <TopFoods foods={stats?.topFoods ?? []} />
          </div>
        )}
      </div>
    </>
  );
}
