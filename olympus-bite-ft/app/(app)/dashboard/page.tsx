'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '@/shared/components/layout/Header';
import { StatsOverview } from '@/features/dashboard/components/StatsOverview';
import { ClientsList } from '@/features/dashboard/components/ClientsList';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart';
import { MacroChart } from '@/features/dashboard/components/MacroChart';
import { TopFoods } from '@/features/dashboard/components/TopFoods';
import { ClientDashboardView } from '@/features/dashboard/components/ClientDashboardView';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import type { DashboardStats } from '@/features/dashboard/types/dashboard.types';

export default function DashboardPage() {
  const { user, isTrainer } = useAuth();

  // Client dashboard
  if (!isTrainer) {
    return <ClientDashboardView />;
  }

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
        <div className="space-y-6 max-w-full overflow-hidden">
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
          {/* Bottom skeleton */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800 lg:col-span-2" />
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Dashboard" subtitle="Error" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <span className="text-4xl mb-3 block">⚠️</span>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
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
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Entrenador'} 👋`}
        subtitle={new Intl.DateTimeFormat('es', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now)}
      />

      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Row 1: Stat Cards */}
        <StatsOverview
          totalClients={stats?.totalClients ?? 0}
          activeMealsToday={stats?.activeMealsToday ?? 0}
          totalRoutines={stats?.totalRoutines ?? 0}
          activeRoutines={stats?.activeRoutines ?? 0}
          avgCaloriesToday={stats?.avgCaloriesToday ?? 0}
          mealsThisWeek={stats?.mealsThisWeek ?? 0}
          mealsLastWeek={stats?.mealsLastWeek ?? 0}
        />

        {/* Row 2: Charts */}
        <div className="grid gap-4 lg:grid-cols-2 items-stretch">
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

        {/* Row 3: Clients + Activity */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 min-w-0">
            <ClientsList clients={stats?.clientsOverview ?? []} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <RecentActivity meals={stats?.recentMeals ?? []} />
          </div>
        </div>

        {/* Row 4: Top Foods */}
        {(stats?.topFoods?.length ?? 0) > 0 && (
          <TopFoods foods={stats?.topFoods ?? []} />
        )}

        {/* Refresh button */}
        <div className="flex justify-center pb-4">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200 transition-colors dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            🔄 Actualizar datos
          </button>
        </div>
      </div>
    </>
  );
}
